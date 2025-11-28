import { Component } from '@angular/core';
import { FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  loading = false;
  errorMessage = '';
  successMessage = '';

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirm_password: ['', [Validators.required]],
  }, { validators: this.passwordMatchValidator });

  constructor(
    private readonly fb: FormBuilder,
    private readonly auth: AuthService,
    private readonly router: Router,
  ) {}

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirm_password');
    
    if (!password || !confirmPassword) {
      return null;
    }
    
    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  submit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    
    // Send all fields including confirm_password
    const registerData = this.form.getRawValue();
    console.log('Signup form submitted:', registerData);
    this.auth.register(registerData).subscribe({
      next: (response) => {
        console.log('Signup successful:', response);
        this.loading = false;
        this.successMessage = 'Account created successfully. You can now log in.';
        setTimeout(() => this.router.navigate(['/auth/login']), 1000);
      },
      error: (err) => {
        console.log('Signup error:', err);
        this.loading = false;
        this.errorMessage = err?.error?.detail || 'Signup failed. Please try again.';
      },
    });
  }
}

