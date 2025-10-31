import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { TokenStorageService } from '../services/token-storage.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private readonly tokenStorage: TokenStorageService, private readonly router: Router) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Don't add token for login/signup endpoints
    const isAuthEndpoint = req.url.includes('/login') || req.url.includes('/signup');
    
    const token = this.tokenStorage.getAccessToken();
    const authReq = (token && !isAuthEndpoint) 
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) 
      : req;
    
    return next.handle(authReq).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401 && !isAuthEndpoint) {
          this.tokenStorage.clear();
          this.router.navigate(['/auth/login']);
        }
        return throwError(() => err);
      })
    );
  }
}


