import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api.service';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <div class="layout">
    <header class="topbar">
      <a routerLink="/dashboard">&larr; Back</a>
      <div class="spacer"></div>
      <h3 style="margin:0">User Management</h3>
      <div class="spacer"></div>
      <button (click)="logout()">Logout</button>
    </header>
    <main class="content">
      <form class="create" (ngSubmit)="createUser()">
        <input [(ngModel)]="newEmail" name="email" type="email" placeholder="Email" required />
        <input [(ngModel)]="newPassword" name="password" type="password" placeholder="Password" required minlength="6" />
        <select [(ngModel)]="newRole" name="role">
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>
        <button type="submit" [disabled]="creating()">Create</button>
        <span class="msg ok" *ngIf="created()">User created</span>
        <span class="msg err" *ngIf="error()">{{ error() }}</span>
      </form>
      <div class="list">
        <div class="item" *ngFor="let u of users()">
          <div class="email">{{ u.email }}</div>
          <div class="inline">
            <label>Role</label>
            <select [(ngModel)]="u.role" (ngModelChange)="update(u)">
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
            <label>Status</label>
            <select [(ngModel)]="u.status" (ngModelChange)="update(u)">
              <option value="active">active</option>
              <option value="disabled">disabled</option>
            </select>
            <ng-container *ngIf="confirmId() !== u.id; else confirmTpl">
              <button type="button" class="danger" (click)="askDelete(u)" [disabled]="u.email==='admin@example.com'">Delete</button>
            </ng-container>
            <ng-template #confirmTpl>
              <span class="confirm">Confirm delete?</span>
              <button type="button" class="danger" (click)="doDelete(u)">Delete</button>
              <button type="button" (click)="cancelDelete()">Cancel</button>
            </ng-template>
          </div>
        </div>
      </div>
    </main>
  </div>
  `,
  styles: [`
    .layout { min-height:100dvh; display:flex; flex-direction:column; background:white; color:#0f172a; }
    .topbar { display:flex; align-items:center; gap:1rem; padding:.75rem 1rem; border-bottom:1px solid #e5e7eb; color:#0f172a; }
    .topbar a { color:#0f172a; }
    .topbar h3 { color:#0f172a; }
    .spacer { flex:1; }
    .content { padding: 1rem; display:flex; flex-direction:column; gap: 1rem; }
    .create { display:flex; gap:.5rem; flex-wrap:wrap; }
    input, select { padding:.5rem .625rem; border:1px solid #d1d5db; border-radius:8px; color:#0f172a; }
    button { padding:.5rem .75rem; border:0; border-radius:8px; background:#2563eb; color:white; font-weight:600; cursor:pointer; }
    .list { border:1px solid #e5e7eb; border-radius:12px; overflow:hidden; }
    .item { padding:.75rem 1rem; border-bottom:1px solid #f3f4f6; }
    .item:last-child { border-bottom:0; }
    .email { font-weight:600; margin-bottom:.5rem; color:#0f172a; }
    .inline { display:flex; align-items:center; gap:.5rem; flex-wrap:wrap; }
    label { color:#374151; font-size:.85rem; }
    .danger { background:#dc2626; }
    .msg { margin-left:.5rem; font-size:.85rem; }
    .msg.ok { color:#059669; }
    .msg.err { color:#b91c1c; }
    .confirm { color:#b91c1c; font-weight:600; margin-right:.25rem; }
  `]
})
export class UsersComponent implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthService);
  users = signal<any[]>([]);

  newEmail = '';
  newPassword = '';
  newRole: 'user' | 'admin' = 'user';
  creating = signal(false);
  error = signal('');
  created = signal(false);
  confirmId = signal<string | null>(null);

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.api.listUsers().subscribe(res => this.users.set(res.users));
  }

  createUser() {
    this.error.set('');
    this.created.set(false);
    this.creating.set(true);
    this.api.createUser({ email: this.newEmail, password: this.newPassword, role: this.newRole })
      .subscribe({
        next: () => {
          this.creating.set(false);
          this.created.set(true);
          this.newEmail = '';
          this.newPassword = '';
          this.newRole = 'user';
          this.refresh();
          setTimeout(() => this.created.set(false), 2000);
        },
        error: (err) => {
          this.creating.set(false);
          if (err?.status === 401 || err?.status === 403) {
            this.auth.clear();
            location.href = '/login';
            return;
          }
          this.error.set(err?.error?.error || 'Failed to create user');
        }
      });
  }

  update(u: any) {
    this.api.updateUser(u.id, { role: u.role, status: u.status }).subscribe();
  }

  logout() {
    this.auth.clear();
    location.href = '/login';
  }

  askDelete(u: any) {
    this.confirmId.set(u.id);
  }
  cancelDelete() {
    this.confirmId.set(null);
  }
  doDelete(u: any) {
    this.api.deleteUser(u.id).subscribe(() => {
      this.confirmId.set(null);
      this.refresh();
    });
  }
}
