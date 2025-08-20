import { Routes } from '@angular/router';
import { LoadingComponent } from './component/loading/loading.component';
import { PageNotFoundComponent } from './component/page-not-found/page-not-found.component';
import { DashboardComponent } from './component/dashboard/dashboard.component';
import { LayoutComponent } from '@component/layout/layout.component';
import { LogoutComponent } from '@component/logout/logout.component';
import { authGuard } from './guards/auth.guard';

let children: Routes = [
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
    },
    {
        path: 'dashboard',
        component: DashboardComponent,

    },
    {
        path: 'summary',
        data: { translationGroup: 'summary' },
        loadComponent: () => import('@component/clinical-summary/clinical-summary.component').then(m => m.ClinicalSummaryComponent)
    },
];

export const routes: Routes = [
    { path: 'loading', component: LoadingComponent },
    { path: 'logout', component: LogoutComponent },
    {path: 'error', loadComponent: () => import('@component/error/error.component').then(m => m.ErrorComponent) },
    {
        path: 'patient-portal',
        component: LayoutComponent,
        canActivate: [authGuard],
        children: children
    },
    
    { path: 'login', redirectTo: 'patient-portal', pathMatch: 'full' },
    { path: '', redirectTo: '/loading', pathMatch: 'full' },
    { path: '**', component: PageNotFoundComponent }
];
