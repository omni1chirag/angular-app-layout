import { Routes } from '@angular/router';
import { AdminDashboardComponent } from '@component/dashboard/admin-dashboard/admin-dashboard.component';
import { LayoutComponent } from '@component/layout/layout.component';
import { LoginComponent } from '@component/login/login.component';
import { PageNotFoundComponent } from '@component/page-not-found/page-not-found.component';
import { DoctorDashboardComponent } from '@component/dashboard/doctor-dashboard/doctor-dashboard.component';
import { authGuard } from '@guard/auth.guard';
import { roleRedirectGuard } from '@guard/role-redirct.guard';
import { DashboardComponent } from '@component/dashboard/dashboard.component';
import { LogoutComponent } from '@component/logout/logout.component';
import { ErrorComponent } from '@component/error/error.component';
import { LoadingComponent } from '@component/loading/loading.component';

let children: Routes = [

    {
        path: 'approval-requests',
        loadComponent: () => import('@component/approval-requests/approval-requests.component').then(m => m.ApprovalRequestsComponent)
    },
    {
        path: 'organization',
        children: [
            { path: '', redirectTo: 'list', pathMatch: 'full' },
            {
                path: 'list',
                loadComponent: () =>
                    import('@component/organization/organization-list/organization-list.component').then(
                        m => m.OrganizationListComponent
                    )
            },
            {
                path: 'add',
                loadComponent: () =>
                    import('@component/organization/organization-add-edit/organization-add-edit.component').then(
                        m => m.OrganizationAddEditComponent
                    )
            },
            {
                path: ':id/edit',
                loadComponent: () =>
                    import('@component/organization/organization-add-edit/organization-add-edit.component').then(
                        m => m.OrganizationAddEditComponent
                    )
            }
        ]
    },

    {
        path: 'clinic',
        children: [
            {
                path: 'list',
                loadComponent: () => import('@component/clinic/clinic-list/clinic-list.component').then(m => m.clinicListComponent)
            },
            {
                path: 'add',
                // component: PracticeAddEditComponent,
                loadComponent: () => import('@component/clinic/clinic-add-edit/clinic-add-edit.component').then(m => m.ClinicAddEditComponent)
            },
            {
                path: ':id/edit',
                loadComponent: () => import('@component/clinic/clinic-add-edit/clinic-add-edit.component').then(m => m.ClinicAddEditComponent)
            }
        ]
    },
    {
        path: 'doctor',
        children: [
            {
                path: 'list',
                loadComponent: () => import('@component/doctor/doctor-list/doctor-list.component').then(m => m.DoctorListComponent)
            },
            {
                path: 'add',
                // component: AddEditProviderComponent,
                loadComponent: () => import('@component/doctor/doctor-add-edit/doctor-add-edit.component').then(m => m.DoctorAddEditComponent)
            },
            {
                path: ':id/edit',
                loadComponent: () => import('@component/doctor/doctor-add-edit/doctor-add-edit.component').then(m => m.DoctorAddEditComponent)
            }
        ]
    },
    {
        path: 'user',
        children: [
            {
                path: 'list',
                loadComponent: () => import('@component/user/user-list/user-list.component').then(m => m.UserListComponent)
            },
            {
                path: 'add',
                loadComponent: () => import('@component/user/user-add-edit/user-add-edit.component').then(m => m.UserAddEditComponent)
            },
            {
                path: ':id/edit',
                loadComponent: () => import('@component/user/user-add-edit/user-add-edit.component').then(m => m.UserAddEditComponent)
            },
        ]
    },
    {
        path: 'role',
        children: [
            {
                path: 'permissions',
                loadComponent: () => import('@component/role-permission/manage-permissions/manage-permissions.component').then(m => m.ManagePermissionsComponent)
            }
        ]
    },
    {
        path: 'notification',
        children: [
            {
                path: 'add-edit',
                loadComponent: () => import('@component/notification/notification-add-edit/notification-add-edit.component').then(m => m.NotificationAddEditComponent)
            },
            {
                path: 'list',
                loadComponent: () => import('@component/notification/notification-list/notification-list.component').then(m => m.NotificationListComponent)
            }
        ]
    },
    {
        path: 'setup',
        children: [
            {
                path: 'commission',
                children: [
                    {
                        path: 'add-edit',
                        loadComponent: () => import('@component/commission/commission-add-edit/commission-add-edit.component').then(m => m.CommissionAddEditComponent)
                    },
                    {
                        path: 'list',
                        loadComponent: () => import('@component/commission/commission-list/commission-list.component').then(m => m.CommissionListComponent)
                    }
                ]

            },
            {
                path: 'working-hours',
                loadComponent: () => import('@component/working-hours/working-hours-add-edit/working-hours-add-edit.component').then(m => m.WorkingHoursAddEditComponent)
            },
            {
                path: 'consultation-charges',
                loadComponent: () => import('@component/consultation-charges/consultation-charges.component').then(m => m.ConsultationChargesComponent)
            }

        ]
    },
    {
        path: 'profile',
        loadComponent: () => import('@component/user/user-profile/user-profile.component').then(m => m.UserProfileComponent)
    },
    {
        path: 'patient',
        data: { translationGroup: 'patient' },
        children: [
            {
                path: 'list',
                loadComponent: () => import('@component/patient/patient-list/patient-list.component').then(m => m.PatientListComponent)
            },
            {
                path: 'add',
                loadComponent: () => import('@component/patient/patient-add-edit/patient-add-edit.component').then(m => m.PatientAddEditComponent)
            },
            {
                path: ':id',
                loadComponent: () => import('@component/patient/patient-tab/patient-tab.component').then(m => m.PatientTabComponent),
                children:[
                    {
                        path: 'summary',
                        data: { translationGroup: 'summary' },
                        loadComponent: () => import('@component/patient/patient-tab/clinical-summary/clinical-summary.component').then(m => m.ClinicalSummaryComponent)
                    },
                    {
                        path: 'profile',
                        data: { translationGroup: 'patient' },
                        loadComponent: () => import('@component/patient/patient-tab/patient-profile/patient-profile.component').then(m => m.PatientProfileComponent)
                    },

                ]
            },
        ]
    },
    {
        path: 'appointment',
        data: { translationGroup: 'patient' },
        children: [
            {
                path: 'scheduler',
                loadComponent: () => import('@component/appointment/scheduler/scheduler.component').then(m => m.SchedulerComponent)
            },
            {
                path: 'list',
                loadComponent: () => import('@component/appointment/appointment-list/appointment-list.component').then(m => m.AppointmentListComponent)
            },
            {
                path: ':id/edit',
                loadComponent: () => import('@component/appointment/appointment-add-edit/appointment-add-edit.component').then(m => m.AddEditAppointmentComponent)
            },
        ]
    },

    {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [roleRedirectGuard]

    },
    {
        path: 'admin-dashboard',
        component: AdminDashboardComponent
    },
    {
        path: 'doctor-dashboard',
        component: DoctorDashboardComponent
    },
    {
        path: '', component: DashboardComponent,
        pathMatch: 'full',
        canActivate: [roleRedirectGuard]
    },
];

export const routes: Routes = [
    { path: 'logout', component: LogoutComponent },
    { path: 'testing', component: PageNotFoundComponent },
    { path: 'login', component: LoginComponent },
    { path: 'loading', component: LoadingComponent },
    { path: 'error', component: ErrorComponent },
    {
        path: 'patient-map',
        loadComponent: () => import('@component/user-patient-map/user-patient-map.component').then(m => m.UserPatientMapComponent)
    },
    {
        path: 'registration',
        loadComponent: () => import('@component/doctor/doctor-registration/doctor-registration.component').then(m => m.DoctorRegistrationComponent)
    },
    {
        path: 'subscription',
        loadComponent: () => import('@component/subscription-plan/subscription-plan.component').then(m => m.SubscriptionPlanComponent)
    },
    {
        path: 'home', component: LayoutComponent,
        canActivate: [authGuard],
        children: children
    },
    { path: '', redirectTo: '/loading', pathMatch: 'full' },
    { path: '**', redirectTo: '/error', pathMatch: 'full' } // must be last
];
