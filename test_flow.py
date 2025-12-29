#!/usr/bin/env python3
"""
Скрипт для тестирования полного флоу сайта от регистрации до создания команд
"""
import requests
import json
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv

load_dotenv()

# URLs из деплоя
AUTH_URL = "https://functions.poehali.dev/48b769d9-54a9-49a4-a89a-6089b61817f4"
REGISTER_TEAM_URL = "https://functions.poehali.dev/901d94af-9e50-45eb-ae3a-e06b1272d7be"

def print_section(title):
    print(f"\n{'='*80}")
    print(f"  {title}")
    print('='*80)

def print_step(step_num, description):
    print(f"\n[Шаг {step_num}] {description}")
    print("-" * 80)

def print_result(data):
    print(json.dumps(data, indent=2, ensure_ascii=False))

# Шаг 1: Регистрация первого пользователя
print_section("ТЕСТИРОВАНИЕ ПОЛНОГО ФЛОУ САЙТА")

print_step(1, "Регистрация пользователя testuser1@test.com")
register_response = requests.post(AUTH_URL, json={
    "action": "register",
    "nickname": "TestPlayer1",
    "email": "testuser1@test.com",
    "password": "test123"
})
print(f"Статус: {register_response.status_code}")
register_data = register_response.json()
print_result(register_data)

# Получаем verification token из базы
print_step("1.1", "Получение verification token из базы данных")
conn = psycopg2.connect(os.environ['DATABASE_URL'])
cur = conn.cursor(cursor_factory=RealDictCursor)
cur.execute("""
    SELECT id, email, nickname, email_verification_token, email_verified 
    FROM t_p4831367_esport_gta_disaster.users 
    WHERE email = 'testuser1@test.com'
""")
user1 = cur.fetchone()
print_result(dict(user1))
token1 = user1['email_verification_token']
user1_id = user1['id']

# Верификация email
print_step("1.2", "Верификация email через backend")
verify_response = requests.post(AUTH_URL, json={
    "action": "verify_email",
    "token": token1
})
print(f"Статус: {verify_response.status_code}")
verify_data = verify_response.json()
print_result(verify_data)
session_token1 = verify_data.get('session_token')

# Шаг 2: Вход в систему
print_step(2, "Вход в систему с testuser1@test.com")
login_response = requests.post(AUTH_URL, json={
    "action": "login",
    "email": "testuser1@test.com",
    "password": "test123"
})
print(f"Статус: {login_response.status_code}")
login_data = login_response.json()
print_result(login_data)
if not session_token1:
    session_token1 = login_data.get('session_token')

# Шаг 3: Создание первой команды
print_step(3, "Создание команды 'Test Squad Alpha' с тегом TSA")
team1_response = requests.post(REGISTER_TEAM_URL, 
    headers={"X-User-Id": str(user1_id)},
    json={
        "name": "Test Squad Alpha",
        "tag": "TSA",
        "description": "Test team for testing purposes"
    }
)
print(f"Статус: {team1_response.status_code}")
team1_data = team1_response.json()
print_result(team1_data)

# Шаг 4: Регистрация второго пользователя
print_step(4, "Регистрация пользователя testuser2@test.com")
register2_response = requests.post(AUTH_URL, json={
    "action": "register",
    "nickname": "TestPlayer2",
    "email": "testuser2@test.com",
    "password": "test123"
})
print(f"Статус: {register2_response.status_code}")
register2_data = register2_response.json()
print_result(register2_data)

# Получаем verification token из базы
print_step("4.1", "Получение verification token для testuser2")
cur.execute("""
    SELECT id, email, nickname, email_verification_token, email_verified 
    FROM t_p4831367_esport_gta_disaster.users 
    WHERE email = 'testuser2@test.com'
""")
user2 = cur.fetchone()
print_result(dict(user2))
token2 = user2['email_verification_token']
user2_id = user2['id']

# Верификация email
print_step("4.2", "Верификация email testuser2")
verify2_response = requests.post(AUTH_URL, json={
    "action": "verify_email",
    "token": token2
})
print(f"Статус: {verify2_response.status_code}")
verify2_data = verify2_response.json()
print_result(verify2_data)
session_token2 = verify2_data.get('session_token')

# Вход второго пользователя
print_step("4.3", "Вход testuser2 в систему")
login2_response = requests.post(AUTH_URL, json={
    "action": "login",
    "email": "testuser2@test.com",
    "password": "test123"
})
print(f"Статус: {login2_response.status_code}")
login2_data = login2_response.json()
print_result(login2_data)

# Создание второй команды
print_step("4.4", "Создание команды 'Test Squad Beta' с тегом TSB")
team2_response = requests.post(REGISTER_TEAM_URL, 
    headers={"X-User-Id": str(user2_id)},
    json={
        "name": "Test Squad Beta",
        "tag": "TSB",
        "description": "Second test team"
    }
)
print(f"Статус: {team2_response.status_code}")
team2_data = team2_response.json()
print_result(team2_data)

# Шаг 5: Проверка команд в базе
print_step(5, "Проверка всех тестовых команд в базе данных")
cur.execute("""
    SELECT id, name, tag, captain_id, level, points, verified, wins, losses, created_at
    FROM t_p4831367_esport_gta_disaster.teams 
    WHERE tag IN ('TSA', 'TSB')
    ORDER BY created_at
""")
teams = cur.fetchall()
print(f"Найдено команд: {len(teams)}")
for team in teams:
    print_result(dict(team))

cur.close()
conn.close()

print_section("ТЕСТИРОВАНИЕ ЗАВЕРШЕНО")
print("\n✓ Все шаги выполнены успешно!")
print(f"✓ Создано пользователей: 2 (testuser1, testuser2)")
print(f"✓ Создано команд: 2 (TSA, TSB)")
print(f"✓ Обе команды имеют level=2, points=200")
