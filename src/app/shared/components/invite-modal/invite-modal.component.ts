import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { EventsService } from '../../../core/services/events.service';
import { UsersService, User } from '../../../core/services/users.service';
import { TokenStorageService } from '../../../core/services/token-storage.service';

@Component({
  selector: 'app-invite-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invite-modal.component.html',
  styleUrls: ['./invite-modal.component.scss'],
})
export class InviteModalComponent implements OnInit {
  @Input() eventId!: number;
  @Input() eventTitle: string = 'Event';
  @Output() close = new EventEmitter<void>();
  @Output() invited = new EventEmitter<User>();

  searchQuery = '';
  loading = false;
  inviting = false;
  users: User[] = [];
  filteredUsers: User[] = [];
  selectedUser: User | null = null;
  successMessage = '';
  errorMessage = '';

  private searchSubject = new Subject<string>();
  private allUsers: User[] = [];

  constructor(
    private readonly eventsService: EventsService,
    private readonly usersService: UsersService,
    private readonly tokenStorage: TokenStorageService
  ) {}

  ngOnInit(): void {
    this.loadUsers();

    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((query) => {
        this.filterUsers(query);
      });
  }

  loadUsers(): void {
    this.loading = true;
    this.usersService.getAllUsers().subscribe({
      next: (users) => {
        this.allUsers = users || [];
        this.users = [...this.allUsers];
        this.filteredUsers = [...this.allUsers];
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load users:', err);
        this.errorMessage = 'Failed to load users';
        this.loading = false;
      },
    });
  }

  onSearchChange(query: string): void {
    this.searchQuery = query;
    this.searchSubject.next(query);
  }

  filterUsers(query: string): void {
    const q = query.toLowerCase().trim();
    if (!q) {
      this.filteredUsers = [...this.users];
    } else {
      this.filteredUsers = this.users.filter(
        (user) =>
          user.name.toLowerCase().includes(q) ||
          user.email.toLowerCase().includes(q)
      );
    }
  }

  selectUser(user: User): void {
    this.selectedUser = user;
    this.successMessage = '';
    this.errorMessage = '';
  }

  inviteUser(): void {
    if (!this.selectedUser) return;

    const token = this.tokenStorage.getAccessToken();
    const inviterId = token ? parseInt(token, 10) : 0;
    
    if (!inviterId) {
      this.errorMessage = 'You must be logged in to invite users.';
      return;
    }

    this.inviting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.eventsService.inviteUser(this.eventId, this.selectedUser.id, inviterId).subscribe({
      next: () => {
        this.successMessage = `${this.selectedUser?.name} has been invited!`;
        this.invited.emit(this.selectedUser!);
        // Remove from list after inviting
        this.users = this.users.filter(u => u.id !== this.selectedUser?.id);
        this.filteredUsers = this.filteredUsers.filter(u => u.id !== this.selectedUser?.id);
        this.selectedUser = null;
        this.inviting = false;
      },
      error: (err) => {
        console.error('Invite error:', err);
        // Handle different error response formats
        let message = 'Failed to invite user. Please try again.';
        if (err?.error) {
          if (typeof err.error === 'string') {
            message = err.error;
          } else if (err.error.detail) {
            message = typeof err.error.detail === 'string' 
              ? err.error.detail 
              : JSON.stringify(err.error.detail);
          } else if (err.error.message) {
            message = err.error.message;
          }
        }
        this.errorMessage = message;
        this.inviting = false;
      },
    });
  }

  closeModal(): void {
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.closeModal();
    }
  }
}

