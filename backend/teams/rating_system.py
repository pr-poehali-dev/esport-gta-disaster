def calculate_level_from_points(points: int) -> int:
    """
    Рассчитывает уровень команды на основе очков.
    
    Система уровней:
    - Уровень 1: 0-99 очков
    - Уровень 2: 100-299 очков (стартовый)
    - Уровень 3: 300-499 очков
    - Уровень 4: 500-699 очков
    - Уровень 5: 700-899 очков
    - Уровень 6: 900-1099 очков
    - Уровень 7: 1100-1299 очков
    - Уровень 8: 1300-1499 очков
    - Уровень 9: 1500-1699 очков
    - Уровень 10: 1700+ очков (максимальный)
    """
    if points < 100:
        return 1
    elif points < 300:
        return 2
    elif points < 500:
        return 3
    elif points < 700:
        return 4
    elif points < 900:
        return 5
    elif points < 1100:
        return 6
    elif points < 1300:
        return 7
    elif points < 1500:
        return 8
    elif points < 1700:
        return 9
    else:
        return 10


def calculate_points_change(winner_points: int, loser_points: int) -> tuple[int, int]:
    """
    Рассчитывает изменение очков для победителя и проигравшего.
    
    Базовые значения:
    - Победа: +50 очков
    - Поражение: -30 очков
    
    Коэффициент разницы уровней:
    - Победа над более сильной командой: больше очков
    - Поражение от более слабой команды: больше потерь
    
    Returns:
        tuple: (очки_победителя, очки_проигравшего)
    """
    BASE_WIN_POINTS = 50
    BASE_LOSE_POINTS = -30
    
    # Разница в очках между командами
    points_diff = abs(winner_points - loser_points)
    
    # Коэффициент (чем больше разница, тем больше множитель)
    multiplier = 1 + (points_diff / 1000)
    
    if winner_points < loser_points:
        # Победа над более сильным противником
        winner_gain = int(BASE_WIN_POINTS * multiplier)
        loser_loss = BASE_LOSE_POINTS
    else:
        # Победа над более слабым противником
        winner_gain = BASE_WIN_POINTS
        loser_loss = int(BASE_LOSE_POINTS * multiplier)
    
    return (winner_gain, loser_loss)


def update_team_rating_after_match(cur, conn, winner_id: int, loser_id: int):
    """
    Обновляет рейтинг команд после завершения матча.
    
    Args:
        cur: Database cursor
        conn: Database connection
        winner_id: ID команды-победителя
        loser_id: ID команды-проигравшего
    """
    # Получаем текущие данные команд
    cur.execute("""
        SELECT id, points, wins, losses, rating, level
        FROM t_p4831367_esport_gta_disaster.teams
        WHERE id IN (%s, %s)
    """, (winner_id, loser_id))
    
    teams_data = {row['id']: row for row in cur.fetchall()}
    
    if winner_id not in teams_data or loser_id not in teams_data:
        raise Exception("Одна или обе команды не найдены")
    
    winner_data = teams_data[winner_id]
    loser_data = teams_data[loser_id]
    
    winner_points = winner_data['points'] or 200
    loser_points = loser_data['points'] or 200
    
    # Рассчитываем изменение очков
    winner_gain, loser_loss = calculate_points_change(winner_points, loser_points)
    
    # Новые очки
    new_winner_points = max(0, winner_points + winner_gain)
    new_loser_points = max(0, loser_points + loser_loss)
    
    # Новые уровни
    new_winner_level = calculate_level_from_points(new_winner_points)
    new_loser_level = calculate_level_from_points(new_loser_points)
    
    # Обновляем победителя
    cur.execute("""
        UPDATE t_p4831367_esport_gta_disaster.teams
        SET points = %s,
            level = %s,
            wins = wins + 1,
            rating = rating + 25
        WHERE id = %s
    """, (new_winner_points, new_winner_level, winner_id))
    
    # Обновляем проигравшего
    cur.execute("""
        UPDATE t_p4831367_esport_gta_disaster.teams
        SET points = %s,
            level = %s,
            losses = losses + 1,
            rating = GREATEST(rating - 15, 0)
        WHERE id = %s
    """, (new_loser_points, new_loser_level, loser_id))
    
    conn.commit()
    
    return {
        'winner': {
            'points_gained': winner_gain,
            'new_points': new_winner_points,
            'new_level': new_winner_level
        },
        'loser': {
            'points_lost': loser_loss,
            'new_points': new_loser_points,
            'new_level': new_loser_level
        }
    }