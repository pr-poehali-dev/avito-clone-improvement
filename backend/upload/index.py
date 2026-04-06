"""
Загрузка фото объявлений в S3.
POST /?action=photo — принимает base64-изображение, возвращает CDN URL.
Требует авторизацию через токен.
"""

import json
import os
import base64
import uuid
import boto3
import psycopg2

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p16851207_avito_clone_improvem")
BUCKET = "files"
CDN_BASE = f"https://cdn.poehali.dev/projects/{os.environ.get('AWS_ACCESS_KEY_ID', '')}/bucket"

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Authorization, Authorization",
    "Content-Type": "application/json",
}

ALLOWED_TYPES = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp"}
MAX_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB


def ok(data):
    return {"statusCode": 200, "headers": CORS, "body": json.dumps(data)}


def err(code, msg):
    return {"statusCode": code, "headers": CORS, "body": json.dumps({"error": msg})}


def get_s3():
    return boto3.client(
        "s3",
        endpoint_url="https://bucket.poehali.dev",
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    )


def get_user_id(token: str) -> int | None:
    if not token:
        return None
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()
    cur.execute(
        f"SELECT user_id FROM {SCHEMA}.sessions WHERE token = %s AND expires_at > NOW()",
        (token,)
    )
    row = cur.fetchone()
    conn.close()
    return row[0] if row else None


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    headers_in = event.get("headers") or {}
    raw_auth = headers_in.get("X-Authorization") or headers_in.get("Authorization") or ""
    token = raw_auth.replace("Bearer ", "").strip()

    user_id = get_user_id(token)
    if not user_id:
        return err(401, "Не авторизован")

    body = {}
    if event.get("body"):
        body = json.loads(event["body"])

    # Принимаем base64 строку и mime-тип
    data_b64 = body.get("data") or ""
    mime = (body.get("mime") or "image/jpeg").lower()

    if not data_b64:
        return err(400, "Не передан файл (поле data)")

    if mime not in ALLOWED_TYPES:
        return err(400, f"Неподдерживаемый тип файла. Разрешены: {', '.join(ALLOWED_TYPES)}")

    # Декодируем base64 (убираем data:image/... префикс если есть)
    if "," in data_b64:
        data_b64 = data_b64.split(",", 1)[1]

    try:
        image_bytes = base64.b64decode(data_b64)
    except Exception:
        return err(400, "Некорректный base64")

    if len(image_bytes) > MAX_SIZE_BYTES:
        return err(400, "Файл слишком большой. Максимум 5 МБ")

    ext = ALLOWED_TYPES[mime]
    key = f"ads/{user_id}/{uuid.uuid4()}.{ext}"

    s3 = get_s3()
    s3.put_object(
        Bucket=BUCKET,
        Key=key,
        Body=image_bytes,
        ContentType=mime,
    )

    cdn_url = f"{CDN_BASE}/{key}"
    return ok({"url": cdn_url, "key": key})
