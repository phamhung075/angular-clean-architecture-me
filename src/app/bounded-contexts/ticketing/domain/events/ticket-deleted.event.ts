import { DomainEvent } from "../../../../_cors/events/domain-event";

export class TicketDeletedEvent extends DomainEvent {
  constructor(
    public readonly ticketId: number
  ) {
    super();
  }
  
  get eventName(): string {
    return 'ticket.deleted';
  }
}