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
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
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
            return get_registrations(conn, user_id)
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            return register_team(conn, user_id, body)
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
            SELECT tr.id, tr.tournament_name, tr.status, tr.registered_at,
                   t.id as team_id, t.name as team_name, t.logo_url
            FROM tournament_registrations tr
            LEFT JOIN teams t ON tr.team_id = t.id
            WHERE tr.user_id = %s OR t.captain_id = %s
            ORDER BY tr.registered_at DESC
        ''', (user_id, user_id))
        
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
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'You must create a team first'})
            }
        
        cur.execute('''
            SELECT id FROM tournament_registrations 
            WHERE team_id = %s AND tournament_name = %s
        ''', (team['id'], tournament_name))
        
        existing = cur.fetchone()
        if existing:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Team already registered for this tournament'})
            }
        
        cur.execute('''
            INSERT INTO tournament_registrations (user_id, team_id, tournament_name, status)
            VALUES (%s, %s, %s, %s)
            RETURNING id, tournament_name, status, registered_at
        ''', (user_id, team['id'], tournament_name, 'pending'))
        
        registration = cur.fetchone()
        conn.commit()
        
        result = dict(registration)
        result['registered_at'] = result['registered_at'].isoformat() if result['registered_at'] else None
        
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(result)
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
