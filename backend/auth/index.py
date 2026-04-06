"""
Авторизация и регистрация пользователей ОбъявоМаркет.
action: register | login | me | logout — передаётся query-параметром или в body.
"""

import json
import os
import hashlib
import secrets
import psycopg2
from datetime import datetime, timedelta

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p16851207_avito_clone_improvem")

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Authorization, Authorization",
    "Content-Type": "application/json",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def make_token() -> str:
    return secrets.token_hex(32)


def ok(data: dict) -> dict:
    return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps(data)}


def err(code: int, message: str) -> dict:
    return {"statusCode": code, "headers": CORS_HEADERS, "body": json.dumps({"error": message})}


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    body = {}
    if event.get("body"):
        body = json.loads(event["body"])

    qs = event.get("queryStringParameters") or {}
    action = qs.get("action") or body.get("action") or ""

    headers_in = event.get("headers") or {}
    raw_auth = headers_in.get("X-Authorization") or headers_in.get("Authorization") or ""
    token = raw_auth.replace("Bearer ", "").strip()

    # --- register ---
    if action == "register":
        name = (body.get("name") or "").strip()
        email = (body.get("email") or "").strip().lower()
        password = body.get("password") or ""
        city = (body.get("city") or "").strip()

        if not name or not email or not password:
            return err(400, "Заполните все обязательные поля")
        if len(password) < 6:
            return err(400, "Пароль должен быть не менее 6 символов")

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE email = %s", (email,))
        if cur.fetchone():
            conn.close()
            return err(409, "Пользователь с таким email уже существует")

        pwd_hash = hash_password(password)
        cur.execute(
            f"INSERT INTO {SCHEMA}.users (name, email, password_hash, city) VALUES (%s, %s, %s, %s) RETURNING id, name, email, city",
            (name, email, pwd_hash, city)
        )
        row = cur.fetchone()
        user_id = row[0]

        token_val = make_token()
        expires = datetime.now() + timedelta(days=30)
        cur.execute(
            f"INSERT INTO {SCHEMA}.sessions (user_id, token, expires_at) VALUES (%s, %s, %s)",
            (user_id, token_val, expires)
        )
        conn.commit()
        conn.close()

        return ok({"token": token_val, "user": {"id": row[0], "name": row[1], "email": row[2], "city": row[3]}})

    # --- login ---
    if action == "login":
        email = (body.get("email") or "").strip().lower()
        password = body.get("password") or ""

        if not email or not password:
            return err(400, "Введите email и пароль")

        pwd_hash = hash_password(password)
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"SELECT id, name, email, city, phone FROM {SCHEMA}.users WHERE email = %s AND password_hash = %s",
            (email, pwd_hash)
        )
        row = cur.fetchone()
        if not row:
            conn.close()
            return err(401, "Неверный email или пароль")

        user_id = row[0]
        token_val = make_token()
        expires = datetime.now() + timedelta(days=30)
        cur.execute(
            f"INSERT INTO {SCHEMA}.sessions (user_id, token, expires_at) VALUES (%s, %s, %s)",
            (user_id, token_val, expires)
        )
        conn.commit()
        conn.close()

        return ok({"token": token_val, "user": {"id": row[0], "name": row[1], "email": row[2], "city": row[3], "phone": row[4]}})

    # --- me ---
    if action == "me":
        if not token:
            return err(401, "Не авторизован")

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"SELECT u.id, u.name, u.email, u.city, u.phone, u.about FROM {SCHEMA}.sessions s JOIN {SCHEMA}.users u ON u.id = s.user_id WHERE s.token = %s AND s.expires_at > NOW()",
            (token,)
        )
        row = cur.fetchone()
        conn.close()

        if not row:
            return err(401, "Сессия истекла")

        return ok({"user": {"id": row[0], "name": row[1], "email": row[2], "city": row[3], "phone": row[4], "about": row[5]}})

    # --- logout ---
    if action == "logout":
        if token:
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(f"UPDATE {SCHEMA}.sessions SET expires_at = NOW() WHERE token = %s", (token,))
            conn.commit()
            conn.close()
        return ok({"ok": True})

    return err(400, "Неизвестное действие. Укажите action: register | login | me | logout")
