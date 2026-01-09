import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'home/doctor/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'home/clinic/:id/doctors',
    renderMode: RenderMode.Client
  },
  {
    path: 'home/speciality/:id/doctors',
    renderMode: RenderMode.Client
  }, 
  {
    path: 'home/appointment/:id/reschedule',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
