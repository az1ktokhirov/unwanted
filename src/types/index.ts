export type Locale = "uz" | "ru" | "en";

export interface Player {
  id: string;
  name_uz: string;
  name_ru: string;
  name_en: string;
  position_uz: string;
  position_ru: string;
  position_en: string;
  number: number | null;
  photo_url: string | null;
  bio_uz: string | null;
  bio_ru: string | null;
  bio_en: string | null;
  birthdate: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  nationality: string;
  dominant_foot: string | null;
  joined_date: string | null;
  contract_until: string | null;
  status: "active" | "reserve" | "injured" | "inactive";
  is_active: boolean;
  created_at: string;
}

export interface Match {
  id: string;
  opponent_uz: string;
  opponent_ru: string;
  opponent_en: string;
  opponent_logo_url: string | null;
  match_date: string;
  venue_uz: string | null;
  venue_ru: string | null;
  venue_en: string | null;
  stadium: string | null;
  attendance: number | null;
  referee: string | null;
  competition_uz: string;
  competition_ru: string;
  competition_en: string;
  season: string;
  round: string | null;
  score_home: number | null;
  score_away: number | null;
  status: "upcoming" | "finished" | "live" | "draft";
  highlight_url: string | null;
  created_at: string;
}

export interface MatchEvent {
  id: string;
  match_id: string;
  minute: number;
  extra_time: number;
  event_type: "goal" | "yellow_card" | "red_card" | "substitution";
  team: "home" | "away";
  player_id: string | null;
  player_name: string | null;
  description: string | null;
  created_at: string;
}

export interface PlayerStats {
  id: string;
  player_id: string;
  match_id: string;
  goals: number;
  assists: number;
  yellow_cards: number;
  red_cards: number;
  minutes_played: number;
  shots_total: number;
  shots_on_target: number;
  passes_total: number;
  passes_accuracy: number | null;
  rating: number | null;
  is_starter: boolean;
}

export interface MatchStats {
  id: string;
  match_id: string;
  possession_home: number;
  possession_away: number;
  shots_home: number;
  shots_away: number;
  shots_on_target_home: number;
  shots_on_target_away: number;
  corners_home: number;
  corners_away: number;
  fouls_home: number;
  fouls_away: number;
  yellow_home: number;
  yellow_away: number;
  red_home: number;
  red_away: number;
}

export interface News {
  id: string;
  title_uz: string;
  title_ru: string;
  title_en: string;
  body_uz: string;
  body_ru: string;
  body_en: string;
  excerpt_uz: string | null;
  excerpt_ru: string | null;
  excerpt_en: string | null;
  cover_url: string | null;
  slug: string;
  category: "match" | "club" | "interview" | "media" | "announcement" | "tournament";
  published_at: string | null;
  status: "draft" | "published" | "scheduled" | "archived";
  tags: string[];
  views: number;
  author_id: string | null;
  created_at: string;
}

export interface Media {
  id: string;
  title_uz: string;
  title_ru: string;
  title_en: string;
  youtube_id: string;
  thumbnail_url: string | null;
  category: "match" | "vlog" | "behind_scenes" | "shorts" | "training" | "interview" | "highlight";
  views_count: number;
  duration_seconds: number | null;
  published_at: string | null;
  is_published: boolean;
  is_featured: boolean;
}

export interface LeagueStanding {
  id: string;
  season: string;
  competition: string;
  team_name: string;
  team_logo_url: string | null;
  is_unwanted_boys: boolean;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_diff: number;
  points: number;
  form: string[];
}

export interface Partner {
  id: string;
  name: string;
  logo_url: string | null;
  website: string | null;
  category: "equipment" | "food" | "finance" | "media" | "insurance" | "telecom" | "other";
  description_uz: string | null;
  description_ru: string | null;
  description_en: string | null;
  contact_person: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contract_start: string | null;
  contract_end: string | null;
  status: "active" | "inactive" | "pending" | "expired";
  priority: number;
  views_count: number;
  created_at: string;
}

export interface Banner {
  id: string;
  name: string;
  image_url: string | null;
  link_url: string | null;
  placement: "hero_slider" | "below_hero" | "news_sidebar" | "match_sidebar" | "player_page_bottom" | "media_top";
  type: "image" | "video";
  status: "active" | "inactive" | "scheduled";
  start_date: string | null;
  end_date: string | null;
  priority: number;
  device: "all" | "desktop" | "mobile";
  views: number;
  clicks: number;
  created_at: string;
}

export interface Page {
  id: string;
  slug: string;
  title_uz: string;
  title_ru: string;
  title_en: string;
  content_uz: string | null;
  content_ru: string | null;
  content_en: string | null;
  cover_url: string | null;
  is_published: boolean;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: "super_admin" | "admin" | "manager" | "editor" | "moderator" | "viewer";
  is_active: boolean;
  last_login: string | null;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  admin_user_id: string;
  action: "create" | "update" | "delete" | "publish" | "login" | "logout";
  module: string;
  description: string;
  entity_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  status: "success" | "error" | "warning";
  created_at: string;
}

export interface SiteSetting {
  key: string;
  value_uz: string | null;
  value_ru: string | null;
  value_en: string | null;
  type: string;
}
