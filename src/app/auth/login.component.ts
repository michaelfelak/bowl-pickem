import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../shared/services/auth.service';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  registerForm!: FormGroup;
  isLoginMode = true;
  isLoading = false;
  errorMessage = '';
  showOnlyError = false;
  returnUrl = '';
  isAdmin = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.isAdmin = this.authService.isAdmin();
  }

  ngOnInit(): void {
    this.initializeForms();
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  private initializeForms(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
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

  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.errorMessage = '';
    this.showOnlyError = false;
  }

  onSubmit(): void {
    if (this.isLoginMode) {
      this.login();
    } else {
      this.register();
    }
  }

  private login(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.showOnlyError = false;
    const { username, password } = this.loginForm.value;

    this.authService.login(username, password).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate([this.returnUrl]);
      },
      error: (err) => {
        this.isLoading = false;
        this.showOnlyError = true;
        // Extract status code and message
        const statusCode = err.status || 'Error';
        const statusText = err.statusText || 'Unknown error';
        this.errorMessage = `${statusCode} ${statusText}`;
      }
    });
  }

  private register(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.showOnlyError = false;
    const { username, email, password } = this.registerForm.value;

    this.authService.register(username, email, password).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate([this.returnUrl]);
      },
      error: (err) => {
        this.isLoading = false;
        this.showOnlyError = true;
        // Extract status code and message
        const statusCode = err.status || 'Error';
        const statusText = err.statusText || 'Unknown error';
        this.errorMessage = `${statusCode} ${statusText}`;
      }
    });
  }

  get username(): any {
    return this.isLoginMode ? this.loginForm.get('username') : this.registerForm.get('username');
  }

  get password(): any {
    return this.isLoginMode ? this.loginForm.get('password') : this.registerForm.get('password');
  }

  get passwordConfirm(): any {
    return this.isLoginMode ? null : this.registerForm.get('passwordConfirm');
  }

  get currentForm(): FormGroup {
    return this.isLoginMode ? this.loginForm : this.registerForm;
  }
}
