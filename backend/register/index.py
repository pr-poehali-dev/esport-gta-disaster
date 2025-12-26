import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    '''API для регистрации команд на турниры'''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id'
            },
            'body': ''
        }
    
    user_id = event.get('headers', {}).get('x-user-id') or event.get('headers', {}).get('X-User-Id')
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'User ID required'})
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    
    try:
        if method == 'GET':
            query_params = event.get('queryStringParameters', {}) or {}
            action = query_params.get('action')
            if action == 'all':
                return get_all_registrations(conn, user_id)
            elif action == 'teams':
                return get_user_teams(conn, user_id)
            else:
                return get_registrations(conn, user_id)
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            return register_team(conn, user_id, body)
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            return update_registration(conn, user_id, body)
        elif method == 'DELETE':
            query_params = event.get('queryStringParameters', {}) or {}
            tournament_name = query_params.get('tournament')
            return unregister_team(conn, user_id, tournament_name)
        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'})
            }
    finally:
        conn.close()


def get_registrations(conn, user_id: str) -> dict:
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute('''
            SELECT 
                tr.id, tr.tournament_name, tr.registered_at,
                tr.moderation_status, tr.moderation_comment,
                tr.discord_contact, tr.comment,
                t.id as team_id, t.name as team_name, t.logo_url,
                u.nickname as captain_nickname
            FROM tournament_registrations tr
            JOIN teams t ON tr.team_id = t.id
            JOIN users u ON t.captain_id = u.id
            WHERE tr.user_id = %s
            ORDER BY tr.registered_at DESC
        ''', (user_id,))
        
        registrations = cur.fetchall()
        
        result = []
        for reg in registrations:
            r = dict(reg)
            if r['registered_at']:
                r['registered_at'] = r['registered_at'].isoformat()
            result.append(r)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(result)
        }


def register_team(conn, user_id: str, data: dict) -> dict:
    tournament_name = data.get('tournament_name', '').strip()
    team_id = data.get('team_id')
    discord_contact = data.get('discord_contact', '').strip()
    comment = data.get('comment', '').strip()
    
    if not tournament_name:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Tournament name is required'})
        }
    
    if not team_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Team is required'})
        }
    
    if not discord_contact:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Discord contact is required'})
        }
    
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute('''
            SELECT t.id, t.name, 
                   (SELECT COUNT(*) FROM team_members WHERE team_id = t.id) as member_count
            FROM teams t
            WHERE t.id = %s AND (t.captain_id = %s OR EXISTS (
                SELECT 1 FROM team_members WHERE team_id = t.id AND user_id = %s
            ))
        ''', (team_id, user_id, user_id))
        team = cur.fetchone()
        
        if not team:
            return {
                'statusCode': 403,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'You are not a member of this team'})
            }
        
        if team['member_count'] < 5:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Team must have at least 5 members'})
            }
        
        cur.execute('''
            SELECT id FROM tournament_registrations 
            WHERE team_id = %s AND tournament_name = %s
        ''', (team_id, tournament_name))
        
        existing = cur.fetchone()
        if existing:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Team already registered for this tournament'})
            }
        
        cur.execute('''
            INSERT INTO tournament_registrations 
            (user_id, team_id, tournament_name, moderation_status, discord_contact, comment)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id, tournament_name, registered_at
        ''', (user_id, team_id, tournament_name, 'pending', discord_contact, comment))
        
        registration = cur.fetchone()
        
        cur.execute('''
            INSERT INTO user_achievements (user_id, achievement_code) 
            VALUES (%s, 'first_tournament')
            ON CONFLICT (user_id, achievement_code) DO NOTHING
        ''', (user_id,))
        
        cur.execute('''
            UPDATE users 
            SET user_status = 'Игрок', 
                achievement_points = achievement_points + 20,
                updated_at = NOW()
            WHERE id = %s 
            AND user_status = 'Новичок'
            AND NOT EXISTS (
                SELECT 1 FROM user_achievements 
                WHERE user_id = %s AND achievement_code = 'first_tournament'
            )
        ''', (user_id, user_id))
        
        conn.commit()
        
        result = dict(registration)
        result['registered_at'] = result['registered_at'].isoformat() if result['registered_at'] else None
        
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(result)
        }


def get_all_registrations(conn, user_id: str) -> dict:
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute('SELECT is_organizer, user_status FROM users WHERE id = %s', (user_id,))
        user = cur.fetchone()
        
        if not user or (not user['is_organizer'] and user['user_status'] not in ['Администратор', 'Главный администратор']):
            return {
                'statusCode': 403,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Access denied'})
            }
        
        cur.execute('''
            SELECT 
                tr.id, tr.tournament_name, tr.registered_at,
                tr.moderation_status, tr.moderation_comment,
                tr.discord_contact, tr.comment,
                t.id as team_id, t.name as team_name, t.logo_url,
                u.nickname as captain_nickname
            FROM tournament_registrations tr
            JOIN teams t ON tr.team_id = t.id
            JOIN users u ON t.captain_id = u.id
            ORDER BY 
                CASE tr.moderation_status 
                    WHEN 'pending' THEN 1 
                    WHEN 'approved' THEN 2 
                    WHEN 'rejected' THEN 3 
                END,
                tr.registered_at DESC
        ''')
        
        registrations = cur.fetchall()
        
        result = []
        for reg in registrations:
            r = dict(reg)
            if r['registered_at']:
                r['registered_at'] = r['registered_at'].isoformat()
            result.append(r)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(result)
        }


def get_user_teams(conn, user_id: str) -> dict:
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute('''
            SELECT DISTINCT t.id, t.name, t.logo_url, t.captain_id,
                   u.nickname as captain_nickname,
                   (SELECT COUNT(*) FROM team_members WHERE team_id = t.id) as member_count
            FROM teams t
            JOIN users u ON t.captain_id = u.id
            WHERE t.captain_id = %s 
               OR EXISTS (SELECT 1 FROM team_members WHERE team_id = t.id AND user_id = %s)
            ORDER BY t.created_at DESC
        ''', (user_id, user_id))
        
        teams = cur.fetchall()
        
        result = []
        for team in teams:
            t = dict(team)
            t['is_captain'] = t['captain_id'] == int(user_id)
            
            cur.execute('''
                SELECT player_nickname, player_role, user_id
                FROM team_members
                WHERE team_id = %s
                ORDER BY CASE player_role WHEN 'main' THEN 1 WHEN 'reserve' THEN 2 END
            ''', (t['id'],))
            
            roster = cur.fetchall()
            t['roster'] = [dict(r) for r in roster]
            result.append(t)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(result)
        }


def update_registration(conn, user_id: str, data: dict) -> dict:
    registration_id = data.get('registration_id')
    moderation_status = data.get('moderation_status')
    moderation_comment = data.get('moderation_comment', '')
    
    if not registration_id or not moderation_status:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'registration_id and moderation_status are required'})
        }
    
    if moderation_status not in ['approved', 'rejected']:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'moderation_status must be approved or rejected'})
        }
    
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute('SELECT is_organizer, user_status FROM users WHERE id = %s', (user_id,))
        user = cur.fetchone()
        
        if not user or (not user['is_organizer'] and user['user_status'] not in ['Администратор', 'Главный администратор']):
            return {
                'statusCode': 403,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Access denied'})
            }
        
        cur.execute('''
            UPDATE tournament_registrations
            SET moderation_status = %s,
                moderation_comment = %s,
                moderated_by = %s,
                moderated_at = CURRENT_TIMESTAMP
            WHERE id = %s
            RETURNING id
        ''', (moderation_status, moderation_comment, user_id, registration_id))
        
        updated = cur.fetchone()
        
        if not updated:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Registration not found'})
            }
        
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'message': 'Registration updated successfully'})
        }


def unregister_team(conn, user_id: str, tournament_name: str) -> dict:
    if not tournament_name:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Tournament name is required'})
        }
    
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute('SELECT id FROM teams WHERE captain_id = %s', (user_id,))
        team = cur.fetchone()
        
        if not team:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Team not found'})
            }
        
        cur.execute('''
            DELETE FROM tournament_registrations 
            WHERE team_id = %s AND tournament_name = %s
            RETURNING id
        ''', (team['id'], tournament_name))
        
        deleted = cur.fetchone()
        
        if not deleted:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Registration not found'})
            }
        
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'message': 'Registration cancelled successfully'})
        }