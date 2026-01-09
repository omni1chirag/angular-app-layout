import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommunicationService {

  private readonly channels = new Map<string, Subject<unknown>>();

  private getOrCreateChannel<T>(key: string): Subject<T> {
    if (!this.channels.has(key)) {
      this.channels.set(key, new Subject<T>());
    }
    return this.channels.get(key) as Subject<T>;
  }

  send<T>(key: string, data: T): void {
    this.getOrCreateChannel<T>(key).next(data);
  }

  get<T>(key: string): Observable<T> {
    return this.getOrCreateChannel<T>(key).asObservable();
  }

  clear(key: string): void {
    const channel = this.channels.get(key);
    if (channel) {
      channel.next(null);
    }
  }

  delete(key: string): void {
    const channel = this.channels.get(key);
    if (channel) {
      channel.complete();
      this.channels.delete(key);
    }
  }

  unsubscribe(): void {
    for (const [, channel] of this.channels) {
      channel.complete();
    }
    this.channels.clear();
  }

}
