import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { EventsService } from '../../../../core/services/events.service';
import { TokenStorageService } from '../../../../core/services/token-storage.service';

@Component({
  selector: 'app-create-event',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.scss'],
})
export class CreateEventComponent {
  loading = false;
  errorMessage = '';

  createForm = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    date: ['', [Validators.required]],
    time: ['', [Validators.required]],
    location: ['', [Validators.required]],
    description: ['', [Validators.required]],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly eventsService: EventsService,
    private readonly tokenStorage: TokenStorageService,
    private readonly router: Router
  ) {}

  submit(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const userId = this.tokenStorage.getAccessToken();
    if (!userId) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    const payload = this.createForm.getRawValue();
    const uid = parseInt(userId, 10);

    this.eventsService.createEvent(uid, payload).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err: unknown) => {
        this.loading = false;
        if (typeof err === 'object' && err !== null && 'error' in err && typeof (err as any).error === 'object' && (err as any).error !== null && 'detail' in (err as any).error) {
          this.errorMessage = (err as any).error.detail;
        } else {
          this.errorMessage = 'Failed to create event. Please try again.';
        }
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/dashboard']);
  }
}

