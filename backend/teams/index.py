import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    '''API для работы с командами: получение списка верифицированных команд с составами'''
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id'
            },
            'body': ''
        }

    if method == 'GET':
        return get_verified_teams()
    
    return {
        'statusCode': 405,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': 'Method not allowed'})
    }


def get_verified_teams() -> dict:
    '''Получение всех верифицированных команд с их составами'''
    conn = None
    try:
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            # Получаем команды
            cursor.execute("""
                SELECT 
                    t.id,
                    t.name,
                    t.tag,
                    t.logo_url,
                    t.wins,
                    t.losses,
                    t.verified,
                    t.description,
                    t.created_at,
                    CASE 
                        WHEN (t.wins + t.losses) > 0 THEN ROUND((t.wins::decimal / (t.wins + t.losses)) * 100)
                        ELSE 0 
                    END as win_rate
                FROM teams t
                WHERE t.verified = TRUE
                ORDER BY t.wins DESC, t.created_at DESC
            """)
            teams = cursor.fetchall()
            
            # Для каждой команды получаем участников
            for team in teams:
                cursor.execute("""
                    SELECT 
                        tm.id,
                        tm.player_nickname,
                        tm.player_role,
                        tm.joined_at,
                        u.username,
                        u.email
                    FROM team_members tm
                    JOIN users u ON tm.user_id = u.id
                    WHERE tm.team_id = %s
                    ORDER BY tm.joined_at ASC
                """, (team['id'],))
                team['members'] = cursor.fetchall()
                team['member_count'] = len(team['members'])
        
        # Конвертируем datetime объекты в строки
        for team in teams:
            if team.get('created_at'):
                team['created_at'] = team['created_at'].isoformat()
            for member in team.get('members', []):
                if member.get('joined_at'):
                    member['joined_at'] = member['joined_at'].isoformat()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'teams': teams,
                'total': len(teams)
            })
        }
    
    except Exception as e:
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
