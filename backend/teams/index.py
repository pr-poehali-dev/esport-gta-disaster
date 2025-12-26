import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    '''API для управления командами: создание, редактирование, управление составом (5 основных + 2 запасных игрока)'''
    method = event.get('httpMethod', 'GET')
    query_params = event.get('queryStringParameters', {}) or {}
    action = query_params.get('action', '')
    
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
        if action == 'roster':
            if method == 'PUT':
                body = json.loads(event.get('body', '{}'))
                return update_roster(conn, user_id, body)
            elif method == 'GET':
                return get_roster(conn, user_id)
        elif method == 'GET':
            return get_user_team(conn, user_id)
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            return create_team(conn, user_id, body)
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            return update_team(conn, user_id, body)
        elif method == 'DELETE':
            return delete_team(conn, user_id)
        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'})
            }
    finally:
        conn.close()


def get_user_team(conn, user_id: str) -> dict:
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute('''
            SELECT t.id, t.name, t.logo_url, t.captain_id, t.created_at,
                   u.nickname as captain_nickname
            FROM teams t
            JOIN users u ON t.captain_id = u.id
            LEFT JOIN team_members tm ON t.id = tm.team_id
            WHERE t.captain_id = %s OR tm.user_id = %s
            LIMIT 1
        ''', (user_id, user_id))
        
        team = cur.fetchone()
        
        if not team:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Team not found'})
            }
        
        cur.execute('''
            SELECT id, player_nickname, player_role, joined_at
            FROM team_members
            WHERE team_id = %s
            ORDER BY 
                CASE player_role WHEN 'main' THEN 1 WHEN 'reserve' THEN 2 END,
                joined_at
        ''', (team['id'],))
        
        roster = cur.fetchall()
        
        result = dict(team)
        result['roster'] = [dict(r) for r in roster]
        result['created_at'] = result['created_at'].isoformat() if result['created_at'] else None
        
        for player in result['roster']:
            if player['joined_at']:
                player['joined_at'] = player['joined_at'].isoformat()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(result)
        }


def get_roster(conn, user_id: str) -> dict:
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
            SELECT id, player_nickname, player_role, joined_at
            FROM team_members
            WHERE team_id = %s
            ORDER BY 
                CASE player_role WHEN 'main' THEN 1 WHEN 'reserve' THEN 2 END,
                joined_at
        ''', (team['id'],))
        
        roster = cur.fetchall()
        result = [dict(r) for r in roster]
        
        for player in result:
            if player['joined_at']:
                player['joined_at'] = player['joined_at'].isoformat()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(result)
        }


def update_roster(conn, user_id: str, data: dict) -> dict:
    main_players = data.get('main_players', [])
    reserve_players = data.get('reserve_players', [])
    
    if len(main_players) > 5:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Maximum 5 main players allowed'})
        }
    
    if len(reserve_players) > 2:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Maximum 2 reserve players allowed'})
        }
    
    all_nicknames = [p.strip().lower() for p in main_players + reserve_players if p and p.strip()]
    if len(all_nicknames) != len(set(all_nicknames)):
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Duplicate nicknames in roster'})
        }
    
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute('SELECT id FROM teams WHERE captain_id = %s', (user_id,))
        team = cur.fetchone()
        
        if not team:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Team not found or you are not the captain'})
            }
        
        for nickname in all_nicknames:
            if nickname:
                cur.execute('''
                    SELECT u.id, u.nickname 
                    FROM users u
                    WHERE LOWER(u.nickname) = %s
                ''', (nickname,))
                existing_user = cur.fetchone()
                
                if existing_user:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({
                            'error': f'Nickname "{existing_user["nickname"]}" is already registered by another user'
                        })
                    }
        
        cur.execute('DELETE FROM team_members WHERE team_id = %s', (team['id'],))
        
        for nickname in main_players:
            if nickname and nickname.strip():
                cur.execute('''
                    INSERT INTO team_members (team_id, player_nickname, player_role)
                    VALUES (%s, %s, %s)
                ''', (team['id'], nickname.strip(), 'main'))
        
        for nickname in reserve_players:
            if nickname and nickname.strip():
                cur.execute('''
                    INSERT INTO team_members (team_id, player_nickname, player_role)
                    VALUES (%s, %s, %s)
                ''', (team['id'], nickname.strip(), 'reserve'))
        
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'message': 'Roster updated successfully'})
        }


def create_team(conn, user_id: str, data: dict) -> dict:
    name = data.get('name', '').strip()
    logo_url = data.get('logo_url', '').strip()
    
    if not name:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Team name is required'})
        }
    
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute('SELECT id FROM teams WHERE captain_id = %s', (user_id,))
        existing = cur.fetchone()
        
        if existing:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'You already have a team'})
            }
        
        cur.execute('''
            INSERT INTO teams (name, logo_url, captain_id)
            VALUES (%s, %s, %s)
            RETURNING id, name, logo_url, captain_id, created_at
        ''', (name, logo_url, user_id))
        
        team = cur.fetchone()
        
        cur.execute('''
            INSERT INTO user_achievements (user_id, achievement_code) 
            VALUES (%s, 'team_captain')
            ON CONFLICT (user_id, achievement_code) DO NOTHING
        ''', (user_id,))
        
        cur.execute('''
            UPDATE users 
            SET achievement_points = achievement_points + 30
            WHERE id = %s 
            AND NOT EXISTS (
                SELECT 1 FROM user_achievements 
                WHERE user_id = %s AND achievement_code = 'team_captain'
            )
        ''', (user_id, user_id))
        
        conn.commit()
        
        result = dict(team)
        result['created_at'] = result['created_at'].isoformat() if result['created_at'] else None
        
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(result)
        }


def update_team(conn, user_id: str, data: dict) -> dict:
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute('SELECT id FROM teams WHERE captain_id = %s', (user_id,))
        team = cur.fetchone()
        
        if not team:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Team not found or you are not the captain'})
            }
        
        name = data.get('name', '').strip()
        logo_url = data.get('logo_url', '').strip()
        
        cur.execute('''
            UPDATE teams 
            SET name = COALESCE(NULLIF(%s, ''), name),
                logo_url = COALESCE(NULLIF(%s, ''), logo_url),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
            RETURNING id, name, logo_url, captain_id, updated_at
        ''', (name, logo_url, team['id']))
        
        updated = cur.fetchone()
        conn.commit()
        
        result = dict(updated)
        result['updated_at'] = result['updated_at'].isoformat() if result['updated_at'] else None
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(result)
        }


def delete_team(conn, user_id: str) -> dict:
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute('DELETE FROM teams WHERE captain_id = %s RETURNING id', (user_id,))
        deleted = cur.fetchone()
        
        if not deleted:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Team not found or you are not the captain'})
            }
        
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'message': 'Team deleted successfully'})
        }