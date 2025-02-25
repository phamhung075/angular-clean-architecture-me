import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { Ticket, TicketDTO } from '../../domain/models/ticket.entity';
import { TicketRepository } from '../../domain/repositories/ticket.repository';
import { TicketName } from '../../domain/value-objects/ticket-name.value-object';

interface ApiTicketResponse {
  data: {
    item: TicketDTO;
  };
}

interface ApiTicketsResponse {
  data: {
    pageIndex: number;
    items: TicketDTO[];
  };
}

interface ApiCreateResponse {
  data: {
    id: number;
  };
}

interface ApiUpdateResponse {
  data: {
    rowCount: number;
  };
}

interface ApiDeleteResponse {
  data: {
    rowCount: number;
  };
}

@Injectable()
export class HttpTicketRepository implements TicketRepository {
  private apiUrl = 'api/v1/tickets';
  
  constructor(private http: HttpClient) {}
  
  async findById(id: number): Promise<Ticket> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiTicketResponse>(`${this.apiUrl}/${id}`)
      );
      
      return this.mapToEntity(response.data.item);
    } catch (error) {
      console.error(`Error fetching ticket ${id}:`, error);
      throw error;
    }
  }
  
  async findAll(): Promise<Ticket[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiTicketsResponse>(`${this.apiUrl}`)
      );
      
      return response.data.items.map(dto => this.mapToEntity(dto));
    } catch (error) {
      console.error('Error fetching all tickets:', error);
      throw error;
    }
  }
  
  async save(ticket: Ticket): Promise<Ticket> {
    const dto = ticket.toDTO();
    
    if (dto.id === null) {
      // Create new ticket
      try {
        const response = await firstValueFrom(
          this.http.post<ApiCreateResponse>(this.apiUrl, { name: dto.name })
        );
        
        // Return ticket with new ID
        return this.mapToEntity({
          id: response.data.id,
          name: dto.name
        });
      } catch (error) {
        console.error('Error creating ticket:', error);
        throw error;
      }
    } else {
      // Update existing ticket
      try {
        await firstValueFrom(
          this.http.put<ApiUpdateResponse>(
            `${this.apiUrl}/${dto.id}`, 
            { name: dto.name }
          )
        );
        
        // Return the same ticket
        return ticket;
      } catch (error) {
        console.error(`Error updating ticket ${dto.id}:`, error);
        throw error;
      }
    }
  }
  
  async delete(ticket: Ticket): Promise<void> {
    try {
      await firstValueFrom(
        this.http.delete<ApiDeleteResponse>(`${this.apiUrl}/${ticket.getId()}`)
      );
    } catch (error) {
      console.error(`Error deleting ticket ${ticket.getId()}:`, error);
      throw error;
    }
  }
  
  // Helper to map from DTO to domain entity
  private mapToEntity(dto: TicketDTO): Ticket {
    return Ticket.create(
      { name: TicketName.create(dto.name) },
      dto.id
    );
  }
}