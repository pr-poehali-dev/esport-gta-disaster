# v1.0
import json
import os
import psycopg2
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
    
    try:
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            
            public_actions = ['get_news', 'get_rules', 'get_support', 'get_tournaments', 'get_tournament']
            
            if action in public_actions:
                if action == 'get_news':
                    return get_news(cur, conn, body)
                elif action == 'get_rules':
                    return get_rules(cur, conn)
                elif action == 'get_support':
                    return get_support(cur, conn)
                elif action == 'get_tournaments':
                    return get_tournaments(cur, conn)
                elif action == 'get_tournament':
                    return get_tournament(cur, conn, body)
        
        admin_id = event.get('headers', {}).get('X-Admin-Id') or event.get('headers', {}).get('x-admin-id')
        
        if not admin_id:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Требуется авторизация администратора'}),
                'isBase64Encoded': False
            }
        
        cur.execute(f"SELECT role FROM users WHERE id = '{escape_sql(admin_id)}'")
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
            elif action == 'create_news_with_image':
                return create_news_with_image(cur, conn, admin_id, body, admin_role[0])
            elif action == 'delete_tournament':
                return delete_tournament(cur, conn, admin_id, body)
            elif action == 'hide_tournament':
                return hide_tournament(cur, conn, admin_id, body)
            elif action == 'start_tournament':
                return start_tournament(cur, conn, admin_id, body)
            elif action == 'get_admin_tournaments':
                return get_admin_tournaments(cur, conn)
            elif action == 'approve_registration':
                return approve_registration(cur, conn, admin_id, body)
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
                return update_setting(cur, conn, admin_id, body, admin_role[0])
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
    
    cur.execute(f"""
        INSERT INTO admin_verification_codes (admin_id, code, action_type, action_data, expires_at)
        VALUES ('{escape_sql(admin_id)}', '{escape_sql(code)}', '{escape_sql(action_type)}', '{escape_sql(action_data)}', '{expires_at}')
    """)
    conn.commit()
    
    cur.execute(f"SELECT email FROM users WHERE id = '{escape_sql(admin_id)}'")
    admin_email = cur.fetchone()[0]
    
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
        SELECT action_type, action_data FROM admin_verification_codes
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
    
    action_type, action_data = result
    action_data = json.loads(action_data)
    
    cur.execute(f"""
        UPDATE admin_verification_codes
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
    
    if duration_days:
        expires_at = datetime.now() + timedelta(days=duration_days)
        cur.execute(f"""
            INSERT INTO bans (user_id, admin_id, reason, expires_at)
            VALUES ('{escape_sql(user_id)}', '{escape_sql(admin_id)}', '{escape_sql(reason)}', '{expires_at}')
        """)
    else:
        cur.execute(f"""
            INSERT INTO bans (user_id, admin_id, reason)
            VALUES ('{escape_sql(user_id)}', '{escape_sql(admin_id)}', '{escape_sql(reason)}')
        """)
    
    conn.commit()
    
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
    
    if duration_days:
        expires_at = datetime.now() + timedelta(days=duration_days)
        cur.execute(f"""
            INSERT INTO mutes (user_id, admin_id, reason, expires_at)
            VALUES ('{escape_sql(user_id)}', '{escape_sql(admin_id)}', '{escape_sql(reason)}', '{expires_at}')
        """)
    else:
        cur.execute(f"""
            INSERT INTO mutes (user_id, admin_id, reason)
            VALUES ('{escape_sql(user_id)}', '{escape_sql(admin_id)}', '{escape_sql(reason)}')
        """)
    
    conn.commit()
    
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
            INSERT INTO tournament_exclusions (user_id, admin_id, reason, expires_at)
            VALUES ('{escape_sql(user_id)}', '{escape_sql(admin_id)}', '{escape_sql(reason)}', '{expires_at}')
        """)
    else:
        cur.execute(f"""
            INSERT INTO tournament_exclusions (user_id, admin_id, reason)
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
        FROM bans b
        JOIN users u ON b.user_id = u.id
        JOIN users a ON b.admin_id = a.id
        WHERE b.active = TRUE
        ORDER BY b.created_at DESC
    """)
    
    bans = []
    for row in cur.fetchall():
        bans.append({
            'id': row[0],
            'user_id': row[1],
            'username': row[2],
            'admin_id': row[3],
            'admin_username': row[4],
            'reason': row[5],
            'created_at': row[6].isoformat() if row[6] else None,
            'expires_at': row[7].isoformat() if row[7] else None,
            'active': row[8]
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
        FROM mutes m
        JOIN users u ON m.user_id = u.id
        JOIN users a ON m.admin_id = a.id
        WHERE m.active = TRUE
        ORDER BY m.created_at DESC
    """)
    
    mutes = []
    for row in cur.fetchall():
        mutes.append({
            'id': row[0],
            'user_id': row[1],
            'username': row[2],
            'admin_id': row[3],
            'admin_username': row[4],
            'reason': row[5],
            'created_at': row[6].isoformat() if row[6] else None,
            'expires_at': row[7].isoformat() if row[7] else None,
            'active': row[8]
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
        FROM tournament_exclusions e
        JOIN users u ON e.user_id = u.id
        JOIN users a ON e.admin_id = a.id
        WHERE e.active = TRUE
        ORDER BY e.created_at DESC
    """)
    
    exclusions = []
    for row in cur.fetchall():
        exclusions.append({
            'id': row[0],
            'user_id': row[1],
            'username': row[2],
            'admin_id': row[3],
            'admin_username': row[4],
            'reason': row[5],
            'created_at': row[6].isoformat() if row[6] else None,
            'expires_at': row[7].isoformat() if row[7] else None,
            'active': row[8]
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
        UPDATE bans SET active = FALSE
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
        UPDATE mutes SET active = FALSE
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
    game = body.get('game')
    start_date = body.get('start_date')
    end_date = body.get('end_date')
    max_teams = body.get('max_teams')
    prize_pool = body.get('prize_pool')
    rules = body.get('rules')
    format_type = body.get('format_type', 'single_elimination')
    
    cur.execute(f"""
        INSERT INTO tournaments (name, description, game, start_date, end_date, max_teams, prize_pool, rules, format_type, created_by)
        VALUES ('{escape_sql(name)}', '{escape_sql(description)}', '{escape_sql(game)}', '{escape_sql(start_date)}', '{escape_sql(end_date)}', {int(max_teams)}, '{escape_sql(prize_pool)}', '{escape_sql(rules)}', '{escape_sql(format_type)}', '{escape_sql(admin_id)}')
        RETURNING id
    """)
    
    tournament_id = cur.fetchone()[0]
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'message': 'Турнир создан', 'tournament_id': tournament_id}),
        'isBase64Encoded': False
    }

def get_tournaments(cur, conn) -> dict:
    """Получает список всех турниров"""
    
    cur.execute("""
        SELECT id, name, description, game, start_date, end_date, max_teams, prize_pool, 
               rules, format_type, status, created_by, created_at
        FROM tournaments
        ORDER BY start_date DESC
    """)
    
    tournaments = []
    for row in cur.fetchall():
        tournaments.append({
            'id': row[0],
            'name': row[1],
            'description': row[2],
            'game': row[3],
            'start_date': row[4].isoformat() if row[4] else None,
            'end_date': row[5].isoformat() if row[5] else None,
            'max_teams': row[6],
            'prize_pool': row[7],
            'rules': row[8],
            'format_type': row[9],
            'status': row[10],
            'created_by': row[11],
            'created_at': row[12].isoformat() if row[12] else None
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
    
    cur.execute(f"""
        SELECT id, name, description, game, start_date, end_date, max_teams, prize_pool,
               rules, format_type, status, created_by, created_at
        FROM tournaments
        WHERE id = {int(tournament_id)}
    """)
    
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
        'game': row[3],
        'start_date': row[4].isoformat() if row[4] else None,
        'end_date': row[5].isoformat() if row[5] else None,
        'max_teams': row[6],
        'prize_pool': row[7],
        'rules': row[8],
        'format_type': row[9],
        'status': row[10],
        'created_by': row[11],
        'created_at': row[12].isoformat() if row[12] else None
    }
    
    cur.execute(f"""
        SELECT tr.id, tr.team_id, t.name, tr.status, tr.registered_at
        FROM tournament_registrations tr
        JOIN teams t ON tr.team_id = t.id
        WHERE tr.tournament_id = {int(tournament_id)}
        ORDER BY tr.registered_at
    """)
    
    registrations = []
    for row in cur.fetchall():
        registrations.append({
            'id': row[0],
            'team_id': row[1],
            'team_name': row[2],
            'status': row[3],
            'registered_at': row[4].isoformat() if row[4] else None
        })
    
    tournament['registrations'] = registrations
    
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
    
    cur.execute(f"""
        SELECT status FROM tournaments WHERE id = {int(tournament_id)}
    """)
    
    tournament_status = cur.fetchone()
    
    if not tournament_status:
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Турнир не найден'}),
            'isBase64Encoded': False
        }
    
    if tournament_status[0] != 'open':
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Регистрация на турнир закрыта'}),
            'isBase64Encoded': False
        }
    
    cur.execute(f"""
        INSERT INTO tournament_registrations (tournament_id, team_id, status)
        VALUES ({int(tournament_id)}, {int(team_id)}, 'pending')
    """)
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'message': 'Команда зарегистрирована на турнир'}),
        'isBase64Encoded': False
    }

def update_tournament_status(cur, conn, admin_id: str, body: dict) -> dict:
    """Обновляет статус турнира"""
    
    tournament_id = body.get('tournament_id')
    status = body.get('status')
    
    cur.execute(f"""
        UPDATE tournaments
        SET status = '{escape_sql(status)}'
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
        FROM match_chat mc
        JOIN users u ON mc.user_id = u.id
        WHERE mc.match_id = {int(match_id)}
        ORDER BY mc.created_at
    """)
    
    messages = []
    for row in cur.fetchall():
        messages.append({
            'id': row[0],
            'user_id': row[1],
            'username': row[2],
            'message': row[3],
            'created_at': row[4].isoformat() if row[4] else None,
            'message_type': row[5]
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
        INSERT INTO match_chat (match_id, user_id, message, message_type)
        VALUES ({int(match_id)}, '{escape_sql(admin_id)}', '{escape_sql(message)}', '{escape_sql(message_type)}')
        RETURNING id
    """)
    
    message_id = cur.fetchone()[0]
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
        FROM ban_pick bp
        JOIN teams t ON bp.team_id = t.id
        WHERE bp.match_id = {int(match_id)}
        ORDER BY bp.action_order
    """)
    
    ban_picks = []
    for row in cur.fetchall():
        ban_picks.append({
            'id': row[0],
            'team_id': row[1],
            'team_name': row[2],
            'hero_name': row[3],
            'action_type': row[4],
            'action_order': row[5],
            'created_at': row[6].isoformat() if row[6] else None
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
        SELECT COALESCE(MAX(action_order), 0) + 1
        FROM ban_pick
        WHERE match_id = {int(match_id)}
    """)
    
    action_order = cur.fetchone()[0]
    
    cur.execute(f"""
        INSERT INTO ban_pick (match_id, team_id, hero_name, action_type, action_order)
        VALUES ({int(match_id)}, {int(team_id)}, '{escape_sql(hero_name)}', '{escape_sql(action_type)}', {int(action_order)})
        RETURNING id
    """)
    
    ban_pick_id = cur.fetchone()[0]
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
    winner_rating = winner_rating_row[0] if winner_rating_row else 1000
    
    cur.execute(f"""
        SELECT rating FROM team_ratings WHERE team_id = {int(loser_id)}
    """)
    loser_rating_row = cur.fetchone()
    loser_rating = loser_rating_row[0] if loser_rating_row else 1000
    
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
        JOIN teams t ON tr.team_id = t.id
        ORDER BY tr.rating DESC
    """)
    
    ratings = []
    for row in cur.fetchall():
        ratings.append({
            'team_id': row[0],
            'team_name': row[1],
            'rating': row[2],
            'matches_played': row[3],
            'wins': row[4],
            'losses': row[5]
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
    
    cur.execute(f"""
        SELECT password_hash FROM users WHERE id = '{escape_sql(admin_id)}'
    """)
    
    password_hash = cur.fetchone()
    
    if not password_hash:
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Пользователь не найден'}),
            'isBase64Encoded': False
        }
    
    import bcrypt
    
    if bcrypt.checkpw(password.encode('utf-8'), password_hash[0].encode('utf-8')):
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'valid': True}),
            'isBase64Encoded': False
        }
    else:
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'valid': False}),
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
    category = body.get('category', 'general')
    
    cur.execute(f"""
        INSERT INTO news (title, content, category, author_id)
        VALUES ('{escape_sql(title)}', '{escape_sql(content)}', '{escape_sql(category)}', '{escape_sql(admin_id)}')
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
    category = body.get('category')
    
    cur.execute(f"""
        UPDATE news
        SET title = '{escape_sql(title)}', content = '{escape_sql(content)}', category = '{escape_sql(category)}'
        WHERE id = {int(news_id)}
    """)
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'message': 'Новость обновлена'}),
        'isBase64Encoded': False
    }

def delete_news(cur, conn, admin_id: str, body: dict, admin_role: str) -> dict:
    """Удаляет новость"""
    
    if admin_role not in ['admin', 'founder']:
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Недостаточно прав для удаления новостей'}),
            'isBase64Encoded': False
        }
    
    news_id = body.get('news_id')
    
    cur.execute(f"""
        DELETE FROM news WHERE id = {int(news_id)}
    """)
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'message': 'Новость удалена'}),
        'isBase64Encoded': False
    }

def get_news(cur, conn, body: dict) -> dict:
    """Получает новости"""
    
    limit = body.get('limit', 10)
    offset = body.get('offset', 0)
    category = body.get('category')
    
    if category:
        cur.execute(f"""
            SELECT n.id, n.title, n.content, n.category, n.author_id, u.username, n.created_at
            FROM news n
            JOIN users u ON n.author_id = u.id
            WHERE n.category = '{escape_sql(category)}'
            ORDER BY n.created_at DESC
            LIMIT {int(limit)} OFFSET {int(offset)}
        """)
    else:
        cur.execute(f"""
            SELECT n.id, n.title, n.content, n.category, n.author_id, u.username, n.created_at
            FROM news n
            JOIN users u ON n.author_id = u.id
            ORDER BY n.created_at DESC
            LIMIT {int(limit)} OFFSET {int(offset)}
        """)
    
    news_list = []
    for row in cur.fetchall():
        news_list.append({
            'id': row[0],
            'title': row[1],
            'content': row[2],
            'category': row[3],
            'author_id': row[4],
            'author_username': row[5],
            'created_at': row[6].isoformat() if row[6] else None
        })
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'news': news_list}),
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
        INSERT INTO rules (title, content, category, created_by)
        VALUES ('{escape_sql(title)}', '{escape_sql(content)}', '{escape_sql(category)}', '{escape_sql(admin_id)}')
        RETURNING id
    """)
    
    rule_id = cur.fetchone()[0]
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
        DELETE FROM rules WHERE id = {int(rule_id)}
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
            'id': row[0],
            'title': row[1],
            'content': row[2],
            'category': row[3],
            'created_by': row[4],
            'created_at': row[5].isoformat() if row[5] else None
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
            'email': row[0],
            'discord': row[1],
            'telegram': row[2]
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
        FROM users
        ORDER BY created_at DESC
    """)
    
    users = []
    for row in cur.fetchall():
        users.append({
            'id': row[0],
            'username': row[1],
            'email': row[2],
            'role': row[3],
            'created_at': row[4].isoformat() if row[4] else None
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
    
    cur.execute("SELECT COUNT(*) FROM tournaments")
    total_tournaments = cur.fetchone()[0]
    
    cur.execute("SELECT COUNT(*) FROM bans WHERE active = TRUE")
    active_bans = cur.fetchone()[0]
    
    cur.execute("SELECT COUNT(*) FROM mutes WHERE active = TRUE")
    active_mutes = cur.fetchone()[0]
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'stats': {
                'total_users': total_users,
                'total_tournaments': total_tournaments,
                'active_bans': active_bans,
                'active_mutes': active_mutes
            }
        }),
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
    
    if role not in ['admin', 'organizer', 'user']:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Недопустимая роль'}),
            'isBase64Encoded': False
        }
    
    cur.execute(f"""
        UPDATE users
        SET role = '{escape_sql(role)}'
        WHERE id = '{escape_sql(user_id)}'
    """)
    
    cur.execute(f"""
        INSERT INTO role_history (user_id, assigned_by, role, action)
        VALUES ('{escape_sql(user_id)}', '{escape_sql(admin_id)}', '{escape_sql(role)}', 'assigned')
    """)
    
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'message': 'Роль назначена'}),
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
        SELECT role FROM users WHERE id = '{escape_sql(user_id)}'
    """)
    
    current_role = cur.fetchone()
    
    if not current_role:
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Пользователь не найден'}),
            'isBase64Encoded': False
        }
    
    cur.execute(f"""
        UPDATE users
        SET role = 'user'
        WHERE id = '{escape_sql(user_id)}'
    """)
    
    cur.execute(f"""
        INSERT INTO role_history (user_id, assigned_by, role, action)
        VALUES ('{escape_sql(user_id)}', '{escape_sql(admin_id)}', '{escape_sql(current_role[0])}', 'revoked')
    """)
    
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'message': 'Роль отозвана'}),
        'isBase64Encoded': False
    }

def get_staff(cur, conn) -> dict:
    """Получает список сотрудников"""
    
    cur.execute("""
        SELECT id, username, email, role, created_at
        FROM users
        WHERE role IN ('admin', 'founder', 'organizer')
        ORDER BY role, username
    """)
    
    staff = []
    for row in cur.fetchall():
        staff.append({
            'id': row[0],
            'username': row[1],
            'email': row[2],
            'role': row[3],
            'created_at': row[4].isoformat() if row[4] else None
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
        FROM role_history rh
        JOIN users u1 ON rh.user_id = u1.id
        JOIN users u2 ON rh.assigned_by = u2.id
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
        INSERT INTO discussions (title, content, category, author_id)
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
    
    discussion_id = body.get('discussion_id')
    content = body.get('content')
    
    cur.execute(f"""
        SELECT locked FROM discussions WHERE id = {int(discussion_id)}
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
    
    cur.execute(f"""
        INSERT INTO discussion_comments (discussion_id, author_id, content)
        VALUES ({int(discussion_id)}, '{escape_sql(admin_id)}', '{escape_sql(content)}')
        RETURNING id
    """)
    
    comment_id = cur.fetchone()[0]
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'message': 'Комментарий добавлен', 'comment_id': comment_id}),
        'isBase64Encoded': False
    }

def get_discussions(cur, conn) -> dict:
    """Получает список обсуждений"""
    
    cur.execute("""
        SELECT d.id, d.title, d.content, d.category, d.author_id, u.username, d.locked, d.pinned, d.created_at
        FROM discussions d
        JOIN users u ON d.author_id = u.id
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
            'author_username': row[5],
            'locked': row[6],
            'pinned': row[7],
            'created_at': row[8].isoformat() if row[8] else None
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
        SELECT d.id, d.title, d.content, d.category, d.author_id, u.username, d.locked, d.pinned, d.created_at
        FROM discussions d
        JOIN users u ON d.author_id = u.id
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
        'author_username': row[5],
        'locked': row[6],
        'pinned': row[7],
        'created_at': row[8].isoformat() if row[8] else None
    }
    
    cur.execute(f"""
        SELECT dc.id, dc.author_id, u.username, dc.content, dc.created_at
        FROM discussion_comments dc
        JOIN users u ON dc.author_id = u.id
        WHERE dc.discussion_id = {int(discussion_id)}
        ORDER BY dc.created_at
    """)
    
    comments = []
    for row in cur.fetchall():
        comments.append({
            'id': row[0],
            'author_id': row[1],
            'author_username': row[2],
            'content': row[3],
            'created_at': row[4].isoformat() if row[4] else None
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
        DELETE FROM discussions WHERE id = {int(discussion_id)}
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
        INSERT INTO news (title, content, category, author_id, image_url)
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
        DELETE FROM tournaments WHERE id = {int(tournament_id)}
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
        FROM tournaments t
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
    
    registration_id = body.get('registration_id')
    approved = body.get('approved', True)
    
    status = 'approved' if approved else 'rejected'
    
    cur.execute(f"""
        UPDATE tournament_registrations
        SET status = '{escape_sql(status)}'
        WHERE id = {int(registration_id)}
    """)
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'message': f'Регистрация {status}'}),
        'isBase64Encoded': False
    }

def get_moderation_logs(cur, conn):
    """Получение всех логов модерации"""
    cur.execute("""
        SELECT al.id, al.action_type, al.target_user_id, u.username as target_username,
               al.admin_id, a.username as admin_username, al.reason, al.created_at
        FROM admin_action_logs al
        LEFT JOIN users u ON al.target_user_id = u.id
        LEFT JOIN users a ON al.admin_id = a.id
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
        LEFT JOIN users u ON b.user_id = u.id
        LEFT JOIN users a ON b.banned_by = a.id
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
        LEFT JOIN users u ON m.user_id = u.id
        LEFT JOIN users a ON m.muted_by = a.id
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