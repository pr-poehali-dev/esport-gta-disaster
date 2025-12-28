# v1.0
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    '''API для регистрации новой команды пользователем'''
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id'
            },
            'body': ''
        }

    if method == 'POST':
        return register_team(event)
    
    return {
        'statusCode': 405,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': 'Method not allowed'})
    }


def register_team(event: dict) -> dict:
    '''Регистрация новой команды'''
    conn = None
    try:
        # Получаем user_id из заголовков
        headers = event.get('headers', {})
        user_id = headers.get('X-User-Id') or headers.get('x-user-id')
        
        if not user_id:
            return {
                'statusCode': 401,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Необходима авторизация'})
            }
        
        # Парсим данные команды
        body = json.loads(event.get('body', '{}'))
        team_name = body.get('name', '').strip()
        team_tag = body.get('tag', '').strip().upper()
        logo_url = body.get('logo_url', '').strip()
        description = body.get('description', '').strip()
        
        # Валидация
        if not team_name or len(team_name) < 3:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Название команды должно содержать минимум 3 символа'})
            }
        
        if not team_tag or len(team_tag) < 2 or len(team_tag) > 10:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Тег команды должен содержать от 2 до 10 символов'})
            }
        
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            # Проверяем, не является ли пользователь уже капитаном команды
            cursor.execute("""
                SELECT id FROM teams WHERE captain_id = %s
            """, (user_id,))
            
            if cursor.fetchone():
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Вы уже являетесь капитаном команды'})
                }
            
            # Проверяем уникальность тега
            cursor.execute("""
                SELECT id FROM teams WHERE tag = %s
            """, (team_tag,))
            
            if cursor.fetchone():
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Команда с таким тегом уже существует'})
                }
            
            # Создаем команду (verified по умолчанию FALSE)
            cursor.execute("""
                INSERT INTO teams (name, tag, logo_url, captain_id, description, verified, wins, losses, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, FALSE, 0, 0, NOW(), NOW())
                RETURNING id, name, tag, logo_url, verified, created_at
            """, (team_name, team_tag, logo_url if logo_url else None, user_id, description if description else None))
            
            new_team = cursor.fetchone()
            
            # Добавляем капитана в состав команды
            cursor.execute("""
                INSERT INTO team_members (team_id, user_id, joined_at, player_role)
                VALUES (%s, %s, NOW(), %s)
            """, (new_team['id'], user_id, 'Капитан'))
            
            conn.commit()
        
        return {
            'statusCode': 201,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'message': 'Команда создана! Ожидайте проверки администратором для активации.',
                'team': {
                    'id': new_team['id'],
                    'name': new_team['name'],
                    'tag': new_team['tag'],
                    'logo_url': new_team['logo_url'],
                    'verified': new_team['verified'],
                    'created_at': new_team['created_at'].isoformat()
                }
            })
        }
    
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Неверный формат данных'})
        }
    except Exception as e:
        if conn:
            conn.rollback()
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }
    finally:
        if conn:
            conn.close()