"""API для регистрации, авторизации и управления пользователями"""
import json
import os
import hashlib
import secrets
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def generate_session_token() -> str:
    return secrets.token_urlsafe(32)

def serialize_datetime(obj):
    if isinstance(obj, datetime):
        return obj.isoformat()
    return obj

def dict_with_serialized_dates(d):
    if not d:
        return d
    return {k: serialize_datetime(v) for k, v in d.items()}

def handler(event: dict, context) -> dict:
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Session-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    query_params = event.get('queryStringParameters') or {}
    path = query_params.get('action', '')
    
    try:
        if method == 'POST' and path == 'register':
            return register_user(event)
        elif method == 'POST' and path == 'login':
            return login_user(event)
        elif method == 'POST' and path == 'logout':
            return logout_user(event)
        elif method == 'GET' and path == 'profile':
            return get_profile(event)
        elif method == 'PUT' and path == 'profile':
            return update_profile(event)
        else:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Not found', 'path': path, 'method': method}),
                'isBase64Encoded': False
            }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }

def register_user(event: dict) -> dict:
    data = json.loads(event.get('body', '{}'))
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    nickname = data.get('nickname', '').strip()
    discord = data.get('discord', '').strip()
    team = data.get('team', '').strip()
    
    if not email or not password or not nickname:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Email, password and nickname are required'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT id FROM users WHERE email = %s", (email,))
            if cur.fetchone():
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Email already exists'}),
                    'isBase64Encoded': False
                }
            
            password_hash = hash_password(password)
            cur.execute(
                """INSERT INTO users (email, password_hash, nickname, discord, team) 
                   VALUES (%s, %s, %s, %s, %s) RETURNING id, email, nickname, discord, team, role, is_organizer, created_at""",
                (email, password_hash, nickname, discord, team)
            )
            user = cur.fetchone()
            conn.commit()
            
            session_token = generate_session_token()
            expires_at = datetime.now() + timedelta(days=30)
            cur.execute(
                "INSERT INTO user_sessions (user_id, session_token, expires_at) VALUES (%s, %s, %s)",
                (user['id'], session_token, expires_at)
            )
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'user': dict_with_serialized_dates(dict(user)),
                    'session_token': session_token
                }),
                'isBase64Encoded': False
            }
    finally:
        conn.close()

def login_user(event: dict) -> dict:
    data = json.loads(event.get('body', '{}'))
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    
    if not email or not password:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Email and password are required'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            password_hash = hash_password(password)
            cur.execute(
                "SELECT id, email, nickname, discord, team, role, is_organizer, created_at FROM users WHERE email = %s AND password_hash = %s",
                (email, password_hash)
            )
            user = cur.fetchone()
            
            if not user:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Invalid credentials'}),
                    'isBase64Encoded': False
                }
            
            session_token = generate_session_token()
            expires_at = datetime.now() + timedelta(days=30)
            cur.execute(
                "INSERT INTO user_sessions (user_id, session_token, expires_at) VALUES (%s, %s, %s)",
                (user['id'], session_token, expires_at)
            )
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'user': dict_with_serialized_dates(dict(user)),
                    'session_token': session_token
                }),
                'isBase64Encoded': False
            }
    finally:
        conn.close()

def logout_user(event: dict) -> dict:
    token = event.get('headers', {}).get('X-Session-Token') or event.get('headers', {}).get('x-session-token')
    
    if not token:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'No session token'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM user_sessions WHERE session_token = %s", (token,))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Logged out'}),
                'isBase64Encoded': False
            }
    finally:
        conn.close()

def get_profile(event: dict) -> dict:
    token = event.get('headers', {}).get('X-Session-Token') or event.get('headers', {}).get('x-session-token')
    
    if not token:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'No session token'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """SELECT u.id, u.email, u.nickname, u.discord, u.team, u.avatar_url, u.role, u.is_organizer, u.created_at
                   FROM users u
                   JOIN user_sessions s ON u.id = s.user_id
                   WHERE s.session_token = %s AND s.expires_at > NOW()""",
                (token,)
            )
            user = cur.fetchone()
            
            if not user:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Invalid or expired session'}),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'user': dict_with_serialized_dates(dict(user))}),
                'isBase64Encoded': False
            }
    finally:
        conn.close()

def update_profile(event: dict) -> dict:
    token = event.get('headers', {}).get('X-Session-Token') or event.get('headers', {}).get('x-session-token')
    
    if not token:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'No session token'}),
            'isBase64Encoded': False
        }
    
    data = json.loads(event.get('body', '{}'))
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """SELECT u.id FROM users u
                   JOIN user_sessions s ON u.id = s.user_id
                   WHERE s.session_token = %s AND s.expires_at > NOW()""",
                (token,)
            )
            result = cur.fetchone()
            
            if not result:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Invalid or expired session'}),
                    'isBase64Encoded': False
                }
            
            user_id = result['id']
            updates = []
            params = []
            
            if 'nickname' in data:
                updates.append("nickname = %s")
                params.append(data['nickname'])
            if 'discord' in data:
                updates.append("discord = %s")
                params.append(data['discord'])
            if 'team' in data:
                updates.append("team = %s")
                params.append(data['team'])
            if 'avatar_url' in data:
                updates.append("avatar_url = %s")
                params.append(data['avatar_url'])
            
            if not updates:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'No fields to update'}),
                    'isBase64Encoded': False
                }
            
            updates.append("updated_at = NOW()")
            params.append(user_id)
            
            query = f"UPDATE users SET {', '.join(updates)} WHERE id = %s RETURNING id, email, nickname, discord, team, avatar_url, role, created_at"
            cur.execute(query, params)
            user = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'user': dict_with_serialized_dates(dict(user))}),
                'isBase64Encoded': False
            }
    finally:
        conn.close()