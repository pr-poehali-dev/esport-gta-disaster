# v1.0
import json
import os
import psycopg2
import boto3
import base64
import secrets
from datetime import datetime

def handler(event: dict, context) -> dict:
    """API для управления профилем пользователя с загрузкой аватара"""
    
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
        
        session_token = event.get('headers', {}).get('x-session-token') or event.get('headers', {}).get('X-Session-Token')
        
        if not session_token:
            return error_response('Требуется авторизация', 401)
        
        user_id = get_user_id_from_session(cur, session_token)
        if not user_id:
            return error_response('Недействительная сессия', 401)
        
        if method == 'GET':
            return get_profile(cur, user_id)
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            return update_profile(cur, conn, user_id, body)
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            
            if action == 'upload_avatar':
                return upload_avatar(cur, conn, user_id, body)
            elif action == 'upload_banner':
                return upload_banner(cur, conn, user_id, body)
            elif action == 'track_activity':
                return track_activity(cur, conn, user_id, body)
            elif action == 'change_password':
                return change_password(cur, conn, user_id, body)
            elif action == 'get_login_history':
                return get_login_history(cur, user_id, body)
            else:
                return error_response('Неизвестное действие', 400)
        
        cur.close()
        conn.close()
        return error_response('Метод не поддерживается', 405)
    
    except Exception as e:
        return error_response(str(e), 500)

def get_user_id_from_session(cur, session_token: str) -> int:
    """Получение ID пользователя по токену сессии"""
    cur.execute("""
        SELECT user_id FROM t_p4831367_esport_gta_disaster.sessions 
        WHERE session_token = %s AND expires_at > NOW()
    """, (session_token,))
    
    result = cur.fetchone()
    return result[0] if result else None

def get_profile(cur, user_id: int) -> dict:
    """Получение полной информации профиля"""
    cur.execute("""
        SELECT id, nickname, email, discord, team, avatar_url, role, 
               auto_status, bio, signature_url, total_time_seconds, 
               created_at, achievement_points, banner_url
        FROM t_p4831367_esport_gta_disaster.users 
        WHERE id = %s
    """, (user_id,))
    
    user = cur.fetchone()
    
    if not user:
        return error_response('Пользователь не найден', 404)
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'id': user[0],
            'nickname': user[1],
            'email': user[2],
            'discord': user[3],
            'team': user[4],
            'avatar_url': user[5],
            'role': user[6],
            'auto_status': user[7],
            'bio': user[8],
            'signature_url': user[9],
            'total_time_seconds': user[10],
            'total_time_hours': round(user[10] / 3600, 1) if user[10] else 0,
            'created_at': user[11].isoformat() if user[11] else None,
            'achievement_points': user[12],
            'banner_url': user[13]
        }),
        'isBase64Encoded': False
    }

def update_profile(cur, conn, user_id: int, body: dict) -> dict:
    """Обновление информации профиля"""
    nickname = body.get('nickname', '').strip()
    discord = body.get('discord', '').strip()
    team = body.get('team', '').strip()
    bio = body.get('bio', '').strip()
    signature_url = body.get('signature_url', '').strip()
    
    # Проверка уникальности никнейма
    if nickname:
        cur.execute("""
            SELECT id FROM t_p4831367_esport_gta_disaster.users 
            WHERE nickname = %s AND id != %s
        """, (nickname, user_id))
        
        if cur.fetchone():
            return error_response('Данное имя пользователя уже занято', 400)
    
    # Обновление профиля
    updates = []
    params = []
    
    if nickname:
        updates.append('nickname = %s')
        params.append(nickname)
    
    if discord is not None:
        updates.append('discord = %s')
        params.append(discord)
    
    if team is not None:
        updates.append('team = %s')
        params.append(team)
    
    if bio is not None:
        updates.append('bio = %s')
        params.append(bio)
    
    if signature_url is not None:
        updates.append('signature_url = %s')
        params.append(signature_url)
    
    updates.append('updated_at = NOW()')
    params.append(user_id)
    
    if updates:
        query = f"""
            UPDATE t_p4831367_esport_gta_disaster.users 
            SET {', '.join(updates)}
            WHERE id = %s
        """
        cur.execute(query, params)
        conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'message': 'Профиль обновлен'}),
        'isBase64Encoded': False
    }

def upload_avatar(cur, conn, user_id: int, body: dict) -> dict:
    """Загрузка аватара пользователя в S3"""
    avatar_base64 = body.get('avatar_base64')
    file_type = body.get('file_type', 'image/jpeg')
    
    if not avatar_base64:
        return error_response('Изображение не предоставлено', 400)
    
    try:
        # Декодирование base64
        image_data = base64.b64decode(avatar_base64)
        
        # Генерация уникального имени файла
        file_extension = file_type.split('/')[-1]
        filename = f"avatars/{user_id}_{secrets.token_hex(8)}.{file_extension}"
        
        # Загрузка в S3
        s3 = boto3.client('s3',
            endpoint_url='https://bucket.poehali.dev',
            aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
            aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
        )
        
        s3.put_object(
            Bucket='files',
            Key=filename,
            Body=image_data,
            ContentType=file_type
        )
        
        # CDN URL
        cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{filename}"
        
        # Обновление аватара в БД и получение обновлённого профиля
        cur.execute("""
            UPDATE t_p4831367_esport_gta_disaster.users 
            SET avatar_url = %s, updated_at = NOW()
            WHERE id = %s
            RETURNING id, nickname, email, discord, team, avatar_url, role, 
                      auto_status, bio, signature_url, total_time_seconds, 
                      created_at, achievement_points, banner_url
        """, (cdn_url, user_id))
        
        user = cur.fetchone()
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'avatar_url': cdn_url,
                'message': 'Аватар загружен',
                'profile': {
                    'id': user[0],
                    'nickname': user[1],
                    'email': user[2],
                    'discord': user[3],
                    'team': user[4],
                    'avatar_url': user[5],
                    'role': user[6],
                    'auto_status': user[7],
                    'bio': user[8],
                    'signature_url': user[9],
                    'total_time_seconds': user[10],
                    'total_time_hours': round(user[10] / 3600, 1) if user[10] else 0,
                    'created_at': user[11].isoformat() if user[11] else None,
                    'achievement_points': user[12],
                    'banner_url': user[13]
                }
            }),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return error_response(f'Ошибка загрузки: {str(e)}', 500)

def track_activity(cur, conn, user_id: int, body: dict) -> dict:
    """Отслеживание активности пользователя и обновление автостатуса"""
    duration_seconds = body.get('duration_seconds', 0)
    
    if duration_seconds <= 0:
        return error_response('Неверная длительность сессии', 400)
    
    # Добавление сессии активности
    cur.execute("""
        INSERT INTO t_p4831367_esport_gta_disaster.user_activity_sessions 
        (user_id, duration_seconds, session_end)
        VALUES (%s, %s, NOW())
    """, (user_id, duration_seconds))
    
    # Обновление общего времени
    cur.execute("""
        UPDATE t_p4831367_esport_gta_disaster.users 
        SET total_time_seconds = total_time_seconds + %s,
            last_activity_at = NOW()
        WHERE id = %s
        RETURNING total_time_seconds
    """, (duration_seconds, user_id))
    
    total_seconds = cur.fetchone()[0]
    total_hours = total_seconds / 3600
    
    # Автоматическое обновление статуса
    new_status = 'Новичок'
    if total_hours >= 10:
        new_status = 'Киберспортсмен'
    elif total_hours >= 3:
        new_status = 'Освоившийся'
    elif total_hours >= 1:
        new_status = 'Пользователь'
    
    cur.execute("""
        UPDATE t_p4831367_esport_gta_disaster.users 
        SET auto_status = %s
        WHERE id = %s
    """, (new_status, user_id))
    
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'success': True,
            'total_time_seconds': total_seconds,
            'total_time_hours': round(total_hours, 1),
            'auto_status': new_status
        }),
        'isBase64Encoded': False
    }

def upload_banner(cur, conn, user_id: int, body: dict) -> dict:
    """Загрузка баннера профиля в S3"""
    banner_base64 = body.get('banner_base64')
    file_type = body.get('file_type', 'image/jpeg')
    
    if not banner_base64:
        return error_response('Изображение не предоставлено', 400)
    
    try:
        image_data = base64.b64decode(banner_base64)
        file_extension = file_type.split('/')[-1]
        filename = f"banners/{user_id}_{secrets.token_hex(8)}.{file_extension}"
        
        s3 = boto3.client('s3',
            endpoint_url='https://bucket.poehali.dev',
            aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
            aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
        )
        
        s3.put_object(
            Bucket='files',
            Key=filename,
            Body=image_data,
            ContentType=file_type
        )
        
        cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{filename}"
        
        cur.execute("""
            UPDATE t_p4831367_esport_gta_disaster.users 
            SET banner_url = %s, updated_at = NOW()
            WHERE id = %s
            RETURNING id, nickname, email, discord, team, avatar_url, role, 
                      auto_status, bio, signature_url, total_time_seconds, 
                      created_at, achievement_points, banner_url
        """, (cdn_url, user_id))
        
        user = cur.fetchone()
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'banner_url': cdn_url,
                'message': 'Баннер загружен',
                'profile': {
                    'id': user[0],
                    'nickname': user[1],
                    'email': user[2],
                    'discord': user[3],
                    'team': user[4],
                    'avatar_url': user[5],
                    'role': user[6],
                    'auto_status': user[7],
                    'bio': user[8],
                    'signature_url': user[9],
                    'total_time_seconds': user[10],
                    'total_time_hours': round(user[10] / 3600, 1) if user[10] else 0,
                    'created_at': user[11].isoformat() if user[11] else None,
                    'achievement_points': user[12],
                    'banner_url': user[13]
                }
            }),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return error_response(f'Ошибка загрузки: {str(e)}', 500)

def change_password(cur, conn, user_id: int, body: dict) -> dict:
    """Смена пароля пользователя"""
    import hashlib
    
    current_password = body.get('current_password', '')
    new_password = body.get('new_password', '')
    
    if not current_password or not new_password:
        return error_response('Заполните все поля', 400)
    
    if len(new_password) < 6:
        return error_response('Пароль должен быть не менее 6 символов', 400)
    
    # Проверяем текущий пароль
    current_hash = hashlib.sha256(current_password.encode()).hexdigest()
    cur.execute("""
        SELECT password_hash FROM t_p4831367_esport_gta_disaster.users 
        WHERE id = %s
    """, (user_id,))
    
    result = cur.fetchone()
    if not result or result[0] != current_hash:
        return error_response('Неверный текущий пароль', 401)
    
    # Обновляем пароль
    new_hash = hashlib.sha256(new_password.encode()).hexdigest()
    cur.execute("""
        UPDATE t_p4831367_esport_gta_disaster.users 
        SET password_hash = %s, updated_at = NOW()
        WHERE id = %s
    """, (new_hash, user_id))
    
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'success': True,
            'message': 'Пароль успешно изменен'
        }),
        'isBase64Encoded': False
    }

def get_login_history(cur, user_id: int, body: dict) -> dict:
    """Получение истории входов пользователя"""
    limit = body.get('limit', 20)
    
    cur.execute("""
        SELECT 
            id,
            ip_address,
            user_agent,
            country,
            city,
            login_successful,
            login_method,
            created_at
        FROM t_p4831367_esport_gta_disaster.login_logs
        WHERE user_id = %s
        ORDER BY created_at DESC
        LIMIT %s
    """, (user_id, limit))
    
    logs = []
    for row in cur.fetchall():
        logs.append({
            'id': row[0],
            'ip_address': row[1],
            'user_agent': row[2],
            'country': row[3],
            'city': row[4],
            'login_successful': row[5],
            'login_method': row[6],
            'created_at': row[7].isoformat() if row[7] else None
        })
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'login_history': logs
        }),
        'isBase64Encoded': False
    }

def error_response(message: str, status_code: int) -> dict:
    return {
        'statusCode': status_code,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': message}),
        'isBase64Encoded': False
    }