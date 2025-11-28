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
  selector: 'app-invited-events',
  standalone: true,
  imports: [
    CommonModule,
    TabsComponent,
    SearchBarComponent,
    EventCardComponent,
    EmptyStateComponent,
  ],
  templateUrl: './invited-events.component.html',
  styleUrls: ['./invited-events.component.scss'],
})
export class InvitedEventsComponent implements OnInit {
  tabs: Tab[] = [];
  invitedEvents: Event[] = [];
  filteredEvents: Event[] = [];
  loading = false;
  searchQuery = '';

  private organizedCount = 0;

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
    if (!userId) return;

    this.loading = true;
    const uid = parseInt(userId, 10);

    this.eventsService.getInvitedEvents(uid).subscribe({
      next: (events) => {
        this.invitedEvents = events || [];
        this.filteredEvents = [...this.invitedEvents];
        this.loadOrganizedCount(uid);
        this.loading = false;
      },
      error: () => {
        this.invitedEvents = [];
        this.filteredEvents = [];
        this.loading = false;
      },
    });
  }

  private loadOrganizedCount(userId: number): void {
    this.eventsService.getOrganizedEvents(userId).subscribe({
      next: (events) => {
        this.organizedCount = events?.length || 0;
        this.updateTabs();
      },
      error: () => {
        this.organizedCount = 0;
        this.updateTabs();
      },
    });
  }

  private updateTabs(): void {
    this.tabs = [
      {
        label: 'All Events',
        route: '/dashboard',
        count: this.organizedCount + this.invitedEvents.length,
      },
      {
        label: 'Organized',
        route: '/dashboard/organized',
        count: this.organizedCount,
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
      this.filteredEvents = [...this.invitedEvents];
    } else {
      this.filteredEvents = this.invitedEvents.filter(
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

