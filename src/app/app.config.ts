import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideHttpClient } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { environment } from '../../environments/environment';
import { routes } from './app.routes';
import { TICKET_REPOSITORY } from './bounded-contexts/ticketing/domain/repositories/ticket.repository';
import { HttpTicketRepository } from './bounded-contexts/ticketing/infrastructure/repositories/http-ticket.repository';
import { MockTicketRepository } from './bounded-contexts/ticketing/infrastructure/repositories/mock-ticket.repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes), 
    provideClientHydration(withEventReplay()),
    provideHttpClient(),
    {
      provide: TICKET_REPOSITORY,
      useClass: environment.production ? HttpTicketRepository : MockTicketRepository
    }, provideAnimationsAsync()
  ]
};
