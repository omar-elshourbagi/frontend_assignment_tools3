import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { TokenStorageService } from '../../core/services/token-storage.service';
import { UsersService } from '../../core/services/users.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
})
export class MainLayoutComponent implements OnInit {
  userName: string = '';

  constructor(
    private readonly tokenStorage: TokenStorageService,
    private readonly usersService: UsersService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  private loadCurrentUser(): void {
    const token = this.tokenStorage.getAccessToken();
    if (token) {
      const userId = parseInt(token, 10);
      this.usersService.getCurrentUser(userId).subscribe({
        next: (user) => {
          this.userName = user?.name || 'User';
        },
        error: (err) => {
          console.error('Failed to load current user:', err);
          this.userName = 'User';
        },
      });
    }
  }
}

