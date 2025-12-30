import json
import os
import psycopg2
import base64
import random
import math
from datetime import datetime
from psycopg2.extras import RealDictCursor
from rating_system import update_team_rating_after_match

def handler(event: dict, context) -> dict:
    '''API для работы с командами, турнирами, новостями и матчами'''
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Session-Token, X-User-Id'
            },
            'body': '',
            'isBase64Encoded': False
        }

    try:
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'GET':
            path = event.get('queryStringParameters', {})
            resource = path.get('resource', 'teams')
            
            if resource == 'tournaments':
                return get_tournaments(cur, conn, path)
            elif resource == 'news':
                return get_news(cur, conn, path)
            elif resource == 'matches' and path.get('tournament_id'):
                return get_tournament_matches(cur, conn, path)
            elif path.get('match_id'):
                return get_match_details(cur, conn, event)
            else:
                return get_verified_teams(cur, conn)
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            
            if action == 'create_team':
                return create_team(cur, conn, body, event)
            elif action == 'invite_player':
                return invite_player(cur, conn, body, event)
            elif action == 'respond_invitation':
                return respond_invitation(cur, conn, body, event)
            elif action == 'get_invitations':
                return get_invitations(cur, conn, event)
            elif action == 'get_user_teams':
                return get_user_teams(cur, conn, body)
            elif action == 'search_users':
                return search_users(cur, conn, body)
            elif action == 'register_tournament':
                return register_tournament(cur, conn, body, event)
            elif action == 'get_bracket':
                return get_bracket(cur, conn, body)
            elif action == 'generate_bracket':
                return generate_bracket(cur, conn, body, event)
            elif action == 'upload_screenshot':
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

def get_verified_teams(cur, conn) -> dict:
    '''Получение всех верифицированных команд с их составами'''
    try:
        # Простой запрос без сложных вычислений
        cur.execute("""
            SELECT 
                id,
                name,
                tag,
                logo_url,
                wins,
                losses,
                draws,
                rating,
                verified,
                description,
                created_at,
                level,
                points,
                team_color
            FROM t_p4831367_esport_gta_disaster.teams
            ORDER BY rating DESC, level DESC NULLS LAST
        """)
        team_rows = cur.fetchall()
        
        teams = []
        for row in team_rows:
            # Безопасное получение значений с дефолтами
            wins = row.get('wins') or 0
            losses = row.get('losses') or 0
            win_rate = round((wins / (wins + losses) * 100)) if (wins + losses) > 0 else 0
            
            team = {
                'id': row.get('id'),
                'name': row.get('name'),
                'tag': row.get('tag'),
                'logo_url': row.get('logo_url'),
                'wins': wins,
                'losses': losses,
                'draws': row.get('draws') or 0,
                'rating': row.get('rating') or 1000,
                'verified': row.get('verified') or False,
                'description': row.get('description'),
                'created_at': row['created_at'].isoformat() if row.get('created_at') else None,
                'level': row.get('level') or 2,
                'points': row.get('points') or 200,
                'team_color': row.get('team_color') or '#FFFFFF',
                'win_rate': win_rate
            }
            
            # Получаем членов команды
            try:
                cur.execute("""
                    SELECT 
                        tm.id,
                        tm.user_id,
                        tm.player_role as member_role,
                        tm.joined_at,
                        u.nickname,
                        u.avatar_url
                    FROM t_p4831367_esport_gta_disaster.team_members tm
                    JOIN t_p4831367_esport_gta_disaster.users u ON tm.user_id = u.id
                    WHERE tm.team_id = %s
                    ORDER BY tm.is_captain DESC, tm.joined_at ASC
                """, (team['id'],))
                
                members = []
                for m_row in cur.fetchall():
                    members.append({
                        'id': m_row.get('id'),
                        'user_id': m_row.get('user_id'),
                        'member_role': m_row.get('member_role'),
                        'joined_at': m_row['joined_at'].isoformat() if m_row.get('joined_at') else None,
                        'nickname': m_row.get('nickname'),
                        'avatar_url': m_row.get('avatar_url')
                    })
                
                team['members'] = members
                team['member_count'] = len(members)
            except Exception as member_error:
                # Если ошибка при получении членов, просто ставим пустой список
                team['members'] = []
                team['member_count'] = 0
            
            teams.append(team)
        
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
        return error_response(f'Error in get_verified_teams: {str(e)}', 500)

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
        SELECT u.id, u.role FROM t_p4831367_esport_gta_disaster.users u
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
        SELECT COUNT(*) FROM match_screenshots
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
        JOIN sessions s ON u.id = s.user_id
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
        JOIN teams t1 ON bm.team1_id = t1.id
        JOIN teams t2 ON bm.team2_id = t2.id
        WHERE bm.id = %s
    """, (match_id,))
    
    match = cur.fetchone()
    
    if not match:
        return error_response('Матч не найден', 404)
    
    team1_id, team2_id, captain1_id, captain2_id, team1_confirmed, team2_confirmed, team1_score, team2_score = match
    
    if user_id == captain1_id:
        cur.execute("""
            UPDATE bracket_matches
            SET team1_captain_confirmed = TRUE, status = 'in_progress'
            WHERE id = %s
        """, (match_id,))
        team1_confirmed = True
    elif user_id == captain2_id:
        cur.execute("""
            UPDATE bracket_matches
            SET team2_captain_confirmed = TRUE, status = 'in_progress'
            WHERE id = %s
        """, (match_id,))
        team2_confirmed = True
    else:
        return error_response('Вы не капитан ни одной из команд', 403)
    
    if team1_confirmed and team2_confirmed:
        winner_id = team1_id if team1_score > team2_score else team2_id
        loser_id = team2_id if winner_id == team1_id else team1_id
        
        cur.execute("""
            UPDATE t_p4831367_esport_gta_disaster.bracket_matches
            SET winner_id = %s, status = 'completed', completed_at = NOW()
            WHERE id = %s
        """, (winner_id, match_id))
        
        # Обновляем рейтинг команд по новой системе
        try:
            rating_update = update_team_rating_after_match(cur, conn, winner_id, loser_id)
        except Exception as e:
            conn.rollback()
            return error_response(f'Ошибка обновления рейтинга: {str(e)}', 500)
    
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
        JOIN sessions s ON u.id = s.user_id
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
        JOIN teams t1 ON bm.team1_id = t1.id
        JOIN teams t2 ON bm.team2_id = t2.id
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
        UPDATE bracket_matches
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
        JOIN sessions s ON u.id = s.user_id
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
            UPDATE bracket_matches
            SET moderator_verified = TRUE
            WHERE id = %s
        """, (match_id,))
    elif action == 'dispute':
        cur.execute("""
            UPDATE bracket_matches
            SET status = 'disputed', team1_captain_confirmed = FALSE, team2_captain_confirmed = FALSE
            WHERE id = %s
        """, (match_id,))
    elif action == 'force_complete':
        winner_id = body.get('winner_id')
        if not winner_id:
            return error_response('Укажите winner_id', 400)
        
        # Получаем информацию о матче
        cur.execute("""
            SELECT team1_id, team2_id FROM t_p4831367_esport_gta_disaster.bracket_matches
            WHERE id = %s
        """, (match_id,))
        match_info = cur.fetchone()
        
        if not match_info:
            return error_response('Матч не найден', 404)
        
        team1_id, team2_id = match_info
        loser_id = team2_id if winner_id == team1_id else team1_id
        
        # Обновляем результат матча
        cur.execute("""
            UPDATE t_p4831367_esport_gta_disaster.bracket_matches
            SET winner_id = %s, status = 'completed', moderator_verified = TRUE, completed_at = NOW()
            WHERE id = %s
        """, (winner_id, match_id))
        
        # Обновляем рейтинг команд
        try:
            rating_update = update_team_rating_after_match(cur, conn, winner_id, loser_id)
        except Exception as e:
            conn.rollback()
            return error_response(f'Ошибка обновления рейтинга: {str(e)}', 500)
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
        JOIN sessions s ON u.id = s.user_id
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
            UPDATE bracket_matches
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
                UPDATE bracket_matches
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
        JOIN sessions s ON u.id = s.user_id
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
        SELECT referee_id FROM bracket_matches
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
        UPDATE bracket_matches
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

def get_tournaments(cur, conn, params: dict) -> dict:
    '''Получение списка турниров или детальной информации'''
    tournament_id = params.get('id')
    
    if tournament_id:
        cur.execute("""
            SELECT t.id, t.name, t.description, t.start_date, t.end_date, 
                   t.max_teams, t.registration_open, t.game_type, t.prize_pool,
                   t.rules, t.created_at,
                   COUNT(tr.id) as registered_teams
            FROM t_p4831367_esport_gta_disaster.tournaments t
            LEFT JOIN tournament_registrations tr ON t.id = tr.tournament_id AND tr.status = 'approved'
            WHERE t.id = %s
            GROUP BY t.id
        """, (tournament_id,))
        
        row = cur.fetchone()
        if not row:
            return error_response('Турнир не найден', 404)
        
        tournament = {
            'id': row['id'],
            'name': row['name'],
            'description': row['description'],
            'startDate': row['start_date'].isoformat() if row['start_date'] else None,
            'endDate': row['end_date'].isoformat() if row['end_date'] else None,
            'maxTeams': row['max_teams'],
            'registrationOpen': row['registration_open'],
            'gameType': row['game_type'],
            'prizePool': row['prize_pool'],
            'rules': row['rules'],
            'createdAt': row['created_at'].isoformat(),
            'registeredTeams': row['registered_teams']
        }
        
        cur.execute("""
            SELECT t.id, t.name, t.logo_url, t.tag
            FROM t_p4831367_esport_gta_disaster.tournament_registrations tr
            JOIN teams t ON tr.team_id = t.id
            WHERE tr.tournament_id = %s AND tr.status = 'approved'
        """, (tournament_id,))
        
        tournament['teams'] = [
            {'id': r['id'], 'name': r['name'], 'logo': r['logo_url'], 'tag': r['tag']}
            for r in cur.fetchall()
        ]
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(tournament),
            'isBase64Encoded': False
        }
    
    else:
        cur.execute("""
            SELECT t.id, t.name, t.description, t.start_date, t.game_type, 
                   t.prize_pool, t.max_teams, t.registration_open,
                   COUNT(tr.id) as registered_teams
            FROM t_p4831367_esport_gta_disaster.tournaments t
            LEFT JOIN tournament_registrations tr ON t.id = tr.tournament_id AND tr.status = 'approved'
            GROUP BY t.id
            ORDER BY t.start_date DESC
        """)
        
        tournaments = []
        for row in cur.fetchall():
            tournaments.append({
                'id': row['id'],
                'name': row['name'],
                'description': row['description'],
                'startDate': row['start_date'].isoformat() if row['start_date'] else None,
                'gameType': row['game_type'],
                'prizePool': row['prize_pool'],
                'maxTeams': row['max_teams'],
                'registrationOpen': row['registration_open'],
                'registeredTeams': row['registered_teams']
            })
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'tournaments': tournaments}),
            'isBase64Encoded': False
        }

def get_news(cur, conn, params: dict) -> dict:
    '''Получение списка новостей или детальной информации'''
    news_id = params.get('id')
    
    if news_id:
        cur.execute("""
            SELECT n.id, n.title, n.content, n.created_at, n.updated_at,
                   u.nickname as author_name
            FROM t_p4831367_esport_gta_disaster.news n
            LEFT JOIN users u ON n.author_id = u.id
            WHERE n.id = %s AND n.published = true
        """, (news_id,))
        
        row = cur.fetchone()
        if not row:
            return error_response('Новость не найдена', 404)
        
        news_item = {
            'id': row['id'],
            'title': row['title'],
            'content': row['content'],
            'createdAt': row['created_at'].isoformat() if row['created_at'] else None,
            'updatedAt': row['updated_at'].isoformat() if row['updated_at'] else None,
            'author': row['author_name'] or 'Администрация'
        }
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(news_item),
            'isBase64Encoded': False
        }
    
    else:
        limit = int(params.get('limit', 10))
        offset = int(params.get('offset', 0))
        
        cur.execute("""
            SELECT n.id, n.title, n.content, n.created_at, u.nickname as author_name
            FROM t_p4831367_esport_gta_disaster.news n
            LEFT JOIN users u ON n.author_id = u.id
            WHERE n.published = true
            ORDER BY n.created_at DESC
            LIMIT %s OFFSET %s
        """, (limit, offset))
        
        news_list = []
        for row in cur.fetchall():
            news_list.append({
                'id': row['id'],
                'title': row['title'],
                'excerpt': row['content'][:200] + '...' if len(row['content']) > 200 else row['content'],
                'createdAt': row['created_at'].isoformat() if row['created_at'] else None,
                'author': row['author_name'] or 'Администрация'
            })
        
        cur.execute("SELECT COUNT(*) as count FROM t_p4831367_esport_gta_disaster.news WHERE published = true")
        total = cur.fetchone()['count']
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'news': news_list,
                'total': total,
                'limit': limit,
                'offset': offset
            }),
            'isBase64Encoded': False
        }

def get_tournament_matches(cur, conn, params: dict) -> dict:
    '''Получение матчей турнира'''
    tournament_id = params.get('tournament_id')
    
    cur.execute("""
        SELECT m.id, m.team1_id, m.team2_id, 
               m.team1_score, m.team2_score, m.status, m.scheduled_time,
               m.match_number, m.round_name,
               t1.name as team1_name, t1.logo_url as team1_logo, t1.tag as team1_tag,
               t2.name as team2_name, t2.logo_url as team2_logo, t2.tag as team2_tag
        FROM t_p4831367_esport_gta_disaster.bracket_matches m
        LEFT JOIN teams t1 ON m.team1_id = t1.id
        LEFT JOIN teams t2 ON m.team2_id = t2.id
        WHERE m.tournament_id = %s
        ORDER BY m.match_number
    """, (tournament_id,))
    
    matches = []
    for row in cur.fetchall():
        matches.append({
            'id': row['id'],
            'team1': {
                'id': row['team1_id'],
                'name': row['team1_name'],
                'logo': row['team1_logo'],
                'tag': row['team1_tag'],
                'score': row['team1_score']
            },
            'team2': {
                'id': row['team2_id'],
                'name': row['team2_name'],
                'logo': row['team2_logo'],
                'tag': row['team2_tag'],
                'score': row['team2_score']
            },
            'status': row['status'],
            'scheduledTime': row['scheduled_time'].isoformat() if row['scheduled_time'] else None,
            'matchNumber': row['match_number'],
            'roundName': row['round_name']
        })
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'matches': matches}),
        'isBase64Encoded': False
    }

def error_response(message: str, status: int) -> dict:
    '''Формирование ответа с ошибкой'''
    return {
        'statusCode': status,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': message}),
        'isBase64Encoded': False
    }

def create_team(cur, conn, body: dict, event: dict) -> dict:
    '''Создание новой команды'''
    user_id = event.get('headers', {}).get('X-User-Id') or event.get('headers', {}).get('x-user-id')
    
    if not user_id:
        return error_response('Требуется авторизация', 401)
    
    cur.execute("SELECT COUNT(*) FROM t_p4831367_esport_gta_disaster.team_members WHERE user_id = %s AND status = 'active'", (user_id,))
    team_count = cur.fetchone()[0]
    
    if team_count >= 3:
        return error_response('Вы не можете состоять более чем в 3 командах', 403)
    
    name = body.get('name', '').strip()
    tag = body.get('tag', '').strip()
    description = body.get('description', '').strip()
    players = body.get('players', [])
    
    if not name:
        return error_response('Название команды обязательно', 400)
    
    if len(players) > 7:
        return error_response('Максимум 7 игроков (5 основных + 2 запасных)', 400)
    
    cur.execute("SELECT id FROM t_p4831367_esport_gta_disaster.teams WHERE name = %s", (name,))
    if cur.fetchone():
        return error_response('Команда с таким названием уже существует', 400)
    
    cur.execute("""
        INSERT INTO t_p4831367_esport_gta_disaster.teams 
        (name, tag, description, captain_id, rating, wins, losses, draws, verified, created_at)
        VALUES (%s, %s, %s, %s, 1000, 0, 0, 0, TRUE, NOW())
        RETURNING id
    """, (name, tag, description, user_id))
    
    team_id = cur.fetchone()[0]
    
    cur.execute("""
        INSERT INTO t_p4831367_esport_gta_disaster.team_members 
        (team_id, user_id, player_role, is_captain, status, joined_at)
        VALUES (%s, %s, 'main', TRUE, 'active', NOW())
    """, (team_id, user_id))
    
    for idx, player in enumerate(players[:7]):
        if player.get('user_id') and player['user_id'] != int(user_id):
            role = 'reserve' if idx >= 5 else 'main'
            
            cur.execute("""
                INSERT INTO t_p4831367_esport_gta_disaster.team_invitations 
                (team_id, inviter_id, invited_user_id, player_role, status, created_at)
                VALUES (%s, %s, %s, %s, 'pending', NOW())
                ON CONFLICT (team_id, invited_user_id) DO NOTHING
            """, (team_id, user_id, player['user_id'], role))
    
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'team_id': team_id, 'message': f'Команда "{name}" создана'}),
        'isBase64Encoded': False
    }

def invite_player(cur, conn, body: dict, event: dict) -> dict:
    '''Приглашение игрока в команду'''
    user_id = event.get('headers', {}).get('X-User-Id') or event.get('headers', {}).get('x-user-id')
    
    if not user_id:
        return error_response('Требуется авторизация', 401)
    
    team_id = body.get('team_id')
    invited_user_id = body.get('invited_user_id')
    player_role = body.get('player_role', 'main')
    
    if not team_id or not invited_user_id:
        return error_response('Укажите команду и пользователя', 400)
    
    cur.execute("""
        SELECT captain_id FROM t_p4831367_esport_gta_disaster.teams 
        WHERE id = %s
    """, (team_id,))
    
    team = cur.fetchone()
    if not team:
        return error_response('Команда не найдена', 404)
    
    if team[0] != int(user_id):
        return error_response('Только капитан может приглашать игроков', 403)
    
    cur.execute("SELECT COUNT(*) FROM t_p4831367_esport_gta_disaster.team_members WHERE user_id = %s AND status = 'active'", (invited_user_id,))
    team_count = cur.fetchone()[0]
    
    if team_count >= 3:
        return error_response('Этот игрок уже состоит в 3 командах', 403)
    
    cur.execute("""
        INSERT INTO t_p4831367_esport_gta_disaster.team_invitations 
        (team_id, inviter_id, invited_user_id, player_role, status, created_at)
        VALUES (%s, %s, %s, %s, 'pending', NOW())
        ON CONFLICT (team_id, invited_user_id) DO UPDATE SET status = 'pending', created_at = NOW()
        RETURNING id
    """, (team_id, user_id, invited_user_id, player_role))
    
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'message': 'Приглашение отправлено'}),
        'isBase64Encoded': False
    }

def respond_invitation(cur, conn, body: dict, event: dict) -> dict:
    '''Ответ на приглашение в команду'''
    user_id = event.get('headers', {}).get('X-User-Id') or event.get('headers', {}).get('x-user-id')
    
    if not user_id:
        return error_response('Требуется авторизация', 401)
    
    invitation_id = body.get('invitation_id')
    accept = body.get('accept', False)
    
    if not invitation_id:
        return error_response('Укажите приглашение', 400)
    
    cur.execute("""
        SELECT team_id, invited_user_id, player_role 
        FROM t_p4831367_esport_gta_disaster.team_invitations 
        WHERE id = %s AND invited_user_id = %s AND status = 'pending'
    """, (invitation_id, user_id))
    
    invitation = cur.fetchone()
    if not invitation:
        return error_response('Приглашение не найдено', 404)
    
    team_id, invited_user, role = invitation
    
    if accept:
        cur.execute("SELECT COUNT(*) FROM t_p4831367_esport_gta_disaster.team_members WHERE user_id = %s AND status = 'active'", (user_id,))
        team_count = cur.fetchone()[0]
        
        if team_count >= 3:
            return error_response('Вы уже состоите в 3 командах', 403)
        
        cur.execute("""
            INSERT INTO t_p4831367_esport_gta_disaster.team_members 
            (team_id, user_id, player_role, is_captain, status, joined_at)
            VALUES (%s, %s, %s, FALSE, 'active', NOW())
        """, (team_id, user_id, role))
        
        cur.execute("""
            UPDATE t_p4831367_esport_gta_disaster.team_invitations 
            SET status = 'accepted', responded_at = NOW() 
            WHERE id = %s
        """, (invitation_id,))
        
        message = 'Вы вступили в команду'
    else:
        cur.execute("""
            UPDATE t_p4831367_esport_gta_disaster.team_invitations 
            SET status = 'declined', responded_at = NOW() 
            WHERE id = %s
        """, (invitation_id,))
        
        message = 'Приглашение отклонено'
    
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'message': message}),
        'isBase64Encoded': False
    }

def get_invitations(cur, conn, event: dict) -> dict:
    '''Получение приглашений пользователя'''
    user_id = event.get('headers', {}).get('X-User-Id') or event.get('headers', {}).get('x-user-id')
    
    if not user_id:
        return error_response('Требуется авторизация', 401)
    
    cur.execute("""
        SELECT 
            i.id,
            i.team_id,
            t.name as team_name,
            t.tag,
            t.logo_url,
            u.nickname as inviter_name,
            i.player_role,
            i.created_at,
            i.status
        FROM t_p4831367_esport_gta_disaster.team_invitations i
        JOIN t_p4831367_esport_gta_disaster.teams t ON i.team_id = t.id
        JOIN t_p4831367_esport_gta_disaster.users u ON i.inviter_id = u.id
        WHERE i.invited_user_id = %s
        ORDER BY i.created_at DESC
        LIMIT 50
    """, (user_id,))
    
    invitations = []
    for row in cur.fetchall():
        invitations.append({
            'id': row[0],
            'team_id': row[1],
            'team_name': row[2],
            'tag': row[3],
            'logo_url': row[4],
            'inviter_name': row[5],
            'player_role': row[6],
            'created_at': row[7].isoformat() if row[7] else None,
            'status': row[8]
        })
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'invitations': invitations}),
        'isBase64Encoded': False
    }

def get_user_teams(cur, conn, event: dict) -> dict:
    '''Получение команд пользователя'''
    user_id = event.get('headers', {}).get('X-User-Id') or event.get('headers', {}).get('x-user-id')
    
    if not user_id:
        return error_response('Требуется авторизация', 401)
    
    cur.execute("""
        SELECT 
            t.id,
            t.name,
            t.tag,
            t.logo_url,
            t.rating,
            t.wins,
            t.losses,
            t.draws,
            tm.is_captain,
            tm.player_role
        FROM t_p4831367_esport_gta_disaster.team_members tm
        JOIN t_p4831367_esport_gta_disaster.teams t ON tm.team_id = t.id
        WHERE tm.user_id = %s AND tm.status = 'active'
        ORDER BY tm.is_captain DESC, tm.joined_at DESC
    """, (user_id,))
    
    teams = []
    for row in cur.fetchall():
        teams.append({
            'id': row[0],
            'name': row[1],
            'tag': row[2],
            'logo_url': row[3],
            'rating': row[4],
            'wins': row[5],
            'losses': row[6],
            'draws': row[7],
            'is_captain': row[8],
            'player_role': row[9]
        })
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'teams': teams}),
        'isBase64Encoded': False
    }

def search_users(cur, conn, body: dict) -> dict:
    '''Поиск пользователей по никнейму'''
    query = body.get('query', '').strip()
    
    if len(query) < 2:
        return error_response('Минимум 2 символа для поиска', 400)
    
    cur.execute("""
        SELECT id, nickname, avatar_url, rating
        FROM t_p4831367_esport_gta_disaster.users
        WHERE nickname ILIKE %s
        ORDER BY rating DESC
        LIMIT 20
    """, (f'%{query}%',))
    
    users = []
    for row in cur.fetchall():
        users.append({
            'id': row['id'],
            'nickname': row['nickname'],
            'avatar_url': row['avatar_url'],
            'rating': row['rating'] or 1000
        })
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'users': users}),
        'isBase64Encoded': False
    }

def register_tournament(cur, conn, body: dict, event: dict) -> dict:
    '''Регистрация команды на турнир с выбором 5 основных + 2 запасных игроков'''
    user_id = event.get('headers', {}).get('X-User-Id') or event.get('headers', {}).get('x-user-id')
    
    if not user_id:
        return error_response('Требуется авторизация', 401)
    
    tournament_id = body.get('tournament_id')
    team_id = body.get('team_id')
    main_players = body.get('main_players', [])
    reserve_players = body.get('reserve_players', [])
    
    if not tournament_id or not team_id:
        return error_response('Укажите турнир и команду', 400)
    
    if len(main_players) < 1 or len(main_players) > 5:
        return error_response('Необходимо выбрать от 1 до 5 основных игроков', 400)
    
    if len(reserve_players) > 2:
        return error_response('Можно выбрать максимум 2 запасных игрока', 400)
    
    cur.execute("""
        SELECT captain_id FROM t_p4831367_esport_gta_disaster.teams 
        WHERE id = %s
    """, (team_id,))
    
    team = cur.fetchone()
    if not team:
        return error_response('Команда не найдена', 404)
    
    if team[0] != int(user_id):
        return error_response('Только капитан может регистрировать команду', 403)
    
    cur.execute("""
        SELECT is_started FROM t_p4831367_esport_gta_disaster.tournaments 
        WHERE id = %s
    """, (tournament_id,))
    
    tournament = cur.fetchone()
    if not tournament:
        return error_response('Турнир не найден', 404)
    
    if tournament[0]:
        return error_response('Регистрация на турнир закрыта (турнир начат)', 403)
    
    for player_id in main_players + reserve_players:
        cur.execute("""
            SELECT COUNT(*) FROM t_p4831367_esport_gta_disaster.team_members 
            WHERE team_id = %s AND user_id = %s AND status = 'active'
        """, (team_id, player_id))
        
        if cur.fetchone()[0] == 0:
            return error_response(f'Игрок {player_id} не состоит в команде', 400)
    
    cur.execute("""
        INSERT INTO t_p4831367_esport_gta_disaster.tournament_registrations 
        (tournament_id, team_id, approved, registered_at, main_players, reserve_players)
        VALUES (%s, %s, FALSE, NOW(), %s, %s)
        ON CONFLICT (tournament_id, team_id) DO UPDATE
        SET main_players = EXCLUDED.main_players,
            reserve_players = EXCLUDED.reserve_players,
            registered_at = NOW()
        RETURNING id
    """, (tournament_id, team_id, json.dumps(main_players), json.dumps(reserve_players)))
    
    result = cur.fetchone()
    if not result:
        return error_response('Ошибка регистрации', 500)
    
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'message': 'Заявка на участие отправлена'}),
        'isBase64Encoded': False
    }

def get_bracket(cur, conn, body: dict) -> dict:
    '''Получение турнирной сетки'''
    tournament_id = body.get('tournament_id')
    
    if not tournament_id:
        return error_response('Укажите турнир', 400)
    
    cur.execute("""
        SELECT 
            m.id,
            m.team1_id,
            m.team2_id,
            m.team1_score,
            m.team2_score,
            m.status,
            m.scheduled_at,
            m.match_number,
            m.stage_id,
            m.winner_id,
            m.next_match_id,
            t1.name as team1_name,
            t1.logo_url as team1_logo,
            t2.name as team2_name,
            t2.logo_url as team2_logo,
            bs.stage_name,
            bs.stage_order
        FROM t_p4831367_esport_gta_disaster.matches m
        LEFT JOIN t_p4831367_esport_gta_disaster.teams t1 ON m.team1_id = t1.id
        LEFT JOIN t_p4831367_esport_gta_disaster.teams t2 ON m.team2_id = t2.id
        LEFT JOIN t_p4831367_esport_gta_disaster.bracket_stages bs ON m.stage_id = bs.id
        WHERE m.tournament_id = %s
        ORDER BY bs.stage_order, m.match_number
    """, (tournament_id,))
    
    matches = []
    for row in cur.fetchall():
        matches.append({
            'id': row[0],
            'team1_id': row[1],
            'team2_id': row[2],
            'team1_score': row[3],
            'team2_score': row[4],
            'status': row[5],
            'scheduled_at': row[6].isoformat() if row[6] else None,
            'match_number': row[7],
            'stage_id': row[8],
            'winner_id': row[9],
            'next_match_id': row[10],
            'team1_name': row[11],
            'team1_logo': row[12],
            'team2_name': row[13],
            'team2_logo': row[14],
            'stage_name': row[15],
            'stage_order': row[16]
        })
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'matches': matches}),
        'isBase64Encoded': False
    }

def generate_bracket(cur, conn, body: dict, event: dict) -> dict:
    '''Генерация турнирной сетки'''
    user_id = event.get('headers', {}).get('X-User-Id') or event.get('headers', {}).get('x-user-id')
    
    if not user_id:
        return error_response('Требуется авторизация', 401)
    
    cur.execute("SELECT role FROM t_p4831367_esport_gta_disaster.users WHERE id = %s", (user_id,))
    user_role = cur.fetchone()
    
    if not user_role or user_role[0] not in ['founder', 'organizer', 'admin']:
        return error_response('Недостаточно прав', 403)
    
    tournament_id = body.get('tournament_id')
    
    if not tournament_id:
        return error_response('Укажите турнир', 400)
    
    cur.execute("""
        SELECT team_id FROM t_p4831367_esport_gta_disaster.tournament_registrations 
        WHERE tournament_id = %s AND approved = TRUE
        ORDER BY registered_at
    """, (tournament_id,))
    
    teams = [row[0] for row in cur.fetchall()]
    
    if len(teams) < 2:
        return error_response('Недостаточно команд для создания сетки', 400)
    
    import math
    bracket_size = 2 ** math.ceil(math.log2(len(teams)))
    
    stages = []
    current_size = bracket_size
    stage_num = 1
    
    while current_size >= 2:
        stage_name = {
            2: 'Финал',
            4: 'Полуфинал',
            8: 'Четвертьфинал',
            16: '1/8 финала',
            32: '1/16 финала'
        }.get(current_size, f'Раунд {stage_num}')
        
        cur.execute("""
            INSERT INTO t_p4831367_esport_gta_disaster.bracket_stages 
            (tournament_id, stage_name, stage_order, best_of)
            VALUES (%s, %s, %s, 1)
            RETURNING id
        """, (tournament_id, stage_name, stage_num))
        
        stages.append({'id': cur.fetchone()[0], 'name': stage_name, 'matches': current_size // 2})
        current_size //= 2
        stage_num += 1
    
    stages.reverse()
    
    random.shuffle(teams)
    teams += [None] * (bracket_size - len(teams))
    
    match_id_map = {}
    
    for stage_idx, stage in enumerate(stages):
        matches_in_stage = stage['matches']
        
        for match_num in range(matches_in_stage):
            if stage_idx == 0:
                team1_idx = match_num * 2
                team2_idx = match_num * 2 + 1
                team1_id = teams[team1_idx]
                team2_id = teams[team2_idx]
            else:
                team1_id = None
                team2_id = None
            
            next_match_num = match_num // 2 if stage_idx < len(stages) - 1 else None
            
            cur.execute("""
                INSERT INTO t_p4831367_esport_gta_disaster.matches 
                (tournament_id, team1_id, team2_id, status, stage_id, match_number, team1_score, team2_score)
                VALUES (%s, %s, %s, 'pending', %s, %s, 0, 0)
                RETURNING id
            """, (tournament_id, team1_id, team2_id, stage['id'], match_num + 1))
            
            match_id = cur.fetchone()[0]
            match_id_map[(stage_idx, match_num)] = match_id
            
            if next_match_num is not None and (stage_idx + 1, next_match_num) in match_id_map:
                next_match_id = match_id_map[(stage_idx + 1, next_match_num)]
                cur.execute("""
                    UPDATE t_p4831367_esport_gta_disaster.matches 
                    SET next_match_id = %s 
                    WHERE id = %s
                """, (next_match_id, match_id))
    
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'message': 'Турнирная сетка сгенерирована', 'teams_count': len([t for t in teams if t])}),
        'isBase64Encoded': False
    }