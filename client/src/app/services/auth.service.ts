import { Injectable, signal } from '@angular/core';

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly user = signal<User | null>(this.readUser());
  readonly token = signal<string | null>(this.readToken());

  private readUser(): User | null {
    const raw = localStorage.getItem('auth:user');
    return raw ? JSON.parse(raw) : null;
    }

  private readToken(): string | null {
    return localStorage.getItem('auth:token');
  }

  setSession(token: string, user: User) {
    this.token.set(token);
    this.user.set(user);
    localStorage.setItem('auth:token', token);
    localStorage.setItem('auth:user', JSON.stringify(user));
  }

  clear() {
    this.token.set(null);
    this.user.set(null);
    localStorage.removeItem('auth:token');
    localStorage.removeItem('auth:user');
  }

  isAdmin() {
    return this.user()?.role === 'admin';
  }
}

