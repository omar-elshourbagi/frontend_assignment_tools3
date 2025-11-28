import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { EventsService } from '../core/services/events.service';
import { TokenStorageService } from '../core/services/token-storage.service';
import { Event } from '../models/event.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  organizedEvents: Event[] = [];
  invitedEvents: Event[] = [];
  loading = false;
  errorMessage = '';
  showCreate = false;
  createForm = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    date: ['', [Validators.required]],
    time: ['', [Validators.required]],
    location: ['', [Validators.required]],
    description: [''],
  });

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly eventsService: EventsService,
    private readonly tokenStorage: TokenStorageService,
    private readonly fb: FormBuilder,
  ) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  openCreateForm(): void {
    this.errorMessage = '';
    this.showCreate = true;
  }

  closeCreateForm(): void {
    this.showCreate = false;
    this.createForm.reset();
  }

  submitCreate(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }
    const token = this.tokenStorage.getAccessToken();
    const userId = token ? Number(token) : NaN;
    if (!userId) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.loading = true;
    const payload = this.createForm.getRawValue();
    this.eventsService.createEvent(userId, payload).subscribe({
      next: () => {
        this.closeCreateForm();
        this.reloadLists(userId);
      },
      error: () => {
        this.errorMessage = 'Failed to create event';
        this.loading = false;
      },
    });
  }

  ngOnInit(): void {
    const token = this.tokenStorage.getAccessToken();
    const userId = token ? Number(token) : NaN;
    if (!userId) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.reloadLists(userId);
  }

  private reloadLists(userId: number): void {
    this.loading = true;
    this.errorMessage = '';
    // Load organized and invited events
    this.eventsService.getOrganizedEvents(userId).subscribe({
      next: events => this.organizedEvents = events || [],
      error: () => this.errorMessage = 'Failed to load organized events',
    });
    this.eventsService.getInvitedEvents(userId).subscribe({
      next: events => this.invitedEvents = events || [],
      error: () => this.errorMessage = 'Failed to load invited events',
      complete: () => this.loading = false,
    });
  }

  get allEventsCount(): number {
    return this.organizedEvents.length + this.invitedEvents.length;
  }

  get allEvents(): Event[] {
    const byId = new Map<number, Event>();
    [...this.organizedEvents, ...this.invitedEvents].forEach(ev => {
      byId.set(ev.id, ev);
    });
    return Array.from(byId.values());
  }
}


