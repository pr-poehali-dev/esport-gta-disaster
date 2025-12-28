import json
import os
import psycopg2
import random
import string
from datetime import datetime, timedelta
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def handler(event: dict, context) -> dict:
    """API для административных действий: бан, мут, отстранение от турниров"""
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Id'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    admin_id = event.get('headers', {}).get('X-Admin-Id') or event.get('headers', {}).get('x-admin-id')
    
    if not admin_id:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Требуется авторизация администратора'}),
            'isBase64Encoded': False
        }
    
    try:
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        
        cur.execute("SELECT role FROM users WHERE id = %s", (admin_id,))
        admin_role = cur.fetchone()
        
        if not admin_role or admin_role[0] not in ['admin', 'founder', 'organizer']:
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
            elif action == 'get_tournaments':
                return get_tournaments(cur, conn)
            elif action == 'get_tournament':
                return get_tournament(cur, conn, body)
            elif action == 'register_team':
                return register_team(cur, conn, body)
            elif action == 'update_tournament_status':
                return update_tournament_status(cur, conn, admin_id, body)
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
                return create_news(cur, conn, admin_id, body, admin_role[0])
            elif action == 'update_news':
                return update_news(cur, conn, admin_id, body, admin_role[0])
            elif action == 'delete_news':
                return delete_news(cur, conn, admin_id, body, admin_role[0])
            elif action == 'get_news':
                return get_news(cur, conn, body)
            elif action == 'create_rule':
                return create_rule(cur, conn, admin_id, body, admin_role[0])
            elif action == 'update_rule':
                return update_rule(cur, conn, admin_id, body, admin_role[0])
            elif action == 'delete_rule':
                return delete_rule(cur, conn, admin_id, body, admin_role[0])
            elif action == 'get_rules':
                return get_rules(cur, conn)
            elif action == 'update_support':
                return update_support(cur, conn, admin_id, body, admin_role[0])
            elif action == 'get_support':
                return get_support(cur, conn)
            elif action == 'get_all_users':
                return get_all_users(cur, conn)
            elif action == 'get_dashboard_stats':
                return get_dashboard_stats(cur, conn)
            elif action == 'assign_role':
                return assign_role(cur, conn, admin_id, admin_role[0], body)
            elif action == 'revoke_role':
                return revoke_role(cur, conn, admin_id, admin_role[0], body)
            elif action == 'get_staff':
                return get_staff(cur, conn)
            elif action == 'get_role_history':
                return get_role_history(cur, conn, body)
            elif action == 'create_discussion':
                return create_discussion(cur, conn, admin_id, admin_role[0], body)
            elif action == 'add_comment':
                return add_comment(cur, conn, admin_id, admin_role[0], body)
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
            else:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Неизвестное действие'}),
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
    
    cur.execute("""
        INSERT INTO admin_verification_codes (admin_id, code, action_type, action_data, expires_at)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING id
    """, (admin_id, code, action_type, action_data, expires_at))
    
    code_id = cur.fetchone()[0]
    conn.commit()
    
    cur.execute("SELECT email FROM users WHERE id = %s", (admin_id,))
    admin_email = cur.fetchone()[0]
    
    try:
        send_email(admin_email, code, action_type)
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
        'body': json.dumps({'success': True, 'code_id': code_id, 'message': f'Код отправлен на {admin_email}'}),
        'isBase64Encoded': False
    }

def send_email(to_email: str, code: str, action_type: str):
    """Отправляет email с кодом подтверждения"""
    
    smtp_email = os.environ.get('SMTP_EMAIL')
    smtp_password = os.environ.get('SMTP_PASSWORD')
    
    if not smtp_email or not smtp_password:
        raise Exception('SMTP настройки не заданы')
    
    action_names = {
        'ban': 'Бан пользователя',
        'mute': 'Мут пользователя',
        'suspend': 'Отстранение от турнира'
    }
    
    action_name = action_names.get(action_type, 'Административное действие')
    
    msg = MIMEMultipart()
    msg['From'] = smtp_email
    msg['To'] = to_email
    msg['Subject'] = f'Disaster Esports - Код подтверждения действия'
    
    body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #0D94E7;">Подтверждение административного действия</h2>
        <p><strong>Действие:</strong> {action_name}</p>
        <p>Для подтверждения действия введите код:</p>
        <h1 style="color: #A855F7; letter-spacing: 5px; font-size: 36px;">{code}</h1>
        <p style="color: #666;">Код действителен 10 минут</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #999;">Disaster Esports Admin Panel</p>
    </body>
    </html>
    """
    
    msg.attach(MIMEText(body, 'html'))
    
    if '@gmail.com' in smtp_email:
        smtp_server = 'smtp.gmail.com'
        smtp_port = 587
    elif '@yandex.ru' in smtp_email or '@yandex.com' in smtp_email:
        smtp_server = 'smtp.yandex.ru'
        smtp_port = 587
    else:
        smtp_server = 'smtp.gmail.com'
        smtp_port = 587
    
    server = smtplib.SMTP(smtp_server, smtp_port)
    server.starttls()
    server.login(smtp_email, smtp_password)
    server.send_message(msg)
    server.quit()

def send_user_notification(to_email: str, subject: str, html_body: str):
    """Отправляет email уведомление пользователю"""
    
    smtp_email = os.environ.get('SMTP_EMAIL')
    smtp_password = os.environ.get('SMTP_PASSWORD')
    
    if not smtp_email or not smtp_password:
        raise Exception('SMTP настройки не заданы')
    
    msg = MIMEMultipart()
    msg['From'] = smtp_email
    msg['To'] = to_email
    msg['Subject'] = subject
    
    msg.attach(MIMEText(html_body, 'html'))
    
    if '@gmail.com' in smtp_email:
        smtp_server = 'smtp.gmail.com'
        smtp_port = 587
    elif '@yandex.ru' in smtp_email or '@yandex.com' in smtp_email:
        smtp_server = 'smtp.yandex.ru'
        smtp_port = 587
    else:
        smtp_server = 'smtp.gmail.com'
        smtp_port = 587
    
    server = smtplib.SMTP(smtp_server, smtp_port)
    server.starttls()
    server.login(smtp_email, smtp_password)
    server.send_message(msg)
    server.quit()

def verify_and_execute(cur, conn, admin_id: str, body: dict) -> dict:
    """Проверяет код и выполняет административное действие"""
    
    code = body.get('code')
    
    cur.execute("""
        SELECT id, action_type, action_data, expires_at, is_used
        FROM admin_verification_codes
        WHERE admin_id = %s AND code = %s
        ORDER BY created_at DESC
        LIMIT 1
    """, (admin_id, code))
    
    result = cur.fetchone()
    
    if not result:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Неверный код'}),
            'isBase64Encoded': False
        }
    
    code_id, action_type, action_data_str, expires_at, is_used = result
    
    if is_used:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Код уже использован'}),
            'isBase64Encoded': False
        }
    
    if datetime.now() > expires_at:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Код истек'}),
            'isBase64Encoded': False
        }
    
    action_data = json.loads(action_data_str)
    
    cur.execute("UPDATE admin_verification_codes SET is_used = TRUE WHERE id = %s", (code_id,))
    
    if action_type == 'ban':
        result = execute_ban(cur, conn, admin_id, action_data)
    elif action_type == 'mute':
        result = execute_mute(cur, conn, admin_id, action_data)
    elif action_type == 'suspend':
        result = execute_suspension(cur, conn, admin_id, action_data)
    else:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Неизвестный тип действия'}),
            'isBase64Encoded': False
        }
    
    conn.commit()
    
    return result

def execute_ban(cur, conn, admin_id: str, data: dict) -> dict:
    """Выполняет бан пользователя"""
    
    user_id = data.get('user_id')
    reason = data.get('reason')
    duration_days = data.get('duration_days')
    is_permanent = data.get('is_permanent', False)
    
    ban_end_date = None if is_permanent else datetime.now() + timedelta(days=int(duration_days))
    
    cur.execute("UPDATE users SET is_banned = TRUE WHERE id = %s", (user_id,))
    
    cur.execute("""
        INSERT INTO bans (user_id, admin_id, reason, ban_end_date, is_permanent)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (user_id) DO UPDATE
        SET admin_id = EXCLUDED.admin_id,
            reason = EXCLUDED.reason,
            ban_start_date = NOW(),
            ban_end_date = EXCLUDED.ban_end_date,
            is_permanent = EXCLUDED.is_permanent
    """, (user_id, admin_id, reason, ban_end_date, is_permanent))
    
    cur.execute("""
        INSERT INTO admin_actions_log (admin_id, action_type, target_user_id, details)
        VALUES (%s, 'ban', %s, %s)
    """, (admin_id, user_id, json.dumps(data)))
    
    cur.execute("SELECT email, nickname FROM users WHERE id = %s", (user_id,))
    user_data = cur.fetchone()
    
    if user_data:
        user_email, user_nickname = user_data
        duration_text = 'навсегда' if is_permanent else f'{duration_days} дней'
        
        try:
            send_user_notification(
                user_email,
                f'{user_nickname}, вы получили бан',
                f'''
                <html>
                <body style="font-family: Arial, sans-serif; color: #333;">
                    <h2 style="color: #DC2626;">Вы получили бан на сайте Disaster Esports</h2>
                    <p><strong>Причина:</strong> {reason}</p>
                    <p><strong>Длительность:</strong> {duration_text}</p>
                    <p>Если вы считаете это ошибкой, обратитесь в поддержку.</p>
                    <hr style="border: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #999;">Disaster Esports</p>
                </body>
                </html>
                '''
            )
            
            cur.execute("""
                INSERT INTO user_notifications (user_id, notification_type, subject, message, is_sent)
                VALUES (%s, 'ban', %s, %s, TRUE)
            """, (user_id, 'Бан аккаунта', f'Причина: {reason}, Длительность: {duration_text}'))
        except Exception as e:
            cur.execute("""
                INSERT INTO user_notifications (user_id, notification_type, subject, message, is_sent, error_message)
                VALUES (%s, 'ban', %s, %s, FALSE, %s)
            """, (user_id, 'Бан аккаунта', f'Причина: {reason}', str(e)))
    
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'message': 'Пользователь забанен, уведомление отправлено'}),
        'isBase64Encoded': False
    }

def execute_mute(cur, conn, admin_id: str, data: dict) -> dict:
    """Выполняет мут пользователя"""
    
    user_id = data.get('user_id')
    reason = data.get('reason')
    duration_days = data.get('duration_days')
    is_permanent = data.get('is_permanent', False)
    
    mute_end_date = None if is_permanent else datetime.now() + timedelta(days=int(duration_days))
    
    cur.execute("UPDATE users SET is_muted = TRUE WHERE id = %s", (user_id,))
    
    cur.execute("""
        INSERT INTO mutes (user_id, admin_id, reason, mute_end_date, is_permanent)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (user_id) DO UPDATE
        SET admin_id = EXCLUDED.admin_id,
            reason = EXCLUDED.reason,
            mute_start_date = NOW(),
            mute_end_date = EXCLUDED.mute_end_date,
            is_permanent = EXCLUDED.is_permanent
    """, (user_id, admin_id, reason, mute_end_date, is_permanent))
    
    cur.execute("""
        INSERT INTO admin_actions_log (admin_id, action_type, target_user_id, details)
        VALUES (%s, 'mute', %s, %s)
    """, (admin_id, user_id, json.dumps(data)))
    
    cur.execute("SELECT email, nickname FROM users WHERE id = %s", (user_id,))
    user_data = cur.fetchone()
    
    if user_data:
        user_email, user_nickname = user_data
        duration_text = 'навсегда' if is_permanent else f'{duration_days} дней'
        
        try:
            send_user_notification(
                user_email,
                f'{user_nickname}, вы получили мут',
                f'''
                <html>
                <body style="font-family: Arial, sans-serif; color: #333;">
                    <h2 style="color: #F97316;">Вы получили мут на сайте Disaster Esports</h2>
                    <p><strong>Причина:</strong> {reason}</p>
                    <p><strong>Длительность:</strong> {duration_text}</p>
                    <p>Вы не сможете отправлять сообщения в чате до окончания срока мута.</p>
                    <hr style="border: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #999;">Disaster Esports</p>
                </body>
                </html>
                '''
            )
            
            cur.execute("""
                INSERT INTO user_notifications (user_id, notification_type, subject, message, is_sent)
                VALUES (%s, 'mute', %s, %s, TRUE)
            """, (user_id, 'Мут аккаунта', f'Причина: {reason}, Длительность: {duration_text}'))
        except Exception as e:
            cur.execute("""
                INSERT INTO user_notifications (user_id, notification_type, subject, message, is_sent, error_message)
                VALUES (%s, 'mute', %s, %s, FALSE, %s)
            """, (user_id, 'Мут аккаунта', f'Причина: {reason}', str(e)))
    
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'message': 'Мут выдан, уведомление отправлено'}),
        'isBase64Encoded': False
    }

def execute_suspension(cur, conn, admin_id: str, data: dict) -> dict:
    """Выполняет отстранение от турнира"""
    
    user_id = data.get('user_id')
    tournament_id = data.get('tournament_id')
    reason = data.get('reason')
    
    cur.execute("""
        INSERT INTO tournament_exclusions (user_id, tournament_id, admin_id, reason)
        VALUES (%s, %s, %s, %s)
    """, (user_id, tournament_id, admin_id, reason))
    
    cur.execute("""
        INSERT INTO admin_actions_log (admin_id, action_type, target_user_id, details)
        VALUES (%s, 'suspend', %s, %s)
    """, (admin_id, user_id, json.dumps(data)))
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'message': 'Пользователь отстранен от турнира'}),
        'isBase64Encoded': False
    }

def get_bans(cur, conn) -> dict:
    """Получает список всех банов"""
    
    cur.execute("""
        SELECT 
            b.id,
            u.id as user_id,
            u.nickname,
            a.nickname as admin_name,
            b.reason,
            b.ban_start_date,
            b.ban_end_date,
            b.is_permanent
        FROM bans b
        JOIN users u ON b.user_id = u.id
        JOIN users a ON b.admin_id = a.id
        WHERE u.is_banned = TRUE
        ORDER BY b.created_at DESC
    """)
    
    bans = []
    for row in cur.fetchall():
        bans.append({
            'id': row[0],
            'user_id': row[1],
            'username': row[2],
            'admin_name': row[3],
            'reason': row[4],
            'ban_start_date': row[5].isoformat() if row[5] else None,
            'ban_end_date': row[6].isoformat() if row[6] else None,
            'is_permanent': row[7]
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
        SELECT 
            m.id,
            u.id as user_id,
            u.nickname,
            a.nickname as admin_name,
            m.reason,
            m.mute_start_date,
            m.mute_end_date,
            m.is_permanent
        FROM mutes m
        JOIN users u ON m.user_id = u.id
        JOIN users a ON m.admin_id = a.id
        WHERE u.is_muted = TRUE
        ORDER BY m.created_at DESC
    """)
    
    mutes = []
    for row in cur.fetchall():
        mutes.append({
            'id': row[0],
            'user_id': row[1],
            'username': row[2],
            'admin_name': row[3],
            'reason': row[4],
            'mute_start_date': row[5].isoformat() if row[5] else None,
            'mute_end_date': row[6].isoformat() if row[6] else None,
            'is_permanent': row[7]
        })
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'mutes': mutes}),
        'isBase64Encoded': False
    }

def get_exclusions(cur, conn) -> dict:
    """Получает список всех отстранений"""
    
    cur.execute("""
        SELECT 
            e.id,
            u.id as user_id,
            u.nickname,
            t.name as tournament_name,
            a.nickname as admin_name,
            e.reason,
            e.exclusion_date
        FROM tournament_exclusions e
        JOIN users u ON e.user_id = u.id
        LEFT JOIN tournaments t ON e.tournament_id = t.id
        JOIN users a ON e.admin_id = a.id
        ORDER BY e.created_at DESC
    """)
    
    exclusions = []
    for row in cur.fetchall():
        exclusions.append({
            'id': row[0],
            'user_id': row[1],
            'username': row[2],
            'tournament_name': row[3] or 'Все турниры',
            'admin_name': row[4],
            'reason': row[5],
            'exclusion_date': row[6].isoformat() if row[6] else None
        })
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'exclusions': exclusions}),
        'isBase64Encoded': False
    }

def remove_ban(cur, conn, admin_id: str, body: dict) -> dict:
    """Снимает бан с пользователя"""
    
    user_id = body.get('user_id')
    
    cur.execute("UPDATE users SET is_banned = FALSE WHERE id = %s", (user_id,))
    
    cur.execute("""
        INSERT INTO admin_actions_log (admin_id, action_type, target_user_id, details)
        VALUES (%s, 'unban', %s, %s)
    """, (admin_id, user_id, json.dumps({'action': 'unban'})))
    
    cur.execute("SELECT email, nickname FROM users WHERE id = %s", (user_id,))
    user_data = cur.fetchone()
    
    if user_data:
        user_email, user_nickname = user_data
        
        try:
            send_user_notification(
                user_email,
                f'{user_nickname}, бан снят',
                f'''
                <html>
                <body style="font-family: Arial, sans-serif; color: #333;">
                    <h2 style="color: #10B981;">Бан снят на сайте Disaster Esports</h2>
                    <p>Ваш аккаунт был разблокирован администратором.</p>
                    <p>Вы снова можете пользоваться всеми функциями сайта.</p>
                    <hr style="border: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #999;">Disaster Esports</p>
                </body>
                </html>
                '''
            )
            
            cur.execute("""
                INSERT INTO user_notifications (user_id, notification_type, subject, message, is_sent)
                VALUES (%s, 'unban', %s, %s, TRUE)
            """, (user_id, 'Бан снят', 'Ваш аккаунт разблокирован'))
        except Exception as e:
            cur.execute("""
                INSERT INTO user_notifications (user_id, notification_type, subject, message, is_sent, error_message)
                VALUES (%s, 'unban', %s, %s, FALSE, %s)
            """, (user_id, 'Бан снят', 'Ваш аккаунт разблокирован', str(e)))
    
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'message': 'Бан снят, уведомление отправлено'}),
        'isBase64Encoded': False
    }

def remove_mute(cur, conn, admin_id: str, body: dict) -> dict:
    """Снимает мут с пользователя"""
    
    user_id = body.get('user_id')
    
    cur.execute("UPDATE users SET is_muted = FALSE WHERE id = %s", (user_id,))
    
    cur.execute("""
        INSERT INTO admin_actions_log (admin_id, action_type, target_user_id, details)
        VALUES (%s, 'unmute', %s, %s)
    """, (admin_id, user_id, json.dumps({'action': 'unmute'})))
    
    cur.execute("SELECT email, nickname FROM users WHERE id = %s", (user_id,))
    user_data = cur.fetchone()
    
    if user_data:
        user_email, user_nickname = user_data
        
        try:
            send_user_notification(
                user_email,
                f'{user_nickname}, мут снят',
                f'''
                <html>
                <body style="font-family: Arial, sans-serif; color: #333;">
                    <h2 style="color: #10B981;">Мут снят на сайте Disaster Esports</h2>
                    <p>Вы снова можете отправлять сообщения в чате.</p>
                    <hr style="border: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #999;">Disaster Esports</p>
                </body>
                </html>
                '''
            )
            
            cur.execute("""
                INSERT INTO user_notifications (user_id, notification_type, subject, message, is_sent)
                VALUES (%s, 'unmute', %s, %s, TRUE)
            """, (user_id, 'Мут снят', 'Вы можете снова писать в чате'))
        except Exception as e:
            cur.execute("""
                INSERT INTO user_notifications (user_id, notification_type, subject, message, is_sent, error_message)
                VALUES (%s, 'unmute', %s, %s, FALSE, %s)
            """, (user_id, 'Мут снят', 'Вы можете снова писать в чате', str(e)))
    
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'message': 'Мут снят, уведомление отправлено'}),
        'isBase64Encoded': False
    }

def create_tournament(cur, conn, admin_id: str, body: dict) -> dict:
    """Создает новый турнир"""
    
    name = body.get('name')
    description = body.get('description')
    prize_pool = body.get('prize_pool')
    location = body.get('location')
    game_project = body.get('game_project')
    map_pool = body.get('map_pool', [])
    format_type = body.get('format')
    team_size = body.get('team_size')
    best_of = body.get('best_of')
    start_date = body.get('start_date')
    image_base64 = body.get('image')
    
    image_url = None
    if image_base64:
        try:
            import base64
            import boto3
            from datetime import datetime
            
            image_data = base64.b64decode(image_base64.split(',')[1] if ',' in image_base64 else image_base64)
            
            s3 = boto3.client('s3',
                endpoint_url='https://bucket.poehali.dev',
                aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
                aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
            )
            
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            file_key = f'tournaments/{timestamp}_{name.replace(" ", "_")}.png'
            
            s3.put_object(
                Bucket='files',
                Key=file_key,
                Body=image_data,
                ContentType='image/png'
            )
            
            image_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{file_key}"
        except Exception as e:
            pass
    
    cur.execute("""
        INSERT INTO t_p4831367_esport_gta_disaster.tournaments 
        (name, description, prize_pool, location, game_project, map_pool, format, team_size, best_of, start_date, status, created_by, image_url)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'upcoming', %s, %s)
        RETURNING id
    """, (name, description, prize_pool, location, game_project, json.dumps(map_pool), format_type, team_size, best_of, start_date, admin_id, image_url))
    
    tournament_id = cur.fetchone()[0]
    
    if image_url:
        news_content = f"""
        🏆 Объявлен новый турнир: {name}!
        
        📅 Дата начала: {start_date}
        💰 Призовой фонд: {prize_pool}
        📍 Локация: {location}
        
        {description}
        """
        
        cur.execute("""
            INSERT INTO t_p4831367_esport_gta_disaster.news 
            (title, content, image_url, author_id, tournament_id, published)
            VALUES (%s, %s, %s, %s, %s, TRUE)
        """, (f'Турнир {name}', news_content, image_url, admin_id, tournament_id))
    
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'tournament_id': tournament_id, 'image_url': image_url}),
        'isBase64Encoded': False
    }

def get_tournaments(cur, conn) -> dict:
    """Получает список всех турниров"""
    
    cur.execute("""
        SELECT id, name, description, prize_pool, location, game_project, map_pool, format, team_size, best_of, start_date, status, created_at
        FROM tournaments
        ORDER BY start_date DESC
    """)
    
    tournaments = []
    for row in cur.fetchall():
        tournaments.append({
            'id': row[0],
            'name': row[1],
            'description': row[2],
            'prize_pool': row[3],
            'location': row[4],
            'game_project': row[5],
            'map_pool': json.loads(row[6]) if row[6] else [],
            'format': row[7],
            'team_size': row[8],
            'best_of': row[9],
            'start_date': row[10].isoformat() if row[10] else None,
            'status': row[11],
            'created_at': row[12].isoformat() if row[12] else None
        })
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'tournaments': tournaments}),
        'isBase64Encoded': False
    }

def get_tournament(cur, conn, body: dict) -> dict:
    """Получает детали турнира"""
    
    tournament_id = body.get('tournament_id')
    
    cur.execute("""
        SELECT id, name, description, prize_pool, location, game_project, map_pool, format, team_size, best_of, start_date, status, created_at
        FROM tournaments
        WHERE id = %s
    """, (tournament_id,))
    
    row = cur.fetchone()
    if not row:
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Турнир не найден'}),
            'isBase64Encoded': False
        }
    
    tournament = {
        'id': row[0],
        'name': row[1],
        'description': row[2],
        'prize_pool': row[3],
        'location': row[4],
        'game_project': row[5],
        'map_pool': json.loads(row[6]) if row[6] else [],
        'format': row[7],
        'team_size': row[8],
        'best_of': row[9],
        'start_date': row[10].isoformat() if row[10] else None,
        'status': row[11],
        'created_at': row[12].isoformat() if row[12] else None
    }
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'tournament': tournament}),
        'isBase64Encoded': False
    }

def register_team(cur, conn, body: dict) -> dict:
    """Регистрирует команду на турнир"""
    
    tournament_id = body.get('tournament_id')
    team_id = body.get('team_id')
    
    cur.execute("SELECT team_size FROM tournaments WHERE id = %s", (tournament_id,))
    tournament = cur.fetchone()
    if not tournament:
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Турнир не найден'}),
            'isBase64Encoded': False
        }
    
    required_team_size = tournament[0]
    
    cur.execute("SELECT COUNT(*) FROM team_members WHERE team_id = %s", (team_id,))
    current_team_size = cur.fetchone()[0]
    
    if current_team_size < required_team_size:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Размер команды должен быть {required_team_size}, сейчас {current_team_size}'}),
            'isBase64Encoded': False
        }
    
    cur.execute("""
        INSERT INTO tournament_teams (tournament_id, team_id, registered_at)
        VALUES (%s, %s, NOW())
        ON CONFLICT DO NOTHING
    """, (tournament_id, team_id))
    
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'message': 'Команда зарегистрирована'}),
        'isBase64Encoded': False
    }

def update_tournament_status(cur, conn, admin_id: str, body: dict) -> dict:
    """Обновляет статус турнира"""
    
    tournament_id = body.get('tournament_id')
    status = body.get('status')
    
    cur.execute("UPDATE tournaments SET status = %s WHERE id = %s", (status, tournament_id))
    
    cur.execute("""
        INSERT INTO admin_actions_log (admin_id, action_type, details)
        VALUES (%s, 'update_tournament_status', %s)
    """, (admin_id, json.dumps({'tournament_id': tournament_id, 'status': status})))
    
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True}),
        'isBase64Encoded': False
    }

def get_match_chat(cur, conn, body: dict) -> dict:
    """Получает сообщения чата матча"""
    
    match_id = body.get('match_id')
    
    cur.execute("""
        SELECT mc.id, mc.user_id, u.username, mc.message, mc.message_type, mc.created_at
        FROM match_chat mc
        JOIN users u ON mc.user_id = u.id
        WHERE mc.match_id = %s
        ORDER BY mc.created_at ASC
    """, (match_id,))
    
    messages = []
    for row in cur.fetchall():
        messages.append({
            'id': row[0],
            'user_id': row[1],
            'username': row[2],
            'message': row[3],
            'message_type': row[4],
            'created_at': row[5].isoformat() if row[5] else None
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
    message_type = body.get('message_type', 'message')
    
    cur.execute("""
        INSERT INTO match_chat (match_id, user_id, message, message_type, created_at)
        VALUES (%s, %s, %s, %s, NOW())
        RETURNING id
    """, (match_id, admin_id, message, message_type))
    
    message_id = cur.fetchone()[0]
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'message_id': message_id}),
        'isBase64Encoded': False
    }

def get_ban_pick(cur, conn, body: dict) -> dict:
    """Получает бан-пик карт для матча"""
    
    match_id = body.get('match_id')
    
    cur.execute("""
        SELECT id, team_id, map_name, action, created_at
        FROM match_ban_pick
        WHERE match_id = %s
        ORDER BY created_at ASC
    """, (match_id,))
    
    ban_picks = []
    for row in cur.fetchall():
        ban_picks.append({
            'id': row[0],
            'team_id': row[1],
            'map_name': row[2],
            'action': row[3],
            'created_at': row[4].isoformat() if row[4] else None
        })
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'ban_picks': ban_picks}),
        'isBase64Encoded': False
    }

def make_ban_pick(cur, conn, body: dict) -> dict:
    """Делает бан или пик карты"""
    
    match_id = body.get('match_id')
    team_id = body.get('team_id')
    map_name = body.get('map_name')
    action = body.get('action', 'ban')
    
    cur.execute("""
        INSERT INTO match_ban_pick (match_id, team_id, map_name, action, created_at)
        VALUES (%s, %s, %s, %s, NOW())
        RETURNING id
    """, (match_id, team_id, map_name, action))
    
    ban_pick_id = cur.fetchone()[0]
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'ban_pick_id': ban_pick_id}),
        'isBase64Encoded': False
    }

def calculate_match_rating(cur, conn, admin_id: str, body: dict) -> dict:
    """Начисляет рейтинг за завершенный матч"""
    
    match_id = body.get('match_id')
    
    cur.execute("""
        SELECT team1_id, team2_id, team1_score, team2_score
        FROM matches
        WHERE id = %s AND status = 'completed'
    """, (match_id,))
    
    match = cur.fetchone()
    if not match:
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Матч не найден или не завершен'}),
            'isBase64Encoded': False
        }
    
    team1_id, team2_id, team1_score, team2_score = match
    
    if team1_score > team2_score:
        winner_id, loser_id = team1_id, team2_id
        rating_change = 25
    elif team2_score > team1_score:
        winner_id, loser_id = team2_id, team1_id
        rating_change = 25
    else:
        cur.execute("UPDATE team_ratings SET rating = rating + 5 WHERE team_id IN (%s, %s)", (team1_id, team2_id))
        conn.commit()
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True, 'message': 'Ничья, +5 рейтинга обеим командам'}),
            'isBase64Encoded': False
        }
    
    cur.execute("""
        INSERT INTO team_ratings (team_id, rating) VALUES (%s, 1000 + %s)
        ON CONFLICT (team_id) DO UPDATE SET rating = team_ratings.rating + %s
    """, (winner_id, rating_change, rating_change))
    
    cur.execute("""
        INSERT INTO team_ratings (team_id, rating) VALUES (%s, 1000 - %s)
        ON CONFLICT (team_id) DO UPDATE SET rating = GREATEST(team_ratings.rating - %s, 0)
    """, (loser_id, rating_change, rating_change))
    
    cur.execute("""
        INSERT INTO admin_actions_log (admin_id, action_type, details)
        VALUES (%s, 'calculate_rating', %s)
    """, (admin_id, json.dumps({'match_id': match_id, 'rating_change': rating_change})))
    
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'rating_change': rating_change}),
        'isBase64Encoded': False
    }

def get_team_ratings(cur, conn) -> dict:
    """Получает рейтинги всех команд"""
    
    cur.execute("""
        SELECT tr.team_id, t.name, tr.rating
        FROM team_ratings tr
        JOIN teams t ON tr.team_id = t.id
        ORDER BY tr.rating DESC
    """)
    
    ratings = []
    for row in cur.fetchall():
        ratings.append({
            'team_id': row[0],
            'team_name': row[1],
            'rating': row[2]
        })
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'ratings': ratings}),
        'isBase64Encoded': False
    }

def verify_admin_password(cur, conn, body: dict) -> dict:
    """Проверяет пароль админ панели"""
    
    password = body.get('password')
    
    if not password:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Укажите пароль'}),
            'isBase64Encoded': False
        }
    
    cur.execute("SELECT password_hash FROM admin_passwords ORDER BY id DESC LIMIT 1")
    result = cur.fetchone()
    
    if not result:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Пароль админ панели не установлен'}),
            'isBase64Encoded': False
        }
    
    stored_password = result[0]
    
    if password == stored_password:
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

def create_news(cur, conn, admin_id: str, body: dict, role: str) -> dict:
    """Создает новость (admin, founder)"""
    
    if role not in ['admin', 'founder']:
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Недостаточно прав'}),
            'isBase64Encoded': False
        }
    
    title = body.get('title')
    content = body.get('content')
    published = body.get('published', False)
    
    cur.execute("""
        INSERT INTO news (title, content, author_id, published)
        VALUES (%s, %s, %s, %s)
        RETURNING id
    """, (title, content, admin_id, published))
    
    news_id = cur.fetchone()[0]
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'news_id': news_id}),
        'isBase64Encoded': False
    }

def update_news(cur, conn, admin_id: str, body: dict, role: str) -> dict:
    """Обновляет новость (admin, founder)"""
    
    if role not in ['admin', 'founder']:
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Недостаточно прав'}),
            'isBase64Encoded': False
        }
    
    news_id = body.get('news_id')
    title = body.get('title')
    content = body.get('content')
    published = body.get('published')
    
    cur.execute("""
        UPDATE news 
        SET title = COALESCE(%s, title),
            content = COALESCE(%s, content),
            published = COALESCE(%s, published),
            updated_at = NOW()
        WHERE id = %s
    """, (title, content, published, news_id))
    
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True}),
        'isBase64Encoded': False
    }

def delete_news(cur, conn, admin_id: str, body: dict, role: str) -> dict:
    """Удаляет новость (admin, founder)"""
    
    if role not in ['admin', 'founder']:
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Недостаточно прав'}),
            'isBase64Encoded': False
        }
    
    news_id = body.get('news_id')
    
    cur.execute("UPDATE news SET published = false WHERE id = %s", (news_id,))
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True}),
        'isBase64Encoded': False
    }

def get_news(cur, conn, body: dict) -> dict:
    """Получает новости (published или все для админов)"""
    
    include_unpublished = body.get('include_unpublished', False)
    
    if include_unpublished:
        cur.execute("""
            SELECT n.id, n.title, n.content, n.published, n.created_at, n.updated_at, u.nickname
            FROM news n
            JOIN users u ON n.author_id = u.id
            ORDER BY n.created_at DESC
        """)
    else:
        cur.execute("""
            SELECT n.id, n.title, n.content, n.published, n.created_at, n.updated_at, u.nickname
            FROM news n
            JOIN users u ON n.author_id = u.id
            WHERE n.published = true
            ORDER BY n.created_at DESC
        """)
    
    news = []
    for row in cur.fetchall():
        news.append({
            'id': row[0],
            'title': row[1],
            'content': row[2],
            'published': row[3],
            'created_at': row[4].isoformat() if row[4] else None,
            'updated_at': row[5].isoformat() if row[5] else None,
            'author_name': row[6]
        })
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'news': news}),
        'isBase64Encoded': False
    }

def create_rule(cur, conn, admin_id: str, body: dict, role: str) -> dict:
    """Создает правило (admin, founder)"""
    
    if role not in ['admin', 'founder']:
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Недостаточно прав'}),
            'isBase64Encoded': False
        }
    
    title = body.get('title')
    content = body.get('content')
    order_index = body.get('order_index', 0)
    
    cur.execute("""
        INSERT INTO rules (title, content, order_index, author_id)
        VALUES (%s, %s, %s, %s)
        RETURNING id
    """, (title, content, order_index, admin_id))
    
    rule_id = cur.fetchone()[0]
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'rule_id': rule_id}),
        'isBase64Encoded': False
    }

def update_rule(cur, conn, admin_id: str, body: dict, role: str) -> dict:
    """Обновляет правило (admin, founder)"""
    
    if role not in ['admin', 'founder']:
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Недостаточно прав'}),
            'isBase64Encoded': False
        }
    
    rule_id = body.get('rule_id')
    title = body.get('title')
    content = body.get('content')
    order_index = body.get('order_index')
    
    cur.execute("""
        UPDATE rules
        SET title = COALESCE(%s, title),
            content = COALESCE(%s, content),
            order_index = COALESCE(%s, order_index),
            updated_at = NOW()
        WHERE id = %s
    """, (title, content, order_index, rule_id))
    
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True}),
        'isBase64Encoded': False
    }

def delete_rule(cur, conn, admin_id: str, body: dict, role: str) -> dict:
    """Удаляет правило (admin, founder)"""
    
    if role not in ['admin', 'founder']:
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Недостаточно прав'}),
            'isBase64Encoded': False
        }
    
    rule_id = body.get('rule_id')
    
    cur.execute("UPDATE rules SET content = '[Удалено]' WHERE id = %s", (rule_id,))
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True}),
        'isBase64Encoded': False
    }

def get_rules(cur, conn) -> dict:
    """Получает все правила"""
    
    cur.execute("""
        SELECT r.id, r.title, r.content, r.order_index, r.created_at, u.nickname
        FROM rules r
        JOIN users u ON r.author_id = u.id
        ORDER BY r.order_index ASC, r.created_at ASC
    """)
    
    rules = []
    for row in cur.fetchall():
        rules.append({
            'id': row[0],
            'title': row[1],
            'content': row[2],
            'order_index': row[3],
            'created_at': row[4].isoformat() if row[4] else None,
            'author_name': row[5]
        })
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'rules': rules}),
        'isBase64Encoded': False
    }

def update_support(cur, conn, admin_id: str, body: dict, role: str) -> dict:
    """Обновляет контакты поддержки (только founder)"""
    
    if role != 'founder':
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Только основатель может редактировать поддержку'}),
            'isBase64Encoded': False
        }
    
    content = body.get('content')
    
    cur.execute("""
        INSERT INTO support_contacts (content, updated_by)
        VALUES (%s, %s)
    """, (content, admin_id))
    
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True}),
        'isBase64Encoded': False
    }

def get_support(cur, conn) -> dict:
    """Получает контакты поддержки"""
    
    cur.execute("""
        SELECT content, updated_at
        FROM support_contacts
        ORDER BY updated_at DESC
        LIMIT 1
    """)
    
    result = cur.fetchone()
    
    if result:
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'content': result[0],
                'updated_at': result[1].isoformat() if result[1] else None
            }),
            'isBase64Encoded': False
        }
    else:
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'content': 'Контакты поддержки не установлены',
                'updated_at': None
            }),
            'isBase64Encoded': False
        }

def get_all_users(cur, conn) -> dict:
    """Получает всех зарегистрированных пользователей"""
    
    cur.execute("""
        SELECT id, nickname, email, role, auto_status, is_banned, is_muted, created_at, last_active
        FROM users
        ORDER BY created_at DESC
    """)
    
    users = []
    for row in cur.fetchall():
        users.append({
            'id': row[0],
            'nickname': row[1],
            'email': row[2],
            'role': row[3],
            'auto_status': row[4],
            'is_banned': row[5],
            'is_muted': row[6],
            'created_at': row[7].isoformat() if row[7] else None,
            'last_active': row[8].isoformat() if row[8] else None
        })
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'users': users}),
        'isBase64Encoded': False
    }

def get_dashboard_stats(cur, conn) -> dict:
    """Получает статистику для дашборда"""
    
    cur.execute("SELECT COUNT(*) FROM users")
    total_users = cur.fetchone()[0]
    
    cur.execute("SELECT COUNT(*) FROM tournaments WHERE status IN ('upcoming', 'in_progress')")
    active_tournaments = cur.fetchone()[0]
    
    cur.execute("SELECT COUNT(*) FROM news WHERE published = true")
    published_news = cur.fetchone()[0]
    
    cur.execute("SELECT COUNT(*) FROM users WHERE is_banned = true")
    active_bans = cur.fetchone()[0]
    
    cur.execute("SELECT COUNT(*) FROM users WHERE is_muted = true")
    active_mutes = cur.fetchone()[0]
    
    cur.execute("SELECT COUNT(*) FROM teams")
    total_teams = cur.fetchone()[0]
    
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

def assign_role(cur, conn, admin_id: str, admin_role: str, body: dict) -> dict:
    """Назначение роли пользователю (только founder)"""
    
    if admin_role != 'founder':
        return error_response('Только основатель может назначать роли', 403)
    
    user_id = body.get('user_id')
    new_role = body.get('role')
    
    if not user_id or not new_role:
        return error_response('Не указан пользователь или роль', 400)
    
    allowed_roles = ['user', 'moderator', 'admin', 'organizer']
    if new_role not in allowed_roles:
        return error_response(f'Недопустимая роль. Доступные: {", ".join(allowed_roles)}', 400)
    
    cur.execute("SELECT nickname, role FROM t_p4831367_esport_gta_disaster.users WHERE id = %s", (user_id,))
    user_data = cur.fetchone()
    
    if not user_data:
        return error_response('Пользователь не найден', 404)
    
    old_role = user_data[1]
    username = user_data[0]
    
    cur.execute("UPDATE t_p4831367_esport_gta_disaster.users SET role = %s WHERE id = %s", (new_role, user_id))
    
    cur.execute("""
        INSERT INTO t_p4831367_esport_gta_disaster.admin_action_logs 
        (admin_id, action_type, target_user_id, details)
        VALUES (%s, %s, %s, %s)
    """, (admin_id, 'role_change', user_id, json.dumps({
        'old_role': old_role,
        'new_role': new_role,
        'username': username
    })))
    
    conn.commit()
    
    return success_response({
        'success': True,
        'message': f'Роль пользователя {username} изменена с {old_role} на {new_role}'
    })

def revoke_role(cur, conn, admin_id: str, admin_role: str, body: dict) -> dict:
    """Снятие роли с пользователя (только founder)"""
    
    if admin_role != 'founder':
        return error_response('Только основатель может снимать роли', 403)
    
    user_id = body.get('user_id')
    
    if not user_id:
        return error_response('Не указан пользователь', 400)
    
    cur.execute("SELECT nickname, role FROM t_p4831367_esport_gta_disaster.users WHERE id = %s", (user_id,))
    user_data = cur.fetchone()
    
    if not user_data:
        return error_response('Пользователь не найден', 404)
    
    old_role = user_data[1]
    username = user_data[0]
    
    if old_role == 'founder':
        return error_response('Нельзя снять роль основателя', 403)
    
    cur.execute("UPDATE t_p4831367_esport_gta_disaster.users SET role = %s WHERE id = %s", ('user', user_id))
    
    cur.execute("""
        INSERT INTO t_p4831367_esport_gta_disaster.admin_action_logs 
        (admin_id, action_type, target_user_id, details)
        VALUES (%s, %s, %s, %s)
    """, (admin_id, 'role_revoke', user_id, json.dumps({
        'old_role': old_role,
        'new_role': 'user',
        'username': username
    })))
    
    conn.commit()
    
    return success_response({
        'success': True,
        'message': f'Роль {old_role} снята с пользователя {username}'
    })

def get_staff(cur, conn) -> dict:
    """Получение списка администраторов и модераторов"""
    
    cur.execute("""
        SELECT id, nickname, email, role, avatar_url, created_at, last_activity_at
        FROM t_p4831367_esport_gta_disaster.users
        WHERE role IN ('founder', 'organizer', 'admin', 'moderator')
        ORDER BY 
            CASE role
                WHEN 'founder' THEN 1
                WHEN 'organizer' THEN 2
                WHEN 'admin' THEN 3
                WHEN 'moderator' THEN 4
            END,
            nickname
    """)
    
    staff = []
    for row in cur.fetchall():
        staff.append({
            'id': row[0],
            'nickname': row[1],
            'email': row[2],
            'role': row[3],
            'avatar_url': row[4],
            'created_at': row[5].isoformat() if row[5] else None,
            'last_activity_at': row[6].isoformat() if row[6] else None
        })
    
    return success_response({'staff': staff})

def get_role_history(cur, conn, body: dict) -> dict:
    """История изменения ролей"""
    
    limit = body.get('limit', 50)
    
    cur.execute("""
        SELECT 
            l.id, l.admin_id, l.action_type, l.target_user_id, l.details, l.created_at,
            a.nickname as admin_name,
            u.nickname as target_name
        FROM t_p4831367_esport_gta_disaster.admin_action_logs l
        LEFT JOIN t_p4831367_esport_gta_disaster.users a ON l.admin_id = a.id
        LEFT JOIN t_p4831367_esport_gta_disaster.users u ON l.target_user_id = u.id
        WHERE l.action_type IN ('role_change', 'role_revoke')
        ORDER BY l.created_at DESC
        LIMIT %s
    """, (limit,))
    
    history = []
    for row in cur.fetchall():
        details = json.loads(row[4]) if row[4] else {}
        history.append({
            'id': row[0],
            'admin_id': row[1],
            'admin_name': row[6],
            'action_type': row[2],
            'target_user_id': row[3],
            'target_name': row[7],
            'old_role': details.get('old_role'),
            'new_role': details.get('new_role'),
            'created_at': row[5].isoformat() if row[5] else None
        })
    
    return success_response({'history': history})

def create_discussion(cur, conn, user_id: str, user_role: str, body: dict) -> dict:
    """Создание новой темы обсуждения (только модераторы)"""
    
    can_moderate = user_role in ['founder', 'organizer', 'admin', 'moderator']
    
    if not can_moderate:
        return error_response('Только модераторы могут создавать обсуждения', 403)
    
    title = body.get('title', '').strip()
    content = body.get('content', '').strip()
    
    if not title or not content:
        return error_response('Заголовок и содержание обязательны', 400)
    
    cur.execute("""
        INSERT INTO t_p4831367_esport_gta_disaster.discussions 
        (title, content, author_id, created_at, updated_at)
        VALUES (%s, %s, %s, NOW(), NOW())
        RETURNING id
    """, (title, content, user_id))
    
    discussion_id = cur.fetchone()[0]
    conn.commit()
    
    return success_response({
        'success': True,
        'discussion_id': discussion_id,
        'message': f'Обсуждение "{title}" создано'
    })

def add_comment(cur, conn, user_id: str, user_role: str, body: dict) -> dict:
    """Добавление комментария к обсуждению"""
    
    can_moderate = user_role in ['founder', 'organizer', 'admin', 'moderator']
    discussion_id = body.get('discussion_id')
    content = body.get('content', '').strip()
    
    if not discussion_id or not content:
        return error_response('Укажите обсуждение и текст комментария', 400)
    
    cur.execute("""
        SELECT is_locked, status FROM t_p4831367_esport_gta_disaster.discussions 
        WHERE id = %s
    """, (discussion_id,))
    
    discussion = cur.fetchone()
    if not discussion:
        return error_response('Обсуждение не найдено', 404)
    
    is_locked = discussion[0]
    status = discussion[1]
    
    if (is_locked or status in ['closed', 'under_review']) and not can_moderate:
        return error_response('Обсуждение закрыто. Только модераторы могут писать', 403)
    
    cur.execute("""
        INSERT INTO t_p4831367_esport_gta_disaster.discussion_comments 
        (discussion_id, author_id, content, created_at)
        VALUES (%s, %s, %s, NOW())
        RETURNING id
    """, (discussion_id, user_id, content))
    
    comment_id = cur.fetchone()[0]
    
    cur.execute("""
        UPDATE t_p4831367_esport_gta_disaster.discussions 
        SET updated_at = NOW() 
        WHERE id = %s
    """, (discussion_id,))
    
    conn.commit()
    
    return success_response({
        'success': True,
        'comment_id': comment_id,
        'message': 'Комментарий добавлен'
    })

def get_discussions(cur, conn) -> dict:
    """Получение всех обсуждений"""
    
    cur.execute("""
        SELECT 
            d.id, d.title, d.content, d.author_id, d.is_locked, d.is_pinned, 
            d.status, d.views, d.created_at, d.updated_at,
            u.nickname, u.avatar_url,
            (SELECT COUNT(*) FROM t_p4831367_esport_gta_disaster.discussion_comments WHERE discussion_id = d.id) as comment_count
        FROM t_p4831367_esport_gta_disaster.discussions d
        LEFT JOIN t_p4831367_esport_gta_disaster.users u ON d.author_id = u.id
        WHERE d.status != 'deleted'
        ORDER BY d.is_pinned DESC, d.updated_at DESC
        LIMIT 100
    """)
    
    discussions = []
    for row in cur.fetchall():
        discussions.append({
            'id': row[0],
            'title': row[1],
            'content': row[2][:200] + '...' if len(row[2]) > 200 else row[2],
            'author_id': row[3],
            'is_locked': row[4],
            'is_pinned': row[5],
            'status': row[6],
            'views': row[7],
            'created_at': row[8].isoformat() if row[8] else None,
            'updated_at': row[9].isoformat() if row[9] else None,
            'author_name': row[10],
            'author_avatar': row[11],
            'comment_count': row[12]
        })
    
    return success_response({'discussions': discussions})

def get_discussion(cur, conn, body: dict) -> dict:
    """Получение обсуждения с комментариями"""
    
    discussion_id = body.get('discussion_id')
    
    if not discussion_id:
        return error_response('Не указан ID обсуждения', 400)
    
    cur.execute("""
        SELECT 
            d.id, d.title, d.content, d.author_id, d.is_locked, d.is_pinned, 
            d.status, d.views, d.created_at, d.updated_at,
            u.nickname, u.avatar_url
        FROM t_p4831367_esport_gta_disaster.discussions d
        LEFT JOIN t_p4831367_esport_gta_disaster.users u ON d.author_id = u.id
        WHERE d.id = %s
    """, (discussion_id,))
    
    row = cur.fetchone()
    if not row:
        return error_response('Обсуждение не найдено', 404)
    
    discussion = {
        'id': row[0],
        'title': row[1],
        'content': row[2],
        'author_id': row[3],
        'is_locked': row[4],
        'is_pinned': row[5],
        'status': row[6],
        'views': row[7],
        'created_at': row[8].isoformat() if row[8] else None,
        'updated_at': row[9].isoformat() if row[9] else None,
        'author_name': row[10],
        'author_avatar': row[11]
    }
    
    cur.execute("""
        SELECT 
            c.id, c.content, c.created_at, c.author_id,
            u.nickname, u.avatar_url
        FROM t_p4831367_esport_gta_disaster.discussion_comments c
        LEFT JOIN t_p4831367_esport_gta_disaster.users u ON c.author_id = u.id
        WHERE c.discussion_id = %s
        ORDER BY c.created_at ASC
    """, (discussion_id,))
    
    comments = []
    for row in cur.fetchall():
        comments.append({
            'id': row[0],
            'content': row[1],
            'created_at': row[2].isoformat() if row[2] else None,
            'author_id': row[3],
            'author_name': row[4],
            'author_avatar': row[5]
        })
    
    discussion['comments'] = comments
    
    cur.execute("""
        UPDATE t_p4831367_esport_gta_disaster.discussions 
        SET views = views + 1 
        WHERE id = %s
    """, (discussion_id,))
    conn.commit()
    
    return success_response({'discussion': discussion})

def lock_discussion(cur, conn, body: dict) -> dict:
    """Блокировка обсуждения"""
    
    discussion_id = body.get('discussion_id')
    lock = body.get('lock', True)
    
    if not discussion_id:
        return error_response('Не указан ID обсуждения', 400)
    
    cur.execute("""
        UPDATE t_p4831367_esport_gta_disaster.discussions 
        SET is_locked = %s 
        WHERE id = %s
    """, (lock, discussion_id))
    
    conn.commit()
    
    status = 'заблокировано' if lock else 'разблокировано'
    return success_response({
        'success': True,
        'message': f'Обсуждение {status}'
    })

def pin_discussion(cur, conn, body: dict) -> dict:
    """Закрепление обсуждения"""
    
    discussion_id = body.get('discussion_id')
    pin = body.get('pin', True)
    
    if not discussion_id:
        return error_response('Не указан ID обсуждения', 400)
    
    cur.execute("""
        UPDATE t_p4831367_esport_gta_disaster.discussions 
        SET is_pinned = %s 
        WHERE id = %s
    """, (pin, discussion_id))
    
    conn.commit()
    
    status = 'закреплено' if pin else 'откреплено'
    return success_response({
        'success': True,
        'message': f'Обсуждение {status}'
    })

def delete_discussion(cur, conn, body: dict) -> dict:
    """Удаление обсуждения"""
    
    discussion_id = body.get('discussion_id')
    
    if not discussion_id:
        return error_response('Не указан ID обсуждения', 400)
    
    cur.execute("SELECT title FROM t_p4831367_esport_gta_disaster.discussions WHERE id = %s", (discussion_id,))
    title = cur.fetchone()
    
    if not title:
        return error_response('Обсуждение не найдено', 404)
    
    cur.execute("UPDATE t_p4831367_esport_gta_disaster.discussions SET status = %s WHERE id = %s", ('deleted', discussion_id))
    conn.commit()
    
    return success_response({
        'success': True,
        'message': f'Обсуждение "{title[0]}" удалено'
    })

def edit_discussion(cur, conn, user_id: str, body: dict) -> dict:
    """Редактирование обсуждения"""
    
    discussion_id = body.get('discussion_id')
    title = body.get('title', '').strip()
    content = body.get('content', '').strip()
    
    if not discussion_id:
        return error_response('Не указан ID обсуждения', 400)
    
    if not title or not content:
        return error_response('Заголовок и содержание обязательны', 400)
    
    cur.execute("""
        UPDATE t_p4831367_esport_gta_disaster.discussions 
        SET title = %s, content = %s, updated_at = NOW() 
        WHERE id = %s
    """, (title, content, discussion_id))
    
    conn.commit()
    
    return success_response({
        'success': True,
        'message': 'Обсуждение обновлено'
    })

def success_response(data: dict) -> dict:
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(data),
        'isBase64Encoded': False
    }

def error_response(message: str, status_code: int = 400) -> dict:
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': message}),
        'isBase64Encoded': False
    }