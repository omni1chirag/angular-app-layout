import { Routes } from '@angular/router';
import { LoadingComponent } from './component/loading/loading.component';
import { PageNotFoundComponent } from './component/page-not-found/page-not-found.component';
import { DashboardComponent } from './component/dashboard/dashboard.component';
import { LayoutComponent } from '@component/layout/layout.component';
import { LogoutComponent } from '@component/logout/logout.component';
import { authGuard } from './guards/auth.guard';
import { TranslationResolver } from '@service/translation-resolver.service';

const children: Routes = [
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
        path: 'profile',
        data: { mode: 'update', translationGroup: 'patient' },
        resolve: { translations: TranslationResolver },
        loadComponent: () => import('@component/profile/user-profiles/user-profiles.component').then(m => m.UserProfilesComponent),
    },
    {
        path: 'family/add',
        data: { mode: 'add-family', translationGroup: 'patient' },
        resolve: { translations: TranslationResolver },
        loadComponent: () => import('@component/profile/user-profiles/user-profiles.component').then(m => m.UserProfilesComponent),
    },
    {
        path: 'notification',
        data: { translationGroup: 'setup' },
        resolve: { translations: TranslationResolver },
        children: [
            {
                path: 'list',
                loadComponent: () => import('@component/notification/notification-list/notification-list.component').then(m => m.NotificationListComponent)
            }
        ]
    },
    {
        path: 'doctor/:id',
        data: { translationGroup: 'patient' },
        resolve: { translations: TranslationResolver },
        loadComponent: () => import('@component/doctor-profile/doctor-profile.component').then(m => m.DoctorProfileComponent)
    },
    {
        path: 'clinic/:id/doctors',
        data: { translationGroup: 'summary' },
        resolve: { translations: TranslationResolver },
        loadComponent: () => import('@component/search/doctor-list/doctor-list.component').then(m => m.DoctorListComponent)
    },
    {
        path: 'speciality/:id/doctors',
        data: { translationGroup: 'summary' },
        resolve: { translations: TranslationResolver },
        loadComponent: () => import('@component/search/doctor-list/doctor-list.component').then(m => m.DoctorListComponent)
    },
    {
        path: 'doctors',
        data: { translationGroup: 'summary' },
        resolve: { translations: TranslationResolver },
        loadComponent: () => import('@component/search/doctor-list/doctor-list.component').then(m => m.DoctorListComponent)
    },
    {
        path: 'clinics',
        data: { translationGroup: 'summary' },
        resolve: { translations: TranslationResolver },
        loadComponent: () => import('@component/search/clinic-list/clinic-list.component').then(m => m.ClinicListComponent)
    },
    {
        path: 'appointment',
        data: { translationGroup: 'patient' },
        resolve: { translations: TranslationResolver },
        children: [
            {
                path: 'list',
                loadComponent: () => import('@component/appointment-list/appointment-list.component').then(m => m.AppointmentListComponent)
            },
            {
                path: ':id/reschedule',
                loadComponent: () => import('@component/doctor-profile/doctor-profile.component').then(m => m.DoctorProfileComponent)
            },
        ]
    },
    {
        path: 'vitals',
        data: { translationGroup: 'patient' },
        resolve: { translations: TranslationResolver },
        children: [
            {
                path: 'list',
                loadComponent: () => import('@component/vitals/patient-vitals-list/patient-vitals-list.component').then(m => m.PatientVitalsListComponent)
            },
        ]
    },
    {
        path: 'clinical-summary',
        data: { translationGroup: 'summary' },
        resolve: { translations: TranslationResolver },
        loadComponent: () => import('@component/patient-tab/patient-tab.component').then(m => m.PatientTabComponent),
        children: [
            {
                path: 'summary',
                data: { translationGroup: 'summary' },
                resolve: { translations: TranslationResolver },
                loadComponent: () => import('@component/patient-tab/clinical-summary/clinical-summary.component').then(m => m.ClinicalSummaryComponent)
            }]
    },
    {
        path: 'medication',
        data: { translationGroup: 'patient' },
        resolve: { translations: TranslationResolver },
        children: [
            {
                path: 'list',
                loadComponent: () => import('@component/medication/medication-list/medication-list.component').then(m => m.PatientMedicationListComponent)
            },
        ]
    },
    {
        path: 'immunization',
        data: { translationGroup: 'patient' },
        resolve: { translations: TranslationResolver },
        children: [
            {
                path: 'list',
                loadComponent: () => import('@component/immunization/immunization-list/immunization-list.component').then(m => m.ImmunizationListComponent)
            },
        ]
    }
];

export const routes: Routes = [
    { path: 'loading', component: LoadingComponent },
    { path: 'logout', component: LogoutComponent },
    { path: 'error', loadComponent: () => import('@component/error/error.component').then(m => m.ErrorComponent) },
    {
        path: 'registration',
        data: { mode: 'registration', translationGroup: 'patient' },
        resolve: { translations: TranslationResolver },
        loadComponent: () => import('@component/profile/registration/registration.component').then(m => m.RegistrationComponent),
    },
    {
        path: 'jitsi/jitsi-integration',
        loadComponent: () => import('@component/jitsi-integration/jitsi-integration.component').then(m => m.JitsiIntegrationComponent)
    },
    {
        path: 'home',
        component: LayoutComponent,
        canActivate: [authGuard],
        children: children
    },
    { path: 'login', redirectTo: '', pathMatch: 'full' },
    { path: '', redirectTo: '/loading', pathMatch: 'full' },
    { path: '**', component: PageNotFoundComponent }
];
