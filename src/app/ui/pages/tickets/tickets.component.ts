import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CreateTicketCommand } from '../../../bounded-contexts/ticketing/application/commands/create-ticket.command';
import { DeleteTicketCommand } from '../../../bounded-contexts/ticketing/application/commands/delete-ticket.command';
import { UpdateTicketCommand } from '../../../bounded-contexts/ticketing/application/commands/update-ticket.command';
import { TicketQueryService } from '../../../bounded-contexts/ticketing/application/queries/ticket-query.service';
import { TicketService } from '../../../bounded-contexts/ticketing/application/services/ticket.service';




@Component({
  standalone: true,
  selector: 'app-tickets',
  templateUrl: './tickets.component.html',
  imports: [CommonModule, FormsModule, RouterModule],
})
export class TicketsComponent implements OnInit {
  @ViewChild('ticketNameInput') ticketNameInput!: ElementRef;
  
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private ticketService: TicketService,
    public queryService: TicketQueryService
  ) {}
  
  ngOnInit(): void {
    // Load all tickets
    this.queryService.getAllTickets().then(tickets => {
      // If there are tickets and no route param, navigate to the first ticket
      const routeId = this.route.snapshot.paramMap.get('id');
      
      if (tickets.length > 0 && (!routeId || routeId === '.')) {
        this.navigateToTicket(tickets[0].id);
      }
      
      // Subscribe to route changes to load selected ticket
      this.route.paramMap.subscribe(params => {
        const id = params.get('id');
        
        if (id && id !== '.') {
          this.openTicket(Number(id));
        }
      });
    });
  }
  
  openTicket(id: number): void {
    this.queryService.getTicketById(id);
  }
  
  newTicket(): void {
    this.queryService.createEmptyTicket();
    setTimeout(() => this.ticketNameInput.nativeElement.focus(), 0);
  }
  
  async saveTicket(): Promise<void> {
    const ticket = this.queryService.currentTicket();
    
    if (!ticket) return;
    
    try {
      if (ticket.id === null) {
        // Create new ticket
        const command = new CreateTicketCommand(ticket.name);
        const newId = await this.ticketService.createTicket(command);
        this.navigateToTicket(newId);
      } else {
        // Update existing ticket
        const command = new UpdateTicketCommand(ticket.id, ticket.name);
        await this.ticketService.updateTicket(command);
      }
    } catch (error) {
      console.error('Error saving ticket:', error);
      // Handle UI error feedback
    }
  }
  
  async deleteTicket(): Promise<void> {
    const ticket = this.queryService.currentTicket();
    
    if (!ticket || ticket.id === null) return;
    
    try {
      const command = new DeleteTicketCommand(ticket.id);
      const nextId = await this.ticketService.deleteTicket(command);
      
      if (nextId === 0) {
        this.newTicket();
      } else {
        this.navigateToTicket(nextId);
      }
    } catch (error) {
      console.error('Error deleting ticket:', error);
      // Handle UI error feedback
    }
  }
  
  private navigateToTicket(id: number): void {
    this.router.navigate(['/tickets', id]);
  }
}