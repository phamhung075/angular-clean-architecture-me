import { DomainEvent } from '../events/domain-event';
import { Entity } from './base.entity';

export abstract class AggregateRoot<T> extends Entity<T> {
  private domainEvents: DomainEvent[] = [];
  
  protected addDomainEvent(domainEvent: DomainEvent): void {
    this.domainEvents.push(domainEvent);
  }
  
  public clearEvents(): DomainEvent[] {
    const events = [...this.domainEvents];
    this.domainEvents = [];
    return events;
  }
  
  public getEvents(): DomainEvent[] {
    return [...this.domainEvents];
  }
}