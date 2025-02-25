import { Injectable } from '@angular/core';
import { Ticket, TicketDTO } from '../../domain/models/ticket.entity';
import { TicketRepository } from '../../domain/repositories/ticket.repository';
import { TicketName } from '../../domain/value-objects/ticket-name.value-object';

@Injectable()
export class MockTicketRepository implements TicketRepository {
  private tickets: TicketDTO[] = [
    { id: 1, name: 'First ticket' },
    { id: 2, name: 'Second ticket' }
  ];
  
  private nextId = 3;
  
  async findById(id: number): Promise<Ticket> {
    const dto = this.tickets.find(t => t.id === id);
    
    if (!dto) {
      throw new Error(`Ticket with ID ${id} not found`);
    }
    
    return this.mapToEntity(dto);
  }
  
  async findAll(): Promise<Ticket[]> {
    return this.tickets.map(dto => this.mapToEntity(dto));
  }
  
  async save(ticket: Ticket): Promise<Ticket> {
    const dto = ticket.toDTO();
    
    if (dto.id === null) {
      // Create new
      const newId = this.nextId++;
      const newTicket = { 
        id: newId, 
        name: dto.name 
      };
      
      this.tickets.push(newTicket);
      
      return this.mapToEntity(newTicket);
    } else {
      // Update existing
      const index = this.tickets.findIndex(t => t.id === dto.id);
      
      if (index === -1) {
        throw new Error(`Ticket with ID ${dto.id} not found`);
      }
      
      this.tickets[index] = { ...dto };
      
      return ticket;
    }
  }
  
  async delete(ticket: Ticket): Promise<void> {
    const id = ticket.getId();
    const index = this.tickets.findIndex(t => t.id === id);
    
    if (index === -1) {
      throw new Error(`Ticket with ID ${id} not found`);
    }
    
    this.tickets.splice(index, 1);
  }
  
  // Helper to map from DTO to domain entity
  private mapToEntity(dto: TicketDTO): Ticket {
    return Ticket.create(
      { name: TicketName.create(dto.name) },
      dto.id
    );
  }
}