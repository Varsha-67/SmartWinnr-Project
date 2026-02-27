import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Summary {
  activeUsers: number;
  signUps: number;
  sales: number;
}

export interface TimeseriesPoint {
  t: string | Date;
  activeUsers: number;
  signUps: number;
  sales: number;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = (import.meta as any).env?.NG_APP_API_URL || 'http://localhost:4001/api';

  login(email: string, password: string) {
    return this.http.post<{ token: string; user: { id: string; email: string; role: string } }>(
      `${this.base}/auth/login`,
      { email, password }
    );
  }

  getSummary() {
    return this.http.get<Summary>(`${this.base}/metrics/summary`);
  }

  getTimeseries() {
    return this.http.get<{ points: TimeseriesPoint[] }>(`${this.base}/metrics/timeseries`);
  }

  listUsers() {
    return this.http.get<{ users: any[] }>(`${this.base}/users`);
  }

  createUser(payload: { email: string; password: string; role?: string; status?: string }) {
    return this.http.post<{ user: any }>(`${this.base}/users`, payload);
  }

  updateUser(id: string, payload: { role?: string; status?: string }) {
    return this.http.patch<{ user: any }>(`${this.base}/users/${id}`, payload);
  }

  deleteUser(id: string) {
    return this.http.delete<void>(`${this.base}/users/${id}`);
  }
}
