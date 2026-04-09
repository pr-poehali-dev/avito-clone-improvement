"""
Сообщения между пользователями и отзывы.
action: send | inbox | thread | mark_read | reviews_list | reviews_create
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


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    body = {}
    if event.get("body"):
        body = json.loads(event["body"])

    qs = event.get("queryStringParameters") or {}
    action = qs.get("action") or body.get("action") or "inbox"

    headers_in = event.get("headers") or {}
    raw_auth = headers_in.get("X-Authorization") or headers_in.get("Authorization") or ""
    token = raw_auth.replace("Bearer ", "").strip()

    conn = get_conn()
    user_id = get_user_id(token, conn)
    if not user_id:
        conn.close()
        return err(401, "Не авторизован")

    # --- send ---
    if action == "send":
        receiver_id = body.get("receiver_id")
        ad_id = body.get("ad_id")
        text = (body.get("text") or "").strip()

        if not receiver_id or not text:
            conn.close()
            return err(400, "Укажите получателя и текст сообщения")

        if int(receiver_id) == user_id:
            conn.close()
            return err(400, "Нельзя писать самому себе")

        cur = conn.cursor()
        cur.execute(f"""
            INSERT INTO {SCHEMA}.messages (sender_id, receiver_id, ad_id, text)
            VALUES (%s, %s, %s, %s)
            RETURNING id, created_at
        """, (user_id, int(receiver_id), ad_id, text))
        row = cur.fetchone()

        # Уведомление получателю о новом сообщении
        cur.execute(f"SELECT name FROM {SCHEMA}.users WHERE id = %s", (user_id,))
        sender_name = (cur.fetchone() or ["Пользователь"])[0]
        ad_title = None
        if ad_id:
            cur.execute(f"SELECT title FROM {SCHEMA}.ads WHERE id = %s", (int(ad_id),))
            ad_row = cur.fetchone()
            ad_title = ad_row[0] if ad_row else None
        notif_text = f"{sender_name}: {text[:80]}{'...' if len(text) > 80 else ''}"
        if ad_title:
            notif_text = f"{sender_name} по объявлению «{ad_title[:40]}»: {text[:60]}"
        cur.execute(f"""
            INSERT INTO {SCHEMA}.notifications (user_id, type, title, text, ad_id)
            VALUES (%s, 'message', 'Новое сообщение', %s, %s)
        """, (int(receiver_id), notif_text, ad_id))

        conn.commit()
        conn.close()
        return ok({"id": row[0], "created_at": str(row[1])})

    # --- inbox: список диалогов ---
    if action == "inbox":
        cur = conn.cursor()
        cur.execute(f"""
            SELECT DISTINCT ON (other_user)
                CASE WHEN m.sender_id = %s THEN m.receiver_id ELSE m.sender_id END as other_user,
                m.id, m.text, m.created_at, m.is_read, m.sender_id,
                m.ad_id, a.title as ad_title,
                u.name as other_name, u.avatar_url as other_avatar
            FROM {SCHEMA}.messages m
            LEFT JOIN {SCHEMA}.ads a ON a.id = m.ad_id
            JOIN {SCHEMA}.users u ON u.id = CASE WHEN m.sender_id = %s THEN m.receiver_id ELSE m.sender_id END
            WHERE m.sender_id = %s OR m.receiver_id = %s
            ORDER BY other_user, m.created_at DESC
        """, (user_id, user_id, user_id, user_id))
        rows = cur.fetchall()

        unread_cur = conn.cursor()
        unread_cur.execute(f"""
            SELECT sender_id, COUNT(*) FROM {SCHEMA}.messages
            WHERE receiver_id = %s AND is_read = FALSE
            GROUP BY sender_id
        """, (user_id,))
        unread_map = {r[0]: r[1] for r in unread_cur.fetchall()}
        conn.close()

        dialogs = []
        for r in rows:
            other_id = r[0]
            dialogs.append({
                "other_user_id": other_id,
                "other_name": r[8],
                "other_avatar": r[9],
                "last_message": r[2],
                "last_time": str(r[3]),
                "is_read": r[4],
                "is_mine": r[5] == user_id,
                "ad_id": r[6],
                "ad_title": r[7],
                "unread": unread_map.get(other_id, 0),
            })
        return ok({"dialogs": dialogs})

    # --- thread: переписка с конкретным пользователем ---
    if action == "thread":
        other_id = int(qs.get("other_id") or body.get("other_id") or 0)
        if not other_id:
            conn.close()
            return err(400, "Укажите other_id")

        cur = conn.cursor()
        cur.execute(f"""
            SELECT m.id, m.sender_id, m.text, m.created_at, m.is_read,
                   m.ad_id, a.title as ad_title, u.name as sender_name
            FROM {SCHEMA}.messages m
            LEFT JOIN {SCHEMA}.ads a ON a.id = m.ad_id
            JOIN {SCHEMA}.users u ON u.id = m.sender_id
            WHERE (m.sender_id = %s AND m.receiver_id = %s)
               OR (m.sender_id = %s AND m.receiver_id = %s)
            ORDER BY m.created_at ASC
        """, (user_id, other_id, other_id, user_id))
        rows = cur.fetchall()

        # Помечаем как прочитанные
        cur.execute(f"""
            UPDATE {SCHEMA}.messages SET is_read = TRUE
            WHERE sender_id = %s AND receiver_id = %s AND is_read = FALSE
        """, (other_id, user_id))
        conn.commit()

        # Инфо о собеседнике
        cur.execute(f"SELECT id, name, avatar_url FROM {SCHEMA}.users WHERE id = %s", (other_id,))
        other = cur.fetchone()
        conn.close()

        thread = []
        for r in rows:
            thread.append({
                "id": r[0], "sender_id": r[1], "text": r[2],
                "created_at": str(r[3]), "is_read": r[4],
                "ad_id": r[5], "ad_title": r[6], "sender_name": r[7],
            })
        return ok({
            "messages": thread,
            "other": {"id": other[0], "name": other[1], "avatar_url": other[2]} if other else None,
        })

    # --- mark_read ---
    if action == "mark_read":
        other_id = body.get("other_id")
        if not other_id:
            conn.close()
            return err(400, "Укажите other_id")
        cur = conn.cursor()
        cur.execute(f"""
            UPDATE {SCHEMA}.messages SET is_read = TRUE
            WHERE sender_id = %s AND receiver_id = %s AND is_read = FALSE
        """, (int(other_id), user_id))
        conn.commit()
        conn.close()
        return ok({"ok": True})

    # --- reviews_list ---
    if action == "reviews_list":
        target_id = qs.get("user_id") or body.get("user_id")
        if not target_id:
            conn.close()
            return err(400, "Укажите user_id")

        cur = conn.cursor()
        cur.execute(f"""
            SELECT r.id, r.rating, r.text, r.created_at,
                   u.name as author_name, r.author_id,
                   a.title as ad_title, a.id as ad_id
            FROM {SCHEMA}.reviews r
            JOIN {SCHEMA}.users u ON u.id = r.author_id
            LEFT JOIN {SCHEMA}.ads a ON a.id = r.ad_id
            WHERE r.target_user_id = %s
            ORDER BY r.created_at DESC
        """, (int(target_id),))
        rows = cur.fetchall()

        cur.execute(f"""
            SELECT COUNT(*), ROUND(AVG(rating)::numeric, 1)
            FROM {SCHEMA}.reviews WHERE target_user_id = %s
        """, (int(target_id),))
        stats = cur.fetchone()

        cur.execute(f"SELECT id, name, created_at FROM {SCHEMA}.users WHERE id = %s", (int(target_id),))
        user_row = cur.fetchone()

        cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.ads WHERE user_id = %s AND status = 'active'", (int(target_id),))
        ads_count = cur.fetchone()[0]

        conn.close()
        reviews = [{"id": r[0], "rating": r[1], "text": r[2], "created_at": str(r[3]),
                    "author_name": r[4], "author_id": r[5], "ad_title": r[6], "ad_id": r[7]}
                   for r in rows]
        return ok({
            "reviews": reviews, "total": stats[0] or 0,
            "avg_rating": float(stats[1]) if stats[1] else 0,
            "user": {"id": user_row[0], "name": user_row[1], "created_at": str(user_row[2]), "ads_count": ads_count} if user_row else None,
        })

    # --- reviews_create ---
    if action == "reviews_create":
        target_id = body.get("target_user_id")
        rating = body.get("rating")
        text = (body.get("text") or "").strip()
        ad_id = body.get("ad_id")

        if not target_id or not rating:
            conn.close()
            return err(400, "Укажите target_user_id и оценку")
        if int(target_id) == user_id:
            conn.close()
            return err(400, "Нельзя оставлять отзыв самому себе")
        if not (1 <= int(rating) <= 5):
            conn.close()
            return err(400, "Оценка от 1 до 5")

        cur = conn.cursor()
        cur.execute(f"""
            SELECT id FROM {SCHEMA}.reviews
            WHERE author_id = %s AND target_user_id = %s AND ad_id IS NOT DISTINCT FROM %s
        """, (user_id, int(target_id), ad_id))
        if cur.fetchone():
            conn.close()
            return err(409, "Вы уже оставляли отзыв для этой сделки")

        cur.execute(f"""
            INSERT INTO {SCHEMA}.reviews (author_id, target_user_id, ad_id, rating, text)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id, created_at
        """, (user_id, int(target_id), ad_id, int(rating), text or None))
        row = cur.fetchone()

        # Уведомление тому, кому оставили отзыв
        cur.execute(f"SELECT name FROM {SCHEMA}.users WHERE id = %s", (user_id,))
        author_name = (cur.fetchone() or ["Пользователь"])[0]
        stars = "⭐" * int(rating)
        notif_text = f"{author_name} оставил отзыв {stars}: {(text or '')[:80]}"
        cur.execute(f"""
            INSERT INTO {SCHEMA}.notifications (user_id, type, title, text, ad_id)
            VALUES (%s, 'review', 'Новый отзыв', %s, %s)
        """, (int(target_id), notif_text, ad_id))

        conn.commit()
        conn.close()
        return ok({"id": row[0], "created_at": str(row[1])})

    conn.close()
    return err(400, "Неизвестное действие")