export interface Event {
  id: number;
  title: string;
  description?: string;
  location?: string;
  date?: string; // YYYY-MM-DD
  time?: string; // HH:mm
  organizer_id: number;
}

export interface Attendee {
  user_id: number;
  name?: string;
  email?: string;
  status?: 'going' | 'interested' | 'not_going' | 'invited';
}

export interface CreateEventRequest {
  title: string;
  description?: string;
  location?: string;
  date?: string; // YYYY-MM-DD
  time?: string; // HH:mm
}

export interface CreateEventResponse {
  id: number;
}

export interface InviteUserRequest {
  user_id: number; // who to invite
}

export interface UpdateAttendanceRequest {
  user_id: number;
  status: 'going' | 'interested' | 'not_going';
}

export interface SearchEventsParams {
  q?: string;
  from?: string; // ISO date
  to?: string;   // ISO date
  location?: string;
  organizer_id?: number;
  user_id?: number;
  page?: number;
  size?: number;
}


