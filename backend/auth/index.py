# v1.0
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
import hashlib
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta

def format_user(user_data):
    """Форматирование данных пользователя для JSON ответа"""
    if not user_data:
        return None
    
    # Now accepts dict cursor results
    return {
        'id': user_data.get('id'),
        'email': user_data.get('email'),
        'nickname': user_data.get('nickname'),
        'discord': user_data.get('discord'),
        'team': user_data.get('team'),
        'avatar_url': user_data.get('avatar_url'),
        'role': user_data.get('role', 'user'),
        'created_at': user_data['created_at'].isoformat() if user_data.get('created_at') and hasattr(user_data['created_at'], 'isoformat') else str(user_data.get('created_at')) if user_data.get('created_at') else None,
        'email_verified': user_data.get('email_verified', False),
        'custom_title': user_data.get('custom_title') if user_data.get('custom_title') else user_data.get('auto_status'),
        'rating': user_data.get('rating', 1000),
        'wins': user_data.get('wins', 0),
        'losses': user_data.get('losses', 0)
    }

def handler(event: dict, context) -> dict:
    """API для регистрации и авторизации пользователей с подтверждением email"""
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Session-Token'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            
            if action == 'check_nickname':
                return check_nickname(cur, conn, body)
            elif action == 'check_email':
                return check_email(cur, conn, body)
            elif action == 'register':
                return register(cur, conn, body)
            elif action == 'verify_email':
                return verify_email(cur, conn, body)
            elif action == 'resend_verification':
                return resend_verification(cur, conn, body)
            elif action == 'login':
                return login(cur, conn, body)
            elif action == 'logout':
                return logout(cur, conn, event)
            elif action == 'reset_password_request':
                return reset_password_request(cur, conn, body)
            elif action == 'reset_password_verify':
                return reset_password_verify(cur, conn, body)
            elif action == 'reset_password':
                return reset_password(cur, conn, body)
            elif action == 'admin_get_users':
                return admin_get_users(cur, conn, event)
            elif action == 'admin_update_user':
                return admin_update_user(cur, conn, body, event)
            else:
                return error_response('Неизвестное действие', 400)
        
        elif method == 'GET':
            session_token = event.get('headers', {}).get('X-Session-Token')
            if session_token:
                return get_profile(cur, conn, session_token)
        
        cur.close()
        conn.close()
        return error_response('Метод не поддерживается', 405)
    
    except Exception as e:
        return error_response(str(e), 500)

def check_nickname(cur, conn, body: dict) -> dict:
    """Проверка уникальности никнейма"""
    nickname = body.get('nickname', '').strip()
    
    if not nickname:
        return error_response('Укажите имя пользователя', 400)
    
    cur.execute("SELECT id FROM t_p4831367_esport_gta_disaster.users WHERE LOWER(nickname) = LOWER(%s)", (nickname,))
    exists = cur.fetchone()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'available': not exists}),
        'isBase64Encoded': False
    }

def check_email(cur, conn, body: dict) -> dict:
    """Проверка уникальности email"""
    email = body.get('email', '').strip().lower()
    
    if not email:
        return error_response('Укажите email', 400)
    
    cur.execute("SELECT id FROM t_p4831367_esport_gta_disaster.users WHERE email = %s", (email,))
    exists = cur.fetchone()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'available': not exists}),
        'isBase64Encoded': False
    }

def register(cur, conn, body: dict) -> dict:
    """Регистрация нового пользователя"""
    nickname = body.get('nickname', '').strip()
    email = body.get('email', '').strip().lower()
    password = body.get('password', '')
    
    if not nickname or not email or not password:
        return error_response('Заполните все поля', 400)
    
    cur.execute("SELECT id FROM t_p4831367_esport_gta_disaster.users WHERE LOWER(nickname) = LOWER(%s)", (nickname,))
    if cur.fetchone():
        return error_response('Данное имя пользователя занято', 400)
    
    cur.execute("SELECT id FROM t_p4831367_esport_gta_disaster.users WHERE LOWER(email) = LOWER(%s)", (email,))
    if cur.fetchone():
        return error_response('Данная почта уже привязана к другому аккаунту', 400)
    
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    verification_token = secrets.token_urlsafe(32)
    
    cur.execute("""
        INSERT INTO t_p4831367_esport_gta_disaster.users (nickname, email, password_hash, role, email_verified, email_verification_token, created_at)
        VALUES (%s, %s, %s, 'user', FALSE, %s, NOW())
        RETURNING id
    """, (nickname, email, password_hash, verification_token))
    
    user_id = cur.fetchone()[0]
    conn.commit()
    
    try:
        send_verification_email(email, nickname, verification_token)
    except Exception as e:
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'message': 'Регистрация успешна, но письмо не отправлено',
                'user_id': user_id,
                'verification_needed': True
            }),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'success': True,
            'message': 'Письмо с подтверждением отправлено на вашу почту',
            'user_id': user_id,
            'email': email
        }),
        'isBase64Encoded': False
    }

def verify_email(cur, conn, body: dict) -> dict:
    """Подтверждение email по токену"""
    token = body.get('token', '')
    
    if not token:
        return error_response('Токен не указан', 400)
    
    cur.execute("""
        SELECT id, nickname, email FROM t_p4831367_esport_gta_disaster.users 
        WHERE email_verification_token = %s AND email_verified = FALSE
    """, (token,))
    
    user = cur.fetchone()
    
    if not user:
        return error_response('Неверная или устаревшая ссылка', 400)
    
    user_id, nickname, email = user
    
    cur.execute("""
        UPDATE t_p4831367_esport_gta_disaster.users 
        SET email_verified = TRUE, email_verification_token = NULL 
        WHERE id = %s
    """, (user_id,))
    
    session_token = secrets.token_urlsafe(32)
    expires_at = datetime.now() + timedelta(days=30)
    
    cur.execute("""
        INSERT INTO t_p4831367_esport_gta_disaster.sessions (user_id, session_token, expires_at)
        VALUES (%s, %s, %s)
    """, (user_id, session_token, expires_at))
    
    conn.commit()
    
    cur.execute("SELECT * FROM t_p4831367_esport_gta_disaster.users WHERE id = %s", (user_id,))
    user_data = cur.fetchone()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'success': True,
            'message': 'Email подтвержден! Вы вошли в систему',
            'session_token': session_token,
            'user': format_user(user_data)
        }),
        'isBase64Encoded': False
    }

def resend_verification(cur, conn, body: dict) -> dict:
    """Повторная отправка письма с подтверждением"""
    email = body.get('email', '').strip().lower()
    
    cur.execute("""
        SELECT id, nickname, email_verification_token, email_verified 
        FROM t_p4831367_esport_gta_disaster.users WHERE email = %s
    """, (email,))
    
    user = cur.fetchone()
    
    if not user:
        return error_response('Пользователь не найден', 404)
    
    user_id, nickname, token, verified = user
    
    if verified:
        return error_response('Email уже подтвержден', 400)
    
    try:
        send_verification_email(email, nickname, token)
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True, 'message': 'Письмо отправлено повторно'}),
            'isBase64Encoded': False
        }
    except Exception as e:
        return error_response(f'Ошибка отправки письма: {str(e)}', 500)

def login(cur, conn, body: dict) -> dict:
    """Вход в аккаунт"""
    email = body.get('email', '').strip().lower()
    password = body.get('password', '')
    
    if not email or not password:
        return error_response('Заполните все поля', 400)
    
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    
    cur.execute("""
        SELECT id, email_verified, is_banned FROM t_p4831367_esport_gta_disaster.users 
        WHERE LOWER(email) = LOWER(%s) AND password_hash = %s
    """, (email, password_hash))
    
    user = cur.fetchone()
    
    if not user:
        return error_response('Неверный email или пароль', 401)
    
    user_id, email_verified, is_banned = user
    
    if is_banned:
        return error_response('Ваш аккаунт заблокирован', 403)
    
    if not email_verified:
        return error_response('Подтвердите email перед входом', 403)
    
    session_token = secrets.token_urlsafe(32)
    expires_at = datetime.now() + timedelta(days=30)
    
    cur.execute("""
        INSERT INTO t_p4831367_esport_gta_disaster.sessions (user_id, session_token, expires_at)
        VALUES (%s, %s, %s)
    """, (user_id, session_token, expires_at))
    
    conn.commit()
    
    cur.execute("SELECT * FROM t_p4831367_esport_gta_disaster.users WHERE id = %s", (user_id,))
    user_data = cur.fetchone()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'session_token': session_token,
            'user': format_user(user_data)
        }),
        'isBase64Encoded': False
    }

def logout(cur, conn, event: dict) -> dict:
    """Выход из аккаунта"""
    session_token = event.get('headers', {}).get('X-Session-Token')
    
    if session_token:
        cur.execute("DELETE FROM t_p4831367_esport_gta_disaster.sessions WHERE session_token = %s", (session_token,))
        conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True}),
        'isBase64Encoded': False
    }

def get_profile(cur, conn, session_token: str) -> dict:
    """Получение профиля пользователя"""
    cur.execute("""
        SELECT u.* FROM t_p4831367_esport_gta_disaster.users u
        JOIN t_p4831367_esport_gta_disaster.sessions s ON u.id = s.user_id
        WHERE s.session_token = %s AND s.expires_at > NOW()
    """, (session_token,))
    
    user_data = cur.fetchone()
    
    if not user_data:
        return error_response('Сессия недействительна', 401)
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'user': format_user(user_data)}),
        'isBase64Encoded': False
    }

def send_verification_email(to_email: str, nickname: str, token: str):
    """Отправка письма с подтверждением"""
    smtp_email = os.environ.get('SMTP_EMAIL')
    smtp_password = os.environ.get('SMTP_PASSWORD')
    
    if not smtp_email or not smtp_password:
        raise Exception('SMTP настройки не заданы')
    
    verification_url = f"https://disaster-esports.ru/verify?token={token}"
    
    msg = MIMEMultipart()
    msg['From'] = smtp_email
    msg['To'] = to_email
    msg['Subject'] = 'Подтверждение регистрации - Disaster Esports'
    
    body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; background: #0f1419; color: #fff; padding: 40px;">
        <div style="max-width: 600px; margin: 0 auto; background: #1a1f26; border: 2px solid #0D94E7; border-radius: 10px; padding: 40px;">
            <h1 style="color: #0D94E7; text-align: center; font-size: 32px; margin-bottom: 20px;">
                🎮 Disaster Esports
            </h1>
            <h2 style="color: #fff; font-size: 24px; margin-bottom: 20px;">
                Добро пожаловать, {nickname}!
            </h2>
            <p style="font-size: 16px; line-height: 1.6; color: #ccc; margin-bottom: 30px;">
                Для завершения регистрации подтвердите ваш email адрес, нажав на кнопку ниже:
            </p>
            <div style="text-align: center; margin: 40px 0;">
                <a href="{verification_url}" 
                   style="display: inline-block; background: linear-gradient(135deg, #0D94E7 0%, #A855F7 100%); 
                          color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; 
                          font-size: 18px; font-weight: bold;">
                    ПОДТВЕРДИТЬ EMAIL
                </a>
            </div>
            <p style="font-size: 14px; color: #888; margin-top: 30px; text-align: center;">
                Если кнопка не работает, скопируйте эту ссылку:<br>
                <a href="{verification_url}" style="color: #0D94E7;">{verification_url}</a>
            </p>
            <hr style="border: 1px solid #333; margin: 30px 0;">
            <p style="font-size: 12px; color: #666; text-align: center;">
                Disaster Esports © 2025<br>
                Если вы не регистрировались, проигнорируйте это письмо
            </p>
        </div>
    </body>
    </html>
    """
    
    msg.attach(MIMEText(body, 'html'))
    
    if '@gmail.com' in smtp_email:
        smtp_server = 'smtp.gmail.com'
        smtp_port = 587
    elif '@yandex.ru' in smtp_email or '@yandex.com' in smtp_email:
        smtp_server = 'smtp.yandex.ru'
        smtp_port = 587
    else:
        smtp_server = 'smtp.gmail.com'
        smtp_port = 587
    
    server = smtplib.SMTP(smtp_server, smtp_port)
    server.starttls()
    server.login(smtp_email, smtp_password)
    server.send_message(msg)
    server.quit()



def reset_password_request(cur, conn, body: dict) -> dict:
    '''Запрос на восстановление пароля - отправка кода на email'''
    email = body.get('email', '').strip().lower()
    
    if not email:
        return error_response('Email обязателен', 400)
    
    cur.execute(
        "SELECT id, nickname FROM t_p4831367_esport_gta_disaster.users WHERE email = %s",
        (email,)
    )
    user = cur.fetchone()
    
    if not user:
        return error_response('Пользователь с таким email не найден', 404)
    
    user_id, nickname = user
    
    token = secrets.token_urlsafe(32)
    expires_at = datetime.now() + timedelta(hours=1)
    
    cur.execute(
        """INSERT INTO t_p4831367_esport_gta_disaster.password_reset_tokens 
           (user_id, token, expires_at) VALUES (%s, %s, %s)""",
        (user_id, token, expires_at)
    )
    conn.commit()
    
    smtp_email = os.environ.get('SMTP_EMAIL')
    smtp_password = os.environ.get('SMTP_PASSWORD')
    
    if smtp_email and smtp_password:
        try:
            send_reset_email(email, nickname, token, smtp_email, smtp_password)
        except Exception as e:
            print(f"Failed to send email: {e}")
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'success': True,
            'message': 'Код восстановления отправлен на ваш email',
            'token': token
        }),
        'isBase64Encoded': False
    }


def reset_password_verify(cur, conn, body: dict) -> dict:
    '''Проверка токена восстановления'''
    token = body.get('token', '').strip()
    
    if not token:
        return error_response('Токен обязателен', 400)
    
    cur.execute(
        """SELECT user_id, expires_at, used 
           FROM t_p4831367_esport_gta_disaster.password_reset_tokens 
           WHERE token = %s""",
        (token,)
    )
    result = cur.fetchone()
    
    if not result:
        return error_response('Неверный токен', 404)
    
    user_id, expires_at, used = result
    
    if used:
        return error_response('Токен уже использован', 400)
    
    if datetime.now() > expires_at:
        return error_response('Токен истек', 400)
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'valid': True, 'user_id': user_id}),
        'isBase64Encoded': False
    }


def reset_password(cur, conn, body: dict) -> dict:
    '''Сброс пароля с использованием токена'''
    token = body.get('token', '').strip()
    new_password = body.get('new_password', '').strip()
    
    if not token or not new_password:
        return error_response('Токен и новый пароль обязательны', 400)
    
    if len(new_password) < 6:
        return error_response('Пароль должен быть не менее 6 символов', 400)
    
    cur.execute(
        """SELECT user_id, expires_at, used 
           FROM t_p4831367_esport_gta_disaster.password_reset_tokens 
           WHERE token = %s""",
        (token,)
    )
    result = cur.fetchone()
    
    if not result:
        return error_response('Неверный токен', 404)
    
    user_id, expires_at, used = result
    
    if used:
        return error_response('Токен уже использован', 400)
    
    if datetime.now() > expires_at:
        return error_response('Токен истек', 400)
    
    password_hash = hashlib.sha256(new_password.encode()).hexdigest()
    
    cur.execute(
        "UPDATE t_p4831367_esport_gta_disaster.users SET password_hash = %s WHERE id = %s",
        (password_hash, user_id)
    )
    
    cur.execute(
        "UPDATE t_p4831367_esport_gta_disaster.password_reset_tokens SET used = TRUE WHERE token = %s",
        (token,)
    )
    
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'message': 'Пароль успешно изменен'}),
        'isBase64Encoded': False
    }


def admin_get_users(cur, conn, event: dict) -> dict:
    '''Получение списка всех пользователей (только для админов)'''
    admin_token = event.get('headers', {}).get('X-Admin-Token') or event.get('headers', {}).get('x-admin-token')
    
    if not admin_token:
        return error_response('Требуется авторизация', 401)
    
    cur.execute("SELECT role FROM t_p4831367_esport_gta_disaster.users WHERE session_token = %s", (admin_token,))
    admin = cur.fetchone()
    
    if not admin or admin[0] not in ['admin', 'founder']:
        return error_response('Доступ запрещен', 403)
    
    cur.execute("""
        SELECT id, nickname, email, role, status, avatar_url, signature, created_at
        FROM t_p4831367_esport_gta_disaster.users
        ORDER BY created_at DESC
    """)
    users = cur.fetchall()
    
    users_list = [{
        'id': u[0],
        'nickname': u[1],
        'email': u[2],
        'role': u[3],
        'status': u[4],
        'avatar_url': u[5],
        'signature': u[6],
        'created_at': u[7].isoformat() if u[7] else None
    } for u in users]
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'users': users_list}),
        'isBase64Encoded': False
    }

def admin_update_user(cur, conn, body: dict, event: dict) -> dict:
    '''Обновление пользователя (только для админов)'''
    admin_token = event.get('headers', {}).get('X-Admin-Token') or event.get('headers', {}).get('x-admin-token')
    
    if not admin_token:
        return error_response('Требуется авторизация', 401)
    
    cur.execute("SELECT role FROM t_p4831367_esport_gta_disaster.users WHERE session_token = %s", (admin_token,))
    admin = cur.fetchone()
    
    if not admin or admin[0] not in ['admin', 'founder']:
        return error_response('Доступ запрещен', 403)
    
    user_id = body.get('user_id')
    if not user_id:
        return error_response('Не указан ID пользователя', 400)
    
    updates = []
    values = []
    
    if 'role' in body:
        updates.append('role = %s')
        values.append(body['role'])
    
    if 'status' in body:
        updates.append('status = %s')
        values.append(body['status'])
    
    if 'avatar_url' in body:
        updates.append('avatar_url = %s')
        values.append(body['avatar_url'])
    
    if 'signature' in body:
        updates.append('signature = %s')
        values.append(body['signature'])
    
    if not updates:
        return error_response('Нет данных для обновления', 400)
    
    values.append(user_id)
    query = f"UPDATE t_p4831367_esport_gta_disaster.users SET {', '.join(updates)} WHERE id = %s"
    cur.execute(query, values)
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True}),
        'isBase64Encoded': False
    }

def send_reset_email(to_email: str, nickname: str, token: str, smtp_email: str, smtp_password: str):
    '''Отправка email с кодом восстановления'''
    subject = "Восстановление пароля DISASTER ESPORTS"
    
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border: 1px solid #333; padding: 30px; border-radius: 10px;">
                <h1 style="color: #0d94e7; margin-bottom: 20px;">DISASTER ESPORTS</h1>
                <h2 style="color: #ffffff;">Восстановление пароля</h2>
                <p>Здравствуйте, {nickname}!</p>
                <p>Вы запросили восстановление пароля. Ваш код восстановления:</p>
                <div style="background-color: #0d94e7; color: #ffffff; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; border-radius: 5px; margin: 20px 0;">
                    {token}
                </div>
                <p style="color: #999;">Код действителен в течение 1 часа.</p>
                <p style="color: #999;">Если вы не запрашивали восстановление пароля, просто проигнорируйте это письмо.</p>
                <hr style="border: none; border-top: 1px solid #333; margin: 20px 0;">
                <p style="color: #666; font-size: 12px;">DISASTER ESPORTS - Киберспортивная организация</p>
            </div>
        </body>
    </html>
    """
    
    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = smtp_email
    msg['To'] = to_email
    
    html_part = MIMEText(html_content, 'html')
    msg.attach(html_part)
    
    if 'gmail' in smtp_email:
        smtp_server = 'smtp.gmail.com'
        smtp_port = 587
    elif 'yandex' in smtp_email:
        smtp_server = 'smtp.yandex.ru'
        smtp_port = 587
    else:
        smtp_server = 'smtp.gmail.com'
        smtp_port = 587
    
    with smtplib.SMTP(smtp_server, smtp_port) as server:
        server.starttls()
        server.login(smtp_email, smtp_password)
        server.send_message(msg)


def error_response(message: str, status: int) -> dict:
    """Формирование ответа с ошибкой"""
    return {
        'statusCode': status,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': message}),
        'isBase64Encoded': False
    }