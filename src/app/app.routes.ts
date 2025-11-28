import { Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { AuthShellComponent } from './auth/pages/shell/auth-shell.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AllEventsComponent } from './features/dashboard/pages/all-events/all-events.component';
import { OrganizedEventsComponent } from './features/dashboard/pages/organized-events/organized-events.component';
import { InvitedEventsComponent } from './features/dashboard/pages/invited-events/invited-events.component';
import { CreateEventComponent } from './features/events/pages/create-event/create-event.component';
import { EventDetailsComponent } from './features/events/pages/event-details/event-details.component';

export const routes: Routes = [
  { path: 'auth', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'auth/:mode', component: AuthShellComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: AllEventsComponent },
      { path: 'dashboard/organized', component: OrganizedEventsComponent },
      { path: 'dashboard/invited', component: InvitedEventsComponent },
      { path: 'events/create', component: CreateEventComponent },
      { path: 'events/:id', component: EventDetailsComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
