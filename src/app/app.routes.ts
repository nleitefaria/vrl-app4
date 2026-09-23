import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/states' },
  {
    path: 'states',
    loadChildren: () => import('./pages/states/states.routes').then((m) => m.STATES_ROUTES),
  },
  {
    path: 'districts',
    loadChildren: () => import('./pages/districts/districts.routes').then((m) => m.DISTRICTS_ROUTES),
  },
];
