import { Injectable } from '@angular/core';

const ACCESS_TOKEN_KEY = 'access_token';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  saveAccessToken(token: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  clear(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
}


