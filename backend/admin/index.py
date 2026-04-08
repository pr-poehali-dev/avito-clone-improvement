"""
Админ-панель ОбъявоМаркет.
action: stats | users | ads | delete_ad | ban_user | unban_user | make_admin | approve_ad | reject_ad
Требует прав администратора.
"""

import json
import os
import psycopg2

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p16851207_avito_clone_improvem")
CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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


def is_admin(user_id: int, conn) -> bool:
    cur = conn.cursor()
    cur.execute(f"SELECT 1 FROM {SCHEMA}.admins WHERE user_id = %s", (user_id,))
    return cur.fetchone() is not None


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    body = {}
    if event.get("body"):
        body = json.loads(event["body"])

    qs = event.get("queryStringParameters") or {}
    action = qs.get("action") or body.get("action") or "stats"

    headers_in = event.get("headers") or {}
    raw_auth = headers_in.get("X-Authorization") or headers_in.get("Authorization") or ""
    token = raw_auth.replace("Bearer ", "").strip()

    conn = get_conn()
    user_id = get_user_id(token, conn)
    if not user_id or not is_admin(user_id, conn):
        conn.close()
        return err(403, "Доступ запрещён")

    cur = conn.cursor()

    # --- stats ---
    if action == "stats":
        cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.users")
        total_users = cur.fetchone()[0]

        cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.ads WHERE status = 'active'")
        active_ads = cur.fetchone()[0]

        cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.ads")
        total_ads = cur.fetchone()[0]

        cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.messages")
        total_messages = cur.fetchone()[0]

        cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.reviews")
        total_reviews = cur.fetchone()[0]

        cur.execute(f"SELECT COALESCE(SUM(views), 0) FROM {SCHEMA}.ads")
        total_views = cur.fetchone()[0]

        cur.execute(f"""
            SELECT COUNT(*) FROM {SCHEMA}.users
            WHERE created_at > NOW() - INTERVAL '7 days'
        """)
        new_users_week = cur.fetchone()[0]

        cur.execute(f"""
            SELECT COUNT(*) FROM {SCHEMA}.ads
            WHERE created_at > NOW() - INTERVAL '7 days'
        """)
        new_ads_week = cur.fetchone()[0]

        conn.close()
        return ok({
            "total_users": total_users,
            "active_ads": active_ads,
            "total_ads": total_ads,
            "total_messages": total_messages,
            "total_reviews": total_reviews,
            "total_views": total_views,
            "new_users_week": new_users_week,
            "new_ads_week": new_ads_week,
        })

    # --- users ---
    if action == "users":
        limit = int(qs.get("limit") or 50)
        offset = int(qs.get("offset") or 0)
        search = qs.get("search") or ""

        where = "1=1"
        if search:
            safe = search.replace("'", "''")
            where = f"(u.name ILIKE '%{safe}%' OR u.email ILIKE '%{safe}%')"

        cur.execute(f"""
            SELECT u.id, u.name, u.email, u.created_at,
                   COUNT(DISTINCT a.id) as ads_count,
                   EXISTS(SELECT 1 FROM {SCHEMA}.admins ad WHERE ad.user_id = u.id) as is_admin,
                   u.is_banned
            FROM {SCHEMA}.users u
            LEFT JOIN {SCHEMA}.ads a ON a.user_id = u.id
            WHERE {where}
            GROUP BY u.id
            ORDER BY u.created_at DESC
            LIMIT {limit} OFFSET {offset}
        """)
        rows = cur.fetchall()

        cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.users u WHERE {where}")
        total = cur.fetchone()[0]
        conn.close()

        users = []
        for r in rows:
            users.append({
                "id": r[0], "name": r[1], "email": r[2],
                "created_at": str(r[3]), "ads_count": r[4],
                "is_admin": r[5], "is_banned": r[6],
            })
        return ok({"users": users, "total": total})

    # --- ads ---
    if action == "ads":
        limit = int(qs.get("limit") or 50)
        offset = int(qs.get("offset") or 0)
        status_filter = qs.get("status") or ""
        search = qs.get("search") or ""

        where = ["1=1"]
        if status_filter:
            where.append(f"a.status = '{status_filter}'")
        if search:
            safe = search.replace("'", "''")
            where.append(f"(a.title ILIKE '%{safe}%')")
        where_sql = " AND ".join(where)

        cur.execute(f"""
            SELECT a.id, a.title, a.price, a.status, a.views, a.created_at,
                   u.name as seller, u.id as user_id, a.category
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
                "id": r[0], "title": r[1], "price": r[2], "status": r[3],
                "views": r[4], "created_at": str(r[5]),
                "seller": r[6], "user_id": r[7], "category": r[8],
            })
        return ok({"ads": ads, "total": total})

    # --- delete_ad ---
    if action == "delete_ad":
        ad_id = body.get("id")
        if not ad_id:
            conn.close()
            return err(400, "Укажите id объявления")
        cur.execute(f"""
            UPDATE {SCHEMA}.ads SET status = 'deleted', updated_at = NOW()
            WHERE id = %s
        """, (int(ad_id),))
        conn.commit()
        conn.close()
        return ok({"ok": True})

    # --- ban_user / unban_user ---
    if action in ("ban_user", "unban_user"):
        target_id = body.get("user_id")
        if not target_id:
            conn.close()
            return err(400, "Укажите user_id")
        banned = action == "ban_user"
        cur.execute(f"""
            UPDATE {SCHEMA}.users SET is_banned = %s WHERE id = %s
        """, (banned, int(target_id)))
        conn.commit()
        conn.close()
        return ok({"ok": True})

    # --- make_admin ---
    if action == "make_admin":
        target_id = body.get("user_id")
        if not target_id:
            conn.close()
            return err(400, "Укажите user_id")
        cur.execute(f"""
            INSERT INTO {SCHEMA}.admins (user_id) VALUES (%s)
            ON CONFLICT DO NOTHING
        """, (int(target_id),))
        conn.commit()
        conn.close()
        return ok({"ok": True})

    # --- approve_ad: одобрить объявление ---
    if action == "approve_ad":
        ad_id = body.get("id")
        if not ad_id:
            conn.close()
            return err(400, "Укажите id объявления")
        cur.execute(f"""
            UPDATE {SCHEMA}.ads SET status = 'active', moderation_comment = NULL, updated_at = NOW()
            WHERE id = %s
        """, (int(ad_id),))
        # Получаем владельца и заголовок
        cur.execute(f"SELECT user_id, title FROM {SCHEMA}.ads WHERE id = %s", (int(ad_id),))
        ad_row = cur.fetchone()
        if ad_row:
            cur.execute(f"""
                INSERT INTO {SCHEMA}.notifications (user_id, type, title, text, ad_id)
                VALUES (%s, 'approved', 'Объявление одобрено', %s, %s)
            """, (ad_row[0], f'Ваше объявление «{ad_row[1]}» прошло проверку и теперь видно всем покупателям.', int(ad_id)))
        conn.commit()
        conn.close()
        return ok({"ok": True})

    # --- reject_ad: отклонить объявление ---
    if action == "reject_ad":
        ad_id = body.get("id")
        comment = (body.get("comment") or "").strip() or "Объявление не соответствует правилам"
        if not ad_id:
            conn.close()
            return err(400, "Укажите id объявления")
        cur.execute(f"""
            UPDATE {SCHEMA}.ads SET status = 'rejected', moderation_comment = %s, updated_at = NOW()
            WHERE id = %s
        """, (comment, int(ad_id)))
        # Получаем владельца и заголовок
        cur.execute(f"SELECT user_id, title FROM {SCHEMA}.ads WHERE id = %s", (int(ad_id),))
        ad_row = cur.fetchone()
        if ad_row:
            cur.execute(f"""
                INSERT INTO {SCHEMA}.notifications (user_id, type, title, text, ad_id)
                VALUES (%s, 'rejected', 'Объявление отклонено', %s, %s)
            """, (ad_row[0], f'Ваше объявление «{ad_row[1]}» было отклонено. Причина: {comment}', int(ad_id)))
        conn.commit()
        conn.close()
        return ok({"ok": True})

    conn.close()
    return err(400, "Неизвестное действие")