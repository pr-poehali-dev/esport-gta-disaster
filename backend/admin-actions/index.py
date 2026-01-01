# v1.0
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
import random
import string
from datetime import datetime, timedelta
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def escape_sql(value):
    """Escape single quotes in SQL strings by doubling them"""
    if value is None:
        return 'NULL'
    return str(value).replace("'", "''")

def log_admin_action(cur, conn, admin_id: str, action_type: str, description: str, target_type: str = None, target_id: int = None):
    """Логирование действий администраторов"""
    try:
        cur.execute(f"""
            INSERT INTO t_p4831367_esport_gta_disaster.admin_action_logs
            (admin_id, action_type, action_description, target_type, target_id, created_at)
            VALUES ({int(admin_id)}, '{escape_sql(action_type)}', '{escape_sql(description)}', 
                    {'NULL' if not target_type else f"'{escape_sql(target_type)}'"}, 
                    {'NULL' if not target_id else int(target_id)}, NOW())
        """)
        conn.commit()
    except Exception as e:
        print(f"ERROR logging admin action: {e}", flush=True)

def handler(event: dict, context) -> dict:
    """API для административных действий: бан, мут, отстранение от турниров"""
    
    import sys
    method = event.get('httpMethod', 'GET')
    
    print(f"=== HANDLER CALLED: method={method}", file=sys.stderr, flush=True)
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Id, X-User-Id'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        print(f"=== Connecting to DB...", file=sys.stderr, flush=True)
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor(cursor_factory=RealDictCursor)
        print(f"=== DB connected successfully", file=sys.stderr, flush=True)
        
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            
            public_actions = ['get_news', 'get_rules', 'get_support', 'get_tournaments', 'get_tournament', 'register_team', 'get_notifications', 'mark_notification_read', 'mark_all_notifications_read']
            
            if action in public_actions:
                print(f"=== PUBLIC ACTION: {action}", file=sys.stderr, flush=True)
                if action == 'get_news':
                    print(f"=== Calling get_news with body: {body}", file=sys.stderr, flush=True)
                    result = get_news(cur, conn, body)
                    print(f"=== get_news returned: {str(result)[:200]}", file=sys.stderr, flush=True)
                    return result
                elif action == 'get_rules':
                    return get_rules(cur, conn)
                elif action == 'get_support':
                    return get_support(cur, conn)
                elif action == 'get_tournaments':
                    return get_tournaments(cur, conn, body)
                elif action == 'get_tournament':
                    return get_tournament(cur, conn, body)
                elif action == 'register_team':
                    return register_team(cur, conn, body)
                elif action == 'get_notifications':
                    return get_notifications(cur, conn, body)
                elif action == 'mark_notification_read':
                    return mark_notification_read(cur, conn, body)
                elif action == 'mark_all_notifications_read':
                    return mark_all_notifications_read(cur, conn, body)
        
        admin_id = event.get('headers', {}).get('X-Admin-Id') or event.get('headers', {}).get('x-admin-id')
        
        print(f"=== Admin ID from headers: {admin_id}", file=sys.stderr, flush=True)
        
        if not admin_id or admin_id == 'null' or admin_id == 'NULL':
            print(f"=== No admin ID, returning 401", file=sys.stderr, flush=True)
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Требуется авторизация администратора'}),
                'isBase64Encoded': False
            }
        
        try:
            admin_id_int = int(admin_id)
            print(f"=== Admin ID converted to int: {admin_id_int}", file=sys.stderr, flush=True)
        except (ValueError, TypeError):
            print(f"=== Invalid admin ID format: {admin_id}", file=sys.stderr, flush=True)
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': f'Неверный формат ID администратора: {admin_id}'}),
                'isBase64Encoded': False
            }
        
        try:
            print(f"=== Checking admin role in DB...", file=sys.stderr, flush=True)
            cur.execute("SELECT role FROM t_p4831367_esport_gta_disaster.users WHERE id = %s", (admin_id_int,))
            admin_role = cur.fetchone()
            print(f"=== Admin role fetched: {admin_role}", file=sys.stderr, flush=True)
        except Exception as e:
            import traceback
            import sys
            error_msg = traceback.format_exc()
            print(f"ERROR checking admin role: {error_msg}", file=sys.stderr, flush=True)
            print(f"Admin ID: {admin_id_int}", file=sys.stderr, flush=True)
            cur.close()
            conn.close()
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': f'Ошибка проверки прав доступа: {str(e)}', 'traceback': error_msg}),
                'isBase64Encoded': False
            }
        
        if not admin_role or admin_role['role'] not in ['admin', 'founder', 'organizer', 'referee']:
            cur.close()
            conn.close()
            return {
                'statusCode': 403,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Недостаточно прав'}),
                'isBase64Encoded': False
            }
        
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            
            print(f"=== ACTION: {action}", file=sys.stderr, flush=True)
            
            if action == 'send_verification_code':
                return send_verification_code(cur, conn, admin_id, body)
            elif action == 'verify_and_execute':
                return verify_and_execute(cur, conn, admin_id, body)
            elif action == 'get_bans':
                return get_bans(cur, conn)
            elif action == 'get_mutes':
                return get_mutes(cur, conn)
            elif action == 'get_exclusions':
                return get_exclusions(cur, conn)
            elif action == 'remove_ban':
                return remove_ban(cur, conn, admin_id, body)
            elif action == 'remove_mute':
                return remove_mute(cur, conn, admin_id, body)
            elif action == 'create_tournament':
                return create_tournament(cur, conn, admin_id, body)
            elif action == 'update_tournament_status':
                return update_tournament_status(cur, conn, admin_id, body)
            elif action == 'toggle_tournament_visibility':
                return toggle_tournament_visibility(cur, conn, admin_id, body)
            elif action == 'delete_tournament':
                return delete_tournament(cur, conn, admin_id, body)
            elif action == 'get_match_chat':
                return get_match_chat(cur, conn, body)
            elif action == 'send_chat_message':
                return send_chat_message(cur, conn, admin_id, body)
            elif action == 'get_ban_pick':
                return get_ban_pick(cur, conn, body)
            elif action == 'make_ban_pick':
                return make_ban_pick(cur, conn, body)
            elif action == 'calculate_match_rating':
                return calculate_match_rating(cur, conn, admin_id, body)
            elif action == 'get_team_ratings':
                return get_team_ratings(cur, conn)
            elif action == 'verify_admin_password':
                return verify_admin_password(cur, conn, body)
            elif action == 'create_news':
                return create_news(cur, conn, admin_id, body, admin_role['role'])
            elif action == 'create_news_with_image':
                print(f"=== CALLING create_news_with_image", file=sys.stderr, flush=True)
                return create_news_with_image(cur, conn, admin_id, body, admin_role['role'])
            elif action == 'update_news':
                return update_news(cur, conn, admin_id, body, admin_role['role'])
            elif action == 'delete_news':
                return delete_news(cur, conn, admin_id, body, admin_role['role'])
            elif action == 'get_news':
                return get_news(cur, conn, body)
            elif action == 'create_rule':
                return create_rule(cur, conn, admin_id, body, admin_role['role'])
            elif action == 'update_rule':
                return update_rule(cur, conn, admin_id, body, admin_role['role'])
            elif action == 'delete_rule':
                return delete_rule(cur, conn, admin_id, body, admin_role['role'])
            elif action == 'get_rules':
                return get_rules(cur, conn)
            elif action == 'update_support':
                return update_support(cur, conn, admin_id, body, admin_role['role'])
            elif action == 'get_support':
                return get_support(cur, conn)
            elif action == 'get_all_users':
                return get_all_users(cur, conn)
            elif action == 'get_dashboard_stats':
                return get_dashboard_stats(cur, conn)
            elif action == 'assign_role':
                return assign_role(cur, conn, admin_id, admin_role['role'], body)
            elif action == 'revoke_role':
                return revoke_role(cur, conn, admin_id, admin_role['role'], body)
            elif action == 'get_staff':
                return get_staff(cur, conn)
            elif action == 'get_role_history':
                return get_role_history(cur, conn, body)
            elif action == 'create_discussion':
                return create_discussion(cur, conn, admin_id, admin_role['role'], body)
            elif action == 'add_comment':
                return add_comment(cur, conn, admin_id, admin_role['role'], body)
            elif action == 'get_discussions':
                return get_discussions(cur, conn)
            elif action == 'get_discussion':
                return get_discussion(cur, conn, body)
            elif action == 'lock_discussion':
                return lock_discussion(cur, conn, body)
            elif action == 'pin_discussion':
                return pin_discussion(cur, conn, body)
            elif action == 'delete_discussion':
                return delete_discussion(cur, conn, body)
            elif action == 'edit_discussion':
                return edit_discussion(cur, conn, admin_id, body)
            elif action == 'hide_tournament':
                return hide_tournament(cur, conn, admin_id, body)
            elif action == 'start_tournament':
                return start_tournament(cur, conn, admin_id, body)
            elif action == 'get_admin_tournaments':
                return get_admin_tournaments(cur, conn)
            elif action == 'approve_registration':
                return approve_registration(cur, conn, admin_id, body)
            elif action == 'reject_registration':
                return reject_registration(cur, conn, admin_id, body)
            elif action == 'get_moderation_logs':
                return get_moderation_logs(cur, conn)
            elif action == 'get_active_bans':
                return get_active_bans(cur, conn)
            elif action == 'get_active_mutes':
                return get_active_mutes(cur, conn)
            elif action == 'update_ban_status':
                return update_ban_status(cur, conn, admin_id, body)
            elif action == 'update_mute_status':
                return update_mute_status(cur, conn, admin_id, body)
            elif action == 'get_settings':
                return get_settings(cur, conn)
            elif action == 'update_setting':
                return update_setting(cur, conn, admin_id, body, admin_role['role'])
            elif action == 'generate_bracket':
                return generate_bracket(cur, conn, admin_id, body)
            elif action == 'get_bracket':
                return get_bracket(cur, conn, body)
            elif action == 'update_match_score':
                return update_match_score(cur, conn, admin_id, body)
            elif action == 'complete_match':
                return complete_match(cur, conn, admin_id, body)
            elif action == 'notify_match_start':
                return notify_match_start(cur, conn, admin_id, body)
            elif action == 'get_group_stage':
                return get_group_stage(cur, conn, body)
            elif action == 'create_group_stage':
                return create_group_stage(cur, conn, admin_id, body)
            elif action == 'update_group_match':
                return update_group_match(cur, conn, admin_id, body)
            elif action == 'finalize_group_stage':
                return finalize_group_stage(cur, conn, admin_id, body)
            elif action == 'get_active_matches':
                return get_active_matches(cur, conn, body)
            elif action == 'get_admin_logs':
                return get_admin_logs(cur, conn, body)
            else:
                print(f"=== UNKNOWN ACTION: {action}", file=sys.stderr, flush=True)
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': f'Неизвестное действие: {action}'}),
                    'isBase64Encoded': False
                }
        
        cur.close()
        conn.close()
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Метод не поддерживается'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }

def send_verification_code(cur, conn, admin_id: str, body: dict) -> dict:
    """Генерирует и отправляет код подтверждения на email администратора"""
    
    code = ''.join(random.choices(string.digits, k=6))
    action_type = body.get('action_type')
    action_data = json.dumps(body.get('action_data', {}))
    expires_at = datetime.now() + timedelta(minutes=10)
    
    cur.execute(f"""
        INSERT INTO t_p4831367_esport_gta_disaster.admin_verification_codes (admin_id, code, action_type, action_data, expires_at)
        VALUES ('{escape_sql(admin_id)}', '{escape_sql(code)}', '{escape_sql(action_type)}', '{escape_sql(action_data)}', '{expires_at}')
    """)
    conn.commit()
    
    cur.execute(f"SELECT email FROM t_p4831367_esport_gta_disaster.users WHERE id = '{escape_sql(admin_id)}'")
    admin_email = cur.fetchone()['email']
    
    smtp_host = os.environ.get('SMTP_HOST', 'smtp.gmail.com')
    smtp_port = int(os.environ.get('SMTP_PORT', 587))
    smtp_user = os.environ.get('SMTP_USER')
    smtp_password = os.environ.get('SMTP_PASSWORD')
    
    msg = MIMEMultipart()
    msg['From'] = smtp_user
    msg['To'] = admin_email
    msg['Subject'] = 'Код подтверждения административного действия'
    
    body_text = f"""
    Ваш код подтверждения: {code}
    
    Код действителен в течение 10 минут.
    Действие: {action_type}
    """
    
    msg.attach(MIMEText(body_text, 'plain'))
    
    try:
        server = smtplib.SMTP(smtp_host, smtp_port)
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.send_message(msg)
        server.quit()
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка отправки email: {str(e)}'}),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'message': 'Код подтверждения отправлен на email'}),
        'isBase64Encoded': False
    }

def verify_and_execute(cur, conn, admin_id: str, body: dict) -> dict:
    """Проверяет код и выполняет административное действие"""
    
    code = body.get('code')
    
    cur.execute(f"""
        SELECT action_type, action_data FROM t_p4831367_esport_gta_disaster.admin_verification_codes
        WHERE admin_id = '{escape_sql(admin_id)}' AND code = '{escape_sql(code)}'
        AND expires_at > NOW() AND used = FALSE
        ORDER BY created_at DESC LIMIT 1
    """)
    
    result = cur.fetchone()
    
    if not result:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Неверный или истекший код'}),
            'isBase64Encoded': False
        }
    
    action_type = result['action_type']
    action_data = json.loads(result['action_data'])
    
    cur.execute(f"""
        UPDATE t_p4831367_esport_gta_disaster.admin_verification_codes
        SET used = TRUE
        WHERE admin_id = '{escape_sql(admin_id)}' AND code = '{escape_sql(code)}'
    """)
    conn.commit()
    
    if action_type == 'ban':
        return execute_ban(cur, conn, admin_id, action_data)
    elif action_type == 'mute':
        return execute_mute(cur, conn, admin_id, action_data)
    elif action_type == 'tournament_exclusion':
        return execute_tournament_exclusion(cur, conn, admin_id, action_data)
    else:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Неизвестный тип действия'}),
            'isBase64Encoded': False
        }

def execute_ban(cur, conn, admin_id: str, data: dict) -> dict:
    """Выполняет бан пользователя"""
    
    user_id = data.get('user_id')
    reason = data.get('reason')
    duration_days = data.get('duration_days')
    
    # Получаем имя пользователя для логирования
    cur.execute(f"SELECT nickname FROM t_p4831367_esport_gta_disaster.users WHERE id = {int(user_id)}")
    user_row = cur.fetchone()
    user_name = user_row['nickname'] if user_row else 'Unknown'
    
    if duration_days:
        expires_at = datetime.now() + timedelta(days=duration_days)
        cur.execute(f"""
            INSERT INTO t_p4831367_esport_gta_disaster.bans (user_id, admin_id, reason, expires_at)
            VALUES ('{escape_sql(user_id)}', '{escape_sql(admin_id)}', '{escape_sql(reason)}', '{expires_at}')
        """)
    else:
        cur.execute(f"""
            INSERT INTO t_p4831367_esport_gta_disaster.bans (user_id, admin_id, reason)
            VALUES ('{escape_sql(user_id)}', '{escape_sql(admin_id)}', '{escape_sql(reason)}')
        """)
    
    conn.commit()
    
    # Логируем бан
    duration_text = f" на {duration_days} дней" if duration_days else " навсегда"
    log_admin_action(cur, conn, admin_id, 'user_ban', 
                     f"Забанил пользователя {user_name}{duration_text}. Причина: {reason}", 'user', int(user_id))
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'message': 'Пользователь забанен'}),
        'isBase64Encoded': False
    }

def execute_mute(cur, conn, admin_id: str, data: dict) -> dict:
    """Выполняет мут пользователя"""
    
    user_id = data.get('user_id')
    reason = data.get('reason')
    duration_days = data.get('duration_days')
    
    # Получаем имя пользователя для логирования
    cur.execute(f"SELECT nickname FROM t_p4831367_esport_gta_disaster.users WHERE id = {int(user_id)}")
    user_row = cur.fetchone()
    user_name = user_row['nickname'] if user_row else 'Unknown'
    
    if duration_days:
        expires_at = datetime.now() + timedelta(days=duration_days)
        cur.execute(f"""
            INSERT INTO t_p4831367_esport_gta_disaster.mutes (user_id, admin_id, reason, expires_at)
            VALUES ('{escape_sql(user_id)}', '{escape_sql(admin_id)}', '{escape_sql(reason)}', '{expires_at}')
        """)
    else:
        cur.execute(f"""
            INSERT INTO t_p4831367_esport_gta_disaster.mutes (user_id, admin_id, reason)
            VALUES ('{escape_sql(user_id)}', '{escape_sql(admin_id)}', '{escape_sql(reason)}')
        """)
    
    conn.commit()
    
    # Логируем мут
    duration_text = f" на {duration_days} дней" if duration_days else " навсегда"
    log_admin_action(cur, conn, admin_id, 'user_mute', 
                     f"Замутил пользователя {user_name}{duration_text}. Причина: {reason}", 'user', int(user_id))
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'message': 'Пользователь замучен'}),
        'isBase64Encoded': False
    }

def execute_tournament_exclusion(cur, conn, admin_id: str, data: dict) -> dict:
    """Выполняет отстранение от турниров"""
    
    user_id = data.get('user_id')
    reason = data.get('reason')
    duration_days = data.get('duration_days')
    
    if duration_days:
        expires_at = datetime.now() + timedelta(days=duration_days)
        cur.execute(f"""
            INSERT INTO t_p4831367_esport_gta_disaster.tournament_exclusions (user_id, admin_id, reason, expires_at)
            VALUES ('{escape_sql(user_id)}', '{escape_sql(admin_id)}', '{escape_sql(reason)}', '{expires_at}')
        """)
    else:
        cur.execute(f"""
            INSERT INTO t_p4831367_esport_gta_disaster.tournament_exclusions (user_id, admin_id, reason)
            VALUES ('{escape_sql(user_id)}', '{escape_sql(admin_id)}', '{escape_sql(reason)}')
        """)
    
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'message': 'Пользователь отстранен от турниров'}),
        'isBase64Encoded': False
    }

def get_bans(cur, conn) -> dict:
    """Получает список всех банов"""
    
    cur.execute("""
        SELECT b.id, b.user_id, u.username, b.admin_id, a.username as admin_username,
               b.reason, b.created_at, b.expires_at, b.active
        FROM t_p4831367_esport_gta_disaster.bans b
        JOIN t_p4831367_esport_gta_disaster.users u ON b.user_id = u.id
        JOIN t_p4831367_esport_gta_disaster.users a ON b.admin_id = a.id
        WHERE b.active = TRUE
        ORDER BY b.created_at DESC
    """)
    
    bans = []
    for row in cur.fetchall():
        bans.append({
            'id': row['id'],
            'user_id': row['user_id'],
            'username': row['username'],
            'admin_id': row['admin_id'],
            'admin_username': row['admin_username'],
            'reason': row['reason'],
            'created_at': row['created_at'].isoformat() if row['created_at'] else None,
            'expires_at': row['expires_at'].isoformat() if row['expires_at'] else None,
            'active': row['active']
        })
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'bans': bans}),
        'isBase64Encoded': False
    }

def get_mutes(cur, conn) -> dict:
    """Получает список всех мутов"""
    
    cur.execute("""
        SELECT m.id, m.user_id, u.username, m.admin_id, a.username as admin_username,
               m.reason, m.created_at, m.expires_at, m.active
        FROM t_p4831367_esport_gta_disaster.mutes m
        JOIN t_p4831367_esport_gta_disaster.users u ON m.user_id = u.id
        JOIN t_p4831367_esport_gta_disaster.users a ON m.admin_id = a.id
        WHERE m.active = TRUE
        ORDER BY m.created_at DESC
    """)
    
    mutes = []
    for row in cur.fetchall():
        mutes.append({
            'id': row['id'],
            'user_id': row['user_id'],
            'username': row['username'],
            'admin_id': row['admin_id'],
            'admin_username': row['admin_username'],
            'reason': row['reason'],
            'created_at': row['created_at'].isoformat() if row['created_at'] else None,
            'expires_at': row['expires_at'].isoformat() if row['expires_at'] else None,
            'active': row['active']
        })
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'mutes': mutes}),
        'isBase64Encoded': False
    }

def get_exclusions(cur, conn) -> dict:
    """Получает список всех отстранений от турниров"""
    
    cur.execute("""
        SELECT e.id, e.user_id, u.username, e.admin_id, a.username as admin_username,
               e.reason, e.created_at, e.expires_at, e.active
        FROM t_p4831367_esport_gta_disaster.tournament_exclusions e
        JOIN t_p4831367_esport_gta_disaster.users u ON e.user_id = u.id
        JOIN t_p4831367_esport_gta_disaster.users a ON e.admin_id = a.id
        WHERE e.active = TRUE
        ORDER BY e.created_at DESC
    """)
    
    exclusions = []
    for row in cur.fetchall():
        exclusions.append({
            'id': row['id'],
            'user_id': row['user_id'],
            'username': row['username'],
            'admin_id': row['admin_id'],
            'admin_username': row['admin_username'],
            'reason': row['reason'],
            'created_at': row['created_at'].isoformat() if row['created_at'] else None,
            'expires_at': row['expires_at'].isoformat() if row['expires_at'] else None,
            'active': row['active']
        })
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'exclusions': exclusions}),
        'isBase64Encoded': False
    }

def remove_ban(cur, conn, admin_id: str, body: dict) -> dict:
    """Снимает бан с пользователя"""
    
    ban_id = body.get('ban_id')
    
    cur.execute(f"""
        UPDATE t_p4831367_esport_gta_disaster.bans SET active = FALSE
        WHERE id = {int(ban_id)}
    """)
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'message': 'Бан снят'}),
        'isBase64Encoded': False
    }

def remove_mute(cur, conn, admin_id: str, body: dict) -> dict:
    """Снимает мут с пользователя"""
    
    mute_id = body.get('mute_id')
    
    cur.execute(f"""
        UPDATE t_p4831367_esport_gta_disaster.mutes SET active = FALSE
        WHERE id = {int(mute_id)}
    """)
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'message': 'Мут снят'}),
        'isBase64Encoded': False
    }

def create_tournament(cur, conn, admin_id: str, body: dict) -> dict:
    """Создает турнир"""
    
    name = body.get('name')
    description = body.get('description')
    game = body.get('game_project', 'GTA V')
    start_date = body.get('start_date')
    end_date = body.get('end_date')
    max_teams = body.get('max_participants', 16)
    prize_pool = body.get('prize_pool')
    rules = body.get('rules')
    format_value = body.get('format', 'single-elimination')
    location = body.get('location')
    team_size = body.get('team_size')
    best_of = body.get('best_of')
    
    if not name or not start_date:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Название и дата начала обязательны'}),
            'isBase64Encoded': False
        }
    
    try:
        cur.execute("""
            INSERT INTO t_p4831367_esport_gta_disaster.tournaments 
            (name, description, game, start_date, end_date, max_teams, prize_pool, rules, format, created_by, location, team_size, best_of, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'upcoming')
            RETURNING id
        """, (name, description, game, start_date, end_date, max_teams, prize_pool, rules, format_value, admin_id, location, team_size, best_of))
        
        tournament_id = cur.fetchone()['id']
        conn.commit()
        
        # Логируем создание турнира
        log_admin_action(cur, conn, admin_id, 'tournament_create', 
                         f"Создал турнир '{name}'", 'tournament', tournament_id)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True, 'message': 'Турнир создан', 'tournament_id': tournament_id}),
            'isBase64Encoded': False
        }
    except psycopg2.IntegrityError as e:
        conn.rollback()
        error_msg = str(e)
        if 'unique constraint' in error_msg.lower() or 'duplicate key' in error_msg.lower():
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Турнир с таким названием уже существует'}),
                'isBase64Encoded': False
            }
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка базы данных: {error_msg}'}),
            'isBase64Encoded': False
        }
    except Exception as e:
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Неожиданная ошибка: {str(e)}'}),
            'isBase64Encoded': False
        }

def toggle_tournament_visibility(cur, conn, admin_id, body: dict) -> dict:
    """Скрывает или показывает турнир"""
    try:
        tournament_id = body.get('tournament_id')
        is_hidden = body.get('is_hidden', True)
        
        if not tournament_id:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Не указан ID турнира'}),
                'isBase64Encoded': False
            }
        
        cur.execute("""
            UPDATE t_p4831367_esport_gta_disaster.tournaments 
            SET is_hidden = %s, updated_at = NOW() 
            WHERE id = %s
        """, (is_hidden, int(tournament_id)))
        
        conn.commit()
        
        action_text = 'скрыт' if is_hidden else 'показан'
        
        # Логируем изменение видимости
        log_admin_action(cur, conn, admin_id, 'tournament_visibility', 
                         f"{'Скрыл' if is_hidden else 'Показал'} турнир", 'tournament', int(tournament_id))
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'message': f'Турнир успешно {action_text}'
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка при изменении видимости: {str(e)}'}),
            'isBase64Encoded': False
        }

def delete_tournament(cur, conn, admin_id, body: dict) -> dict:
    """Мягкое удаление турнира - помечает как removed = 1"""
    import sys
    
    try:
        tournament_id = body.get('tournament_id')
        print(f"=== DELETE Tournament ID: {tournament_id}", file=sys.stderr, flush=True)
        
        if not tournament_id:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Не указан ID турнира'}),
                'isBase64Encoded': False
            }
        
        # Получаем название турнира для логирования
        cur.execute("SELECT name FROM t_p4831367_esport_gta_disaster.tournaments WHERE id = %s", (int(tournament_id),))
        tournament_name_row = cur.fetchone()
        tournament_name = tournament_name_row['name'] if tournament_name_row else 'Unknown'
        
        cur.execute("""
            UPDATE t_p4831367_esport_gta_disaster.tournaments 
            SET removed = 1 
            WHERE id = %s
        """, (int(tournament_id),))
        
        conn.commit()
        print(f"=== Tournament {tournament_id} removed successfully", file=sys.stderr, flush=True)
        
        # Логируем удаление турнира
        log_admin_action(cur, conn, admin_id, 'tournament_delete', 
                         f"Удалил турнир '{tournament_name}'", 'tournament', int(tournament_id))
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'message': 'Турнир удалён из списков'
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        print(f"=== DELETE ERROR: {str(e)}", file=sys.stderr, flush=True)
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка удаления турнира: {str(e)}'}),
            'isBase64Encoded': False
        }

def get_tournaments(cur, conn, body: dict = None) -> dict:
    """Получает список всех турниров (скрытые только для админов)"""
    
    show_hidden = body.get('show_hidden', False) if body else False
    
    if show_hidden:
        cur.execute("""
            SELECT id, name, description, game, start_date, end_date, max_teams, prize_pool, 
                   rules, format, status, created_by, created_at, registration_open, is_hidden
            FROM t_p4831367_esport_gta_disaster.tournaments
            WHERE removed = 0 OR removed IS NULL
            ORDER BY start_date DESC
        """)
    else:
        cur.execute("""
            SELECT id, name, description, game, start_date, end_date, max_teams, prize_pool, 
                   rules, format, status, created_by, created_at, registration_open, is_hidden
            FROM t_p4831367_esport_gta_disaster.tournaments
            WHERE (is_hidden = FALSE OR is_hidden IS NULL) AND (removed = 0 OR removed IS NULL)
            ORDER BY start_date DESC
        """)
    
    tournaments = []
    for row in cur.fetchall():
        tournaments.append({
            'id': row['id'],
            'name': row['name'],
            'description': row['description'],
            'game': row['game'],
            'start_date': row['start_date'].isoformat() if row['start_date'] else None,
            'end_date': row['end_date'].isoformat() if row['end_date'] else None,
            'max_teams': row['max_teams'],
            'prize_pool': row['prize_pool'],
            'rules': row['rules'],
            'format': row['format'],
            'status': row['status'],
            'created_by': row['created_by'],
            'created_at': row['created_at'].isoformat() if row['created_at'] else None,
            'registration_open': row['registration_open'],
            'is_hidden': row.get('is_hidden', False)
        })
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'tournaments': tournaments}),
        'isBase64Encoded': False
    }

def get_tournament(cur, conn, body: dict) -> dict:
    """Получает информацию о турнире"""
    
    tournament_id = body.get('tournament_id')
    
    cur.execute("""
        SELECT id, name, description, game, start_date, end_date, max_teams, prize_pool,
               rules, format, status, created_by, created_at, registration_open
        FROM t_p4831367_esport_gta_disaster.tournaments
        WHERE id = %s
    """, (int(tournament_id),))
    
    row = cur.fetchone()
    
    if not row:
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Турнир не найден'}),
            'isBase64Encoded': False
        }
    
    tournament = {
        'id': row['id'],
        'name': row['name'],
        'description': row['description'],
        'game': row['game'],
        'start_date': row['start_date'].isoformat() if row['start_date'] else None,
        'end_date': row['end_date'].isoformat() if row['end_date'] else None,
        'max_teams': row['max_teams'],
        'prize_pool': row['prize_pool'],
        'rules': row['rules'],
        'format': row['format'],
        'status': row['status'],
        'created_by': row['created_by'],
        'created_at': row['created_at'].isoformat() if row['created_at'] else None,
        'registration_open': row['registration_open']
    }
    
    cur.execute("""
        SELECT tr.id, tr.team_id, t.name, t.tag, t.logo_url, t.rating, tr.status, tr.registered_at
        FROM t_p4831367_esport_gta_disaster.tournament_registrations tr
        JOIN t_p4831367_esport_gta_disaster.teams t ON tr.team_id = t.id
        WHERE tr.tournament_id = %s
        ORDER BY tr.registered_at
    """, (int(tournament_id),))
    
    registered_teams = []
    for row in cur.fetchall():
        registered_teams.append({
            'id': row['id'],
            'team_id': row['team_id'],
            'team_name': row['name'],
            'team_tag': row['tag'],
            'team_logo': row['logo_url'],
            'team_rating': row['rating'],
            'status': row['status'],
            'registered_at': row['registered_at'].isoformat() if row['registered_at'] else None
        })
    
    tournament['registered_teams'] = registered_teams
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'tournament': tournament,
            'id': tournament['id'],
            'name': tournament['name'],
            'registrations': registered_teams
        }),
        'isBase64Encoded': False
    }

def register_team(cur, conn, body: dict) -> dict:
    """Регистрирует команду на турнир"""
    
    tournament_id = body.get('tournament_id')
    team_id = body.get('team_id')
    user_id = body.get('user_id')
    
    if not all([tournament_id, team_id]):
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Необходимо указать tournament_id и team_id'}),
            'isBase64Encoded': False
        }
    
    try:
        # Проверка существования турнира и его статуса
        cur.execute("""
            SELECT id, name, registration_open, max_teams 
            FROM t_p4831367_esport_gta_disaster.tournaments 
            WHERE id = %s
        """, (int(tournament_id),))
        
        tournament = cur.fetchone()
        
        if not tournament:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Турнир не найден'}),
                'isBase64Encoded': False
            }
        
        if not tournament['registration_open']:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Регистрация на турнир закрыта'}),
                'isBase64Encoded': False
            }
        
        # Проверка, что команда существует
        cur.execute("""
            SELECT id, name, captain_id 
            FROM t_p4831367_esport_gta_disaster.teams 
            WHERE id = %s
        """, (int(team_id),))
        
        team = cur.fetchone()
        
        if not team:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Команда не найдена'}),
                'isBase64Encoded': False
            }
        
        # Проверка, что пользователь - капитан команды (если передан user_id)
        if user_id and team['captain_id'] != int(user_id):
            return {
                'statusCode': 403,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Только капитан может регистрировать команду'}),
                'isBase64Encoded': False
            }
        
        # Проверка, что команда уже не зарегистрирована
        cur.execute("""
            SELECT id 
            FROM t_p4831367_esport_gta_disaster.tournament_registrations 
            WHERE tournament_id = %s AND team_id = %s
        """, (int(tournament_id), int(team_id)))
        
        if cur.fetchone():
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Команда уже зарегистрирована на этот турнир'}),
                'isBase64Encoded': False
            }
        
        # Проверка количества команд
        cur.execute("""
            SELECT COUNT(*) as count 
            FROM t_p4831367_esport_gta_disaster.tournament_registrations 
            WHERE tournament_id = %s
        """, (int(tournament_id),))
        
        teams_count = cur.fetchone()['count']
        
        if teams_count >= tournament['max_teams']:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Достигнуто максимальное количество команд'}),
                'isBase64Encoded': False
            }
        
        # Регистрация команды
        cur.execute("""
            INSERT INTO t_p4831367_esport_gta_disaster.tournament_registrations 
            (tournament_id, tournament_name, team_id, status, registered_at) 
            VALUES (%s, %s, %s, 'pending', NOW())
        """, (int(tournament_id), tournament['name'], int(team_id)))
        
        conn.commit()
        
        # Получаем обновлённую информацию о турнире с зарегистрированными командами
        cur.execute("""
            SELECT t.id, t.name, t.description, t.start_date, t.end_date, 
                   t.max_teams, t.prize_pool, t.rules, t.format, t.status, 
                   t.registration_open, t.game, t.created_at
            FROM t_p4831367_esport_gta_disaster.tournaments t
            WHERE t.id = %s
        """, (int(tournament_id),))
        
        updated_tournament = cur.fetchone()
        
        # Получаем все зарегистрированные команды
        cur.execute("""
            SELECT tr.id as registration_id, tr.team_id, tr.status, tr.registered_at,
                   tm.name as team_name, tm.tag, tm.logo_url, tm.rating
            FROM t_p4831367_esport_gta_disaster.tournament_registrations tr
            JOIN t_p4831367_esport_gta_disaster.teams tm ON tr.team_id = tm.id
            WHERE tr.tournament_id = %s
            ORDER BY tr.registered_at ASC
        """, (int(tournament_id),))
        
        registered_teams = []
        for reg_row in cur.fetchall():
            registered_teams.append({
                'registration_id': reg_row['registration_id'],
                'team_id': reg_row['team_id'],
                'team_name': reg_row['team_name'],
                'tag': reg_row['tag'],
                'logo_url': reg_row['logo_url'],
                'rating': reg_row['rating'],
                'status': reg_row['status'],
                'registered_at': reg_row['registered_at'].isoformat() if reg_row['registered_at'] else None
            })
        
        tournament_data = {
            'id': updated_tournament['id'],
            'name': updated_tournament['name'],
            'description': updated_tournament['description'],
            'start_date': updated_tournament['start_date'].isoformat() if updated_tournament['start_date'] else None,
            'end_date': updated_tournament['end_date'].isoformat() if updated_tournament['end_date'] else None,
            'max_teams': updated_tournament['max_teams'],
            'prize_pool': updated_tournament['prize_pool'],
            'rules': updated_tournament['rules'],
            'format': updated_tournament['format'],
            'status': updated_tournament['status'],
            'registration_open': updated_tournament['registration_open'],
            'game': updated_tournament['game'],
            'created_at': updated_tournament['created_at'].isoformat() if updated_tournament['created_at'] else None,
            'registered_teams': registered_teams
        }
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'message': f'Команда "{team["name"]}" успешно зарегистрирована на турнир',
                'tournament': tournament_data
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка регистрации: {str(e)}'}),
            'isBase64Encoded': False
        }

def update_tournament_status(cur, conn, admin_id: str, body: dict) -> dict:
    """Обновляет статус турнира"""
    
    tournament_id = body.get('tournament_id')
    status = body.get('status')
    
    # Если турнир становится активным или завершенным, закрываем регистрацию
    registration_open = True if status == 'upcoming' else False
    
    cur.execute(f"""
        UPDATE tournaments
        SET status = '{escape_sql(status)}', registration_open = {registration_open}
        WHERE id = {int(tournament_id)}
    """)
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'message': 'Статус турнира обновлен'}),
        'isBase64Encoded': False
    }

def get_match_chat(cur, conn, body: dict) -> dict:
    """Получает чат матча"""
    
    match_id = body.get('match_id')
    
    cur.execute(f"""
        SELECT mc.id, mc.user_id, u.username, mc.message, mc.created_at, mc.message_type
        FROM t_p4831367_esport_gta_disaster.match_chat mc
        JOIN t_p4831367_esport_gta_disaster.users u ON mc.user_id = u.id
        WHERE mc.match_id = {int(match_id)}
        ORDER BY mc.created_at
    """)
    
    messages = []
    for row in cur.fetchall():
        messages.append({
            'id': row['id'],
            'user_id': row['user_id'],
            'username': row['username'],
            'message': row['message'],
            'created_at': row['created_at'].isoformat() if row['created_at'] else None,
            'message_type': row['message_type']
        })
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'messages': messages}),
        'isBase64Encoded': False
    }

def send_chat_message(cur, conn, admin_id: str, body: dict) -> dict:
    """Отправляет сообщение в чат матча"""
    
    match_id = body.get('match_id')
    message = body.get('message')
    message_type = body.get('message_type', 'text')
    
    cur.execute(f"""
        INSERT INTO t_p4831367_esport_gta_disaster.match_chat (match_id, user_id, message, message_type)
        VALUES ({int(match_id)}, '{escape_sql(admin_id)}', '{escape_sql(message)}', '{escape_sql(message_type)}')
        RETURNING id
    """)
    
    message_id = cur.fetchone()['id']
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'message': 'Сообщение отправлено', 'message_id': message_id}),
        'isBase64Encoded': False
    }

def get_ban_pick(cur, conn, body: dict) -> dict:
    """Получает информацию о банах и пиках героев"""
    
    match_id = body.get('match_id')
    
    cur.execute(f"""
        SELECT bp.id, bp.team_id, t.name, bp.hero_name, bp.action_type, bp.action_order, bp.created_at
        FROM t_p4831367_esport_gta_disaster.ban_pick bp
        JOIN t_p4831367_esport_gta_disaster.teams t ON bp.team_id = t.id
        WHERE bp.match_id = {int(match_id)}
        ORDER BY bp.action_order
    """)
    
    ban_picks = []
    for row in cur.fetchall():
        ban_picks.append({
            'id': row['id'],
            'team_id': row['team_id'],
            'team_name': row['team_name'],
            'hero_name': row['hero_name'],
            'action_type': row['action_type'],
            'action_order': row['action_order'],
            'created_at': row['created_at'].isoformat() if row['created_at'] else None
        })
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'ban_picks': ban_picks}),
        'isBase64Encoded': False
    }

def make_ban_pick(cur, conn, body: dict) -> dict:
    """Выполняет бан или пик героя"""
    
    match_id = body.get('match_id')
    team_id = body.get('team_id')
    hero_name = body.get('hero_name')
    action_type = body.get('action_type')
    
    cur.execute(f"""
        SELECT COALESCE(MAX(action_order), 0) + 1 AS next_order
        FROM ban_pick
        WHERE match_id = {int(match_id)}
    """)
    
    action_order = cur.fetchone()['next_order']
    
    cur.execute(f"""
        INSERT INTO t_p4831367_esport_gta_disaster.ban_pick (match_id, team_id, hero_name, action_type, action_order)
        VALUES ({int(match_id)}, {int(team_id)}, '{escape_sql(hero_name)}', '{escape_sql(action_type)}', {int(action_order)})
        RETURNING id
    """)
    
    ban_pick_id = cur.fetchone()['id']
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'message': 'Действие выполнено', 'ban_pick_id': ban_pick_id}),
        'isBase64Encoded': False
    }

def calculate_match_rating(cur, conn, admin_id: str, body: dict) -> dict:
    """Рассчитывает рейтинг команд после матча"""
    
    match_id = body.get('match_id')
    winner_id = body.get('winner_id')
    loser_id = body.get('loser_id')
    
    K = 32
    
    cur.execute(f"""
        SELECT rating FROM team_ratings WHERE team_id = {int(winner_id)}
    """)
    winner_rating_row = cur.fetchone()
    winner_rating = winner_rating_row['rating'] if winner_rating_row else 1000
    
    cur.execute(f"""
        SELECT rating FROM team_ratings WHERE team_id = {int(loser_id)}
    """)
    loser_rating_row = cur.fetchone()
    loser_rating = loser_rating_row['rating'] if loser_rating_row else 1000
    
    expected_winner = 1 / (1 + 10 ** ((loser_rating - winner_rating) / 400))
    expected_loser = 1 / (1 + 10 ** ((winner_rating - loser_rating) / 400))
    
    new_winner_rating = winner_rating + K * (1 - expected_winner)
    new_loser_rating = loser_rating + K * (0 - expected_loser)
    
    if winner_rating_row:
        cur.execute(f"""
            UPDATE team_ratings
            SET rating = {new_winner_rating}, matches_played = matches_played + 1, wins = wins + 1
            WHERE team_id = {int(winner_id)}
        """)
    else:
        cur.execute(f"""
            INSERT INTO team_ratings (team_id, rating, matches_played, wins)
            VALUES ({int(winner_id)}, {new_winner_rating}, 1, 1)
        """)
    
    if loser_rating_row:
        cur.execute(f"""
            UPDATE team_ratings
            SET rating = {new_loser_rating}, matches_played = matches_played + 1, losses = losses + 1
            WHERE team_id = {int(loser_id)}
        """)
    else:
        cur.execute(f"""
            INSERT INTO team_ratings (team_id, rating, matches_played, losses)
            VALUES ({int(loser_id)}, {new_loser_rating}, 1, 1)
        """)
    
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'message': 'Рейтинг обновлен',
            'winner_new_rating': new_winner_rating,
            'loser_new_rating': new_loser_rating
        }),
        'isBase64Encoded': False
    }

def get_team_ratings(cur, conn) -> dict:
    """Получает рейтинг всех команд"""
    
    cur.execute("""
        SELECT tr.team_id, t.name, tr.rating, tr.matches_played, tr.wins, tr.losses
        FROM team_ratings tr
        JOIN t_p4831367_esport_gta_disaster.teams t ON tr.team_id = t.id
        ORDER BY tr.rating DESC
    """)
    
    ratings = []
    for row in cur.fetchall():
        ratings.append({
            'team_id': row['team_id'],
            'team_name': row['team_name'],
            'rating': row['rating'],
            'matches_played': row['matches_played'],
            'wins': row['wins'],
            'losses': row['losses']
        })
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'ratings': ratings}),
        'isBase64Encoded': False
    }

def verify_admin_password(cur, conn, body: dict) -> dict:
    """Проверяет пароль администратора"""
    
    admin_id = body.get('admin_id')
    password = body.get('password')
    
    if not admin_id or not password:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Не указан ID администратора или пароль'}),
            'isBase64Encoded': False
        }
    
    try:
        admin_id_int = int(admin_id)
    except (ValueError, TypeError):
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Неверный формат ID администратора'}),
            'isBase64Encoded': False
        }
    
    cur.execute("""
        SELECT password_hash FROM t_p4831367_esport_gta_disaster.users WHERE id = %s
    """, (admin_id_int,))
    
    user_data = cur.fetchone()
    
    if not user_data:
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Пользователь не найден'}),
            'isBase64Encoded': False
        }
    
    import hashlib
    password_hash_sha256 = hashlib.sha256(password.encode()).hexdigest()
    
    if password_hash_sha256 == user_data['password_hash']:
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True}),
            'isBase64Encoded': False
        }
    else:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Неверный пароль'}),
            'isBase64Encoded': False
        }

def create_news(cur, conn, admin_id: str, body: dict, admin_role: str) -> dict:
    """Создает новость"""
    
    if admin_role not in ['admin', 'founder']:
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Недостаточно прав для создания новостей'}),
            'isBase64Encoded': False
        }
    
    title = body.get('title')
    content = body.get('content')
    image_url = body.get('image_url')
    published = body.get('published', False)
    
    if not title or not content:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Заполните заголовок и содержание'}),
            'isBase64Encoded': False
        }
    
    try:
        cur.execute("""
            INSERT INTO t_p4831367_esport_gta_disaster.news 
            (title, content, image_url, author_id, published, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, NOW(), NOW())
            RETURNING id
        """, (title, content, image_url, int(admin_id), published))
        
        result = cur.fetchone()
        news_id = result['id'] if result else None
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True, 'message': 'Новость создана', 'news_id': news_id}),
            'isBase64Encoded': False
        }
    except Exception as e:
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка создания новости: {str(e)}'}),
            'isBase64Encoded': False
        }

def update_news(cur, conn, admin_id: str, body: dict, admin_role: str) -> dict:
    """Обновляет новость"""
    
    if admin_role not in ['admin', 'founder']:
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Недостаточно прав для редактирования новостей'}),
            'isBase64Encoded': False
        }
    
    news_id = body.get('news_id')
    title = body.get('title')
    content = body.get('content')
    image_url = body.get('image_url')
    published = body.get('published')
    
    update_fields = []
    params = []
    
    if title is not None:
        update_fields.append("title = %s")
        params.append(title)
    if content is not None:
        update_fields.append("content = %s")
        params.append(content)
    if image_url is not None:
        update_fields.append("image_url = %s")
        params.append(image_url)
    if published is not None:
        update_fields.append("published = %s")
        params.append(published)
    
    if not update_fields:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Нет данных для обновления'}),
            'isBase64Encoded': False
        }
    
    update_fields.append("updated_at = NOW()")
    params.append(int(news_id))
    
    # Получаем заголовок новости для логирования
    cur.execute("SELECT title FROM t_p4831367_esport_gta_disaster.news WHERE id = %s", (int(news_id),))
    news_title_row = cur.fetchone()
    news_title = news_title_row['title'] if news_title_row else 'Unknown'
    
    cur.execute(f"""
        UPDATE t_p4831367_esport_gta_disaster.news
        SET {', '.join(update_fields)}
        WHERE id = %s
    """, tuple(params))
    conn.commit()
    
    # Логируем обновление новости
    log_admin_action(cur, conn, admin_id, 'news_update', 
                     f"Обновил новость '{news_title}'", 'news', int(news_id))
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'message': 'Новость обновлена'}),
        'isBase64Encoded': False
    }

def delete_news(cur, conn, admin_id: str, body: dict, admin_role: str) -> dict:
    """Удаляет новость"""
    import sys
    
    print(f"=== delete_news called: admin_id={admin_id}, admin_role={admin_role}", file=sys.stderr, flush=True)
    print(f"=== body: {body}", file=sys.stderr, flush=True)
    
    if admin_role not in ['admin', 'founder']:
        print(f"=== ROLE CHECK FAILED: {admin_role}", file=sys.stderr, flush=True)
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Недостаточно прав для удаления новостей'}),
            'isBase64Encoded': False
        }
    
    news_id = body.get('news_id')
    print(f"=== Deleting news_id: {news_id}", file=sys.stderr, flush=True)
    
    try:
        # Получаем заголовок новости для логирования
        cur.execute(f"SELECT title FROM t_p4831367_esport_gta_disaster.news WHERE id = {int(news_id)}")
        news_title_row = cur.fetchone()
        news_title = news_title_row['title'] if news_title_row else 'Unknown'
        
        cur.execute(f"""
            DELETE FROM t_p4831367_esport_gta_disaster.news WHERE id = {int(news_id)}
        """)
        conn.commit()
        
        # Логируем удаление новости
        log_admin_action(cur, conn, admin_id, 'news_delete', 
                         f"Удалил новость '{news_title}'", 'news', int(news_id))
        print(f"=== News deleted successfully", file=sys.stderr, flush=True)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True, 'message': 'Новость удалена'}),
            'isBase64Encoded': False
        }
    except Exception as e:
        print(f"=== ERROR deleting news: {e}", file=sys.stderr, flush=True)
        import traceback
        print(f"=== Traceback: {traceback.format_exc()}", file=sys.stderr, flush=True)
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }

def get_news(cur, conn, body: dict) -> dict:
    """Получает новости"""
    import sys
    
    limit = int(body.get('limit', 50))
    offset = int(body.get('offset', 0))
    include_unpublished = body.get('include_unpublished', False)
    
    print(f"=== get_news: limit={limit}, offset={offset}, include_unpublished={include_unpublished}", file=sys.stderr, flush=True)
    
    try:
        if include_unpublished:
            query = f"""
                SELECT id, title, content, image_url, author_id, published, pinned, created_at, updated_at
                FROM t_p4831367_esport_gta_disaster.news
                ORDER BY pinned DESC, created_at DESC
                LIMIT {limit} OFFSET {offset}
            """
        else:
            query = f"""
                SELECT id, title, content, image_url, author_id, published, pinned, created_at, updated_at
                FROM t_p4831367_esport_gta_disaster.news
                WHERE published = TRUE
                ORDER BY pinned DESC, created_at DESC
                LIMIT {limit} OFFSET {offset}
            """
        
        print(f"=== Executing query: {query[:200]}...", file=sys.stderr, flush=True)
        cur.execute(query)
        print(f"=== Query executed successfully", file=sys.stderr, flush=True)
    except Exception as e:
        print(f"=== ERROR executing query: {e}", file=sys.stderr, flush=True)
        import traceback
        print(f"=== Traceback: {traceback.format_exc()}", file=sys.stderr, flush=True)
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    
    news_list = []
    for row in cur.fetchall():
        news_list.append({
            'id': row['id'],
            'title': row['title'],
            'content': row['content'],
            'image_url': row['image_url'],
            'author_id': row['author_id'],
            'author_name': 'Администратор',
            'published': row['published'] if row['published'] is not None else False,
            'pinned': row['pinned'] if row['pinned'] is not None else False,
            'created_at': row['created_at'].isoformat() if row['created_at'] else None,
            'updated_at': row['updated_at'].isoformat() if row['updated_at'] else None
        })
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'news': news_list}, ensure_ascii=False),
        'isBase64Encoded': False
    }

def create_news_with_image(cur, conn, admin_id: str, body: dict, admin_role: str) -> dict:
    """Создает новость с загрузкой изображения в S3"""
    
    import sys
    print(f"=== create_news_with_image called, admin_role={admin_role}", file=sys.stderr, flush=True)
    
    if admin_role not in ['admin', 'founder']:
        print(f"=== Role check failed: {admin_role}", file=sys.stderr, flush=True)
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Недостаточно прав для создания новостей'}),
            'isBase64Encoded': False
        }
    
    title = body.get('title')
    content = body.get('content')
    image_base64 = body.get('image')
    published = body.get('published', False)
    
    print(f"=== News data: title={title}, content_len={len(content) if content else 0}, has_image={bool(image_base64)}", file=sys.stderr, flush=True)
    
    if not title or not content:
        print(f"=== Validation failed", file=sys.stderr, flush=True)
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Заполните заголовок и содержание'}),
            'isBase64Encoded': False
        }
    
    try:
        print(f"=== Starting news creation process", file=sys.stderr, flush=True)
        import boto3
        import base64
        import hashlib
        from datetime import datetime
        
        image_url = None
        
        if image_base64 and len(image_base64) > 0:
            s3 = boto3.client('s3',
                endpoint_url='https://bucket.poehali.dev',
                aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
                aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
            )
            
            image_data = base64.b64decode(image_base64)
            file_hash = hashlib.md5(image_data).hexdigest()
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            file_key = f'news/{timestamp}_{file_hash}.jpg'
            
            s3.put_object(
                Bucket='files',
                Key=file_key,
                Body=image_data,
                ContentType='image/jpeg'
            )
            
            image_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{file_key}"
        
        cur.execute("""
            INSERT INTO t_p4831367_esport_gta_disaster.news 
            (title, content, image_url, author_id, published, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, NOW(), NOW())
            RETURNING id
        """, (title, content, image_url, int(admin_id), published))
        
        result = cur.fetchone()
        news_id = result['id'] if result else None
        conn.commit()
        
        # Логируем создание новости с изображением
        log_admin_action(cur, conn, admin_id, 'news_create', 
                         f"Создал новость '{title}' с изображением", 'news', news_id)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True, 'message': 'Новость создана', 'news_id': news_id}),
            'isBase64Encoded': False
        }
    except Exception as e:
        conn.rollback()
        import traceback
        error_details = traceback.format_exc()
        print(f"ERROR in create_news_with_image: {error_details}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка создания новости: {str(e)}'}),
            'isBase64Encoded': False
        }

def create_rule(cur, conn, admin_id: str, body: dict, admin_role: str) -> dict:
    """Создает правило"""
    
    if admin_role not in ['admin', 'founder']:
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Недостаточно прав для создания правил'}),
            'isBase64Encoded': False
        }
    
    title = body.get('title')
    content = body.get('content')
    category = body.get('category', 'general')
    
    cur.execute(f"""
        INSERT INTO t_p4831367_esport_gta_disaster.rules (title, content, category, created_by)
        VALUES ('{escape_sql(title)}', '{escape_sql(content)}', '{escape_sql(category)}', '{escape_sql(admin_id)}')
        RETURNING id
    """)
    
    rule_id = cur.fetchone()['id']
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'message': 'Правило создано', 'rule_id': rule_id}),
        'isBase64Encoded': False
    }

def update_rule(cur, conn, admin_id: str, body: dict, admin_role: str) -> dict:
    """Обновляет правило"""
    
    if admin_role not in ['admin', 'founder']:
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Недостаточно прав для редактирования правил'}),
            'isBase64Encoded': False
        }
    
    rule_id = body.get('rule_id')
    title = body.get('title')
    content = body.get('content')
    category = body.get('category')
    
    cur.execute(f"""
        UPDATE rules
        SET title = '{escape_sql(title)}', content = '{escape_sql(content)}', category = '{escape_sql(category)}'
        WHERE id = {int(rule_id)}
    """)
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'message': 'Правило обновлено'}),
        'isBase64Encoded': False
    }

def delete_rule(cur, conn, admin_id: str, body: dict, admin_role: str) -> dict:
    """Удаляет правило"""
    
    if admin_role not in ['admin', 'founder']:
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Недостаточно прав для удаления правил'}),
            'isBase64Encoded': False
        }
    
    rule_id = body.get('rule_id')
    
    cur.execute(f"""
        DELETE FROM t_p4831367_esport_gta_disaster.rules WHERE id = {int(rule_id)}
    """)
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'message': 'Правило удалено'}),
        'isBase64Encoded': False
    }

def get_rules(cur, conn) -> dict:
    """Получает все правила"""
    
    cur.execute("""
        SELECT id, title, content, category, created_by, created_at
        FROM rules
        ORDER BY created_at DESC
    """)
    
    rules = []
    for row in cur.fetchall():
        rules.append({
            'id': row['id'],
            'title': row['title'],
            'content': row['content'],
            'category': row['category'],
            'created_by': row['created_by'],
            'created_at': row['created_at'].isoformat() if row['created_at'] else None
        })
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'rules': rules}),
        'isBase64Encoded': False
    }

def update_support(cur, conn, admin_id: str, body: dict, admin_role: str) -> dict:
    """Обновляет информацию о поддержке"""
    
    if admin_role not in ['admin', 'founder']:
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Недостаточно прав для редактирования поддержки'}),
            'isBase64Encoded': False
        }
    
    email = body.get('email')
    discord = body.get('discord')
    telegram = body.get('telegram')
    
    cur.execute(f"""
        UPDATE support_info
        SET email = '{escape_sql(email)}', discord = '{escape_sql(discord)}', telegram = '{escape_sql(telegram)}'
        WHERE id = 1
    """)
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'message': 'Информация о поддержке обновлена'}),
        'isBase64Encoded': False
    }

def get_support(cur, conn) -> dict:
    """Получает информацию о поддержке"""
    
    cur.execute("""
        SELECT email, discord, telegram
        FROM support_info
        WHERE id = 1
    """)
    
    row = cur.fetchone()
    
    if row:
        support_info = {
            'email': row['email'],
            'discord': row['discord'],
            'telegram': row['telegram']
        }
    else:
        support_info = {
            'email': '',
            'discord': '',
            'telegram': ''
        }
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'support': support_info}),
        'isBase64Encoded': False
    }

def get_all_users(cur, conn) -> dict:
    """Получает список всех пользователей"""
    
    cur.execute("""
        SELECT id, username, email, role, created_at
        FROM t_p4831367_esport_gta_disaster.users
        ORDER BY created_at DESC
    """)
    
    users = []
    for row in cur.fetchall():
        users.append({
            'id': row['id'],
            'username': row['username'],
            'email': row['email'],
            'role': row['role'],
            'created_at': row['created_at'].isoformat() if row['created_at'] else None
        })
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'users': users}),
        'isBase64Encoded': False
    }

def generate_bracket(cur, conn, admin_id: str, body: dict) -> dict:
    """Генерирует турнирную сетку для турнира"""
    tournament_id = body.get('tournament_id')
    bracket_format = body.get('format', 'single_elimination')
    bracket_style = body.get('style', 'esports')
    
    if not tournament_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'tournament_id обязателен'}),
            'isBase64Encoded': False
        }
    
    try:
        # Получаем информацию о турнире
        cur.execute(f"""
            SELECT max_teams FROM t_p4831367_esport_gta_disaster.tournaments
            WHERE id = {tournament_id}
        """)
        tournament_data = cur.fetchone()
        
        if not tournament_data:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Турнир не найден'}),
                'isBase64Encoded': False
            }
        
        max_teams = tournament_data['max_teams'] or 16  # По умолчанию 16 команд
        
        # Получаем все одобренные регистрации (статус approved или confirmed)
        cur.execute(f"""
            SELECT tr.team_id, t.name, t.logo_url
            FROM t_p4831367_esport_gta_disaster.tournament_registrations tr
            JOIN t_p4831367_esport_gta_disaster.teams t ON tr.team_id = t.id
            WHERE tr.tournament_id = {tournament_id} 
            AND (tr.status = 'approved' OR tr.status = 'confirmed')
            ORDER BY tr.registered_at
        """)
        teams = cur.fetchall()
        
        if len(teams) == 0:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Нет одобренных команд для создания сетки'}),
                'isBase64Encoded': False
            }
        
        # Проверяем, есть ли уже сетка
        cur.execute(f"""
            SELECT id FROM t_p4831367_esport_gta_disaster.tournament_brackets
            WHERE tournament_id = {tournament_id}
        """)
        existing_bracket = cur.fetchone()
        
        if existing_bracket:
            bracket_id = existing_bracket['id']
            # Удаляем старые матчи и обновляем стиль
            cur.execute(f"""
                DELETE FROM t_p4831367_esport_gta_disaster.bracket_matches
                WHERE bracket_id = {bracket_id}
            """)
            cur.execute(f"""
                UPDATE t_p4831367_esport_gta_disaster.tournament_brackets
                SET style = '{escape_sql(bracket_style)}', updated_at = NOW()
                WHERE id = {bracket_id}
            """)
        else:
            # Создаем новый bracket
            cur.execute(f"""
                INSERT INTO t_p4831367_esport_gta_disaster.tournament_brackets 
                (tournament_id, format, style, created_by, created_at, updated_at)
                VALUES ({tournament_id}, '{escape_sql(bracket_format)}', '{escape_sql(bracket_style)}', {admin_id}, NOW(), NOW())
                RETURNING id
            """)
            bracket_id = cur.fetchone()['id']
        
        # Генерируем сетку на основе max_teams (фиксированная сетка)
        import math
        rounds = int(math.log2(max_teams))  # Например, 16 команд = 4 раунда
        
        # Создаем список слотов для первого раунда
        slots = [None] * max_teams
        for i, team in enumerate(teams):
            if i < max_teams:
                slots[i] = team['team_id']  # team_id
        
        # Первый раунд - создаем матчи попарно
        match_number = 1
        for i in range(0, max_teams, 2):
            team1_id = slots[i] if slots[i] else None
            team2_id = slots[i + 1] if slots[i + 1] else None
            
            # Если только одна команда в паре - она автоматически проходит дальше
            if team1_id and not team2_id:
                # Команда проходит дальше автоматически
                cur.execute(f"""
                    INSERT INTO t_p4831367_esport_gta_disaster.bracket_matches
                    (bracket_id, round, match_number, team1_id, team2_id, winner_id, status, created_at, updated_at)
                    VALUES ({bracket_id}, 1, {match_number}, {team1_id}, NULL, {team1_id}, 'walkover', NOW(), NOW())
                """)
            elif team2_id and not team1_id:
                # Команда 2 проходит дальше автоматически
                cur.execute(f"""
                    INSERT INTO t_p4831367_esport_gta_disaster.bracket_matches
                    (bracket_id, round, match_number, team1_id, team2_id, winner_id, status, created_at, updated_at)
                    VALUES ({bracket_id}, 1, {match_number}, NULL, {team2_id}, {team2_id}, 'walkover', NOW(), NOW())
                """)
            else:
                # Обычный матч (может быть NULL vs NULL или team vs team)
                cur.execute(f"""
                    INSERT INTO t_p4831367_esport_gta_disaster.bracket_matches
                    (bracket_id, round, match_number, team1_id, team2_id, status, created_at, updated_at)
                    VALUES ({bracket_id}, 1, {match_number}, {'NULL' if not team1_id else team1_id}, {'NULL' if not team2_id else team2_id}, 'pending', NOW(), NOW())
                """)
            
            match_number += 1
        
        # Создаем пустые матчи для следующих раундов
        for round_num in range(2, rounds + 1):
            matches_in_round = max_teams // (2 ** round_num)
            for match_num in range(1, matches_in_round + 1):
                cur.execute(f"""
                    INSERT INTO t_p4831367_esport_gta_disaster.bracket_matches
                    (bracket_id, round, match_number, status, created_at, updated_at)
                    VALUES ({bracket_id}, {round_num}, {match_num}, 'pending', NOW(), NOW())
                """)
        
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'bracket_id': bracket_id,
                'total_teams': len(teams),
                'max_teams': max_teams,
                'rounds': rounds,
                'message': f'Турнирная сетка создана для {len(teams)} из {max_teams} команд'
            }),
            'isBase64Encoded': False
        }
    except Exception as e:
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка генерации сетки: {str(e)}'}),
            'isBase64Encoded': False
        }

def get_bracket(cur, conn, body: dict) -> dict:
    """Получает турнирную сетку"""
    tournament_id = body.get('tournament_id')
    
    if not tournament_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'tournament_id обязателен'}),
            'isBase64Encoded': False
        }
    
    # Получаем bracket_id
    cur.execute(f"""
        SELECT id, format, style FROM t_p4831367_esport_gta_disaster.tournament_brackets
        WHERE tournament_id = {tournament_id}
    """)
    bracket_data = cur.fetchone()
    
    if not bracket_data:
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'bracket': None, 'message': 'Сетка еще не создана'}),
            'isBase64Encoded': False
        }
    
    bracket_id = bracket_data['id']
    bracket_format = bracket_data['format']
    bracket_style = bracket_data.get('style', 'esports')
    
    # Получаем все матчи
    cur.execute(f"""
        SELECT 
            bm.id, bm.round, bm.match_number,
            bm.team1_id, t1.name as team1_name, t1.logo_url as team1_logo,
            bm.team2_id, t2.name as team2_name, t2.logo_url as team2_logo,
            bm.winner_id, tw.name as winner_name,
            bm.team1_score, bm.team2_score,
            bm.status, bm.scheduled_at,
            bm.team1_captain_confirmed, bm.team2_captain_confirmed,
            bm.moderator_verified, bm.map_name
        FROM t_p4831367_esport_gta_disaster.bracket_matches bm
        LEFT JOIN t_p4831367_esport_gta_disaster.teams t1 ON bm.team1_id = t1.id
        LEFT JOIN t_p4831367_esport_gta_disaster.teams t2 ON bm.team2_id = t2.id
        LEFT JOIN t_p4831367_esport_gta_disaster.teams tw ON bm.winner_id = tw.id
        WHERE bm.bracket_id = {bracket_id}
        ORDER BY bm.round, bm.match_number
    """)
    
    matches = []
    for row in cur.fetchall():
        matches.append({
            'id': row['id'],
            'round': row['round'],
            'match_number': row['match_number'],
            'team1_id': row['team1_id'],
            'team1_name': row['team1_name'],
            'team1_logo_url': row['team1_logo'],
            'team2_id': row['team2_id'],
            'team2_name': row['team2_name'],
            'team2_logo_url': row['team2_logo'],
            'winner_id': row['winner_id'],
            'winner_name': row['winner_name'],
            'team1_score': row['team1_score'],
            'team2_score': row['team2_score'],
            'status': row['status'],
            'scheduled_at': row['scheduled_at'].isoformat() if row['scheduled_at'] else None,
            'team1_confirmed': row['team1_captain_confirmed'],
            'team2_confirmed': row['team2_captain_confirmed'],
            'moderator_verified': row['moderator_verified'],
            'map_name': row['map_name']
        })
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'bracket_id': bracket_id,
            'format': bracket_format,
            'style': bracket_style,
            'matches': matches
        }),
        'isBase64Encoded': False
    }

def update_match_score(cur, conn, admin_id: str, body: dict) -> dict:
    """Обновляет счет матча"""
    match_id = body.get('match_id')
    team1_score = body.get('team1_score')
    team2_score = body.get('team2_score')
    
    if not match_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'match_id обязателен'}),
            'isBase64Encoded': False
        }
    
    # Определяем победителя
    winner_id = None
    if team1_score is not None and team2_score is not None:
        cur.execute(f"""
            SELECT team1_id, team2_id FROM t_p4831367_esport_gta_disaster.bracket_matches
            WHERE id = {match_id}
        """)
        teams = cur.fetchone()
        if teams:
            winner_id = teams['team1_id'] if team1_score > team2_score else teams['team2_id'] if team2_score > team1_score else None
    
    # Обновляем матч
    winner_sql = f", winner_id = {winner_id}" if winner_id else ""
    cur.execute(f"""
        UPDATE t_p4831367_esport_gta_disaster.bracket_matches
        SET team1_score = {team1_score if team1_score is not None else 'NULL'},
            team2_score = {team2_score if team2_score is not None else 'NULL'},
            moderator_verified = TRUE,
            updated_at = NOW()
            {winner_sql}
        WHERE id = {match_id}
    """)
    
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'message': 'Счет обновлен'}),
        'isBase64Encoded': False
    }

def complete_match(cur, conn, admin_id: str, body: dict) -> dict:
    """Завершает матч и продвигает победителя в следующий раунд"""
    match_id = body.get('match_id')
    
    if not match_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'match_id обязателен'}),
            'isBase64Encoded': False
        }
    
    # Получаем данные матча
    cur.execute(f"""
        SELECT bracket_id, round, match_number, winner_id, team1_score, team2_score
        FROM t_p4831367_esport_gta_disaster.bracket_matches
        WHERE id = {match_id}
    """)
    match_data = cur.fetchone()
    
    if not match_data:
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Матч не найден'}),
            'isBase64Encoded': False
        }
    
    bracket_id = match_data['bracket_id']
    current_round = match_data['round']
    match_number = match_data['match_number']
    winner_id = match_data['winner_id']
    team1_score = match_data['team1_score']
    team2_score = match_data['team2_score']
    
    if not winner_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Не определен победитель матча'}),
            'isBase64Encoded': False
        }
    
    # Обновляем статус матча
    cur.execute(f"""
        UPDATE t_p4831367_esport_gta_disaster.bracket_matches
        SET status = 'completed', completed_at = NOW(), updated_at = NOW()
        WHERE id = {match_id}
    """)
    
    # Продвигаем победителя в следующий раунд
    next_round = current_round + 1
    next_match_number = (match_number + 1) // 2
    
    # Определяем, какая позиция в следующем матче (team1 или team2)
    is_team1 = (match_number % 2 == 1)
    team_column = 'team1_id' if is_team1 else 'team2_id'
    
    cur.execute(f"""
        UPDATE t_p4831367_esport_gta_disaster.bracket_matches
        SET {team_column} = {winner_id}, updated_at = NOW()
        WHERE bracket_id = {bracket_id} 
        AND round = {next_round} 
        AND match_number = {next_match_number}
    """)
    
    conn.commit()
    
    # Отправляем уведомления игрокам обеих команд о завершении матча
    try:
        cur.execute(f"""
            SELECT bm.team1_id, bm.team2_id, bm.winner_id,
                   t1.name as team1_name, t2.name as team2_name,
                   tw.name as winner_name,
                   tour.name as tournament_name, tour.id as tournament_id
            FROM t_p4831367_esport_gta_disaster.bracket_matches bm
            LEFT JOIN t_p4831367_esport_gta_disaster.teams t1 ON bm.team1_id = t1.id
            LEFT JOIN t_p4831367_esport_gta_disaster.teams t2 ON bm.team2_id = t2.id
            LEFT JOIN t_p4831367_esport_gta_disaster.teams tw ON bm.winner_id = tw.id
            LEFT JOIN t_p4831367_esport_gta_disaster.tournament_brackets tb ON bm.bracket_id = tb.id
            LEFT JOIN t_p4831367_esport_gta_disaster.tournaments tour ON tb.tournament_id = tour.id
            WHERE bm.id = {match_id}
        """)
        match_info = cur.fetchone()
        
        if match_info:
            team1_id = match_info['team1_id']
            team2_id = match_info['team2_id']
            winner_name = match_info['winner_name']
            tournament_name = match_info['tournament_name']
            tournament_id = match_info['tournament_id']
            
            # Получаем игроков обеих команд
            all_members = []
            if team1_id:
                cur.execute(f"SELECT user_id FROM t_p4831367_esport_gta_disaster.team_members WHERE team_id = {team1_id} AND status = 'active'")
                all_members.extend([row['user_id'] for row in cur.fetchall()])
            if team2_id:
                cur.execute(f"SELECT user_id FROM t_p4831367_esport_gta_disaster.team_members WHERE team_id = {team2_id} AND status = 'active'")
                all_members.extend([row['user_id'] for row in cur.fetchall()])
            
            # Отправляем уведомления
            for user_id in all_members:
                cur.execute(f"""
                    INSERT INTO t_p4831367_esport_gta_disaster.notifications 
                    (user_id, type, title, message, link, read, created_at)
                    VALUES (
                        {user_id},
                        'match_result',
                        'Матч завершен',
                        'Матч в турнире "{escape_sql(tournament_name)}" завершен. Победитель: {escape_sql(winner_name)}',
                        '/tournaments/{tournament_id}/bracket',
                        false,
                        NOW()
                    )
                """)
            conn.commit()
    except Exception as e:
        # Если уведомления не отправились - не критично, матч уже завершен
        print(f"Warning: Failed to send notifications: {str(e)}")
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'success': True,
            'message': 'Матч завершен, победитель продвинут в следующий раунд'
        }),
        'isBase64Encoded': False
    }

def get_dashboard_stats(cur, conn) -> dict:
    """Получает статистику для дашборда"""
    
    try:
        cur.execute("SELECT COUNT(*) as cnt FROM t_p4831367_esport_gta_disaster.users")
        result = cur.fetchone()
        total_users = result['cnt'] if result else 0
        
        cur.execute("SELECT COUNT(*) as cnt FROM t_p4831367_esport_gta_disaster.tournaments WHERE status = 'active'")
        result = cur.fetchone()
        active_tournaments = result['cnt'] if result else 0
        
        cur.execute("SELECT COUNT(*) as cnt FROM t_p4831367_esport_gta_disaster.news")
        result = cur.fetchone()
        published_news = result['cnt'] if result else 0
        
        cur.execute("SELECT COUNT(*) as cnt FROM t_p4831367_esport_gta_disaster.bans")
        result = cur.fetchone()
        active_bans = result['cnt'] if result else 0
        
        cur.execute("SELECT COUNT(*) as cnt FROM t_p4831367_esport_gta_disaster.mutes")
        result = cur.fetchone()
        active_mutes = result['cnt'] if result else 0
        
        cur.execute("SELECT COUNT(*) as cnt FROM t_p4831367_esport_gta_disaster.teams")
        result = cur.fetchone()
        total_teams = result['cnt'] if result else 0
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'stats': {
                    'total_users': total_users,
                    'active_tournaments': active_tournaments,
                    'published_news': published_news,
                    'active_bans': active_bans,
                    'active_mutes': active_mutes,
                    'total_teams': total_teams
                }
            }),
            'isBase64Encoded': False
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка получения статистики: {str(e)}'}),
            'isBase64Encoded': False
        }

def assign_role(cur, conn, admin_id: str, admin_role: str, body: dict) -> dict:
    """Назначает роль пользователю"""
    
    if admin_role != 'founder':
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Только основатель может назначать роли'}),
            'isBase64Encoded': False
        }
    
    user_id = body.get('user_id')
    role = body.get('role')
    
    if role not in ['admin', 'organizer', 'referee', 'manager', 'user']:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Недопустимая роль'}),
            'isBase64Encoded': False
        }
    
    # Получаем информацию о пользователе
    cur.execute(f"SELECT nickname FROM t_p4831367_esport_gta_disaster.users WHERE id = {int(user_id)}")
    target_user = cur.fetchone()
    target_nickname = target_user['nickname'] if target_user else 'Unknown'
    
    cur.execute(f"""
        UPDATE t_p4831367_esport_gta_disaster.users
        SET role = '{escape_sql(role)}'
        WHERE id = '{escape_sql(user_id)}'
    """)
    
    cur.execute(f"""
        INSERT INTO t_p4831367_esport_gta_disaster.role_history (user_id, assigned_by, role, action)
        VALUES ('{escape_sql(user_id)}', '{escape_sql(admin_id)}', '{escape_sql(role)}', 'assigned')
    """)
    
    # Логируем действие
    role_names = {'admin': 'Администратор', 'organizer': 'Организатор', 'referee': 'Судья', 'manager': 'Руководитель', 'user': 'Пользователь'}
    log_admin_action(cur, conn, admin_id, 'role_change', 
                     f"Назначил роль '{role_names.get(role, role)}' пользователю {target_nickname}", 
                     'user', int(user_id))
    
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'message': 'Роль назначена'}),
        'isBase64Encoded': False
    }

def revoke_role(cur, conn, admin_id: str, admin_role: str, body: dict) -> dict:
    """Отзывает роль у пользователя"""
    
    if admin_role != 'founder':
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Только основатель может отзывать роли'}),
            'isBase64Encoded': False
        }
    
    user_id = body.get('user_id')
    
    cur.execute(f"""
        SELECT role, nickname FROM t_p4831367_esport_gta_disaster.users WHERE id = '{escape_sql(user_id)}'
    """)
    
    current_user = cur.fetchone()
    
    if not current_user:
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Пользователь не найден'}),
            'isBase64Encoded': False
        }
    
    old_role = current_user['role']
    user_nickname = current_user['nickname']
    
    cur.execute(f"""
        UPDATE t_p4831367_esport_gta_disaster.users
        SET role = 'user'
        WHERE id = '{escape_sql(user_id)}'
    """)
    
    cur.execute(f"""
        INSERT INTO t_p4831367_esport_gta_disaster.role_history (user_id, assigned_by, role, action)
        VALUES ('{escape_sql(user_id)}', '{escape_sql(admin_id)}', '{escape_sql(old_role)}', 'revoked')
    """)
    
    # Логируем снятие роли
    role_names = {'admin': 'Администратор', 'organizer': 'Организатор', 'referee': 'Судья', 'manager': 'Руководитель'}
    log_admin_action(cur, conn, admin_id, 'role_change', 
                     f"Снял роль '{role_names.get(old_role, old_role)}' у пользователя {user_nickname}", 
                     'user', int(user_id))
    
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'message': 'Роль отозвана'}),
        'isBase64Encoded': False
    }

def get_staff(cur, conn) -> dict:
    """Получает список сотрудников"""
    
    cur.execute("""
        SELECT id, nickname, email, role, avatar_url, created_at
        FROM t_p4831367_esport_gta_disaster.users
        WHERE role IN ('admin', 'founder', 'organizer', 'referee', 'manager')
        ORDER BY 
            CASE role
                WHEN 'founder' THEN 1
                WHEN 'admin' THEN 2
                WHEN 'organizer' THEN 3
                WHEN 'referee' THEN 4
                WHEN 'manager' THEN 5
            END,
            nickname
    """)
    
    staff = []
    for row in cur.fetchall():
        staff.append({
            'id': row['id'],
            'nickname': row['nickname'],
            'email': row['email'],
            'role': row['role'],
            'avatar_url': row['avatar_url'],
            'created_at': row['created_at'].isoformat() if row['created_at'] else None
        })
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'staff': staff}),
        'isBase64Encoded': False
    }

def get_role_history(cur, conn, body: dict) -> dict:
    """Получает историю изменения ролей пользователя"""
    
    user_id = body.get('user_id')
    
    cur.execute(f"""
        SELECT rh.id, rh.user_id, u1.username, rh.assigned_by, u2.username, rh.role, rh.action, rh.created_at
        FROM t_p4831367_esport_gta_disaster.role_history rh
        JOIN t_p4831367_esport_gta_disaster.users u1 ON rh.user_id = u1.id
        JOIN t_p4831367_esport_gta_disaster.users u2 ON rh.assigned_by = u2.id
        WHERE rh.user_id = '{escape_sql(user_id)}'
        ORDER BY rh.created_at DESC
    """)
    
    history = []
    for row in cur.fetchall():
        history.append({
            'id': row[0],
            'user_id': row[1],
            'username': row[2],
            'assigned_by': row[3],
            'assigned_by_username': row[4],
            'role': row[5],
            'action': row[6],
            'created_at': row[7].isoformat() if row[7] else None
        })
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'history': history}),
        'isBase64Encoded': False
    }

def create_discussion(cur, conn, admin_id: str, admin_role: str, body: dict) -> dict:
    """Создает обсуждение"""
    
    title = body.get('title')
    content = body.get('content')
    category = body.get('category', 'general')
    
    cur.execute(f"""
        INSERT INTO t_p4831367_esport_gta_disaster.discussions (title, content, category, author_id)
        VALUES ('{escape_sql(title)}', '{escape_sql(content)}', '{escape_sql(category)}', '{escape_sql(admin_id)}')
        RETURNING id
    """)
    
    discussion_id = cur.fetchone()[0]
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'message': 'Обсуждение создано', 'discussion_id': discussion_id}),
        'isBase64Encoded': False
    }

def add_comment(cur, conn, admin_id: str, admin_role: str, body: dict) -> dict:
    """Добавляет комментарий к обсуждению"""
    import boto3
    import base64
    import uuid
    
    discussion_id = body.get('discussion_id')
    content = body.get('content')
    image_base64 = body.get('image_base64')
    image_filename = body.get('image_filename')
    
    cur.execute(f"""
        SELECT locked FROM t_p4831367_esport_gta_disaster.discussions WHERE id = {int(discussion_id)}
    """)
    
    locked = cur.fetchone()
    
    if not locked:
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Обсуждение не найдено'}),
            'isBase64Encoded': False
        }
    
    if locked[0]:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Обсуждение заблокировано'}),
            'isBase64Encoded': False
        }
    
    image_url = None
    if image_base64 and image_filename:
        try:
            s3 = boto3.client('s3',
                endpoint_url='https://bucket.poehali.dev',
                aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
                aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
            )
            
            image_data = base64.b64decode(image_base64)
            file_ext = image_filename.split('.')[-1] if '.' in image_filename else 'jpg'
            key = f'discussions/comments/{uuid.uuid4()}.{file_ext}'
            
            content_type = 'image/jpeg'
            if file_ext.lower() in ['png']:
                content_type = 'image/png'
            elif file_ext.lower() in ['gif']:
                content_type = 'image/gif'
            elif file_ext.lower() in ['webp']:
                content_type = 'image/webp'
            
            s3.put_object(
                Bucket='files',
                Key=key,
                Body=image_data,
                ContentType=content_type
            )
            
            image_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': f'Ошибка загрузки изображения: {str(e)}'}),
                'isBase64Encoded': False
            }
    
    cur.execute(f"""
        INSERT INTO t_p4831367_esport_gta_disaster.discussion_comments (discussion_id, author_id, content, image_url)
        VALUES ({int(discussion_id)}, '{escape_sql(admin_id)}', '{escape_sql(content)}', {'NULL' if not image_url else f"'{escape_sql(image_url)}'"})
        RETURNING id
    """)
    
    comment_id = cur.fetchone()[0]
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'message': 'Комментарий добавлен', 'comment_id': comment_id}),
        'isBase64Encoded': False
    }

def get_discussions(cur, conn) -> dict:
    """Получает список обсуждений"""
    
    cur.execute("""
        SELECT d.id, d.title, d.content, d.category, d.author_id, u.nickname, d.locked, d.pinned, d.created_at,
            (SELECT COUNT(*) FROM t_p4831367_esport_gta_disaster.discussion_comments dc WHERE dc.discussion_id = d.id) as comments_count
        FROM t_p4831367_esport_gta_disaster.discussions d
        JOIN t_p4831367_esport_gta_disaster.users u ON d.author_id = u.id
        ORDER BY d.pinned DESC, d.created_at DESC
    """)
    
    discussions = []
    for row in cur.fetchall():
        discussions.append({
            'id': row[0],
            'title': row[1],
            'content': row[2],
            'category': row[3],
            'author_id': row[4],
            'author_nickname': row[5],
            'is_locked': row[6],
            'is_pinned': row[7],
            'created_at': row[8].isoformat() if row[8] else None,
            'comments_count': row[9]
        })
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'discussions': discussions}),
        'isBase64Encoded': False
    }

def get_discussion(cur, conn, body: dict) -> dict:
    """Получает обсуждение с комментариями"""
    
    discussion_id = body.get('discussion_id')
    
    cur.execute(f"""
        SELECT d.id, d.title, d.content, d.category, d.author_id, u.nickname, d.locked, d.pinned, d.created_at
        FROM t_p4831367_esport_gta_disaster.discussions d
        JOIN t_p4831367_esport_gta_disaster.users u ON d.author_id = u.id
        WHERE d.id = {int(discussion_id)}
    """)
    
    row = cur.fetchone()
    
    if not row:
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Обсуждение не найдено'}),
            'isBase64Encoded': False
        }
    
    discussion = {
        'id': row[0],
        'title': row[1],
        'content': row[2],
        'category': row[3],
        'author_id': row[4],
        'author_nickname': row[5],
        'is_locked': row[6],
        'is_pinned': row[7],
        'created_at': row[8].isoformat() if row[8] else None
    }
    
    cur.execute(f"""
        SELECT dc.id, dc.author_id, u.nickname, dc.content, dc.created_at, dc.image_url
        FROM t_p4831367_esport_gta_disaster.discussion_comments dc
        JOIN t_p4831367_esport_gta_disaster.users u ON dc.author_id = u.id
        WHERE dc.discussion_id = {int(discussion_id)}
        ORDER BY dc.created_at
    """)
    
    comments = []
    for row in cur.fetchall():
        comments.append({
            'id': row[0],
            'author_id': row[1],
            'author_nickname': row[2],
            'content': row[3],
            'created_at': row[4].isoformat() if row[4] else None,
            'image_url': row[5]
        })
    
    discussion['comments'] = comments
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'discussion': discussion}),
        'isBase64Encoded': False
    }

def lock_discussion(cur, conn, body: dict) -> dict:
    """Блокирует обсуждение"""
    
    discussion_id = body.get('discussion_id')
    
    cur.execute(f"""
        UPDATE discussions
        SET locked = TRUE
        WHERE id = {int(discussion_id)}
    """)
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'message': 'Обсуждение заблокировано'}),
        'isBase64Encoded': False
    }

def pin_discussion(cur, conn, body: dict) -> dict:
    """Закрепляет обсуждение"""
    
    discussion_id = body.get('discussion_id')
    
    cur.execute(f"""
        UPDATE discussions
        SET pinned = TRUE
        WHERE id = {int(discussion_id)}
    """)
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'message': 'Обсуждение закреплено'}),
        'isBase64Encoded': False
    }

def delete_discussion(cur, conn, body: dict) -> dict:
    """Удаляет обсуждение"""
    
    discussion_id = body.get('discussion_id')
    
    cur.execute(f"""
        DELETE FROM t_p4831367_esport_gta_disaster.discussions WHERE id = {int(discussion_id)}
    """)
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'message': 'Обсуждение удалено'}),
        'isBase64Encoded': False
    }

def edit_discussion(cur, conn, admin_id: str, body: dict) -> dict:
    """Редактирует обсуждение"""
    
    discussion_id = body.get('discussion_id')
    title = body.get('title')
    content = body.get('content')
    category = body.get('category')
    
    cur.execute(f"""
        UPDATE discussions
        SET title = '{escape_sql(title)}', content = '{escape_sql(content)}', category = '{escape_sql(category)}'
        WHERE id = {int(discussion_id)}
    """)
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'message': 'Обсуждение обновлено'}),
        'isBase64Encoded': False
    }

def create_news_with_image(cur, conn, admin_id: str, body: dict, admin_role: str) -> dict:
    """Создает новость с изображением"""
    
    if admin_role not in ['admin', 'founder']:
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Недостаточно прав для создания новостей'}),
            'isBase64Encoded': False
        }
    
    title = body.get('title')
    content = body.get('content')
    category = body.get('category', 'general')
    image_url = body.get('image_url')
    
    cur.execute(f"""
        INSERT INTO t_p4831367_esport_gta_disaster.news (title, content, category, author_id, image_url)
        VALUES ('{escape_sql(title)}', '{escape_sql(content)}', '{escape_sql(category)}', '{escape_sql(admin_id)}', '{escape_sql(image_url)}')
        RETURNING id
    """)
    
    news_id = cur.fetchone()[0]
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'message': 'Новость создана', 'news_id': news_id}),
        'isBase64Encoded': False
    }

def delete_tournament(cur, conn, admin_id: str, body: dict) -> dict:
    """Удаляет турнир"""
    
    tournament_id = body.get('tournament_id')
    
    cur.execute(f"""
        DELETE FROM t_p4831367_esport_gta_disaster.tournaments WHERE id = {int(tournament_id)}
    """)
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'message': 'Турнир удален'}),
        'isBase64Encoded': False
    }

def hide_tournament(cur, conn, admin_id: str, body: dict) -> dict:
    """Скрывает турнир"""
    
    tournament_id = body.get('tournament_id')
    hidden = body.get('hidden', True)
    
    cur.execute(f"""
        UPDATE tournaments
        SET hidden = {str(hidden).upper()}
        WHERE id = {int(tournament_id)}
    """)
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'message': 'Статус видимости турнира обновлен'}),
        'isBase64Encoded': False
    }

def start_tournament(cur, conn, admin_id: str, body: dict) -> dict:
    """Запускает турнир"""
    
    tournament_id = body.get('tournament_id')
    
    cur.execute(f"""
        UPDATE tournaments
        SET status = 'active'
        WHERE id = {int(tournament_id)}
    """)
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'message': 'Турнир запущен'}),
        'isBase64Encoded': False
    }

def get_admin_tournaments(cur, conn) -> dict:
    """Получает турниры для администрирования"""
    
    cur.execute("""
        SELECT t.id, t.name, t.game, t.status, t.start_date, t.max_teams,
               COUNT(DISTINCT tr.id) as registered_teams
        FROM t_p4831367_esport_gta_disaster.tournaments t
        LEFT JOIN tournament_registrations tr ON t.id = tr.tournament_id
        GROUP BY t.id, t.name, t.game, t.status, t.start_date, t.max_teams
        ORDER BY t.start_date DESC
    """)
    
    tournaments = []
    for row in cur.fetchall():
        tournaments.append({
            'id': row[0],
            'name': row[1],
            'game': row[2],
            'status': row[3],
            'start_date': row[4].isoformat() if row[4] else None,
            'max_teams': row[5],
            'registered_teams': row[6]
        })
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'tournaments': tournaments}),
        'isBase64Encoded': False
    }

def approve_registration(cur, conn, admin_id: str, body: dict) -> dict:
    """Одобряет регистрацию команды на турнир"""
    
    registration_id = body.get('registration_id') or body.get('application_id')
    approved = body.get('approved', True)
    
    if approved is None or approved == 'pending':
        status = 'pending'
    else:
        status = 'approved' if approved else 'rejected'
    
    # Получаем информацию о регистрации
    cur.execute(f"""
        SELECT team_id, tournament_id
        FROM t_p4831367_esport_gta_disaster.tournament_registrations
        WHERE id = {int(registration_id)}
    """)
    reg_info = cur.fetchone()
    
    if reg_info:
        team_id = reg_info['team_id']
        tournament_id = reg_info['tournament_id']
        
        # Обновляем статус
        cur.execute(f"""
            UPDATE t_p4831367_esport_gta_disaster.tournament_registrations
            SET status = '{escape_sql(status)}'
            WHERE id = {int(registration_id)}
        """)
        
        # Отправляем уведомления игрокам команды
        try:
            notify_tournament_registration(cur, conn, tournament_id, team_id, status)
        except Exception as e:
            print(f"Warning: Failed to send notifications: {str(e)}")
    
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'message': f'Регистрация {status}'}),
        'isBase64Encoded': False
    }

def reject_registration(cur, conn, admin_id: str, body: dict) -> dict:
    """Отклоняет регистрацию команды на турнир"""
    
    registration_id = body.get('registration_id') or body.get('application_id')
    
    # Получаем информацию о регистрации
    cur.execute(f"""
        SELECT team_id, tournament_id
        FROM t_p4831367_esport_gta_disaster.tournament_registrations
        WHERE id = {int(registration_id)}
    """)
    reg_info = cur.fetchone()
    
    if reg_info:
        team_id = reg_info['team_id']
        tournament_id = reg_info['tournament_id']
        
        # Обновляем статус
        cur.execute(f"""
            UPDATE t_p4831367_esport_gta_disaster.tournament_registrations
            SET status = 'rejected'
            WHERE id = {int(registration_id)}
        """)
        
        # Отправляем уведомления игрокам команды
        try:
            notify_tournament_registration(cur, conn, tournament_id, team_id, 'rejected')
        except Exception as e:
            print(f"Warning: Failed to send notifications: {str(e)}")
    
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'message': 'Регистрация отклонена'}),
        'isBase64Encoded': False
    }

def get_moderation_logs(cur, conn):
    """Получение всех логов модерации"""
    cur.execute("""
        SELECT al.id, al.action_type, al.target_user_id, u.username as target_username,
               al.admin_id, a.username as admin_username, al.reason, al.created_at
        FROM admin_action_logs al
        LEFT JOIN t_p4831367_esport_gta_disaster.users u ON al.target_user_id = u.id
        LEFT JOIN t_p4831367_esport_gta_disaster.users a ON al.admin_id = a.id
        ORDER BY al.created_at DESC
        LIMIT 100
    """)
    logs = cur.fetchall()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'logs': [{
                'id': log[0],
                'action_type': log[1],
                'target_user_id': log[2],
                'target_username': log[3],
                'admin_id': log[4],
                'admin_username': log[5],
                'reason': log[6],
                'created_at': log[7].isoformat() if log[7] else None
            } for log in logs]
        }),
        'isBase64Encoded': False
    }

def get_active_bans(cur, conn):
    """Получение активных банов"""
    cur.execute("""
        SELECT b.id, b.user_id, u.username, b.reason, b.expires_at, b.banned_by, a.username as admin_name, b.created_at
        FROM user_bans b
        LEFT JOIN t_p4831367_esport_gta_disaster.users u ON b.user_id = u.id
        LEFT JOIN t_p4831367_esport_gta_disaster.users a ON b.banned_by = a.id
        WHERE b.is_active = TRUE
        ORDER BY b.created_at DESC
    """)
    bans = cur.fetchall()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'bans': [{
                'id': ban[0],
                'user_id': ban[1],
                'username': ban[2],
                'reason': ban[3],
                'expires_at': ban[4].isoformat() if ban[4] else None,
                'banned_by': ban[5],
                'admin_name': ban[6],
                'created_at': ban[7].isoformat() if ban[7] else None
            } for ban in bans]
        }),
        'isBase64Encoded': False
    }

def get_active_mutes(cur, conn):
    """Получение активных мутов"""
    cur.execute("""
        SELECT m.id, m.user_id, u.username, m.reason, m.expires_at, m.muted_by, a.username as admin_name, m.created_at
        FROM user_mutes m
        LEFT JOIN t_p4831367_esport_gta_disaster.users u ON m.user_id = u.id
        LEFT JOIN t_p4831367_esport_gta_disaster.users a ON m.muted_by = a.id
        WHERE m.is_active = TRUE
        ORDER BY m.created_at DESC
    """)
    mutes = cur.fetchall()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'mutes': [{
                'id': mute[0],
                'user_id': mute[1],
                'username': mute[2],
                'reason': mute[3],
                'expires_at': mute[4].isoformat() if mute[4] else None,
                'muted_by': mute[5],
                'admin_name': mute[6],
                'created_at': mute[7].isoformat() if mute[7] else None
            } for mute in mutes]
        }),
        'isBase64Encoded': False
    }

def update_ban_status(cur, conn, admin_id: str, body: dict):
    """Обновление статуса бана"""
    ban_id = body.get('ban_id')
    is_active = body.get('is_active', False)
    
    cur.execute(f"UPDATE user_bans SET is_active = {str(is_active).upper()} WHERE id = {int(ban_id)}")
    conn.commit()
    
    cur.execute(f"INSERT INTO admin_action_logs (admin_id, action_type, reason) VALUES ('{escape_sql(admin_id)}', 'ban_status_updated', 'Ban ID {int(ban_id)} updated')")
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'message': 'Статус бана обновлен'}),
        'isBase64Encoded': False
    }

def update_mute_status(cur, conn, admin_id: str, body: dict):
    """Обновление статуса мута"""
    mute_id = body.get('mute_id')
    is_active = body.get('is_active', False)
    
    cur.execute(f"UPDATE user_mutes SET is_active = {str(is_active).upper()} WHERE id = {int(mute_id)}")
    conn.commit()
    
    cur.execute(f"INSERT INTO admin_action_logs (admin_id, action_type, reason) VALUES ('{escape_sql(admin_id)}', 'mute_status_updated', 'Mute ID {int(mute_id)} updated')")
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'message': 'Статус мута обновлен'}),
        'isBase64Encoded': False
    }

def get_settings(cur, conn):
    """Получение всех настроек сайта"""
    cur.execute("""
        SELECT key, value, description, updated_at
        FROM site_settings
        ORDER BY key
    """)
    settings = cur.fetchall()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'settings': [{
                'key': s[0],
                'value': s[1],
                'description': s[2],
                'updated_at': s[3].isoformat() if s[3] else None
            } for s in settings]
        }),
        'isBase64Encoded': False
    }

def update_setting(cur, conn, admin_id: str, body: dict, admin_role: str):
    """Обновление настройки сайта"""
    if admin_role not in ['founder', 'organizer']:
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Только основатель или организатор может изменять настройки'}),
            'isBase64Encoded': False
        }
    
    key = escape_sql(body.get('key', ''))
    value = escape_sql(body.get('value', ''))
    
    cur.execute(f"""
        UPDATE site_settings 
        SET value = '{value}', updated_at = CURRENT_TIMESTAMP, updated_by = '{escape_sql(admin_id)}'
        WHERE key = '{key}'
    """)
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'message': 'Настройка обновлена'}),
        'isBase64Encoded': False
    }

def notify_match_start(cur, conn, admin_id: str, body: dict) -> dict:
    """Отправляет уведомления всем игрокам команд о начале матча"""
    match_id = body.get('match_id')
    tournament_id = body.get('tournament_id')
    
    if not match_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'match_id обязателен'}),
            'isBase64Encoded': False
        }
    
    try:
        # Получаем информацию о матче
        cur.execute(f"""
            SELECT bm.id, bm.team1_id, bm.team2_id, bm.scheduled_at,
                   t1.name as team1_name, t2.name as team2_name,
                   tr.name as tournament_name, tb.tournament_id
            FROM t_p4831367_esport_gta_disaster.bracket_matches bm
            LEFT JOIN t_p4831367_esport_gta_disaster.teams t1 ON bm.team1_id = t1.id
            LEFT JOIN t_p4831367_esport_gta_disaster.teams t2 ON bm.team2_id = t2.id
            LEFT JOIN t_p4831367_esport_gta_disaster.tournament_brackets tb ON bm.bracket_id = tb.id
            LEFT JOIN t_p4831367_esport_gta_disaster.tournaments tr ON tb.tournament_id = tr.id
            WHERE bm.id = {match_id}
        """)
        
        match_data = cur.fetchone()
        
        if not match_data:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Матч не найден'}),
                'isBase64Encoded': False
            }
        
        team1_id = match_data['team1_id']
        team2_id = match_data['team2_id']
        team1_name = match_data['team1_name']
        team2_name = match_data['team2_name']
        tournament_name = match_data['tournament_name']
        tournament_id_from_match = match_data['tournament_id']
        
        notifications = []
        
        # Получаем всех игроков команды 1
        if team1_id:
            cur.execute(f"""
                SELECT user_id FROM t_p4831367_esport_gta_disaster.team_members
                WHERE team_id = {team1_id} AND status = 'active'
            """)
            team1_members = [row['user_id'] for row in cur.fetchall()]
            
            # Создаем уведомления для каждого игрока команды 1
            for user_id in team1_members:
                cur.execute(f"""
                    INSERT INTO t_p4831367_esport_gta_disaster.notifications 
                    (user_id, type, title, message, link, read, created_at)
                    VALUES (
                        {user_id},
                        'match_start',
                        'Матч скоро начнется!',
                        'Ваша команда "{escape_sql(team1_name)}" играет против "{escape_sql(team2_name)}" в турнире "{escape_sql(tournament_name)}"',
                        '/tournaments/{tournament_id_from_match}/bracket',
                        false,
                        NOW()
                    )
                """)
                notifications.append(user_id)
        
        # Получаем всех игроков команды 2
        if team2_id:
            cur.execute(f"""
                SELECT user_id FROM t_p4831367_esport_gta_disaster.team_members
                WHERE team_id = {team2_id} AND status = 'active'
            """)
            team2_members = [row['user_id'] for row in cur.fetchall()]
            
            # Создаем уведомления для каждого игрока команды 2
            for user_id in team2_members:
                cur.execute(f"""
                    INSERT INTO t_p4831367_esport_gta_disaster.notifications 
                    (user_id, type, title, message, link, read, created_at)
                    VALUES (
                        {user_id},
                        'match_start',
                        'Матч скоро начнется!',
                        'Ваша команда "{escape_sql(team2_name)}" играет против "{escape_sql(team1_name)}" в турнире "{escape_sql(tournament_name)}"',
                        '/tournaments/{tournament_id_from_match}/bracket',
                        false,
                        NOW()
                    )
                """)
                notifications.append(user_id)
        
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'message': f'Уведомления отправлены {len(notifications)} игрокам',
                'notified_users': notifications
            }),
            'isBase64Encoded': False
        }
    except Exception as e:
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка отправки уведомлений: {str(e)}'}),
            'isBase64Encoded': False
        }


def get_group_stage(cur, conn, body: dict) -> dict:
    """Получает данные групповой стадии турнира"""
    tournament_id = body.get('tournament_id')
    
    if not tournament_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'tournament_id обязателен'}),
            'isBase64Encoded': False
        }
    
    try:
        # Получаем все команды турнира
        cur.execute(f"""
            SELECT tr.team_id, t.name, t.logo_url
            FROM t_p4831367_esport_gta_disaster.tournament_registrations tr
            JOIN t_p4831367_esport_gta_disaster.teams t ON tr.team_id = t.id
            WHERE tr.tournament_id = {tournament_id} 
            AND (tr.status = 'approved' OR tr.status = 'confirmed')
            ORDER BY tr.registered_at
        """)
        teams = [dict(row) for row in cur.fetchall()]
        
        # Получаем матчи групповой стадии
        cur.execute(f"""
            SELECT id, group_name, team1_id, team2_id, team1_score, team2_score, played
            FROM t_p4831367_esport_gta_disaster.group_stage_matches
            WHERE tournament_id = {tournament_id}
            ORDER BY group_name, id
        """)
        matches = [dict(row) for row in cur.fetchall()]
        
        # Вычисляем турнирную таблицу для каждой группы
        standings = {}
        groups = ['A', 'B', 'C', 'D']
        
        for group in groups:
            group_matches = [m for m in matches if m['group_name'] == group]
            team_stats = {}
            
            # Инициализируем статистику для всех команд группы
            for match in group_matches:
                for team_id in [match['team1_id'], match['team2_id']]:
                    if team_id not in team_stats:
                        team_name = next((t['name'] for t in teams if t['team_id'] == team_id), 'Unknown')
                        team_stats[team_id] = {
                            'team_id': team_id,
                            'team_name': team_name,
                            'matches_played': 0,
                            'wins': 0,
                            'draws': 0,
                            'losses': 0,
                            'goals_for': 0,
                            'goals_against': 0,
                            'goal_difference': 0,
                            'points': 0
                        }
            
            # Обрабатываем сыгранные матчи
            for match in group_matches:
                if match['played']:
                    team1_id = match['team1_id']
                    team2_id = match['team2_id']
                    score1 = match['team1_score']
                    score2 = match['team2_score']
                    
                    # Обновляем статистику
                    team_stats[team1_id]['matches_played'] += 1
                    team_stats[team2_id]['matches_played'] += 1
                    
                    team_stats[team1_id]['goals_for'] += score1
                    team_stats[team1_id]['goals_against'] += score2
                    team_stats[team2_id]['goals_for'] += score2
                    team_stats[team2_id]['goals_against'] += score1
                    
                    if score1 > score2:
                        team_stats[team1_id]['wins'] += 1
                        team_stats[team1_id]['points'] += 3
                        team_stats[team2_id]['losses'] += 1
                    elif score2 > score1:
                        team_stats[team2_id]['wins'] += 1
                        team_stats[team2_id]['points'] += 3
                        team_stats[team1_id]['losses'] += 1
                    else:
                        team_stats[team1_id]['draws'] += 1
                        team_stats[team2_id]['draws'] += 1
                        team_stats[team1_id]['points'] += 1
                        team_stats[team2_id]['points'] += 1
            
            # Вычисляем разницу мячей и сортируем
            for stats in team_stats.values():
                stats['goal_difference'] = stats['goals_for'] - stats['goals_against']
            
            standings[group] = sorted(
                team_stats.values(),
                key=lambda x: (x['points'], x['goal_difference'], x['goals_for']),
                reverse=True
            )
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'teams': teams,
                'matches': matches,
                'standings': standings
            }),
            'isBase64Encoded': False
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка получения групповой стадии: {str(e)}'}),
            'isBase64Encoded': False
        }


def create_group_stage(cur, conn, admin_id: str, body: dict) -> dict:
    """Создает групповую стадию для турнира"""
    tournament_id = body.get('tournament_id')
    
    if not tournament_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'tournament_id обязателен'}),
            'isBase64Encoded': False
        }
    
    try:
        # Получаем команды
        cur.execute(f"""
            SELECT tr.team_id, t.name
            FROM t_p4831367_esport_gta_disaster.tournament_registrations tr
            JOIN t_p4831367_esport_gta_disaster.teams t ON tr.team_id = t.id
            WHERE tr.tournament_id = {tournament_id} 
            AND (tr.status = 'approved' OR tr.status = 'confirmed')
            ORDER BY RANDOM()
        """)
        teams = cur.fetchall()
        
        if len(teams) < 16:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': f'Недостаточно команд для групповой стадии. Нужно минимум 16, есть {len(teams)}'}),
                'isBase64Encoded': False
            }
        
        # Удаляем старые матчи групповой стадии если есть
        cur.execute(f"""
            DELETE FROM t_p4831367_esport_gta_disaster.group_stage_matches
            WHERE tournament_id = {tournament_id}
        """)
        
        # Разбиваем команды на 4 группы по 4 команды
        groups = {'A': [], 'B': [], 'C': [], 'D': []}
        group_names = ['A', 'B', 'C', 'D']
        
        for i, team in enumerate(teams[:16]):
            group_name = group_names[i % 4]
            groups[group_name].append(team['team_id'])
        
        # Создаем матчи для каждой группы (каждый с каждым)
        for group_name, team_ids in groups.items():
            for i in range(len(team_ids)):
                for j in range(i + 1, len(team_ids)):
                    cur.execute(f"""
                        INSERT INTO t_p4831367_esport_gta_disaster.group_stage_matches
                        (tournament_id, group_name, team1_id, team2_id, team1_score, team2_score, played, created_at)
                        VALUES ({tournament_id}, '{group_name}', {team_ids[i]}, {team_ids[j]}, 0, 0, false, NOW())
                    """)
        
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'message': 'Групповая стадия создана',
                'groups': {name: len(team_ids) for name, team_ids in groups.items()}
            }),
            'isBase64Encoded': False
        }
    except Exception as e:
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка создания групповой стадии: {str(e)}'}),
            'isBase64Encoded': False
        }


def update_group_match(cur, conn, admin_id: str, body: dict) -> dict:
    """Обновляет результат матча групповой стадии"""
    tournament_id = body.get('tournament_id')
    match_id = body.get('match_id')
    team1_score = body.get('team1_score', 0)
    team2_score = body.get('team2_score', 0)
    played = body.get('played', False)
    
    if not tournament_id or not match_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'tournament_id и match_id обязательны'}),
            'isBase64Encoded': False
        }
    
    try:
        cur.execute(f"""
            UPDATE t_p4831367_esport_gta_disaster.group_stage_matches
            SET team1_score = {team1_score}, team2_score = {team2_score}, played = {played}, updated_at = NOW()
            WHERE id = {match_id} AND tournament_id = {tournament_id}
        """)
        
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'message': 'Результат матча обновлен'
            }),
            'isBase64Encoded': False
        }
    except Exception as e:
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка обновления матча: {str(e)}'}),
            'isBase64Encoded': False
        }


def finalize_group_stage(cur, conn, admin_id: str, body: dict) -> dict:
    """Завершает групповую стадию и переводит топ-2 команды в плей-офф"""
    tournament_id = body.get('tournament_id')
    
    if not tournament_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'tournament_id обязателен'}),
            'isBase64Encoded': False
        }
    
    try:
        # Получаем все матчи групповой стадии
        cur.execute(f"""
            SELECT id, group_name, team1_id, team2_id, team1_score, team2_score, played
            FROM t_p4831367_esport_gta_disaster.group_stage_matches
            WHERE tournament_id = {tournament_id}
            ORDER BY group_name, id
        """)
        matches = [dict(row) for row in cur.fetchall()]
        
        # Получаем команды
        cur.execute(f"""
            SELECT tr.team_id, t.name
            FROM t_p4831367_esport_gta_disaster.tournament_registrations tr
            JOIN t_p4831367_esport_gta_disaster.teams t ON tr.team_id = t.id
            WHERE tr.tournament_id = {tournament_id} 
            AND (tr.status = 'approved' OR tr.status = 'confirmed')
        """)
        teams = {row['team_id']: row['name'] for row in cur.fetchall()}
        
        # Вычисляем таблицу для каждой группы
        groups = ['A', 'B', 'C', 'D']
        qualified_teams = []
        
        for group in groups:
            group_matches = [m for m in matches if m['group_name'] == group]
            team_stats = {}
            
            # Инициализируем статистику
            for match in group_matches:
                for team_id in [match['team1_id'], match['team2_id']]:
                    if team_id not in team_stats:
                        team_stats[team_id] = {
                            'team_id': team_id,
                            'points': 0,
                            'goal_difference': 0,
                            'goals_for': 0
                        }
            
            # Считаем статистику
            for match in group_matches:
                if match['played']:
                    team1_id = match['team1_id']
                    team2_id = match['team2_id']
                    score1 = match['team1_score']
                    score2 = match['team2_score']
                    
                    team_stats[team1_id]['goals_for'] += score1
                    team_stats[team1_id]['goal_difference'] += (score1 - score2)
                    team_stats[team2_id]['goals_for'] += score2
                    team_stats[team2_id]['goal_difference'] += (score2 - score1)
                    
                    if score1 > score2:
                        team_stats[team1_id]['points'] += 3
                    elif score2 > score1:
                        team_stats[team2_id]['points'] += 3
                    else:
                        team_stats[team1_id]['points'] += 1
                        team_stats[team2_id]['points'] += 1
            
            # Сортируем и берем топ-2
            sorted_teams = sorted(
                team_stats.values(),
                key=lambda x: (x['points'], x['goal_difference'], x['goals_for']),
                reverse=True
            )
            
            qualified_teams.extend([t['team_id'] for t in sorted_teams[:2]])
        
        if len(qualified_teams) != 8:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': f'Недостаточно данных для формирования плей-офф. Получено {len(qualified_teams)} команд, нужно 8'}),
                'isBase64Encoded': False
            }
        
        # Проверяем наличие bracket
        cur.execute(f"""
            SELECT id FROM t_p4831367_esport_gta_disaster.tournament_brackets
            WHERE tournament_id = {tournament_id}
        """)
        bracket = cur.fetchone()
        
        if not bracket:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Сначала создайте турнирную сетку'}),
                'isBase64Encoded': False
            }
        
        bracket_id = bracket['id']
        
        # Удаляем старые матчи плей-офф
        cur.execute(f"""
            DELETE FROM t_p4831367_esport_gta_disaster.bracket_matches
            WHERE bracket_id = {bracket_id}
        """)
        
        # Создаем матчи 1/4 финала (8 команд -> 4 матча)
        # Сетка: A1-B2, C1-D2, B1-A2, D1-C2
        pairs = [
            (qualified_teams[0], qualified_teams[3]),  # A1 vs B2
            (qualified_teams[4], qualified_teams[7]),  # C1 vs D2
            (qualified_teams[2], qualified_teams[1]),  # B1 vs A2
            (qualified_teams[6], qualified_teams[5])   # D1 vs C2
        ]
        
        for i, (team1_id, team2_id) in enumerate(pairs, 1):
            cur.execute(f"""
                INSERT INTO t_p4831367_esport_gta_disaster.bracket_matches
                (bracket_id, round, match_number, team1_id, team2_id, status, created_at, updated_at)
                VALUES ({bracket_id}, 1, {i}, {team1_id}, {team2_id}, 'pending', NOW(), NOW())
            """)
        
        # Создаем пустые матчи для 1/2 финала (2 матча)
        for i in range(1, 3):
            cur.execute(f"""
                INSERT INTO t_p4831367_esport_gta_disaster.bracket_matches
                (bracket_id, round, match_number, status, created_at, updated_at)
                VALUES ({bracket_id}, 2, {i}, 'pending', NOW(), NOW())
            """)
        
        # Создаем финал (1 матч)
        cur.execute(f"""
            INSERT INTO t_p4831367_esport_gta_disaster.bracket_matches
            (bracket_id, round, match_number, status, created_at, updated_at)
            VALUES ({bracket_id}, 3, 1, 'pending', NOW(), NOW())
        """)
        
        conn.commit()
        
        qualified_names = [teams.get(tid, 'Unknown') for tid in qualified_teams]
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'message': 'Групповая стадия завершена, команды переведены в плей-офф',
                'qualified_teams': qualified_names
            }),
            'isBase64Encoded': False
        }
    except Exception as e:
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка завершения групповой стадии: {str(e)}'}),
            'isBase64Encoded': False
        }


def get_notifications(cur, conn, body: dict) -> dict:
    """Получает список уведомлений пользователя"""
    user_id = body.get('user_id')
    limit = body.get('limit', 50)
    
    if not user_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'user_id обязателен'}),
            'isBase64Encoded': False
        }
    
    try:
        cur.execute(f"""
            SELECT id, user_id, type, title, message, link, read, created_at
            FROM t_p4831367_esport_gta_disaster.notifications
            WHERE user_id = {user_id}
            ORDER BY created_at DESC
            LIMIT {limit}
        """)
        notifications = [dict(row) for row in cur.fetchall()]
        
        # Подсчитываем непрочитанные
        cur.execute(f"""
            SELECT COUNT(*) as count
            FROM t_p4831367_esport_gta_disaster.notifications
            WHERE user_id = {user_id} AND read = false
        """)
        unread_count = cur.fetchone()['count']
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'notifications': notifications,
                'unread_count': unread_count
            }),
            'isBase64Encoded': False
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка получения уведомлений: {str(e)}'}),
            'isBase64Encoded': False
        }


def mark_notification_read(cur, conn, body: dict) -> dict:
    """Отмечает уведомление как прочитанное"""
    notification_id = body.get('notification_id')
    
    if not notification_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'notification_id обязателен'}),
            'isBase64Encoded': False
        }
    
    try:
        cur.execute(f"""
            UPDATE t_p4831367_esport_gta_disaster.notifications
            SET read = true
            WHERE id = {notification_id}
        """)
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True, 'message': 'Уведомление прочитано'}),
            'isBase64Encoded': False
        }
    except Exception as e:
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка обновления уведомления: {str(e)}'}),
            'isBase64Encoded': False
        }


def mark_all_notifications_read(cur, conn, body: dict) -> dict:
    """Отмечает все уведомления пользователя как прочитанные"""
    user_id = body.get('user_id')
    
    if not user_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'user_id обязателен'}),
            'isBase64Encoded': False
        }
    
    try:
        cur.execute(f"""
            UPDATE t_p4831367_esport_gta_disaster.notifications
            SET read = true
            WHERE user_id = {user_id} AND read = false
        """)
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True, 'message': 'Все уведомления прочитаны'}),
            'isBase64Encoded': False
        }
    except Exception as e:
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка обновления уведомлений: {str(e)}'}),
            'isBase64Encoded': False
        }


def notify_tournament_result(cur, conn, tournament_id: int, winner_team_id: int) -> dict:
    """Отправляет уведомления всем участникам турнира о результатах"""
    try:
        # Получаем информацию о турнире и победителе
        cur.execute(f"""
            SELECT t.name as tournament_name, team.name as winner_name
            FROM t_p4831367_esport_gta_disaster.tournaments t
            LEFT JOIN t_p4831367_esport_gta_disaster.teams team ON team.id = {winner_team_id}
            WHERE t.id = {tournament_id}
        """)
        info = cur.fetchone()
        
        if not info:
            return {'success': False, 'error': 'Турнир не найден'}
        
        tournament_name = info['tournament_name']
        winner_name = info['winner_name']
        
        # Получаем всех участников турнира (все команды)
        cur.execute(f"""
            SELECT DISTINCT tm.user_id
            FROM t_p4831367_esport_gta_disaster.tournament_registrations tr
            JOIN t_p4831367_esport_gta_disaster.team_members tm ON tr.team_id = tm.team_id
            WHERE tr.tournament_id = {tournament_id} AND tm.status = 'active'
        """)
        participants = [row['user_id'] for row in cur.fetchall()]
        
        # Отправляем уведомления
        for user_id in participants:
            cur.execute(f"""
                INSERT INTO t_p4831367_esport_gta_disaster.notifications 
                (user_id, type, title, message, link, read, created_at)
                VALUES (
                    {user_id},
                    'tournament_result',
                    'Турнир завершен!',
                    'Турнир "{escape_sql(tournament_name)}" завершен. Победитель: {escape_sql(winner_name)}',
                    '/tournaments/{tournament_id}',
                    false,
                    NOW()
                )
            """)
        
        conn.commit()
        return {'success': True, 'notified': len(participants)}
    except Exception as e:
        conn.rollback()
        return {'success': False, 'error': str(e)}


def notify_team_invitation(cur, conn, user_id: int, team_id: int, inviter_name: str) -> dict:
    """Отправляет уведомление о приглашении в команду"""
    try:
        # Получаем название команды
        cur.execute(f"""
            SELECT name FROM t_p4831367_esport_gta_disaster.teams
            WHERE id = {team_id}
        """)
        team = cur.fetchone()
        
        if not team:
            return {'success': False, 'error': 'Команда не найдена'}
        
        team_name = team['name']
        
        cur.execute(f"""
            INSERT INTO t_p4831367_esport_gta_disaster.notifications 
            (user_id, type, title, message, link, read, created_at)
            VALUES (
                {user_id},
                'team_invitation',
                'Приглашение в команду',
                '{escape_sql(inviter_name)} приглашает вас в команду "{escape_sql(team_name)}"',
                '/teams/{team_id}',
                false,
                NOW()
            )
        """)
        
        conn.commit()
        return {'success': True}
    except Exception as e:
        conn.rollback()
        return {'success': False, 'error': str(e)}


def notify_tournament_registration(cur, conn, tournament_id: int, team_id: int, status: str) -> dict:
    """Отправляет уведомление о статусе регистрации команды на турнир"""
    try:
        # Получаем информацию о турнире и команде
        cur.execute(f"""
            SELECT t.name as tournament_name, team.name as team_name
            FROM t_p4831367_esport_gta_disaster.tournaments t
            CROSS JOIN t_p4831367_esport_gta_disaster.teams team
            WHERE t.id = {tournament_id} AND team.id = {team_id}
        """)
        info = cur.fetchone()
        
        if not info:
            return {'success': False, 'error': 'Турнир или команда не найдены'}
        
        tournament_name = info['tournament_name']
        team_name = info['team_name']
        
        # Получаем всех игроков команды
        cur.execute(f"""
            SELECT user_id FROM t_p4831367_esport_gta_disaster.team_members
            WHERE team_id = {team_id} AND status = 'active'
        """)
        members = [row['user_id'] for row in cur.fetchall()]
        
        # Определяем сообщение в зависимости от статуса
        if status == 'approved':
            title = 'Регистрация одобрена!'
            message = f'Ваша команда "{escape_sql(team_name)}" одобрена для участия в турнире "{escape_sql(tournament_name)}"'
        elif status == 'rejected':
            title = 'Регистрация отклонена'
            message = f'Регистрация команды "{escape_sql(team_name)}" на турнир "{escape_sql(tournament_name)}" отклонена'
        else:
            title = 'Статус регистрации изменен'
            message = f'Статус регистрации команды "{escape_sql(team_name)}" на турнир "{escape_sql(tournament_name)}": {status}'
        
        # Отправляем уведомления всем игрокам
        for user_id in members:
            cur.execute(f"""
                INSERT INTO t_p4831367_esport_gta_disaster.notifications 
                (user_id, type, title, message, link, read, created_at)
                VALUES (
                    {user_id},
                    'tournament_update',
                    '{escape_sql(title)}',
                    '{escape_sql(message)}',
                    '/tournaments/{tournament_id}',
                    false,
                    NOW()
                )
            """)
        
        conn.commit()
        return {'success': True, 'notified': len(members)}
    except Exception as e:
        conn.rollback()
        return {'success': False, 'error': str(e)}

def get_all_users(cur, conn) -> dict:
    """Получить всех пользователей для выбора в админке"""
    try:
        cur.execute("""
            SELECT 
                id,
                nickname,
                email,
                role,
                created_at
            FROM t_p4831367_esport_gta_disaster.users
            ORDER BY created_at DESC
        """)
        users = [dict(row) for row in cur.fetchall()]
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'users': users}, default=str),
            'isBase64Encoded': False
        }
    except Exception as e:
        import sys, traceback
        error_msg = traceback.format_exc()
        print(f"ERROR in get_all_users: {error_msg}", file=sys.stderr, flush=True)
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e), 'traceback': error_msg}),
            'isBase64Encoded': False
        }

def get_active_matches(cur, conn, body: dict) -> dict:
    """Получить активные матчи для отображения на главной панели"""
    try:
        limit = body.get('limit', 10)
        
        cur.execute(f"""
            SELECT 
                bm.id,
                t.name as tournament_name,
                bm.round,
                bm.match_number,
                t1.name as team1_name,
                t2.name as team2_name,
                bm.team1_score,
                bm.team2_score,
                bm.status,
                bm.scheduled_at
            FROM t_p4831367_esport_gta_disaster.bracket_matches bm
            JOIN t_p4831367_esport_gta_disaster.tournament_brackets tb ON bm.bracket_id = tb.id
            JOIN t_p4831367_esport_gta_disaster.tournaments t ON tb.tournament_id = t.id
            LEFT JOIN t_p4831367_esport_gta_disaster.teams t1 ON bm.team1_id = t1.id
            LEFT JOIN t_p4831367_esport_gta_disaster.teams t2 ON bm.team2_id = t2.id
            WHERE bm.status IN ('pending', 'in_progress')
            AND (t.removed = 0 OR t.removed IS NULL)
            ORDER BY bm.scheduled_at ASC NULLS LAST, bm.id DESC
            LIMIT {limit}
        """)
        
        matches = [dict(row) for row in cur.fetchall()]
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'matches': matches}, default=str),
            'isBase64Encoded': False
        }
    except Exception as e:
        import sys, traceback
        error_msg = traceback.format_exc()
        print(f"ERROR in get_active_matches: {error_msg}", file=sys.stderr, flush=True)
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e), 'traceback': error_msg}),
            'isBase64Encoded': False
        }

def get_admin_logs(cur, conn, body: dict) -> dict:
    """Получить последние действия администраторов и судей"""
    try:
        limit = body.get('limit', 20)
        
        # Пробуем получить логи из admin_action_logs
        cur.execute(f"""
            SELECT 
                al.id,
                u.nickname as admin_name,
                u.role as admin_role,
                al.action_description as action,
                al.created_at as timestamp,
                al.action_type,
                al.target_type
            FROM t_p4831367_esport_gta_disaster.admin_action_logs al
            JOIN t_p4831367_esport_gta_disaster.users u ON al.admin_id = u.id
            WHERE u.role IN ('admin', 'founder', 'organizer', 'referee')
            ORDER BY al.created_at DESC
            LIMIT {limit}
        """)
        
        logs_from_table = [dict(row) for row in cur.fetchall()]
        
        # Если таблица пустая, получаем логи из истории ролей как fallback
        if not logs_from_table:
            cur.execute(f"""
                SELECT 
                    rh.id,
                    u_admin.nickname as admin_name,
                    u_admin.role as admin_role,
                    CASE 
                        WHEN rh.action = 'assigned' THEN 'Назначил роль ' || rh.role
                        WHEN rh.action = 'revoked' THEN 'Снял роль с пользователя'
                        ELSE rh.action
                    END as action,
                    rh.created_at as timestamp
                FROM t_p4831367_esport_gta_disaster.role_history rh
                JOIN t_p4831367_esport_gta_disaster.users u_admin ON rh.assigned_by = u_admin.id
                WHERE u_admin.role IN ('admin', 'founder', 'organizer', 'referee')
                ORDER BY rh.created_at DESC
                LIMIT {limit}
            """)
            logs = [dict(row) for row in cur.fetchall()]
        else:
            logs = logs_from_table
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'logs': logs}, default=str),
            'isBase64Encoded': False
        }
    except Exception as e:
        import sys, traceback
        error_msg = traceback.format_exc()
        print(f"ERROR in get_admin_logs: {error_msg}", file=sys.stderr, flush=True)
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e), 'traceback': error_msg}),
            'isBase64Encoded': False
        }