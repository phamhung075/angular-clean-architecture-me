import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { DomainEvent } from './domain-event';

@Injectable({
  providedIn: 'root'
})
export class EventBus {
  private eventSubject = new Subject<DomainEvent>();
  
  publish(event: DomainEvent): void {
    this.eventSubject.next(event);
  }
  
  ofType<T extends DomainEvent>(eventType: new (...args: any[]) => T): Observable<T> {
    return this.eventSubject.pipe(
      filter((event): event is T => event instanceof eventType)
    );
  }
}