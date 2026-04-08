"""
CRUD объявлений ОбъявоМаркет.
action: list | my | create | delete | get | pause | user_stats — query-параметр или в body.
Новые объявления создаются со статусом pending (на модерации).
"""

import json
import os
import psycopg2

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

        # Вкладка "На паузе" показывает paused + pending + rejected
        if status_filter == "paused":
            cur.execute(f"""
                SELECT id, title, price, city, category, views, image_url, created_at, status, moderation_comment
                FROM {SCHEMA}.ads
                WHERE user_id = %s AND status IN ('paused', 'pending', 'rejected')
                ORDER BY created_at DESC
            """, (user_id,))
        else:
            cur.execute(f"""
                SELECT id, title, price, city, category, views, image_url, created_at, status, moderation_comment
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
                "moderation_comment": r[9],
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

        media_urls = body.get("media_urls") or []  # [{url, type}]
        # если media_urls не передан но есть image_url — используем его
        if not media_urls and image_url:
            media_urls = [{"url": image_url, "type": "photo"}]

        cur = conn.cursor()
        cur.execute(f"""
            INSERT INTO {SCHEMA}.ads (user_id, title, description, price, category, city, image_url, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, 'pending')
            RETURNING id, title, price, city, category, views, image_url, created_at
        """, (user_id, title, description, price, category, city,
              media_urls[0]["url"] if media_urls else image_url))
        row = cur.fetchone()
        ad_id = row[0]

        # Сохраняем все медиафайлы
        for i, m in enumerate(media_urls[:11]):  # max 10 фото + 1 видео
            mtype = m.get("type", "photo")
            cur.execute(f"""
                INSERT INTO {SCHEMA}.ad_media (ad_id, url, media_type, sort_order)
                VALUES (%s, %s, %s, %s)
            """, (ad_id, m["url"], mtype, i))

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

    # --- get: детальная страница объявления ---
    if action == "get":
        ad_id = qs.get("id") or body.get("id")
        if not ad_id:
            return err(400, "Укажите id")
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"""
            SELECT a.id, a.title, a.description, a.price, a.city, a.category,
                   a.views, a.image_url, a.created_at, a.status,
                   u.id as user_id, u.name as seller_name
            FROM {SCHEMA}.ads a
            JOIN {SCHEMA}.users u ON u.id = a.user_id
            WHERE a.id = %s
        """, (int(ad_id),))
        row = cur.fetchone()
        if not row:
            conn.close()
            return err(404, "Объявление не найдено")

        # Медиафайлы
        cur.execute(f"""
            SELECT url, media_type, sort_order
            FROM {SCHEMA}.ad_media WHERE ad_id = %s ORDER BY sort_order
        """, (int(ad_id),))
        media = [{"url": m[0], "type": m[1]} for m in cur.fetchall()]

        # Инкрементируем просмотры
        cur.execute(f"UPDATE {SCHEMA}.ads SET views = views + 1 WHERE id = %s", (int(ad_id),))
        conn.commit()
        conn.close()

        ad = {
            "id": row[0], "title": row[1], "description": row[2],
            "price": row[3], "city": row[4], "category": row[5],
            "views": row[6] + 1, "image_url": row[7], "created_at": str(row[8]),
            "status": row[9], "user_id": row[10], "seller_name": row[11],
            "media": media if media else ([{"url": row[7], "type": "photo"}] if row[7] else []),
        }
        return ok({"ad": ad})

    # --- pause: приостановить/возобновить объявление ---
    if action == "pause":
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
        cur.execute(f"SELECT status FROM {SCHEMA}.ads WHERE id = %s AND user_id = %s", (int(ad_id), user_id))
        row = cur.fetchone()
        if not row:
            conn.close()
            return err(404, "Объявление не найдено")

        current = row[0]
        # pending и rejected нельзя снять/поставить на паузу
        if current in ("pending", "rejected"):
            conn.close()
            return err(400, "Нельзя изменить статус объявления на модерации")
        new_status = "paused" if current == "active" else "active"
        cur.execute(f"""
            UPDATE {SCHEMA}.ads SET status = %s, updated_at = NOW()
            WHERE id = %s AND user_id = %s
        """, (new_status, int(ad_id), user_id))
        conn.commit()
        conn.close()
        return ok({"ok": True, "new_status": new_status})

    # --- user_stats: статистика пользователя для профиля ---
    if action == "user_stats":
        if not token:
            return err(401, "Не авторизован")
        conn = get_conn()
        user_id = get_user_id(token, conn)
        if not user_id:
            conn.close()
            return err(401, "Не авторизован")

        cur = conn.cursor()
        cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.ads WHERE user_id = %s AND status = 'active'", (user_id,))
        active_ads = cur.fetchone()[0]

        cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.ads WHERE user_id = %s AND status = 'archived'", (user_id,))
        sold_ads = cur.fetchone()[0]

        cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.reviews WHERE target_user_id = %s", (user_id,))
        reviews_count = cur.fetchone()[0]

        cur.execute(f"SELECT ROUND(AVG(rating)::numeric, 1) FROM {SCHEMA}.reviews WHERE target_user_id = %s", (user_id,))
        avg_rating = cur.fetchone()[0] or 0

        cur.execute(f"SELECT created_at FROM {SCHEMA}.users WHERE id = %s", (user_id,))
        joined = cur.fetchone()

        # Непрочитанные сообщения
        try:
            cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.messages WHERE receiver_id = %s AND is_read = FALSE", (user_id,))
            unread_messages = cur.fetchone()[0]
        except Exception:
            unread_messages = 0

        conn.close()

        return ok({
            "active_ads": active_ads,
            "sold_ads": sold_ads,
            "reviews_count": reviews_count,
            "avg_rating": float(avg_rating),
            "joined_at": str(joined[0]) if joined else "",
            "unread_messages": unread_messages,
        })

    # --- unread: только счётчик непрочитанных для Navbar ---
    if action == "unread":
        if not token:
            return ok({"count": 0})
        conn = get_conn()
        user_id = get_user_id(token, conn)
        if not user_id:
            conn.close()
            return ok({"count": 0})
        cur = conn.cursor()
        try:
            cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.messages WHERE receiver_id = %s AND is_read = FALSE", (user_id,))
            count = cur.fetchone()[0]
        except Exception:
            count = 0
        conn.close()
        return ok({"count": count})

    # --- notifications: список уведомлений пользователя ---
    if action == "notifications":
        if not token:
            return ok({"notifications": [], "unread_count": 0})
        conn = get_conn()
        user_id = get_user_id(token, conn)
        if not user_id:
            conn.close()
            return ok({"notifications": [], "unread_count": 0})
        cur = conn.cursor()
        cur.execute(f"""
            SELECT id, type, title, text, ad_id, is_read, created_at
            FROM {SCHEMA}.notifications
            WHERE user_id = %s
            ORDER BY created_at DESC
            LIMIT 30
        """, (user_id,))
        rows = cur.fetchall()
        cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.notifications WHERE user_id = %s AND is_read = FALSE", (user_id,))
        unread_count = cur.fetchone()[0]
        conn.close()
        notifs = []
        for r in rows:
            notifs.append({"id": r[0], "type": r[1], "title": r[2], "text": r[3],
                           "ad_id": r[4], "is_read": r[5], "created_at": str(r[6])})
        return ok({"notifications": notifs, "unread_count": unread_count})

    # --- notifications_read: пометить уведомления прочитанными ---
    if action == "notifications_read":
        if not token:
            return err(401, "Не авторизован")
        conn = get_conn()
        user_id = get_user_id(token, conn)
        if not user_id:
            conn.close()
            return err(401, "Не авторизован")
        notif_id = body.get("id")
        cur = conn.cursor()
        if notif_id:
            cur.execute(f"UPDATE {SCHEMA}.notifications SET is_read = TRUE WHERE id = %s AND user_id = %s",
                        (int(notif_id), user_id))
        else:
            cur.execute(f"UPDATE {SCHEMA}.notifications SET is_read = TRUE WHERE user_id = %s", (user_id,))
        conn.commit()
        conn.close()
        return ok({"ok": True})

    # --- site_stats: публичная статистика для главной страницы ---
    if action == "site_stats":
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.ads WHERE status = 'active'")
        total_ads = cur.fetchone()[0]
        cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.users")
        total_users = cur.fetchone()[0]
        cur.execute(f"SELECT COUNT(DISTINCT city) FROM {SCHEMA}.users WHERE city IS NOT NULL AND city != ''")
        total_cities = cur.fetchone()[0]
        cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.ads WHERE status != 'deleted'")
        total_deals = cur.fetchone()[0]
        conn.close()
        return ok({"total_ads": total_ads, "total_users": total_users, "total_cities": total_cities, "total_deals": total_deals})

    return err(400, "Неизвестное действие")