// src/app/bounded-contexts/ticketing/domain/repositories/ticket.repository.ts

import { InjectionToken } from '@angular/core';
import { Ticket } from '../models/ticket.entity';

export interface TicketRepository {
  findById(id: number): Promise<Ticket>;
  findAll(): Promise<Ticket[]>;
  save(ticket: Ticket): Promise<Ticket>;
  delete(ticket: Ticket): Promise<void>;
}

export const TICKET_REPOSITORY = new InjectionToken<TicketRepository>('TICKET_REPOSITORY');