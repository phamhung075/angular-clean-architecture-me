import { DomainEvent } from "../../../../_cors/events/domain-event";

export class TicketCreatedEvent extends DomainEvent {
  constructor(
    public readonly ticketId: number,
    public readonly ticketName: string
  ) {
    super();
  }
  
  get eventName(): string {
    return 'ticket.created';
  }
}