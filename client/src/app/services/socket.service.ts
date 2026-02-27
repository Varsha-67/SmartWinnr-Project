import { Injectable, NgZone } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket?: Socket;
  readonly connected$ = new BehaviorSubject<boolean>(false);
  readonly bootstrap$ = new BehaviorSubject<any | null>(null);
  readonly tick$ = new BehaviorSubject<any | null>(null);

  constructor(private zone: NgZone) {}

  connect() {
    if (this.socket) return;
    const url = 'http://localhost:4001';
    this.socket = io(url, { transports: ['websocket'], autoConnect: true });
    this.socket.on('connect', () => this.zone.run(() => this.connected$.next(true)));
    this.socket.on('disconnect', () => this.zone.run(() => this.connected$.next(false)));
    this.socket.on('metrics:bootstrap', (data) => this.zone.run(() => this.bootstrap$.next(data)));
    this.socket.on('metrics:tick', (data) => this.zone.run(() => this.tick$.next(data)));
  }
}
