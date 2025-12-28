import json
import os
import psycopg2
import base64
import random
from datetime import datetime
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    '''API для работы с командами и матчами: получение команд, управление матчами, загрузка скриншотов'''
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Session-Token'
            },
            'body': '',
            'isBase64Encoded': False
        }

    try:
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        
        if method == 'GET':
            path = event.get('queryStringParameters', {})
            if path.get('match_id'):
                return get_match_details(cur, conn, event)
            else:
                return get_verified_teams(conn)
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            
            if action == 'upload_screenshot':
                return upload_screenshot(cur, conn, body, event)
            elif action == 'confirm_result':
                return confirm_result(cur, conn, body, event)
            elif action == 'update_score':
                return update_score(cur, conn, body, event)
            elif action == 'moderate_match':
                return moderate_match(cur, conn, body, event)
            elif action == 'assign_referee':
                return assign_referee(cur, conn, body, event)
            elif action == 'nullify_match':
                return nullify_match(cur, conn, body, event)
            else:
                return error_response('Неизвестное действие', 400)
        
        cur.close()
        conn.close()
        return error_response('Метод не поддерживается', 405)
    
    except Exception as e:
        return error_response(str(e), 500)

def get_verified_teams(conn) -> dict:
    '''Получение всех верифицированных команд с их составами'''
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("""
                SELECT 
                    t.id,
                    t.name,
                    t.tag,
                    t.logo_url,
                    t.wins,
                    t.losses,
                    t.draws,
                    t.rating,
                    t.verified,
                    t.description,
                    t.created_at,
                    COALESCE(t.level, 2) as level,
                    COALESCE(t.xp, 100) as xp,
                    COALESCE(t.team_color, '#FFFFFF') as team_color,
                    CASE 
                        WHEN (t.wins + t.losses) > 0 THEN ROUND((t.wins::decimal / (t.wins + t.losses)) * 100)
                        ELSE 0 
                    END as win_rate
                FROM t_p4831367_esport_gta_disaster.teams t
                ORDER BY t.rating DESC, t.level DESC
            """)
            teams = cursor.fetchall()
            
            for team in teams:
                cursor.execute("""
                    SELECT 
                        tm.id,
                        tm.user_id,
                        tm.role as member_role,
                        tm.joined_at,
                        u.nickname,
                        u.avatar_url
                    FROM t_p4831367_esport_gta_disaster.team_members tm
                    JOIN t_p4831367_esport_gta_disaster.users u ON tm.user_id = u.id
                    WHERE tm.team_id = %s
                    ORDER BY tm.joined_at ASC
                """, (team['id'],))
                team['members'] = cursor.fetchall()
                team['member_count'] = len(team['members'])
        
        for team in teams:
            if team.get('created_at'):
                team['created_at'] = team['created_at'].isoformat()
            for member in team.get('members', []):
                if member.get('joined_at'):
                    member['joined_at'] = member['joined_at'].isoformat()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'teams': teams,
                'total': len(teams)
            }),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return error_response(str(e), 500)

def get_match_details(cur, conn, event: dict) -> dict:
    '''Получение подробной информации о матче'''
    match_id = event.get('queryStringParameters', {}).get('match_id')
    
    if not match_id:
        return error_response('Укажите ID матча', 400)
    
    cur.execute("""
        SELECT 
            bm.id, bm.team1_id, bm.team2_id, bm.round, bm.match_order,
            bm.team1_score, bm.team2_score, bm.status, bm.match_details,
            bm.team1_captain_confirmed, bm.team2_captain_confirmed,
            bm.moderator_verified, bm.completed_at, bm.referee_id,
            t1.name as team1_name, t1.logo_url as team1_logo, t1.captain_id as team1_captain, t1.team_color as team1_color,
            t2.name as team2_name, t2.logo_url as team2_logo, t2.captain_id as team2_captain, t2.team_color as team2_color,
            u.nickname as referee_name
        FROM t_p4831367_esport_gta_disaster.bracket_matches bm
        LEFT JOIN t_p4831367_esport_gta_disaster.teams t1 ON bm.team1_id = t1.id
        LEFT JOIN t_p4831367_esport_gta_disaster.teams t2 ON bm.team2_id = t2.id
        LEFT JOIN t_p4831367_esport_gta_disaster.users u ON bm.referee_id = u.id
        WHERE bm.id = %s
    """, (match_id,))
    
    match = cur.fetchone()
    
    if not match:
        return error_response('Матч не найден', 404)
    
    cur.execute("""
        SELECT 
            ms.id, ms.team_id, ms.screenshot_url, ms.description, 
            ms.uploaded_at, u.nickname as uploaded_by_name,
            t.name as team_name
        FROM t_p4831367_esport_gta_disaster.match_screenshots ms
        JOIN t_p4831367_esport_gta_disaster.users u ON ms.uploaded_by = u.id
        JOIN t_p4831367_esport_gta_disaster.teams t ON ms.team_id = t.id
        WHERE ms.match_id = %s
        ORDER BY ms.uploaded_at DESC
    """, (match_id,))
    
    screenshots = cur.fetchall()
    
    cur.execute("""
        SELECT tm.user_id, u.nickname, u.avatar_url, tm.role
        FROM t_p4831367_esport_gta_disaster.team_members tm
        JOIN t_p4831367_esport_gta_disaster.users u ON tm.user_id = u.id
        WHERE tm.team_id = %s
    """, (match[1],))
    team1_members = cur.fetchall()
    
    cur.execute("""
        SELECT tm.user_id, u.nickname, u.avatar_url, tm.role
        FROM t_p4831367_esport_gta_disaster.team_members tm
        JOIN t_p4831367_esport_gta_disaster.users u ON tm.user_id = u.id
        WHERE tm.team_id = %s
    """, (match[2],))
    team2_members = cur.fetchall()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'match': {
                'id': match[0],
                'team1_id': match[1],
                'team2_id': match[2],
                'round': match[3],
                'match_order': match[4],
                'team1_score': match[5],
                'team2_score': match[6],
                'status': match[7],
                'match_details': match[8],
                'team1_captain_confirmed': match[9],
                'team2_captain_confirmed': match[10],
                'moderator_verified': match[11],
                'completed_at': match[12].isoformat() if match[12] else None,
                'referee_id': match[13],
                'team1': {
                    'name': match[14],
                    'logo_url': match[15],
                    'captain_id': match[16],
                    'color': match[17] or generate_random_color(),
                    'members': [{
                        'id': m[0],
                        'nickname': m[1],
                        'avatar_url': m[2],
                        'role': m[3]
                    } for m in team1_members]
                },
                'team2': {
                    'name': match[18],
                    'logo_url': match[19],
                    'captain_id': match[20],
                    'color': match[21] or generate_random_color(),
                    'members': [{
                        'id': m[0],
                        'nickname': m[1],
                        'avatar_url': m[2],
                        'role': m[3]
                    } for m in team2_members]
                },
                'referee': {
                    'id': match[13],
                    'nickname': match[22]
                } if match[13] else None
            },
            'screenshots': [{
                'id': s[0],
                'team_id': s[1],
                'screenshot_url': s[2],
                'description': s[3],
                'uploaded_at': s[4].isoformat() if s[4] else None,
                'uploaded_by_name': s[5],
                'team_name': s[6]
            } for s in screenshots]
        }),
        'isBase64Encoded': False
    }

def upload_screenshot(cur, conn, body: dict, event: dict) -> dict:
    '''Загрузка скриншота матча (только капитаны команд)'''
    session_token = event.get('headers', {}).get('X-Session-Token')
    
    if not session_token:
        return error_response('Требуется авторизация', 401)
    
    cur.execute("""
        SELECT u.id, u.role FROM users u
        JOIN sessions s ON u.id = s.user_id
        WHERE s.session_token = %s AND s.expires_at > NOW()
    """, (session_token,))
    
    user = cur.fetchone()
    
    if not user:
        return error_response('Сессия недействительна', 401)
    
    user_id = user[0]
    match_id = body.get('match_id')
    team_id = body.get('team_id')
    image_base64 = body.get('image')
    description = body.get('description', '')
    
    if not match_id or not team_id or not image_base64:
        return error_response('Укажите match_id, team_id и image', 400)
    
    cur.execute("""
        SELECT captain_id FROM t_p4831367_esport_gta_disaster.teams WHERE id = %s
    """, (team_id,))
    
    team = cur.fetchone()
    
    if not team:
        return error_response('Команда не найдена', 404)
    
    if team[0] != user_id:
        return error_response('Только капитан команды может загружать скриншоты', 403)
    
    cur.execute("""
        SELECT COUNT(*) FROM t_p4831367_esport_gta_disaster.match_screenshots
        WHERE match_id = %s AND team_id = %s
    """, (match_id, team_id))
    
    count = cur.fetchone()[0]
    
    if count >= 5:
        return error_response('Максимум 5 скриншотов на команду', 400)
    
    try:
        import boto3
        
        image_data = base64.b64decode(image_base64.split(',')[1] if ',' in image_base64 else image_base64)
        
        s3 = boto3.client('s3',
            endpoint_url='https://bucket.poehali.dev',
            aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
            aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
        )
        
        filename = f"match-screenshots/{match_id}/{team_id}/{datetime.now().timestamp()}.png"
        
        s3.put_object(
            Bucket='files',
            Key=filename,
            Body=image_data,
            ContentType='image/png'
        )
        
        cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{filename}"
        
        cur.execute("""
            INSERT INTO t_p4831367_esport_gta_disaster.match_screenshots 
            (match_id, team_id, uploaded_by, screenshot_url, description)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id
        """, (match_id, team_id, user_id, cdn_url, description))
        
        screenshot_id = cur.fetchone()[0]
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'screenshot_id': screenshot_id,
                'screenshot_url': cdn_url
            }),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return error_response(f'Ошибка загрузки: {str(e)}', 500)

def confirm_result(cur, conn, body: dict, event: dict) -> dict:
    '''Подтверждение результата матча капитаном'''
    session_token = event.get('headers', {}).get('X-Session-Token')
    
    if not session_token:
        return error_response('Требуется авторизация', 401)
    
    cur.execute("""
        SELECT u.id FROM t_p4831367_esport_gta_disaster.users u
        JOIN t_p4831367_esport_gta_disaster.sessions s ON u.id = s.user_id
        WHERE s.session_token = %s AND s.expires_at > NOW()
    """, (session_token,))
    
    user = cur.fetchone()
    
    if not user:
        return error_response('Сессия недействительна', 401)
    
    user_id = user[0]
    match_id = body.get('match_id')
    
    if not match_id:
        return error_response('Укажите match_id', 400)
    
    cur.execute("""
        SELECT bm.team1_id, bm.team2_id, t1.captain_id, t2.captain_id,
               bm.team1_captain_confirmed, bm.team2_captain_confirmed,
               bm.team1_score, bm.team2_score
        FROM t_p4831367_esport_gta_disaster.bracket_matches bm
        JOIN t_p4831367_esport_gta_disaster.teams t1 ON bm.team1_id = t1.id
        JOIN t_p4831367_esport_gta_disaster.teams t2 ON bm.team2_id = t2.id
        WHERE bm.id = %s
    """, (match_id,))
    
    match = cur.fetchone()
    
    if not match:
        return error_response('Матч не найден', 404)
    
    team1_id, team2_id, captain1_id, captain2_id, team1_confirmed, team2_confirmed, team1_score, team2_score = match
    
    if user_id == captain1_id:
        cur.execute("""
            UPDATE t_p4831367_esport_gta_disaster.bracket_matches
            SET team1_captain_confirmed = TRUE, status = 'in_progress'
            WHERE id = %s
        """, (match_id,))
        team1_confirmed = True
    elif user_id == captain2_id:
        cur.execute("""
            UPDATE t_p4831367_esport_gta_disaster.bracket_matches
            SET team2_captain_confirmed = TRUE, status = 'in_progress'
            WHERE id = %s
        """, (match_id,))
        team2_confirmed = True
    else:
        return error_response('Вы не капитан ни одной из команд', 403)
    
    if team1_confirmed and team2_confirmed:
        winner_id = team1_id if team1_score > team2_score else team2_id
        
        cur.execute("""
            UPDATE t_p4831367_esport_gta_disaster.bracket_matches
            SET winner_id = %s, status = 'completed', completed_at = NOW()
            WHERE id = %s
        """, (winner_id, match_id))
        
        cur.execute("""
            UPDATE t_p4831367_esport_gta_disaster.teams
            SET wins = wins + 1, rating = rating + 25
            WHERE id = %s
        """, (winner_id,))
        
        loser_id = team2_id if winner_id == team1_id else team1_id
        cur.execute("""
            UPDATE t_p4831367_esport_gta_disaster.teams
            SET losses = losses + 1, rating = rating - 15
            WHERE id = %s
        """, (loser_id,))
    
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'success': True,
            'both_confirmed': team1_confirmed and team2_confirmed
        }),
        'isBase64Encoded': False
    }

def update_score(cur, conn, body: dict, event: dict) -> dict:
    '''Обновление счета матча (капитаны или модераторы)'''
    session_token = event.get('headers', {}).get('X-Session-Token')
    
    if not session_token:
        return error_response('Требуется авторизация', 401)
    
    cur.execute("""
        SELECT u.id, u.role FROM t_p4831367_esport_gta_disaster.users u
        JOIN t_p4831367_esport_gta_disaster.sessions s ON u.id = s.user_id
        WHERE s.session_token = %s AND s.expires_at > NOW()
    """, (session_token,))
    
    user = cur.fetchone()
    
    if not user:
        return error_response('Сессия недействительна', 401)
    
    user_id, user_role = user
    match_id = body.get('match_id')
    team1_score = body.get('team1_score')
    team2_score = body.get('team2_score')
    
    if not match_id or team1_score is None or team2_score is None:
        return error_response('Укажите match_id, team1_score и team2_score', 400)
    
    cur.execute("""
        SELECT t1.captain_id, t2.captain_id
        FROM t_p4831367_esport_gta_disaster.bracket_matches bm
        JOIN t_p4831367_esport_gta_disaster.teams t1 ON bm.team1_id = t1.id
        JOIN t_p4831367_esport_gta_disaster.teams t2 ON bm.team2_id = t2.id
        WHERE bm.id = %s
    """, (match_id,))
    
    match = cur.fetchone()
    
    if not match:
        return error_response('Матч не найден', 404)
    
    captain1_id, captain2_id = match
    
    is_captain = user_id in [captain1_id, captain2_id]
    is_moderator = user_role in ['moderator', 'admin', 'founder']
    
    if not is_captain and not is_moderator:
        return error_response('Недостаточно прав', 403)
    
    cur.execute("""
        UPDATE t_p4831367_esport_gta_disaster.bracket_matches
        SET team1_score = %s, team2_score = %s
        WHERE id = %s
    """, (team1_score, team2_score, match_id))
    
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True}),
        'isBase64Encoded': False
    }

def moderate_match(cur, conn, body: dict, event: dict) -> dict:
    '''Модерация матча (только модераторы и выше)'''
    session_token = event.get('headers', {}).get('X-Session-Token')
    
    if not session_token:
        return error_response('Требуется авторизация', 401)
    
    cur.execute("""
        SELECT u.role FROM t_p4831367_esport_gta_disaster.users u
        JOIN t_p4831367_esport_gta_disaster.sessions s ON u.id = s.user_id
        WHERE s.session_token = %s AND s.expires_at > NOW()
    """, (session_token,))
    
    user = cur.fetchone()
    
    if not user:
        return error_response('Сессия недействительна', 401)
    
    user_role = user[0]
    
    if user_role not in ['moderator', 'admin', 'founder']:
        return error_response('Недостаточно прав', 403)
    
    match_id = body.get('match_id')
    action = body.get('moderator_action')
    
    if not match_id or not action:
        return error_response('Укажите match_id и moderator_action', 400)
    
    if action == 'verify':
        cur.execute("""
            UPDATE t_p4831367_esport_gta_disaster.bracket_matches
            SET moderator_verified = TRUE
            WHERE id = %s
        """, (match_id,))
    elif action == 'dispute':
        cur.execute("""
            UPDATE t_p4831367_esport_gta_disaster.bracket_matches
            SET status = 'disputed', team1_captain_confirmed = FALSE, team2_captain_confirmed = FALSE
            WHERE id = %s
        """, (match_id,))
    elif action == 'force_complete':
        winner_id = body.get('winner_id')
        if not winner_id:
            return error_response('Укажите winner_id', 400)
        
        cur.execute("""
            UPDATE t_p4831367_esport_gta_disaster.bracket_matches
            SET winner_id = %s, status = 'completed', moderator_verified = TRUE, completed_at = NOW()
            WHERE id = %s
        """, (winner_id, match_id))
    else:
        return error_response('Неизвестное действие модератора', 400)
    
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True}),
        'isBase64Encoded': False
    }

def assign_referee(cur, conn, body: dict, event: dict) -> dict:
    '''Назначение судьи на матч (автоматически или вручную)'''
    session_token = event.get('headers', {}).get('X-Session-Token')
    
    if not session_token:
        return error_response('Требуется авторизация', 401)
    
    cur.execute("""
        SELECT u.role FROM t_p4831367_esport_gta_disaster.users u
        JOIN t_p4831367_esport_gta_disaster.sessions s ON u.id = s.user_id
        WHERE s.session_token = %s AND s.expires_at > NOW()
    """, (session_token,))
    
    user = cur.fetchone()
    
    if not user:
        return error_response('Сессия недействительна', 401)
    
    user_role = user[0]
    
    if user_role not in ['moderator', 'admin', 'founder']:
        return error_response('Недостаточно прав', 403)
    
    match_id = body.get('match_id')
    referee_id = body.get('referee_id')
    
    if not match_id:
        return error_response('Укажите match_id', 400)
    
    if referee_id:
        cur.execute("""
            UPDATE t_p4831367_esport_gta_disaster.bracket_matches
            SET referee_id = %s
            WHERE id = %s
        """, (referee_id, match_id))
    else:
        cur.execute("""
            SELECT id FROM t_p4831367_esport_gta_disaster.users 
            WHERE role = 'referee'
            ORDER BY RANDOM()
            LIMIT 1
        """)
        referee = cur.fetchone()
        
        if referee:
            cur.execute("""
                UPDATE t_p4831367_esport_gta_disaster.bracket_matches
                SET referee_id = %s
                WHERE id = %s
            """, (referee[0], match_id))
    
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True}),
        'isBase64Encoded': False
    }

def nullify_match(cur, conn, body: dict, event: dict) -> dict:
    '''Аннулирование результата матча судьей'''
    session_token = event.get('headers', {}).get('X-Session-Token')
    
    if not session_token:
        return error_response('Требуется авторизация', 401)
    
    cur.execute("""
        SELECT u.id, u.role FROM t_p4831367_esport_gta_disaster.users u
        JOIN t_p4831367_esport_gta_disaster.sessions s ON u.id = s.user_id
        WHERE s.session_token = %s AND s.expires_at > NOW()
    """, (session_token,))
    
    user = cur.fetchone()
    
    if not user:
        return error_response('Сессия недействительна', 401)
    
    user_id, user_role = user
    match_id = body.get('match_id')
    
    if not match_id:
        return error_response('Укажите match_id', 400)
    
    cur.execute("""
        SELECT referee_id FROM t_p4831367_esport_gta_disaster.bracket_matches
        WHERE id = %s
    """, (match_id,))
    
    match = cur.fetchone()
    
    if not match:
        return error_response('Матч не найден', 404)
    
    is_referee = match[0] == user_id
    is_moderator = user_role in ['moderator', 'admin', 'founder']
    
    if not is_referee and not is_moderator:
        return error_response('Только судья матча или модератор может аннулировать результат', 403)
    
    cur.execute("""
        UPDATE t_p4831367_esport_gta_disaster.bracket_matches
        SET winner_id = NULL, 
            status = 'nullified',
            team1_captain_confirmed = FALSE, 
            team2_captain_confirmed = FALSE,
            moderator_verified = FALSE,
            completed_at = NULL
        WHERE id = %s
    """, (match_id,))
    
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'message': 'Результат матча аннулирован'}),
        'isBase64Encoded': False
    }

def generate_random_color() -> str:
    '''Генерация случайного hex цвета'''
    colors = [
        '#0D94E7', '#A855F7', '#10B981', '#F59E0B', '#EF4444',
        '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#06B6D4'
    ]
    return random.choice(colors)

def error_response(message: str, status: int) -> dict:
    '''Формирование ответа с ошибкой'''
    return {
        'statusCode': status,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': message}),
        'isBase64Encoded': False
    }