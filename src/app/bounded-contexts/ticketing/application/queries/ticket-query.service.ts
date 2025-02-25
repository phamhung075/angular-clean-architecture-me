import { computed, Injectable, signal } from '@angular/core';
import { EventBus } from '../../../../_cors/events/event-bus';
import { TicketCreatedEvent } from '../../domain/events/ticket-created.event';
import { TicketDeletedEvent } from '../../domain/events/ticket-deleted.event';
import { TicketUpdatedEvent } from '../../domain/events/ticket-updated.event';
import { TicketDTO } from '../../domain/models/ticket.entity';
import { TicketRepository } from '../../domain/repositories/ticket.repository';

@Injectable({
  providedIn: 'root'
})
export class TicketQueryService {
  // State signals (read model)
  public _tickets = signal<TicketDTO[]>([]);
  public _currentTicket = signal<TicketDTO | null>(null);
  
  // Computed values
  public tickets = computed(() => this._tickets());
  public currentTicket = computed(() => this._currentTicket());
  
  // Loading state signals
  public isLoading = signal(false);
  public isSaving = signal(false);
  public isDeleting = signal(false);
  
  constructor(
    private repository: TicketRepository,
    private eventBus: EventBus
  ) {
    // Subscribe to relevant domain events to update the read model
    this.subscribeToEvents();
  }
  
  private subscribeToEvents(): void {
    // When a ticket is created, update the tickets list
    this.eventBus.ofType(TicketCreatedEvent).subscribe(event => {
      const tickets = this._tickets();
      this._tickets.set([...tickets, { 
        id: event.ticketId, 
        name: event.ticketName 
      }]);
    });
    
    // When a ticket is updated, update the tickets list and current ticket
    this.eventBus.ofType(TicketUpdatedEvent).subscribe(event => {
      // Update in list
      const tickets = this._tickets();
      const updatedTickets = tickets.map(ticket => 
        ticket.id === event.ticketId 
          ? { ...ticket, name: event.ticketName } 
          : ticket
      );
      this._tickets.set(updatedTickets);
      
      // Update current ticket if it's the one being viewed
      const current = this._currentTicket();
      if (current && current.id === event.ticketId) {
        this._currentTicket.set({ ...current, name: event.ticketName });
      }
    });
    
    // When a ticket is deleted, update the tickets list
    this.eventBus.ofType(TicketDeletedEvent).subscribe(event => {
      const tickets = this._tickets();
      this._tickets.set(tickets.filter(ticket => ticket.id !== event.ticketId));
      
      // Clear current ticket if it was the deleted one
      const current = this._currentTicket();
      if (current && current.id === event.ticketId) {
        this._currentTicket.set(null);
      }
    });
  }
  
  // Query methods
  async getAllTickets(): Promise<TicketDTO[]> {
    this.isLoading.set(true);
    
    try {
      const tickets = await this.repository.findAll();
      const ticketDTOs = tickets.map(ticket => ticket.toDTO());
      
      // Update state
      this._tickets.set(ticketDTOs);
      
      return ticketDTOs;
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      return [];
    } finally {
      this.isLoading.set(false);
    }
  }
  
  async getTicketById(id: number): Promise<TicketDTO | null> {
    this.isLoading.set(true);
    
    try {
      const ticket = await this.repository.findById(id);
      const ticketDTO = ticket.toDTO();
      
      // Update state
      this._currentTicket.set(ticketDTO);
      
      return ticketDTO;
    } catch (error) {
      console.error(`Failed to get ticket with ID ${id}:`, error);
      return null;
    } finally {
      this.isLoading.set(false);
    }
  }
  
  // Creates a new empty ticket for the form
  createEmptyTicket(): void {
    this._currentTicket.set({ id: 0, name: '' });
  }
}