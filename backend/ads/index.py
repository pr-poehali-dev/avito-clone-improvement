"""
CRUD объявлений ОбъявоМаркет.
action: list | my | create | delete — query-параметр или в body.
"""

import json
import os
import psycopg2
from datetime import datetime

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p16851207_avito_clone_improvem")

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Authorization, Authorization",
    "Content-Type": "application/json",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def ok(data):
    return {"statusCode": 200, "headers": CORS, "body": json.dumps(data, default=str)}


def err(code, msg):
    return {"statusCode": code, "headers": CORS, "body": json.dumps({"error": msg})}


def get_user_id(token: str, conn) -> int | None:
    if not token:
        return None
    cur = conn.cursor()
    cur.execute(
        f"SELECT user_id FROM {SCHEMA}.sessions WHERE token = %s AND expires_at > NOW()",
        (token,)
    )
    row = cur.fetchone()
    return row[0] if row else None


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    body = {}
    if event.get("body"):
        body = json.loads(event["body"])

    qs = event.get("queryStringParameters") or {}
    action = qs.get("action") or body.get("action") or "list"

    headers_in = event.get("headers") or {}
    raw_auth = headers_in.get("X-Authorization") or headers_in.get("Authorization") or ""
    token = raw_auth.replace("Bearer ", "").strip()

    # --- list: публичный список объявлений ---
    if action == "list":
        category = qs.get("category") or ""
        city = qs.get("city") or ""
        min_price = qs.get("min_price") or ""
        max_price = qs.get("max_price") or ""
        search = qs.get("search") or ""
        limit = int(qs.get("limit") or 40)
        offset = int(qs.get("offset") or 0)

        where = [f"a.status = 'active'"]
        if category:
            where.append(f"a.category = '{category}'")
        if city and city != "Все города":
            where.append(f"a.city ILIKE '%{city}%'")
        if min_price:
            where.append(f"a.price >= {int(min_price)}")
        if max_price:
            where.append(f"a.price <= {int(max_price)}")
        if search:
            safe = search.replace("'", "''")
            where.append(f"(a.title ILIKE '%{safe}%' OR a.description ILIKE '%{safe}%')")

        where_sql = " AND ".join(where)

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"""
            SELECT a.id, a.title, a.price, a.city, a.category, a.views,
                   a.image_url, a.created_at, u.name as seller_name
            FROM {SCHEMA}.ads a
            JOIN {SCHEMA}.users u ON u.id = a.user_id
            WHERE {where_sql}
            ORDER BY a.created_at DESC
            LIMIT {limit} OFFSET {offset}
        """)
        rows = cur.fetchall()

        cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.ads a WHERE {where_sql}")
        total = cur.fetchone()[0]
        conn.close()

        ads = []
        for r in rows:
            ads.append({
                "id": r[0], "title": r[1], "price": r[2], "city": r[3],
                "category": r[4], "views": r[5], "image_url": r[6],
                "created_at": str(r[7]), "seller_name": r[8],
            })
        return ok({"ads": ads, "total": total})

    # --- my: объявления текущего пользователя ---
    if action == "my":
        conn = get_conn()
        user_id = get_user_id(token, conn)
        if not user_id:
            conn.close()
            return err(401, "Не авторизован")

        status_filter = qs.get("status") or "active"
        cur = conn.cursor()
        cur.execute(f"""
            SELECT id, title, price, city, category, views, image_url, created_at, status
            FROM {SCHEMA}.ads
            WHERE user_id = %s AND status = %s
            ORDER BY created_at DESC
        """, (user_id, status_filter))
        rows = cur.fetchall()

        cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.ads WHERE user_id = %s AND status = 'active'", (user_id,))
        active_count = cur.fetchone()[0]
        cur.execute(f"SELECT COALESCE(SUM(views), 0) FROM {SCHEMA}.ads WHERE user_id = %s", (user_id,))
        total_views = cur.fetchone()[0]
        conn.close()

        ads = []
        for r in rows:
            ads.append({
                "id": r[0], "title": r[1], "price": r[2], "city": r[3],
                "category": r[4], "views": r[5], "image_url": r[6],
                "created_at": str(r[7]), "status": r[8],
            })
        return ok({"ads": ads, "active_count": active_count, "total_views": total_views})

    # --- create ---
    if action == "create":
        conn = get_conn()
        user_id = get_user_id(token, conn)
        if not user_id:
            conn.close()
            return err(401, "Не авторизован")

        title = (body.get("title") or "").strip()
        description = (body.get("description") or "").strip()
        price_raw = body.get("price") or 0
        category = (body.get("category") or "").strip()
        city = (body.get("city") or "").strip()
        image_url = (body.get("image_url") or "").strip() or None

        if not title or not category:
            conn.close()
            return err(400, "Укажите заголовок и категорию")

        try:
            price = int(float(str(price_raw)))
        except Exception:
            price = 0

        cur = conn.cursor()
        cur.execute(f"""
            INSERT INTO {SCHEMA}.ads (user_id, title, description, price, category, city, image_url)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id, title, price, city, category, views, image_url, created_at
        """, (user_id, title, description, price, category, city, image_url))
        row = cur.fetchone()
        conn.commit()
        conn.close()

        return ok({"ad": {
            "id": row[0], "title": row[1], "price": row[2], "city": row[3],
            "category": row[4], "views": row[5], "image_url": row[6], "created_at": str(row[7]),
        }})

    # --- delete (soft) ---
    if action == "delete":
        conn = get_conn()
        user_id = get_user_id(token, conn)
        if not user_id:
            conn.close()
            return err(401, "Не авторизован")

        ad_id = body.get("id") or qs.get("id")
        if not ad_id:
            conn.close()
            return err(400, "Укажите id объявления")

        cur = conn.cursor()
        cur.execute(f"""
            UPDATE {SCHEMA}.ads SET status = 'archived', updated_at = NOW()
            WHERE id = %s AND user_id = %s
        """, (int(ad_id), user_id))
        affected = cur.rowcount
        conn.commit()
        conn.close()

        if affected == 0:
            return err(404, "Объявление не найдено")
        return ok({"ok": True})

    return err(400, "Неизвестное действие")
