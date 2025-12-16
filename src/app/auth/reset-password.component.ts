import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../shared/services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  verificationForm!: FormGroup;
  resetPasswordForm!: FormGroup;
  step: 'verify' | 'reset' = 'verify';
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  verifiedUsername = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForms();
  }

  private initializeForms(): void {
    // Step 1: Verify entry name and email
    this.verificationForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]]
    });

    // Step 2: Reset password (same validation as register form)
    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      passwordConfirm: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
    const password = form.get('password');
    const passwordConfirm = form.get('passwordConfirm');
    
    if (password && passwordConfirm && password.value !== passwordConfirm.value) {
      return { 'passwordMismatch': true };
    }
    return null;
  }

  onVerify(): void {
    if (this.verificationForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    const { username, email } = this.verificationForm.value;

    this.authService.verifyUserForPasswordReset(username, email).subscribe({
      next: () => {
        this.isLoading = false;
        this.verifiedUsername = username;
        this.step = 'reset';
        this.successMessage = 'Verification successful! Please set your new password.';
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Invalid entry name or email. Please try again.';
      }
    });
  }

  onResetPassword(): void {
    if (this.resetPasswordForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    const { password } = this.resetPasswordForm.value;

    this.authService.resetPassword(this.verifiedUsername, password).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Password reset successfully! Redirecting to login...';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to reset password. Please try again.';
      }
    });
  }

  goBack(): void {
    if (this.step === 'reset') {
      this.step = 'verify';
      this.successMessage = '';
      this.resetPasswordForm.reset();
    } else {
      this.router.navigate(['/login']);
    }
  }

  // Getters for template
  get verificationUsername(): any {
    return this.verificationForm.get('username');
  }

  get verificationEmail(): any {
    return this.verificationForm.get('email');
  }

  get password(): any {
    return this.resetPasswordForm.get('password');
  }

  get passwordConfirm(): any {
    return this.resetPasswordForm.get('passwordConfirm');
  }
}
