import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiClientService } from '../core/services/api-client.service';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '../models/auth.models';
import { TokenStorageService } from '../core/services/token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private readonly api: ApiClientService, private readonly tokenStorage: TokenStorageService) {}

  login(payload: LoginRequest): Observable<LoginResponse> {
    console.log('Sending login request to:', '/login', payload);
    return this.api.post<LoginResponse>('/login', payload).pipe(
      tap(res => {
        console.log('Login response:', res);
        // Store user_id as token for now (you can adjust based on your needs)
        this.tokenStorage.saveAccessToken(res.user_id.toString());
      })
    );
  }

  register(payload: RegisterRequest): Observable<RegisterResponse> {
    console.log('Sending signup request to:', '/signup', payload);
    return this.api.post<RegisterResponse>('/signup', payload).pipe(
      tap(res => console.log('Signup response:', res))
    );
  }

  logout(): void {
    this.tokenStorage.clear();
  }
}


