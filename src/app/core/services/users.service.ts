import { Injectable } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { ApiClientService } from './api-client.service';

export interface User {
  id: number;
  name: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  constructor(private readonly api: ApiClientService) {}

  // GET /me - Get current logged-in user's info
  getCurrentUser(userId: number): Observable<User> {
    return this.api.get<User | { data: User }>(`/me?user_id=${userId}`).pipe(
      tap(res => console.log('Current user response:', res)),
      map(res => {
        if (res && typeof res === 'object' && 'data' in res) {
          return res.data;
        }
        return res as User;
      })
    );
  }

  // GET /users - Get all registered users
  getAllUsers(): Observable<User[]> {
    return this.api.get<User[] | { data: User[] }>('/users').pipe(
      tap(res => console.log('Raw users API response:', res)),
      map(res => Array.isArray(res) ? res : (res.data || []))
    );
  }
}

