import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
import urllib.request
import urllib.error

def handler(event: dict, context) -> dict:
    '''API для модерации заявок на турниры: просмотр, одобрение и отклонение заявок команд'''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
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
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute('SELECT role, is_organizer FROM users WHERE id = %s', (user_id,))
            user = cur.fetchone()
            
            if not user or (user['role'] != 'admin' and not user['is_organizer']):
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Access denied. Admin or organizer role required'})
                }
        
        if method == 'GET':
            query_params = event.get('queryStringParameters', {}) or {}
            tournament_name = query_params.get('tournament')
            return get_registrations(conn, tournament_name)
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            return moderate_registration(conn, user_id, body)
        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'})
            }
    finally:
        conn.close()


def get_registrations(conn, tournament_name: str = None) -> dict:
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        if tournament_name:
            cur.execute('''
                SELECT 
                    tr.id, tr.tournament_name, tr.moderation_status, 
                    tr.moderation_comment, tr.registered_at,
                    tr.moderated_at,
                    t.id as team_id, t.name as team_name, t.logo_url,
                    u.nickname as captain_nickname,
                    mod_user.nickname as moderator_nickname
                FROM tournament_registrations tr
                JOIN teams t ON tr.team_id = t.id
                JOIN users u ON t.captain_id = u.id
                LEFT JOIN users mod_user ON tr.moderated_by = mod_user.id
                WHERE tr.tournament_name = %s
                ORDER BY 
                    CASE tr.moderation_status 
                        WHEN 'pending' THEN 1 
                        WHEN 'approved' THEN 2 
                        WHEN 'rejected' THEN 3 
                    END,
                    tr.registered_at DESC
            ''', (tournament_name,))
        else:
            cur.execute('''
                SELECT 
                    tr.id, tr.tournament_name, tr.moderation_status, 
                    tr.moderation_comment, tr.registered_at,
                    tr.moderated_at,
                    t.id as team_id, t.name as team_name, t.logo_url,
                    u.nickname as captain_nickname,
                    mod_user.nickname as moderator_nickname
                FROM tournament_registrations tr
                JOIN teams t ON tr.team_id = t.id
                JOIN users u ON t.captain_id = u.id
                LEFT JOIN users mod_user ON tr.moderated_by = mod_user.id
                ORDER BY 
                    CASE tr.moderation_status 
                        WHEN 'pending' THEN 1 
                        WHEN 'approved' THEN 2 
                        WHEN 'rejected' THEN 3 
                    END,
                    tr.registered_at DESC
            ''')
        
        registrations = cur.fetchall()
        
        result = []
        for reg in registrations:
            r = dict(reg)
            if r['registered_at']:
                r['registered_at'] = r['registered_at'].isoformat()
            if r.get('moderated_at'):
                r['moderated_at'] = r['moderated_at'].isoformat()
            
            cur.execute('''
                SELECT player_nickname, player_role
                FROM team_members
                WHERE team_id = %s
                ORDER BY 
                    CASE player_role WHEN 'main' THEN 1 WHEN 'reserve' THEN 2 END
            ''', (r['team_id'],))
            
            roster = cur.fetchall()
            r['roster'] = [dict(p) for p in roster]
            
            result.append(r)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(result)
        }


def moderate_registration(conn, moderator_id: str, data: dict) -> dict:
    registration_id = data.get('registration_id')
    status = data.get('status')
    comment = data.get('comment', '')
    
    if not registration_id or not status:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'registration_id and status are required'})
        }
    
    if status not in ['approved', 'rejected']:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'status must be "approved" or "rejected"'})
        }
    
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute('''
            SELECT tr.id, tr.tournament_name, tr.team_id,
                   t.name as team_name, 
                   u.nickname as captain_nickname,
                   u.discord as captain_discord
            FROM tournament_registrations tr
            JOIN teams t ON tr.team_id = t.id
            JOIN users u ON t.captain_id = u.id
            WHERE tr.id = %s
        ''', (registration_id,))
        
        reg_info = cur.fetchone()
        
        if not reg_info:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Registration not found'})
            }
        
        cur.execute('''
            UPDATE tournament_registrations
            SET moderation_status = %s,
                moderation_comment = %s,
                moderated_by = %s,
                moderated_at = CURRENT_TIMESTAMP
            WHERE id = %s
            RETURNING id, tournament_name, moderation_status
        ''', (status, comment, moderator_id, registration_id))
        
        updated = cur.fetchone()
        conn.commit()
        
        send_discord_notification(
            team_name=reg_info['team_name'],
            captain_nickname=reg_info['captain_nickname'],
            captain_discord=reg_info.get('captain_discord', ''),
            tournament_name=reg_info['tournament_name'],
            status=status,
            comment=comment
        )
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(dict(updated))
        }


def send_discord_notification(team_name: str, captain_nickname: str, captain_discord: str, 
                             tournament_name: str, status: str, comment: str = ''):
    webhook_url = os.environ.get('DISCORD_WEBHOOK_URL')
    if not webhook_url:
        return
    
    status_emoji = '✅' if status == 'approved' else '❌'
    status_text = 'ОДОБРЕНА' if status == 'approved' else 'ОТКЛОНЕНА'
    color = 3066993 if status == 'approved' else 15158332
    
    embed = {
        'title': f'{status_emoji} Заявка {status_text}',
        'description': f'Команда **{team_name}** на турнир **{tournament_name}**',
        'color': color,
        'fields': [
            {'name': '👑 Капитан', 'value': captain_nickname, 'inline': True},
        ],
        'footer': {'text': 'DISASTER ESPORTS'},
        'timestamp': None
    }
    
    if captain_discord:
        embed['fields'].append({'name': '💬 Discord', 'value': captain_discord, 'inline': True})
    
    if comment:
        embed['fields'].append({'name': '📝 Комментарий', 'value': comment, 'inline': False})
    
    payload = {
        'embeds': [embed]
    }
    
    try:
        req = urllib.request.Request(
            webhook_url,
            data=json.dumps(payload).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        urllib.request.urlopen(req, timeout=5)
    except (urllib.error.URLError, Exception):
        pass