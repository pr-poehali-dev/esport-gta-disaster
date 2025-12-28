const API_BASE = 'https://functions.poehali.dev/a4eec727-e4f2-4b3c-b8d3-06dbb78ab515';

export interface Tournament {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  maxTeams: number;
  registrationOpen: boolean;
  gameType: string;
  prizePool: string;
  rules?: string;
  createdAt: string;
  registeredTeams: number;
  teams?: Team[];
}

export interface News {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  createdAt: string;
  updatedAt?: string;
  author: string;
}

export interface Team {
  id: number;
  name: string;
  tag?: string;
  logo?: string;
  logo_url?: string;
  wins: number;
  losses: number;
  draws?: number;
  rating: number;
  verified?: boolean;
  description?: string;
  created_at?: string;
  level?: number;
  xp?: number;
  team_color?: string;
  win_rate?: number;
  members?: any[];
  member_count?: number;
}

export interface Match {
  id: number;
  tournamentId: number;
  tournamentName?: string;
  team1: {
    id: number;
    name: string;
    logo?: string;
    tag?: string;
    score?: number;
  };
  team2: {
    id: number;
    name: string;
    logo?: string;
    tag?: string;
    score?: number;
  };
  status: string;
  scheduledTime?: string;
  matchNumber?: number;
  roundName?: string;
}

export const api = {
  getTournaments: async (): Promise<Tournament[]> => {
    const response = await fetch(`${API_BASE}?resource=tournaments`);
    if (!response.ok) throw new Error('Ошибка загрузки турниров');
    const data = await response.json();
    return data.tournaments || [];
  },

  getTournament: async (id: number): Promise<Tournament> => {
    const response = await fetch(`${API_BASE}?resource=tournaments&id=${id}`);
    if (!response.ok) throw new Error('Турнир не найден');
    return response.json();
  },

  getNews: async (limit = 10, offset = 0): Promise<{ news: News[]; total: number }> => {
    const response = await fetch(`${API_BASE}?resource=news&limit=${limit}&offset=${offset}`);
    if (!response.ok) throw new Error('Ошибка загрузки новостей');
    return response.json();
  },

  getNewsItem: async (id: number): Promise<News> => {
    const response = await fetch(`${API_BASE}?resource=news&id=${id}`);
    if (!response.ok) throw new Error('Новость не найдена');
    return response.json();
  },

  getTeams: async (): Promise<Team[]> => {
    const response = await fetch(API_BASE);
    if (!response.ok) throw new Error('Ошибка загрузки команд');
    const data = await response.json();
    return data.teams || [];
  },

  getTournamentMatches: async (tournamentId: number): Promise<Match[]> => {
    const response = await fetch(`${API_BASE}?resource=matches&tournament_id=${tournamentId}`);
    if (!response.ok) throw new Error('Ошибка загрузки матчей');
    const data = await response.json();
    return data.matches || [];
  },

  getMatch: async (matchId: number): Promise<Match> => {
    const response = await fetch(`${API_BASE}?match_id=${matchId}`);
    if (!response.ok) throw new Error('Матч не найден');
    const data = await response.json();
    return data.match;
  },
};
