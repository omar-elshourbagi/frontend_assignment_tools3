import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { TokenStorageService } from '../core/services/token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private readonly tokenStorage: TokenStorageService, private readonly router: Router) {}

  canActivate(): boolean {
    const token = this.tokenStorage.getAccessToken();
    if (!token) {
      this.router.navigate(['/auth/login']);
      return false;
    }
    return true;
  }
}


