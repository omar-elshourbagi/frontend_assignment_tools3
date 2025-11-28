import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { InviteModalComponent } from '../../../../shared/components/invite-modal/invite-modal.component';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';
import { EventsService } from '../../../../core/services/events.service';
import { TokenStorageService } from '../../../../core/services/token-storage.service';
import { Event, Attendee } from '../../../../models/event.models';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [CommonModule, ButtonComponent, InviteModalComponent, ConfirmModalComponent],
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.scss'],
})
export class EventDetailsComponent implements OnInit {
  event: Event | null = null;
  attendees: Attendee[] = [];
  loading = true;
  eventId: number = 0;
  showInviteModal = false;
  showDeleteConfirm = false;
  deleting = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly eventsService: EventsService,
    private readonly tokenStorage: TokenStorageService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.eventId = parseInt(id, 10);
      this.loadEventDetails();
    }
  }

  loadEventDetails(): void {
    // For now, we'll show a placeholder since we don't have a specific event detail endpoint
    // You can connect this later when the backend endpoint is ready
    this.loading = false;
    
    // Placeholder event (you can remove this when connecting real API)
    this.event = {
      id: this.eventId,
      organizer_id: 0,
      title: 'Event Title',
      date: '2025-12-05',
      time: '18:00',
      location: 'Location',
      description: 'Event description will appear here once connected to the backend.',
    };

    this.loadAttendees();
  }

  loadAttendees(): void {
    const token = this.tokenStorage.getAccessToken();
    const userId = token ? parseInt(token, 10) : undefined;
    
    if (!userId) {
      this.attendees = [];
      return;
    }

    // Use sent invitations endpoint to get invited users with their info
    this.eventsService.getSentInvitations(userId, this.eventId).subscribe({
      next: (attendees) => {
        console.log('Loaded attendees:', attendees);
        this.attendees = attendees || [];
      },
      error: (err) => {
        console.error('Failed to load attendees:', err);
        this.attendees = [];
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  openDeleteConfirm(): void {
    this.showDeleteConfirm = true;
  }

  closeDeleteConfirm(): void {
    this.showDeleteConfirm = false;
  }

  confirmDelete(): void {
    const token = this.tokenStorage.getAccessToken();
    const userId = token ? parseInt(token, 10) : undefined;
    
    this.deleting = true;
    this.eventsService.deleteEvent(this.eventId, userId).subscribe({
      next: () => {
        console.log('Event deleted successfully');
        this.deleting = false;
        this.showDeleteConfirm = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Delete event error:', err);
        this.deleting = false;
        this.showDeleteConfirm = false;
        alert('Failed to delete event: ' + (err?.error?.detail || err?.message || 'Unknown error'));
      },
    });
  }

  openInviteModal(): void {
    this.showInviteModal = true;
  }

  closeInviteModal(): void {
    this.showInviteModal = false;
  }

  onUserInvited(): void {
    // Reload attendees after inviting someone
    this.loadAttendees();
  }
}

