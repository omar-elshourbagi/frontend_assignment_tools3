import { Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthShellComponent } from './auth/pages/shell/auth-shell.component';

export const routes: Routes = [
  { path: 'auth', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'auth/:mode', component: AuthShellComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth/login' },
];
