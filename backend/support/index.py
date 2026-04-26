"""
Чат службы поддержки.
action: create_ticket | send_message | get_ticket | my_tickets
admin actions: list_tickets | admin_reply | close_ticket | admin_tickets_count
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
    cur.close()
    return row[0] if row else None


def is_admin(user_id: int, conn) -> bool:
    cur = conn.cursor()
    cur.execute(f"SELECT 1 FROM {SCHEMA}.admins WHERE user_id = %s", (user_id,))
    result = cur.fetchone() is not None
    cur.close()
    return result


def handler(event: dict, context) -> dict:
    """Чат поддержки: создание тикетов, переписка с поддержкой."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    qs = event.get("queryStringParameters") or {}
    action = qs.get("action", "")
    raw_token = (event.get("headers") or {}).get("X-Authorization", "") or \
                (event.get("headers") or {}).get("Authorization", "")
    token = raw_token.replace("Bearer ", "").strip()

    body = {}
    if event.get("body"):
        try:
            body = json.loads(event["body"])
        except Exception:
            pass

    conn = get_conn()
    try:
        user_id = get_user_id(token, conn)

        # === Создать тикет ===
        if action == "create_ticket":
            if not user_id:
                return err(401, "Требуется авторизация")
            subject = (body.get("subject") or "Обращение в поддержку")[:255]
            first_msg = (body.get("message") or "").strip()
            if not first_msg:
                return err(400, "Сообщение не может быть пустым")

            cur = conn.cursor()
            # Проверяем открытый тикет
            cur.execute(
                f"SELECT id FROM {SCHEMA}.support_tickets WHERE user_id = %s AND status = 'open' ORDER BY created_at DESC LIMIT 1",
                (user_id,)
            )
            existing = cur.fetchone()
            if existing:
                ticket_id = existing[0]
            else:
                cur.execute(
                    f"INSERT INTO {SCHEMA}.support_tickets (user_id, subject) VALUES (%s, %s) RETURNING id",
                    (user_id, subject)
                )
                ticket_id = cur.fetchone()[0]

            cur.execute(
                f"INSERT INTO {SCHEMA}.support_messages (ticket_id, sender_id, is_admin, text) VALUES (%s, %s, FALSE, %s)",
                (ticket_id, user_id, first_msg)
            )
            cur.execute(
                f"UPDATE {SCHEMA}.support_tickets SET updated_at = NOW(), unread_admin = unread_admin + 1 WHERE id = %s",
                (ticket_id,)
            )
            conn.commit()
            cur.close()
            return ok({"ticket_id": ticket_id})

        # === Получить тикет с сообщениями ===
        if action == "get_ticket":
            if not user_id:
                return err(401, "Требуется авторизация")
            ticket_id = int(qs.get("ticket_id", 0))
            admin = is_admin(user_id, conn)

            cur = conn.cursor()
            if admin:
                cur.execute(
                    f"SELECT t.id, t.subject, t.status, t.created_at, t.updated_at, u.name, t.user_id, t.unread_admin "
                    f"FROM {SCHEMA}.support_tickets t JOIN {SCHEMA}.users u ON u.id = t.user_id WHERE t.id = %s",
                    (ticket_id,)
                )
            else:
                cur.execute(
                    f"SELECT t.id, t.subject, t.status, t.created_at, t.updated_at, u.name, t.user_id, t.unread_admin "
                    f"FROM {SCHEMA}.support_tickets t JOIN {SCHEMA}.users u ON u.id = t.user_id WHERE t.id = %s AND t.user_id = %s",
                    (ticket_id, user_id)
                )
            row = cur.fetchone()
            if not row:
                return err(404, "Тикет не найден")

            ticket = {
                "id": row[0], "subject": row[1], "status": row[2],
                "created_at": row[3], "updated_at": row[4],
                "user_name": row[5], "user_id": row[6], "unread_admin": row[7],
            }

            cur.execute(
                f"SELECT sm.id, sm.sender_id, sm.is_admin, sm.text, sm.created_at, u.name "
                f"FROM {SCHEMA}.support_messages sm LEFT JOIN {SCHEMA}.users u ON u.id = sm.sender_id "
                f"WHERE sm.ticket_id = %s ORDER BY sm.created_at ASC",
                (ticket_id,)
            )
            messages = [
                {"id": r[0], "sender_id": r[1], "is_admin": r[2], "text": r[3], "created_at": r[4], "sender_name": r[5]}
                for r in cur.fetchall()
            ]
            cur.close()
            return ok({"ticket": ticket, "messages": messages})

        # === Мои тикеты (последний открытый) ===
        if action == "my_tickets":
            if not user_id:
                return err(401, "Требуется авторизация")
            cur = conn.cursor()
            cur.execute(
                f"SELECT id, subject, status, created_at, updated_at FROM {SCHEMA}.support_tickets "
                f"WHERE user_id = %s ORDER BY updated_at DESC LIMIT 10",
                (user_id,)
            )
            tickets = [
                {"id": r[0], "subject": r[1], "status": r[2], "created_at": r[3], "updated_at": r[4]}
                for r in cur.fetchall()
            ]
            # Непрочитанные ответы от поддержки
            unread = 0
            if tickets:
                ids = [str(t["id"]) for t in tickets]
                cur.execute(
                    f"SELECT COUNT(*) FROM {SCHEMA}.support_messages "
                    f"WHERE ticket_id = ANY(ARRAY[{','.join(ids)}]) AND is_admin = TRUE "
                    f"AND created_at > COALESCE((SELECT MAX(sm2.created_at) FROM {SCHEMA}.support_messages sm2 WHERE sm2.ticket_id = support_messages.ticket_id AND sm2.is_admin = FALSE), '2000-01-01')"
                )
                # Упрощённо: считаем открытые тикеты с ответами от поддержки
                cur.execute(
                    f"SELECT COUNT(*) FROM {SCHEMA}.support_tickets WHERE user_id = %s AND status = 'answered'",
                    (user_id,)
                )
                unread = cur.fetchone()[0]
            cur.close()
            return ok({"tickets": tickets, "unread": unread})

        # === Отправить сообщение пользователем ===
        if action == "send_message":
            if not user_id:
                return err(401, "Требуется авторизация")
            ticket_id = int(body.get("ticket_id", 0))
            text = (body.get("text") or "").strip()
            if not text:
                return err(400, "Пустое сообщение")

            cur = conn.cursor()
            cur.execute(
                f"SELECT id, status FROM {SCHEMA}.support_tickets WHERE id = %s AND user_id = %s",
                (ticket_id, user_id)
            )
            t = cur.fetchone()
            if not t:
                return err(404, "Тикет не найден")

            cur.execute(
                f"INSERT INTO {SCHEMA}.support_messages (ticket_id, sender_id, is_admin, text) VALUES (%s, %s, FALSE, %s)",
                (ticket_id, user_id, text)
            )
            cur.execute(
                f"UPDATE {SCHEMA}.support_tickets SET updated_at = NOW(), status = 'open', unread_admin = unread_admin + 1 WHERE id = %s",
                (ticket_id,)
            )
            conn.commit()
            cur.close()
            return ok({"ok": True})

        # ======= ADMIN ACTIONS =======

        # === Список тикетов (для админа) ===
        if action == "list_tickets":
            if not user_id or not is_admin(user_id, conn):
                return err(403, "Доступ запрещён")
            status_filter = qs.get("status", "open")
            cur = conn.cursor()
            if status_filter == "all":
                cur.execute(
                    f"SELECT t.id, t.subject, t.status, t.created_at, t.updated_at, u.name, t.unread_admin "
                    f"FROM {SCHEMA}.support_tickets t JOIN {SCHEMA}.users u ON u.id = t.user_id "
                    f"ORDER BY t.unread_admin DESC, t.updated_at DESC LIMIT 100"
                )
            else:
                cur.execute(
                    f"SELECT t.id, t.subject, t.status, t.created_at, t.updated_at, u.name, t.unread_admin "
                    f"FROM {SCHEMA}.support_tickets t JOIN {SCHEMA}.users u ON u.id = t.user_id "
                    f"WHERE t.status = %s ORDER BY t.unread_admin DESC, t.updated_at DESC LIMIT 100",
                    (status_filter,)
                )
            tickets = [
                {"id": r[0], "subject": r[1], "status": r[2], "created_at": r[3], "updated_at": r[4], "user_name": r[5], "unread": r[6]}
                for r in cur.fetchall()
            ]
            cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.support_tickets WHERE status IN ('open', 'answered')")
            open_count = cur.fetchone()[0]
            cur.close()
            return ok({"tickets": tickets, "open_count": open_count})

        # === Ответ администратора ===
        if action == "admin_reply":
            if not user_id or not is_admin(user_id, conn):
                return err(403, "Доступ запрещён")
            ticket_id = int(body.get("ticket_id", 0))
            text = (body.get("text") or "").strip()
            if not text:
                return err(400, "Пустое сообщение")

            cur = conn.cursor()
            # Получаем user_id пользователя по тикету
            cur.execute(f"SELECT user_id, subject FROM {SCHEMA}.support_tickets WHERE id = %s", (ticket_id,))
            ticket_row = cur.fetchone()
            if not ticket_row:
                cur.close()
                return err(404, "Тикет не найден")
            ticket_owner_id, ticket_subject = ticket_row

            cur.execute(
                f"INSERT INTO {SCHEMA}.support_messages (ticket_id, sender_id, is_admin, text) VALUES (%s, %s, TRUE, %s)",
                (ticket_id, user_id, text)
            )
            cur.execute(
                f"UPDATE {SCHEMA}.support_tickets SET updated_at = NOW(), status = 'answered', unread_admin = 0 WHERE id = %s",
                (ticket_id,)
            )
            # Уведомление пользователю
            short = text[:120] + ("..." if len(text) > 120 else "")
            cur.execute(
                f"INSERT INTO {SCHEMA}.notifications (user_id, type, title, text, ad_id) VALUES (%s, 'support', 'Ответ от поддержки', %s, NULL)",
                (ticket_owner_id, short)
            )
            conn.commit()
            cur.close()
            return ok({"ok": True})

        # === Закрыть тикет ===
        if action == "close_ticket":
            if not user_id or not is_admin(user_id, conn):
                return err(403, "Доступ запрещён")
            ticket_id = int(body.get("ticket_id", 0))
            cur = conn.cursor()
            cur.execute(
                f"UPDATE {SCHEMA}.support_tickets SET status = 'closed' WHERE id = %s",
                (ticket_id,)
            )
            conn.commit()
            cur.close()
            return ok({"ok": True})

        # === Счётчик открытых тикетов ===
        if action == "admin_tickets_count":
            if not user_id or not is_admin(user_id, conn):
                return ok({"count": 0})
            cur = conn.cursor()
            cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.support_tickets WHERE status IN ('open', 'answered')")
            count = cur.fetchone()[0]
            cur.close()
            return ok({"count": count})

        return err(400, "Неизвестное действие")

    finally:
        conn.close()