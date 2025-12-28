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
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'message': 'Пользователь забанен'}),
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
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'message': 'Мут выдан'}),
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
    
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'message': 'Бан снят'}),
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
    
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'message': 'Мут снят'}),
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
    
    cur.execute("""
        INSERT INTO tournaments (name, description, prize_pool, location, game_project, map_pool, format, team_size, best_of, start_date, status, created_by)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'upcoming', %s)
        RETURNING id
    """, (name, description, prize_pool, location, game_project, json.dumps(map_pool), format_type, team_size, best_of, start_date, admin_id))
    
    tournament_id = cur.fetchone()[0]
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'tournament_id': tournament_id}),
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