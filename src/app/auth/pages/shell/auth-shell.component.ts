import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { LoginComponent } from '../login/login.component';
import { RegisterComponent } from '../register/register.component';

type AuthMode = 'login' | 'register';

@Component({
  selector: 'app-auth-shell',
  standalone: true,
  imports: [CommonModule, LoginComponent, RegisterComponent],
  templateUrl: './auth-shell.component.html',
  styleUrls: ['./auth-shell.component.scss'],
})
export class AuthShellComponent implements OnInit, OnDestroy {
  mode: AuthMode = 'login';
  private sub?: Subscription;

  constructor(private readonly router: Router, private readonly route: ActivatedRoute) {}

  ngOnInit(): void {
    this.updateMode();
    this.sub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => this.updateMode());
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private updateMode(): void {
    const segment = this.route.snapshot.paramMap.get('mode');
    this.mode = segment === 'register' ? 'register' : 'login';
  }

  goLogin(): void {
    this.mode = 'login';
    this.router.navigate(['/auth/login']);
  }

  goRegister(): void {
    this.mode = 'register';
    this.router.navigate(['/auth/register']);
  }
}


