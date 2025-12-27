import json
import os
import psycopg2
import hashlib
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta

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
        cur = conn.cursor()
        
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
    
    cur.execute("SELECT id FROM users WHERE nickname = %s", (nickname,))
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
    
    cur.execute("SELECT id FROM users WHERE email = %s", (email,))
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
    
    cur.execute("SELECT id FROM users WHERE nickname = %s", (nickname,))
    if cur.fetchone():
        return error_response('Данное имя пользователя занято', 400)
    
    cur.execute("SELECT id FROM users WHERE email = %s", (email,))
    if cur.fetchone():
        return error_response('Данная почта уже привязана к другому аккаунту', 400)
    
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    verification_token = secrets.token_urlsafe(32)
    
    cur.execute("""
        INSERT INTO users (nickname, email, password_hash, role, email_verified, email_verification_token, created_at)
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
        SELECT id, nickname, email FROM users 
        WHERE email_verification_token = %s AND email_verified = FALSE
    """, (token,))
    
    user = cur.fetchone()
    
    if not user:
        return error_response('Неверная или устаревшая ссылка', 400)
    
    user_id, nickname, email = user
    
    cur.execute("""
        UPDATE users 
        SET email_verified = TRUE, email_verification_token = NULL 
        WHERE id = %s
    """, (user_id,))
    
    session_token = secrets.token_urlsafe(32)
    expires_at = datetime.now() + timedelta(days=30)
    
    cur.execute("""
        INSERT INTO sessions (user_id, session_token, expires_at)
        VALUES (%s, %s, %s)
    """, (user_id, session_token, expires_at))
    
    conn.commit()
    
    cur.execute("SELECT * FROM users WHERE id = %s", (user_id,))
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
        FROM users WHERE email = %s
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
        SELECT id, email_verified, is_banned FROM users 
        WHERE email = %s AND password_hash = %s
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
        INSERT INTO sessions (user_id, session_token, expires_at)
        VALUES (%s, %s, %s)
    """, (user_id, session_token, expires_at))
    
    conn.commit()
    
    cur.execute("SELECT * FROM users WHERE id = %s", (user_id,))
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
        cur.execute("DELETE FROM sessions WHERE session_token = %s", (session_token,))
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
        SELECT u.* FROM users u
        JOIN sessions s ON u.id = s.user_id
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

def format_user(user_data) -> dict:
    """Форматирование данных пользователя"""
    return {
        'id': user_data[0],
        'nickname': user_data[1],
        'email': user_data[2],
        'discord': user_data[4],
        'team': user_data[5],
        'avatar_url': user_data[6],
        'role': user_data[7],
        'is_organizer': user_data[8],
        'user_status': user_data[9],
        'achievement_points': user_data[10],
        'created_at': user_data[11].isoformat() if user_data[11] else None,
        'is_banned': user_data[14] if len(user_data) > 14 else False,
        'is_muted': user_data[15] if len(user_data) > 15 else False
    }

def error_response(message: str, status: int) -> dict:
    """Формирование ответа с ошибкой"""
    return {
        'statusCode': status,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': message}),
        'isBase64Encoded': False
    }
