import { Component, OnInit, signal, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, TimeseriesPoint } from '../services/api.service';
import { SocketService } from '../services/socket.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, RouterLink],
  template: `
  <div class="layout">
    <header class="topbar">
      <div class="brand">Admin Dashboard</div>
      <nav class="spacer"></nav>
      <a routerLink="/admin/users" *ngIf="auth.isAdmin()">Manage Users</a>
      <button (click)="logout()">Logout</button>
    </header>
    <main>
      <section class="summary">
        <div class="card"><div class="label">Active Users</div><div class="value">{{ summary().activeUsers }}</div></div>
        <div class="card"><div class="label">Sign-ups</div><div class="value">{{ summary().signUps }}</div></div>
        <div class="card"><div class="label">Sales</div><div class="value">{{ summary().sales }}</div></div>
      </section>
      <section class="chart">
        <canvas baseChart
          [data]="lineChartData"
          [options]="lineChartOptions"
          [type]="'line'">
        </canvas>
      </section>
      <section class="chart small">
        <canvas baseChart
          [data]="doughnutData"
          [options]="doughnutOptions"
          [type]="'doughnut'">
        </canvas>
      </section>
      <section class="chart small">
        <canvas baseChart
          [data]="barData"
          [options]="barOptions"
          [type]="'bar'">
        </canvas>
      </section>
    </main>
  </div>
  `,
  styles: [`
    .layout { min-height: 100dvh; display:flex; flex-direction:column; }
    .topbar { display:flex; align-items:center; gap:1rem; padding:.75rem 1rem; border-bottom: 1px solid #e5e7eb; }
    .brand { font-weight: 700; }
    .spacer { flex:1; }
    main { padding: 1rem; }
    .summary { display:grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 1rem; }
    .card { border:1px solid #e5e7eb; border-radius:12px; padding: .75rem 1rem; background:white; }
    .label { color:#6b7280; font-size:.85rem; }
    .value { font-size:1.75rem; font-weight:700; }
    .chart { margin-top: 1rem; border:1px solid #e5e7eb; border-radius:12px; padding: .5rem; background:white; min-height: 320px; display:flex; align-items:center; }
    .chart.small { min-height: 280px; max-width: 520px; }
    @media (max-width: 800px) { .summary { grid-template-columns: 1fr; } }
  `]
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);
  private socket = inject(SocketService);
  auth = inject(AuthService);

  summary = signal({ activeUsers: 0, signUps: 0, sales: 0 });
  points = signal<TimeseriesPoint[]>([]);

  lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      { label: 'Active Users', data: [], borderColor: '#2563eb', tension: 0.3 },
      { label: 'Sign-ups', data: [], borderColor: '#059669', tension: 0.3 },
      { label: 'Sales', data: [], borderColor: '#dc2626', tension: 0.3 }
    ]
  };

  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { x: { ticks: { maxTicksLimit: 10 } } }
  };

  doughnutData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Active Users', 'Sign-ups', 'Sales'],
    datasets: [
      { data: [0, 0, 0], backgroundColor: ['#2563eb', '#059669', '#dc2626'] }
    ]
  };
  doughnutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } }
  };
  barData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Active', 'Inactive'],
    datasets: [{ data: [0, 0], backgroundColor: ['#059669', '#6b7280'] }]
  };
  barOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { y: { beginAtZero: true } }
  };

  ngOnInit() {
    this.api.getSummary().subscribe((s) => this.summary.set(s));
    this.api.getTimeseries().subscribe((res) => {
      this.points.set(res.points);
      this.syncChart();
    });
    this.socket.connect();
    this.socket.bootstrap$.subscribe((data) => {
      if (data) {
        this.summary.set(data.summary);
        this.points.set(data.timeseries);
        this.syncChart();
      }
    });
    this.socket.tick$.subscribe((p) => {
      if (p) {
        this.summary.set({ activeUsers: p.activeUsers, signUps: p.signUps, sales: p.sales });
        this.points.update((arr) => {
          const next = arr.slice();
          next.push(p);
          if (next.length > 360) next.shift();
          return next;
        });
        this.syncChart();
      }
    });
  }

  private syncChart() {
    const labels = this.points().map(p => new Date(p.t).toLocaleTimeString());
    const au = this.points().map(p => p.activeUsers);
    const su = this.points().map(p => p.signUps);
    const sales = this.points().map(p => p.sales);
    this.lineChartData = {
      labels,
      datasets: [
        { label: 'Active Users', data: au, borderColor: '#2563eb', tension: 0.3, pointRadius: 0 },
        { label: 'Sign-ups', data: su, borderColor: '#059669', tension: 0.3, pointRadius: 0 },
        { label: 'Sales', data: sales, borderColor: '#dc2626', tension: 0.3, pointRadius: 0 }
      ]
    };
    const last = this.summary();
    this.doughnutData = {
      labels: ['Active Users', 'Sign-ups', 'Sales'],
      datasets: [{ data: [last.activeUsers, last.signUps, last.sales], backgroundColor: ['#2563eb', '#059669', '#dc2626'] }]
    };
    const inactive = Math.max(0, last.signUps - last.activeUsers);
    this.barData = {
      labels: ['Active', 'Inactive'],
      datasets: [{ data: [last.activeUsers, inactive], backgroundColor: ['#059669', '#6b7280'] }]
    };
  }

  logout() {
    this.auth.clear();
    location.href = '/login';
  }
}
