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
  selector: 'app-organized-events',
  standalone: true,
  imports: [
    CommonModule,
    TabsComponent,
    SearchBarComponent,
    EventCardComponent,
    EmptyStateComponent,
  ],
  templateUrl: './organized-events.component.html',
  styleUrls: ['./organized-events.component.scss'],
})
export class OrganizedEventsComponent implements OnInit {
  tabs: Tab[] = [];
  organizedEvents: Event[] = [];
  filteredEvents: Event[] = [];
  loading = false;
  searchQuery = '';

  private invitedCount = 0;

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

    this.eventsService.getOrganizedEvents(uid).subscribe({
      next: (events) => {
        this.organizedEvents = events || [];
        this.filteredEvents = [...this.organizedEvents];
        this.loadInvitedCount(uid);
        this.loading = false;
      },
      error: () => {
        this.organizedEvents = [];
        this.filteredEvents = [];
        this.loading = false;
      },
    });
  }

  private loadInvitedCount(userId: number): void {
    this.eventsService.getInvitedEvents(userId).subscribe({
      next: (events) => {
        this.invitedCount = events?.length || 0;
        this.updateTabs();
      },
      error: () => {
        this.invitedCount = 0;
        this.updateTabs();
      },
    });
  }

  private updateTabs(): void {
    this.tabs = [
      {
        label: 'All Events',
        route: '/dashboard',
        count: this.organizedEvents.length + this.invitedCount,
      },
      {
        label: 'Organized',
        route: '/dashboard/organized',
        count: this.organizedEvents.length,
      },
      {
        label: 'Invited',
        route: '/dashboard/invited',
        count: this.invitedCount,
      },
    ];
  }

  onSearch(query: string): void {
    this.searchQuery = query.toLowerCase();
    if (!this.searchQuery) {
      this.filteredEvents = [...this.organizedEvents];
    } else {
      this.filteredEvents = this.organizedEvents.filter(
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

