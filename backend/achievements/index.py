import json
import os
import psycopg2
from datetime import datetime

def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        raise Exception('DATABASE_URL not found')
    return psycopg2.connect(dsn)

def serialize_datetime(obj):
    if isinstance(obj, datetime):
        return obj.isoformat()
    return obj

def dict_with_serialized_dates(d):
    if not d:
        return d
    return {k: serialize_datetime(v) for k, v in d.items()}

def handler(event: dict, context) -> dict:
    '''API для работы с достижениями игроков'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Session-Token'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    query_params = event.get('queryStringParameters') or {}
    action = query_params.get('action', 'list')
    
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        if action == 'list':
            cur.execute('''
                SELECT 
                    id, code, name, description, icon, rarity, category, points
                FROM achievements
                ORDER BY 
                    CASE rarity
                        WHEN 'legendary' THEN 1
                        WHEN 'epic' THEN 2
                        WHEN 'rare' THEN 3
                        WHEN 'common' THEN 4
                    END,
                    points DESC
            ''')
            
            achievements = []
            for row in cur.fetchall():
                achievements.append({
                    'id': row[0],
                    'code': row[1],
                    'name': row[2],
                    'description': row[3],
                    'icon': row[4],
                    'rarity': row[5],
                    'category': row[6],
                    'points': row[7],
                    'unlocked': False,
                    'progress': 0,
                    'maxProgress': 1
                })
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'achievements': achievements}),
                'isBase64Encoded': False
            }
        
        elif action == 'user':
            headers = event.get('headers') or {}
            session_token = headers.get('x-session-token') or headers.get('X-Session-Token')
            
            if not session_token:
                cur.close()
                conn.close()
                return {
                    'statusCode': 401,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Unauthorized'}),
                    'isBase64Encoded': False
                }
            
            cur.execute('''
                SELECT user_id FROM user_sessions 
                WHERE session_token = %s AND expires_at > NOW()
            ''', (session_token,))
            
            session = cur.fetchone()
            if not session:
                cur.close()
                conn.close()
                return {
                    'statusCode': 401,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Invalid session'}),
                    'isBase64Encoded': False
                }
            
            user_id = session[0]
            
            cur.execute('''
                SELECT 
                    a.id, a.code, a.name, a.description, a.icon, 
                    a.rarity, a.category, a.points,
                    ua.unlocked_at, ua.progress, ua.max_progress
                FROM achievements a
                LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = %s
                ORDER BY 
                    CASE WHEN ua.unlocked_at IS NOT NULL THEN 0 ELSE 1 END,
                    CASE a.rarity
                        WHEN 'legendary' THEN 1
                        WHEN 'epic' THEN 2
                        WHEN 'rare' THEN 3
                        WHEN 'common' THEN 4
                    END,
                    a.points DESC
            ''', (user_id,))
            
            achievements = []
            for row in cur.fetchall():
                unlocked = row[8] is not None
                achievements.append({
                    'id': row[0],
                    'code': row[1],
                    'name': row[2],
                    'description': row[3],
                    'icon': row[4],
                    'rarity': row[5],
                    'category': row[6],
                    'points': row[7],
                    'unlocked': unlocked,
                    'unlockedAt': serialize_datetime(row[8]) if unlocked else None,
                    'progress': row[9] if row[9] is not None else 0,
                    'maxProgress': row[10] if row[10] is not None else 1
                })
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'achievements': achievements}),
                'isBase64Encoded': False
            }
        
        else:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Invalid action'}),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        if conn:
            conn.close()
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
