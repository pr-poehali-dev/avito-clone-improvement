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
        subcategory = qs.get("subcategory") or ""
        city = qs.get("city") or ""
        min_price = qs.get("min_price") or ""
        max_price = qs.get("max_price") or ""
        search = qs.get("search") or ""
        limit = int(qs.get("limit") or 40)
        offset = int(qs.get("offset") or 0)

        where = [f"a.status = 'active'"]
        if category:
            where.append(f"a.category = '{category}'")
        if subcategory:
            safe_sub = subcategory.replace("'", "''")
            where.append(f"a.subcategory = '{safe_sub}'")
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
                   a.image_url, a.created_at, u.name as seller_name, u.avatar_url as seller_avatar
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
                "created_at": str(r[7]), "seller_name": r[8], "seller_avatar": r[9],
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
                SELECT id, title, price, city, category, views, image_url, created_at, status, moderation_comment, sold_on_omo, sold_at
                FROM {SCHEMA}.ads
                WHERE user_id = %s AND status IN ('paused', 'pending', 'rejected')
                ORDER BY created_at DESC
            """, (user_id,))
        elif status_filter == "archived":
            cur.execute(f"""
                SELECT id, title, price, city, category, views, image_url, created_at, status, moderation_comment, sold_on_omo, sold_at
                FROM {SCHEMA}.ads
                WHERE user_id = %s AND status IN ('archived', 'sold')
                ORDER BY created_at DESC
            """, (user_id,))
        else:
            cur.execute(f"""
                SELECT id, title, price, city, category, views, image_url, created_at, status, moderation_comment, sold_on_omo, sold_at
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
                "sold_on_omo": r[10],
                "sold_at": str(r[11]) if r[11] else None,
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
        subcategory = (body.get("subcategory") or "").strip() or None
        city = (body.get("city") or "").strip()
        image_url = (body.get("image_url") or "").strip() or None
        condition = (body.get("condition") or "used").strip()
        quantity = int(body.get("quantity") or 1)
        bargain = bool(body.get("bargain") or False)
        exchange = bool(body.get("exchange") or False)

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
            INSERT INTO {SCHEMA}.ads (user_id, title, description, price, category, subcategory, city, image_url, status, condition, quantity, bargain, exchange)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'pending', %s, %s, %s, %s)
            RETURNING id, title, price, city, category, views, image_url, created_at
        """, (user_id, title, description, price, category, subcategory, city,
              media_urls[0]["url"] if media_urls else image_url, condition, quantity, bargain, exchange))
        row = cur.fetchone()
        ad_id = row[0]

        # Записываем начальную цену в историю
        cur.execute(f"INSERT INTO {SCHEMA}.price_history (ad_id, price) VALUES (%s, %s)", (ad_id, price))

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

    # --- mark_sold: пометить объявление как проданное ---
    if action == "mark_sold":
        if not token:
            return err(401, "Не авторизован")
        conn = get_conn()
        user_id = get_user_id(token, conn)
        if not user_id:
            conn.close()
            return err(401, "Не авторизован")

        ad_id = body.get("id")
        sold_on_omo = bool(body.get("sold_on_omo", False))

        if not ad_id:
            conn.close()
            return err(400, "Укажите id объявления")

        cur = conn.cursor()
        cur.execute(f"""
            UPDATE {SCHEMA}.ads
            SET status = 'sold', sold_on_omo = %s, sold_at = NOW(), updated_at = NOW()
            WHERE id = %s AND user_id = %s AND status NOT IN ('deleted', 'sold')
        """, (sold_on_omo, int(ad_id), user_id))
        affected = cur.rowcount
        conn.commit()
        conn.close()

        if affected == 0:
            return err(404, "Объявление не найдено или уже продано")
        return ok({"ok": True, "sold_on_omo": sold_on_omo})

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
                   u.id as user_id, u.name as seller_name,
                   a.subcategory, a.condition, a.quantity,
                   u.phone as seller_phone, u.avatar_url as seller_avatar,
                   a.bargain, a.exchange
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
        # Обновляем дневную статистику просмотров
        cur.execute(f"""
            INSERT INTO {SCHEMA}.ad_view_stats (ad_id, stat_date, views_count)
            VALUES (%s, CURRENT_DATE, 1)
            ON CONFLICT (ad_id, stat_date) DO UPDATE SET views_count = {SCHEMA}.ad_view_stats.views_count + 1
        """, (int(ad_id),))
        # Если авторизован — записываем в историю просмотров
        if token:
            view_user_id = get_user_id(token, conn)
            if view_user_id:
                cur.execute(f"""
                    INSERT INTO {SCHEMA}.viewed_ads (user_id, ad_id, viewed_at)
                    VALUES (%s, %s, NOW())
                    ON CONFLICT (user_id, ad_id) DO UPDATE SET viewed_at = NOW()
                """, (view_user_id, int(ad_id)))
        conn.commit()
        conn.close()

        ad = {
            "id": row[0], "title": row[1], "description": row[2],
            "price": row[3], "city": row[4], "category": row[5],
            "views": row[6] + 1, "image_url": row[7], "created_at": str(row[8]),
            "status": row[9], "user_id": row[10], "seller_name": row[11],
            "subcategory": row[12], "condition": row[13], "quantity": row[14],
            "seller_phone": row[15], "seller_avatar": row[16],
            "bargain": row[17], "exchange": row[18],
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

        cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.ads WHERE user_id = %s AND status IN ('archived', 'sold')", (user_id,))
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
        cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.ads WHERE status = 'sold' AND sold_on_omo = TRUE")
        total_deals = cur.fetchone()[0]
        conn.close()
        return ok({"total_ads": total_ads, "total_users": total_users, "total_cities": total_cities, "total_deals": total_deals})

    # --- track_view: записать просмотр объявления авторизованным пользователем ---
    if action == "track_view":
        ad_id = body.get("ad_id") or qs.get("ad_id")
        if not ad_id:
            return err(400, "Укажите ad_id")
        conn = get_conn()
        cur = conn.cursor()
        # Обновить дневную статистику просмотров
        cur.execute(f"""
            INSERT INTO {SCHEMA}.ad_view_stats (ad_id, stat_date, views_count)
            VALUES (%s, CURRENT_DATE, 1)
            ON CONFLICT (ad_id, stat_date) DO UPDATE SET views_count = {SCHEMA}.ad_view_stats.views_count + 1
        """, (int(ad_id),))
        # Если пользователь авторизован — сохранить в историю
        if token:
            user_id = get_user_id(token, conn)
            if user_id:
                cur.execute(f"""
                    INSERT INTO {SCHEMA}.viewed_ads (user_id, ad_id, viewed_at)
                    VALUES (%s, %s, NOW())
                    ON CONFLICT (user_id, ad_id) DO UPDATE SET viewed_at = NOW()
                """, (user_id, int(ad_id)))
        conn.commit()
        conn.close()
        return ok({"ok": True})

    # --- view_history: история просмотров пользователя ---
    if action == "view_history":
        if not token:
            return err(401, "Не авторизован")
        conn = get_conn()
        user_id = get_user_id(token, conn)
        if not user_id:
            conn.close()
            return err(401, "Не авторизован")
        limit = int(qs.get("limit") or 30)
        offset = int(qs.get("offset") or 0)
        cur = conn.cursor()
        cur.execute(f"""
            SELECT a.id, a.title, a.price, a.city, a.category, a.views,
                   a.image_url, a.created_at, u.name as seller_name,
                   a.status, v.viewed_at
            FROM {SCHEMA}.viewed_ads v
            JOIN {SCHEMA}.ads a ON a.id = v.ad_id
            JOIN {SCHEMA}.users u ON u.id = a.user_id
            WHERE v.user_id = %s
            ORDER BY v.viewed_at DESC
            LIMIT %s OFFSET %s
        """, (user_id, limit, offset))
        rows = cur.fetchall()
        conn.close()
        ads = []
        for r in rows:
            ads.append({
                "id": r[0], "title": r[1], "price": r[2], "city": r[3],
                "category": r[4], "views": r[5], "image_url": r[6],
                "created_at": str(r[7]), "seller_name": r[8],
                "status": r[9], "viewed_at": str(r[10]),
            })
        return ok({"ads": ads})

    # --- viewed_ids: список id просмотренных объявлений для пометки на карточках ---
    if action == "viewed_ids":
        if not token:
            return ok({"ids": []})
        conn = get_conn()
        user_id = get_user_id(token, conn)
        if not user_id:
            conn.close()
            return ok({"ids": []})
        cur = conn.cursor()
        cur.execute(f"SELECT ad_id FROM {SCHEMA}.viewed_ads WHERE user_id = %s", (user_id,))
        ids = [r[0] for r in cur.fetchall()]
        conn.close()
        return ok({"ids": ids})

    # --- ad_view_stats: статистика просмотров объявления по дням (только для автора) ---
    if action == "ad_view_stats":
        ad_id = qs.get("ad_id") or body.get("ad_id")
        period = qs.get("period") or "week"
        if not ad_id:
            return err(400, "Укажите ad_id")
        if not token:
            return err(401, "Не авторизован")
        conn = get_conn()
        user_id = get_user_id(token, conn)
        if not user_id:
            conn.close()
            return err(401, "Не авторизован")
        cur = conn.cursor()
        # Проверяем что это объявление принадлежит пользователю
        cur.execute(f"SELECT id FROM {SCHEMA}.ads WHERE id = %s AND user_id = %s", (int(ad_id), user_id))
        if not cur.fetchone():
            conn.close()
            return err(403, "Доступ запрещён")
        days = {"day": 1, "3days": 3, "week": 7, "month": 30}.get(period, 7)
        cur.execute(f"""
            SELECT stat_date, views_count
            FROM {SCHEMA}.ad_view_stats
            WHERE ad_id = %s AND stat_date >= CURRENT_DATE - INTERVAL '{days} days'
            ORDER BY stat_date ASC
        """, (int(ad_id),))
        rows = cur.fetchall()
        conn.close()
        stats = [{"date": str(r[0]), "views": r[1]} for r in rows]
        return ok({"stats": stats})

    # --- offer_price: покупатель предлагает свою цену ---
    if action == "offer_price":
        if not token:
            return err(401, "Не авторизован")
        conn = get_conn()
        user_id = get_user_id(token, conn)
        if not user_id:
            conn.close()
            return err(401, "Не авторизован")
        ad_id = body.get("ad_id")
        offered_price = body.get("offered_price")
        message = body.get("message") or ""
        if not ad_id or not offered_price:
            conn.close()
            return err(400, "Укажите ad_id и offered_price")
        cur = conn.cursor()
        # Нельзя торговаться с самим собой
        cur.execute(f"SELECT user_id, title, price FROM {SCHEMA}.ads WHERE id = %s AND status = 'active'", (int(ad_id),))
        ad_row = cur.fetchone()
        if not ad_row:
            conn.close()
            return err(404, "Объявление не найдено")
        seller_id, ad_title, ad_price = ad_row
        if seller_id == user_id:
            conn.close()
            return err(400, "Нельзя торговаться с самим собой")
        cur.execute(f"""
            INSERT INTO {SCHEMA}.price_offers (ad_id, buyer_id, offered_price, message, status)
            VALUES (%s, %s, %s, %s, 'pending')
            RETURNING id
        """, (int(ad_id), user_id, int(offered_price), message))
        offer_id = cur.fetchone()[0]
        # Уведомление продавцу
        cur.execute(f"""
            SELECT name FROM {SCHEMA}.users WHERE id = %s
        """, (user_id,))
        buyer_name = (cur.fetchone() or ["Покупатель"])[0]
        cur.execute(f"""
            INSERT INTO {SCHEMA}.notifications (user_id, type, title, text, ad_id)
            VALUES (%s, 'price_offer', 'Предложение цены', %s, %s)
        """, (seller_id, f'{buyer_name} предлагает {int(offered_price):,} ₽ за «{ad_title}»', int(ad_id)))
        conn.commit()
        conn.close()
        return ok({"ok": True, "offer_id": offer_id})

    # --- get_offers: получить предложения цен для объявления (для продавца) ---
    if action == "get_offers":
        if not token:
            return err(401, "Не авторизован")
        ad_id = qs.get("ad_id") or body.get("ad_id")
        if not ad_id:
            return err(400, "Укажите ad_id")
        conn = get_conn()
        user_id = get_user_id(token, conn)
        if not user_id:
            conn.close()
            return err(401, "Не авторизован")
        cur = conn.cursor()
        cur.execute(f"SELECT id FROM {SCHEMA}.ads WHERE id = %s AND user_id = %s", (int(ad_id), user_id))
        if not cur.fetchone():
            conn.close()
            return err(403, "Доступ запрещён")
        cur.execute(f"""
            SELECT o.id, o.offered_price, o.message, o.status, o.created_at, u.name as buyer_name
            FROM {SCHEMA}.price_offers o
            JOIN {SCHEMA}.users u ON u.id = o.buyer_id
            WHERE o.ad_id = %s
            ORDER BY o.created_at DESC
        """, (int(ad_id),))
        rows = cur.fetchall()
        conn.close()
        offers = [{"id": r[0], "offered_price": r[1], "message": r[2], "status": r[3],
                   "created_at": str(r[4]), "buyer_name": r[5]} for r in rows]
        return ok({"offers": offers})

    # --- recommendations: объявления на основе истории просмотров ---
    if action == "recommendations":
        limit = int(qs.get("limit") or 8)
        conn = get_conn()
        cur = conn.cursor()

        if token:
            user_id = get_user_id(token, conn)
        else:
            user_id = None

        if user_id:
            # Берём категории из последних 20 просмотров
            cur.execute(f"""
                SELECT a.category, COUNT(*) as cnt
                FROM {SCHEMA}.viewed_ads v
                JOIN {SCHEMA}.ads a ON a.id = v.ad_id
                WHERE v.user_id = %s
                GROUP BY a.category
                ORDER BY cnt DESC
                LIMIT 3
            """, (user_id,))
            top_cats = [r[0] for r in cur.fetchall()]

            if top_cats:
                cats_sql = "', '".join(top_cats)
                cur.execute(f"""
                    SELECT a.id, a.title, a.price, a.city, a.category, a.views,
                           a.image_url, a.created_at, u.name as seller_name,
                           (a.views * 2 + EXTRACT(EPOCH FROM (NOW() - a.created_at)) / -3600) as score
                    FROM {SCHEMA}.ads a
                    JOIN {SCHEMA}.users u ON u.id = a.user_id
                    WHERE a.status = 'active'
                      AND a.category IN ('{cats_sql}')
                      AND a.id NOT IN (
                          SELECT ad_id FROM {SCHEMA}.viewed_ads WHERE user_id = %s
                      )
                    ORDER BY score DESC
                    LIMIT {limit}
                """, (user_id,))
                rows = cur.fetchall()
                if rows:
                    conn.close()
                    ads = [{"id": r[0], "title": r[1], "price": r[2], "city": r[3],
                            "category": r[4], "views": r[5], "image_url": r[6],
                            "created_at": str(r[7]), "seller_name": r[8]} for r in rows]
                    return ok({"ads": ads, "based_on": top_cats})

        # Fallback — популярные за последние 7 дней
        cur.execute(f"""
            SELECT a.id, a.title, a.price, a.city, a.category, a.views,
                   a.image_url, a.created_at, u.name as seller_name
            FROM {SCHEMA}.ads a
            JOIN {SCHEMA}.users u ON u.id = a.user_id
            WHERE a.status = 'active'
              AND a.created_at >= NOW() - INTERVAL '30 days'
            ORDER BY a.views DESC
            LIMIT {limit}
        """)
        rows = cur.fetchall()
        conn.close()
        ads = [{"id": r[0], "title": r[1], "price": r[2], "city": r[3],
                "category": r[4], "views": r[5], "image_url": r[6],
                "created_at": str(r[7]), "seller_name": r[8]} for r in rows]
        return ok({"ads": ads, "based_on": []})

    # --- hot_ads: популярные объявления с маркером ---
    if action == "hot_ads":
        limit = int(qs.get("limit") or 8)
        conn = get_conn()
        cur = conn.cursor()
        # Score = просмотры за неделю * 3 + общие просмотры
        cur.execute(f"""
            SELECT a.id, a.title, a.price, a.city, a.category, a.views,
                   a.image_url, a.created_at, u.name as seller_name,
                   COALESCE(ws.week_views, 0) as week_views,
                   (COALESCE(ws.week_views, 0) * 3 + a.views) as score
            FROM {SCHEMA}.ads a
            JOIN {SCHEMA}.users u ON u.id = a.user_id
            LEFT JOIN (
                SELECT ad_id, SUM(views_count) as week_views
                FROM {SCHEMA}.ad_view_stats
                WHERE stat_date >= CURRENT_DATE - INTERVAL '7 days'
                GROUP BY ad_id
            ) ws ON ws.ad_id = a.id
            WHERE a.status = 'active'
            ORDER BY score DESC
            LIMIT {limit}
        """)
        rows = cur.fetchall()
        conn.close()
        ads = [{"id": r[0], "title": r[1], "price": r[2], "city": r[3],
                "category": r[4], "views": r[5], "image_url": r[6],
                "created_at": str(r[7]), "seller_name": r[8],
                "week_views": r[9], "score": r[10], "hot": True} for r in rows]
        return ok({"ads": ads})

    # --- send_report: пожаловаться на объявление или пользователя ---
    if action == "send_report":
        if not token:
            return err(401, "Не авторизован")
        conn = get_conn()
        user_id = get_user_id(token, conn)
        if not user_id:
            conn.close()
            return err(401, "Не авторизован")
        ad_id_r = body.get("ad_id")
        target_user_id = body.get("target_user_id")
        reason = (body.get("reason") or "").strip()
        details = (body.get("details") or "").strip() or None
        if not reason:
            conn.close()
            return err(400, "Укажите причину жалобы")
        cur = conn.cursor()
        cur.execute(f"""
            INSERT INTO {SCHEMA}.reports (reporter_id, ad_id, target_user_id, reason, details)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id
        """, (user_id, ad_id_r, target_user_id, reason, details))
        report_id = cur.fetchone()[0]
        # Проверяем подозрительную активность: 3+ жалоб на пользователя
        if target_user_id:
            cur.execute(f"""
                SELECT COUNT(*) FROM {SCHEMA}.reports
                WHERE target_user_id = %s AND status = 'open'
            """, (int(target_user_id),))
            report_count = cur.fetchone()[0]
            if report_count >= 3:
                # Уведомляем всех администраторов
                cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE is_admin = TRUE")
                admin_ids = [r[0] for r in cur.fetchall()]
                cur.execute(f"SELECT name FROM {SCHEMA}.users WHERE id = %s", (int(target_user_id),))
                target_row = cur.fetchone()
                target_name = target_row[0] if target_row else "пользователь"
                for admin_id in admin_ids:
                    cur.execute(f"""
                        INSERT INTO {SCHEMA}.notifications (user_id, type, title, text, ad_id)
                        VALUES (%s, 'alert', 'Подозрительная активность', %s, %s)
                    """, (admin_id, f'На пользователя «{target_name}» поступило уже {report_count} жалоб', ad_id_r))
        conn.commit()
        conn.close()
        return ok({"ok": True, "report_id": report_id})

    # --- subscribe: подписаться на категорию или ключевое слово ---
    if action == "subscribe":
        if not token:
            return err(401, "Не авторизован")
        conn = get_conn()
        user_id = get_user_id(token, conn)
        if not user_id:
            conn.close()
            return err(401, "Не авторизован")
        sub_type = (body.get("type") or "category").strip()
        value = (body.get("value") or "").strip()
        if not value:
            conn.close()
            return err(400, "Укажите значение подписки")
        if sub_type not in ("category", "keyword"):
            conn.close()
            return err(400, "Тип должен быть category или keyword")
        cur = conn.cursor()
        cur.execute(f"""
            INSERT INTO {SCHEMA}.subscriptions (user_id, type, value)
            VALUES (%s, %s, %s)
            ON CONFLICT (user_id, type, value) DO NOTHING
            RETURNING id
        """, (user_id, sub_type, value))
        row = cur.fetchone()
        conn.commit()
        conn.close()
        return ok({"ok": True, "created": bool(row)})

    # --- unsubscribe: отписаться ---
    if action == "unsubscribe":
        if not token:
            return err(401, "Не авторизован")
        conn = get_conn()
        user_id = get_user_id(token, conn)
        if not user_id:
            conn.close()
            return err(401, "Не авторизован")
        sub_id = body.get("id")
        sub_type = body.get("type")
        value = body.get("value")
        cur = conn.cursor()
        if sub_id:
            cur.execute(f"UPDATE {SCHEMA}.subscriptions SET id = id WHERE id = %s AND user_id = %s", (int(sub_id), user_id))
            cur.execute(f"DELETE FROM {SCHEMA}.subscriptions WHERE id = %s AND user_id = %s", (int(sub_id), user_id))
        elif sub_type and value:
            cur.execute(f"DELETE FROM {SCHEMA}.subscriptions WHERE user_id = %s AND type = %s AND value = %s", (user_id, sub_type, value))
        conn.commit()
        conn.close()
        return ok({"ok": True})

    # --- my_subscriptions: список подписок пользователя ---
    if action == "my_subscriptions":
        if not token:
            return err(401, "Не авторизован")
        conn = get_conn()
        user_id = get_user_id(token, conn)
        if not user_id:
            conn.close()
            return err(401, "Не авторизован")
        cur = conn.cursor()
        cur.execute(f"""
            SELECT id, type, value, created_at
            FROM {SCHEMA}.subscriptions
            WHERE user_id = %s
            ORDER BY created_at DESC
        """, (user_id,))
        rows = cur.fetchall()
        conn.close()
        subs = [{"id": r[0], "type": r[1], "value": r[2], "created_at": str(r[3])} for r in rows]
        return ok({"subscriptions": subs})

    # --- similar: похожие объявления той же категории ---
    if action == "similar":
        ad_id = qs.get("ad_id") or body.get("ad_id")
        if not ad_id:
            return err(400, "Укажите ad_id")
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"SELECT category, city, price FROM {SCHEMA}.ads WHERE id = %s", (int(ad_id),))
        row = cur.fetchone()
        if not row:
            conn.close()
            return ok({"ads": []})
        cat, city, price = row
        limit = int(qs.get("limit") or 6)
        # Похожие: та же категория, близкая цена, не это же объявление
        cur.execute(f"""
            SELECT a.id, a.title, a.price, a.city, a.category, a.views,
                   a.image_url, a.created_at, u.name as seller_name, a.bargain, a.exchange
            FROM {SCHEMA}.ads a
            JOIN {SCHEMA}.users u ON u.id = a.user_id
            WHERE a.status = 'active'
              AND a.category = %s
              AND a.id != %s
            ORDER BY ABS(a.price - %s) ASC, a.created_at DESC
            LIMIT %s
        """, (cat, int(ad_id), price or 0, limit))
        rows = cur.fetchall()
        conn.close()
        ads = [{"id": r[0], "title": r[1], "price": r[2], "city": r[3],
                "category": r[4], "views": r[5], "image_url": r[6],
                "created_at": str(r[7]), "seller_name": r[8],
                "bargain": r[9], "exchange": r[10]} for r in rows]
        return ok({"ads": ads})

    # --- price_history: история изменения цены объявления ---
    if action == "price_history":
        ad_id = qs.get("ad_id") or body.get("ad_id")
        if not ad_id:
            return err(400, "Укажите ad_id")
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"""
            SELECT price, changed_at FROM {SCHEMA}.price_history
            WHERE ad_id = %s ORDER BY changed_at ASC
        """, (int(ad_id),))
        rows = cur.fetchall()
        conn.close()
        history = [{"price": r[0], "changed_at": str(r[1])} for r in rows]
        return ok({"history": history})

    # --- templates_list: шаблоны объявлений пользователя ---
    if action == "templates_list":
        if not token:
            return err(401, "Не авторизован")
        conn = get_conn()
        user_id = get_user_id(token, conn)
        if not user_id:
            conn.close()
            return err(401, "Не авторизован")
        cur = conn.cursor()
        cur.execute(f"SELECT id, name, data, created_at FROM {SCHEMA}.ad_templates WHERE user_id = %s ORDER BY created_at DESC", (user_id,))
        rows = cur.fetchall()
        conn.close()
        import json as _json
        templates = [{"id": r[0], "name": r[1], "data": r[2], "created_at": str(r[3])} for r in rows]
        return ok({"templates": templates})

    # --- templates_save: сохранить шаблон ---
    if action == "templates_save":
        if not token:
            return err(401, "Не авторизован")
        conn = get_conn()
        user_id = get_user_id(token, conn)
        if not user_id:
            conn.close()
            return err(401, "Не авторизован")
        name = (body.get("name") or "Мой шаблон").strip()[:100]
        data = body.get("data") or {}
        cur = conn.cursor()
        cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.ad_templates WHERE user_id = %s", (user_id,))
        cnt = cur.fetchone()[0]
        if cnt >= 10:
            conn.close()
            return err(400, "Максимум 10 шаблонов")
        cur.execute(f"INSERT INTO {SCHEMA}.ad_templates (user_id, name, data) VALUES (%s, %s, %s) RETURNING id", (user_id, name, _json.dumps(data)))
        new_id = cur.fetchone()[0]
        conn.commit()
        conn.close()
        return ok({"id": new_id})

    # --- templates_delete: удалить шаблон ---
    if action == "templates_delete":
        if not token:
            return err(401, "Не авторизован")
        conn = get_conn()
        user_id = get_user_id(token, conn)
        if not user_id:
            conn.close()
            return err(401, "Не авторизован")
        tpl_id = body.get("id")
        if not tpl_id:
            conn.close()
            return err(400, "Укажите id")
        cur = conn.cursor()
        cur.execute(f"UPDATE {SCHEMA}.ad_templates SET id = id WHERE id = %s AND user_id = %s", (int(tpl_id), user_id))
        cur.execute(f"DELETE FROM {SCHEMA}.ad_templates WHERE id = %s AND user_id = %s", (int(tpl_id), user_id))
        conn.commit()
        conn.close()
        return ok({"ok": True})

    return err(400, "Неизвестное действие")