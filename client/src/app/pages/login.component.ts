import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="login-container">
    <form (ngSubmit)="login()" class="card">
      <h2>Admin Dashboard</h2>
      <div class="field">
        <label>Email</label>
        <input [(ngModel)]="email" name="email" type="email" required />
      </div>
      <div class="field">
        <label>Password</label>
        <input [(ngModel)]="password" name="password" type="password" required />
      </div>
      <button type="submit">Sign in</button>
      <p class="hint" *ngIf="hint()">
        Hint: admin@example.com / admin123
      </p>
      <p class="error" *ngIf="error()">{{ error() }}</p>
    </form>
  </div>
  `,
  styles: [`
    .login-container { min-height: 100dvh; display:flex; align-items:center; justify-content:center; padding: 1rem; }
    .card { width: 100%; max-width: 360px; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.25rem; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    h2 { margin: 0 0 1rem; }
    .field { display:flex; flex-direction:column; gap:.5rem; margin-bottom: .75rem; }
    input { padding:.5rem .625rem; border:1px solid #d1d5db; border-radius:8px; }
    button { width:100%; padding:.6rem; border-radius:8px; border:0; background:#2563eb; color:white; font-weight:600; cursor:pointer; }
    .hint { margin-top:.5rem; color:#6b7280; font-size:.85rem; }
    .error { margin-top:.5rem; color:#b91c1c; }
  `]
})
export class LoginComponent {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private router = inject(Router);

  email = 'admin@example.com';
  password = 'admin123';
  error = signal('');
  hint = signal(true);

  login() {
    this.error.set('');
    this.api.login(this.email, this.password).subscribe({
      next: (res) => {
        const role = (res.user.role === 'admin' ? 'admin' : 'user') as 'admin' | 'user';
        this.auth.setSession(res.token, { ...res.user, role });
        this.router.navigateByUrl('/dashboard');
      },
      error: (err) => {
        this.error.set(err?.error?.error ?? 'Login failed');
      }
    });
  }
}
