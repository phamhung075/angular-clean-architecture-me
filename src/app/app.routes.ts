import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'tickets', pathMatch: 'full' },
  {
    path: 'tickets',
    loadChildren: () => import('./ui/pages/tickets/tickets.routes').then(m => m.routes)
  }
];