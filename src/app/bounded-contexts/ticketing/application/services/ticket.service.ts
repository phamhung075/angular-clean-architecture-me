import { Inject, Injectable } from '@angular/core';

import { EventBus } from '../../../../_cors/events/event-bus';
import { Ticket } from '../../domain/models/ticket.entity';
import { TICKET_REPOSITORY, TicketRepository } from '../../domain/repositories/ticket.repository';
import { TicketName } from '../../domain/value-objects/ticket-name.value-object';
import { CreateTicketCommand } from '../commands/create-ticket.command';
import { DeleteTicketCommand } from '../commands/delete-ticket.command';
import { UpdateTicketCommand } from '../commands/update-ticket.command';
import { TicketQueryService } from '../queries/ticket-query.service';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  constructor(
    @Inject(TICKET_REPOSITORY) private repository: TicketRepository,
    private queryService: TicketQueryService,
    private eventBus: EventBus
  ) {}
  
  async createTicket(command: CreateTicketCommand): Promise<number> {
    try {
      // Create domain entity with domain logic
      const ticketName = TicketName.create(command.name);
      const ticket = Ticket.create({ name: ticketName });
      
      // Persist and get the new ID
      const savedTicket = await this.repository.save(ticket);
      
      // Mark as created with the new ID (this will create the domain event)
      savedTicket.markAsCreated(savedTicket.getId());
      
      // Publish all domain events
      savedTicket.getEvents().forEach(event => this.eventBus.publish(event));
      
      return savedTicket.getId();
    } catch (error) {
      // Handle errors appropriately
      console.error('Failed to create ticket:', error);
      throw error;
    }
  }
  
  async updateTicket(command: UpdateTicketCommand): Promise<void> {
    try {
      // Get existing ticket
      const ticket = await this.repository.findById(command.id);
      
      // Apply domain logic
      const ticketName = TicketName.create(command.name);
      ticket.updateName(ticketName);
      
      // Persist
      await this.repository.save(ticket);
      
      // Publish domain events
      ticket.getEvents().forEach(event => this.eventBus.publish(event));
      
    } catch (error) {
      console.error('Failed to update ticket:', error);
      throw error;
    }
  }
  
  async deleteTicket(command: DeleteTicketCommand): Promise<number> {
    try {
      // Get existing ticket
      const ticket = await this.repository.findById(command.id);
      
      // Apply domain logic
      ticket.markAsDeleted();
      
      // Find the next ticket ID for navigation
      const tickets = await this.queryService.getAllTickets();
      const currentIndex = tickets.findIndex(t => t.id === command.id);
      let nextId = 0;
      
      // Determine next ticket to show
      if (tickets.length > 1) {
        if (currentIndex === tickets.length - 1) {
          // If deleting the last one, go to previous
          nextId = tickets[currentIndex - 1].id;
        } else {
          // Otherwise go to next
          nextId = tickets[currentIndex + 1].id;
        }
      }
      
      // Persist
      await this.repository.delete(ticket);
      
      // Publish domain events
      ticket.getEvents().forEach(event => this.eventBus.publish(event));
      
      return nextId;
    } catch (error) {
      console.error('Failed to delete ticket:', error);
      throw error;
    }
  }
}