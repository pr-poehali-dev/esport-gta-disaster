import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    '''API для управления командами: создание, получение, обновление и удаление команд'''
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
                   u.nickname as captain_nickname,
                   (SELECT COUNT(*) FROM team_members WHERE team_id = t.id) as members_count
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
            SELECT u.id, u.nickname, u.avatar_url, tm.joined_at
            FROM team_members tm
            JOIN users u ON tm.user_id = u.id
            WHERE tm.team_id = %s
            ORDER BY tm.joined_at
        ''', (team['id'],))
        
        members = cur.fetchall()
        
        result = dict(team)
        result['members'] = [dict(m) for m in members]
        result['created_at'] = result['created_at'].isoformat() if result['created_at'] else None
        
        for member in result['members']:
            if member['joined_at']:
                member['joined_at'] = member['joined_at'].isoformat()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(result)
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
