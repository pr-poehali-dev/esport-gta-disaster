import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


def send_verification_email(email: str, token: str, nickname: str):
    """Отправка email с подтверждением регистрации"""
    smtp_host = os.environ.get('SMTP_HOST')
    smtp_port = int(os.environ.get('SMTP_PORT', 587))
    smtp_user = os.environ.get('SMTP_USER')
    smtp_password = os.environ.get('SMTP_PASSWORD')
    
    if not all([smtp_host, smtp_user, smtp_password]):
        return False
    
    verification_url = f"https://esport-gta-disaster.poehali.app/verify-email?token={token}"
    
    msg = MIMEMultipart('alternative')
    msg['Subject'] = '✅ Подтвердите регистрацию - DISASTER ESPORTS'
    msg['From'] = smtp_user
    msg['To'] = email
    
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{ font-family: Arial, sans-serif; background-color: #0f1419; color: #ffffff; margin: 0; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1f2e 0%, #0d94e7 100%); border-radius: 10px; padding: 40px; }}
            .logo {{ text-align: center; margin-bottom: 30px; }}
            .logo h1 {{ font-size: 32px; font-weight: bold; background: linear-gradient(90deg, #0d94e7 0%, #a855f7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0; }}
            .content {{ background: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 30px; margin-bottom: 20px; }}
            .button {{ display: inline-block; background: linear-gradient(90deg, #0d94e7 0%, #a855f7 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 5px; font-weight: bold; margin: 20px 0; }}
            .footer {{ text-align: center; color: #a0aec0; font-size: 12px; margin-top: 20px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo">
                <h1>⚡ DISASTER ESPORTS</h1>
                <p style="color: #a0aec0; margin: 5px 0;">ГТА Криминальная Россия</p>
            </div>
            <div class="content">
                <h2 style="color: #0d94e7; margin-top: 0;">Добро пожаловать, {nickname}!</h2>
                <p>Спасибо за регистрацию на нашей турнирной платформе.</p>
                <p>Для завершения регистрации подтвердите ваш email адрес:</p>
                <div style="text-align: center;">
                    <a href="{verification_url}" class="button">Подтвердить Email</a>
                </div>
                <p style="font-size: 14px; color: #a0aec0;">Ссылка действительна 24 часа</p>
                <p style="font-size: 12px; color: #718096; margin-top: 20px;">Если кнопка не работает, скопируйте эту ссылку:<br>
                <a href="{verification_url}" style="color: #0d94e7; word-break: break-all;">{verification_url}</a></p>
            </div>
            <div class="footer">
                <p>© 2025 DISASTER ESPORTS. Все права защищены.</p>
                <p>Если вы не регистрировались на нашем сайте, просто игнорируйте это письмо.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    part = MIMEText(html, 'html', 'utf-8')
    msg.attach(part)
    
    try:
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(msg)
        return True
    except Exception:
        return False
