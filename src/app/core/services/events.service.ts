import { Injectable } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { ApiClientService } from './api-client.service';
import {
  Attendee,
  CreateEventRequest,
  CreateEventResponse,
  Event,
  InviteUserRequest,
  SearchEventsParams,
  UpdateAttendanceRequest,
} from '../../models/event.models';

@Injectable({ providedIn: 'root' })
export class EventsService {
  constructor(private readonly api: ApiClientService) {}

  // POST /events
  createEvent(userId: number, payload: CreateEventRequest): Observable<CreateEventResponse> {
    console.log('Creating event with payload:', payload, 'for user:', userId);
    // Backend expects user_id as a query parameter
    return this.api.post<CreateEventResponse>(`/events?user_id=${userId}`, payload).pipe(
      tap(res => console.log('Create event response:', res))
    );
  }

  // GET /events/organized?user_id=...
  getOrganizedEvents(userId: number): Observable<Event[]> {
    return this.api.get<Event[] | { data: Event[] }>('/events/organized', { user_id: userId }).pipe(
      tap(res => console.log('Raw organized events API response:', res)),
      map(res => Array.isArray(res) ? res : (res.data || []))
    );
  }

  // GET /events/invited?user_id=...
  getInvitedEvents(userId: number): Observable<Event[]> {
    return this.api.get<Event[] | { data: Event[] }>('/events/invited', { user_id: userId }).pipe(
      tap(res => console.log('Raw invited events API response:', res)),
      map(res => Array.isArray(res) ? res : (res.data || []))
    );
  }

  // GET /events/{event_id}/attendees
      getEventAttendees(eventId: number, userId?: number): Observable<Attendee[]> {
    const url = userId 
      ? `/events/${eventId}/attendees?user_id=${userId}` 
      : `/events/${eventId}/attendees`;
    console.log('Getting attendees:', url);
    return this.api.get<Attendee[] | { data: Attendee[] }>(url).pipe(
      tap(res => console.log('Attendees response:', res)),
      map(res => Array.isArray(res) ? res : (res.data || []))
    );
  }

  // POST /events/{event_id}/invite
  inviteUser(eventId: number, inviteeId: number, inviterId: number): Observable<unknown> {
    // Backend expects inviter_id as query param and userId in body
    const url = `/events/${eventId}/invite?inviter_id=${inviterId}`;
    const body = { userId: inviteeId };
    console.log('Inviting user:', url, 'body:', body);
    return this.api.post<unknown>(url, body).pipe(
      tap(res => console.log('Invite response:', res))
    );
  }

  // PUT /events/{event_id}/attendance
  updateAttendanceStatus(eventId: number, payload: UpdateAttendanceRequest): Observable<{ updated: boolean }> {
    return this.api.put<{ updated: boolean }>(`/events/${eventId}/attendance`, payload);
  }

  // DELETE /events/{event_id}
  deleteEvent(eventId: number, userId?: number): Observable<unknown> {
    const url = userId ? `/events/${eventId}?user_id=${userId}` : `/events/${eventId}`;
    console.log('Deleting event:', url);
    return this.api.delete(url).pipe(
      tap(res => console.log('Delete event response:', res))
    );
  }

  // GET /events/search
  searchEvents(params: SearchEventsParams): Observable<Event[]> {
    return this.api.get<Event[] | { data: Event[] }>('/events/search', params as Record<string, string | number | boolean>).pipe(
      map(res => Array.isArray(res) ? res : (res.data || []))
    );
  }

  // GET /events/invitations/sent - Get invitations sent by current user
  getSentInvitations(userId: number, eventId?: number): Observable<Attendee[]> {
    let url = `/events/invitations/sent?user_id=${userId}`;
    if (eventId) {
      url += `&event_id=${eventId}`;
    }
    console.log('Getting sent invitations:', url);
    return this.api.get<Attendee[] | { data: Attendee[] }>(url).pipe(
      tap(res => console.log('Sent invitations response:', res)),
      map(res => Array.isArray(res) ? res : (res.data || []))
    );
  }
}


