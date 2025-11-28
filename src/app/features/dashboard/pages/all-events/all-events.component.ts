import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TabsComponent, Tab } from '../../../../shared/components/tabs/tabs.component';
import { SearchBarComponent } from '../../../../shared/components/search-bar/search-bar.component';
import { EventCardComponent } from '../../../../shared/components/event-card/event-card.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { EventsService } from '../../../../core/services/events.service';
import { TokenStorageService } from '../../../../core/services/token-storage.service';
import { Event } from '../../../../models/event.models';

@Component({
  selector: 'app-all-events',
  standalone: true,
  imports: [
    CommonModule,
    TabsComponent,
    SearchBarComponent,
    EventCardComponent,
    EmptyStateComponent,
  ],
  templateUrl: './all-events.component.html',
  styleUrls: ['./all-events.component.scss'],
})
export class AllEventsComponent implements OnInit {
  tabs: Tab[] = [];
  allEvents: Event[] = [];
  filteredEvents: Event[] = [];
  loading = false;
  searchQuery = '';

  private organizedEvents: Event[] = [];
  private invitedEvents: Event[] = [];

  constructor(
    private readonly eventsService: EventsService,
    private readonly tokenStorage: TokenStorageService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    const userId = this.tokenStorage.getAccessToken();
    console.log('Loading events for user:', userId);
    if (!userId) return;

    this.loading = true;
    const uid = parseInt(userId, 10);

    this.eventsService.getOrganizedEvents(uid).subscribe({
      next: (events) => {
        console.log('Organized events response:', events);
        this.organizedEvents = events || [];
        this.loadInvitedEvents(uid);
      },
      error: (err) => {
        console.error('Error loading organized events:', err);
        this.organizedEvents = [];
        this.loadInvitedEvents(uid);
      },
    });
  }

  private loadInvitedEvents(userId: number): void {
    this.eventsService.getInvitedEvents(userId).subscribe({
      next: (events) => {
        console.log('Invited events response:', events);
        this.invitedEvents = events || [];
        this.allEvents = [...this.organizedEvents, ...this.invitedEvents];
        this.filteredEvents = [...this.allEvents];
        console.log('All events:', this.allEvents);
        this.updateTabs();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading invited events:', err);
        this.invitedEvents = [];
        this.allEvents = [...this.organizedEvents];
        this.filteredEvents = [...this.allEvents];
        this.updateTabs();
        this.loading = false;
      },
    });
  }

  private updateTabs(): void {
    this.tabs = [
      {
        label: 'All Events',
        route: '/dashboard',
        count: this.allEvents.length,
      },
      {
        label: 'Organized',
        route: '/dashboard/organized',
        count: this.organizedEvents.length,
      },
      {
        label: 'Invited',
        route: '/dashboard/invited',
        count: this.invitedEvents.length,
      },
    ];
  }

  onSearch(query: string): void {
    this.searchQuery = query.toLowerCase();
    if (!this.searchQuery) {
      this.filteredEvents = [...this.allEvents];
    } else {
      this.filteredEvents = this.allEvents.filter(
        (event) =>
          event.title.toLowerCase().includes(this.searchQuery) ||
          event.description?.toLowerCase().includes(this.searchQuery) ||
          event.location?.toLowerCase().includes(this.searchQuery)
      );
    }
  }

  onCreateEvent(): void {
    this.router.navigate(['/events/create']);
  }
}

