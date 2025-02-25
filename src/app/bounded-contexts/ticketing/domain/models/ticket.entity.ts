import { AggregateRoot } from '../../../../_cors/domain/aggregate-root';
import { TicketCreatedEvent } from '../events/ticket-created.event';
import { TicketDeletedEvent } from '../events/ticket-deleted.event';
import { TicketUpdatedEvent } from '../events/ticket-updated.event';
import { TicketName } from '../value-objects/ticket-name.value-object';

export interface TicketProps {
  name: TicketName;
}

export class Ticket extends AggregateRoot<number> {
  private name: TicketName;
  
  private constructor(id: number, props: TicketProps) {
    super(id);
    this.name = props.name;
  }
  
  public static create(props: TicketProps, id?: number): Ticket {
    const ticketId = id ?? null;
    
    if (ticketId == null) {
      // New ticket creation will be finalized when persisted
      // The event will be triggered after the ID is assigned
        throw new Error('Ticket ID cannot be null');
    }
    const ticket = new Ticket(ticketId, props);

    return ticket;
  }
  
  public updateName(name: TicketName): void {
    if (this.name.equals(name)) {
      return; // No change, no event
    }
    
    this.name = name;
    this.addDomainEvent(new TicketUpdatedEvent(this.getId(), this.name.value));
  }
  
  public markAsCreated(newId: number): void {
    if (this.getId() !== null) {
      throw new Error('Cannot mark an existing ticket as created');
    }
    
    // Update the ID (this is a special case where we mutate the ID after repository save)
    Object.defineProperty(this, 'id', { value: newId });
    
    // Now we have an ID, we can properly create the event
    this.addDomainEvent(new TicketCreatedEvent(newId, this.name.value));
  }
  
  public markAsDeleted(): void {
    this.addDomainEvent(new TicketDeletedEvent(this.getId()));
  }
  
  get getName(): TicketName {
    return this.name;
  }
  
  // For presentation purposes only - entities should generally not expose simple data objects
  public toDTO(): TicketDTO {
    return {
      id: this.getId(),
      name: this.name.value
    };
  }
}

// DTO for presentation and persistence
export interface TicketDTO {
  id: number;
  name: string;
}