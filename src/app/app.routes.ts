import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { ComponentListComponent } from './component-list/component-list.component';
import { LayoutComponent } from './layout/layout.component';
import { LoginComponent } from './login/login.component';
import { TestingComponent } from './testing/testing.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'testing', component: TestingComponent },
    { path: 'list', component: ComponentListComponent },
    {
        path: 'registration',
        loadComponent: () => import('./provider-registration/provider-registration.component').then(m => m.ProviderRegistrationComponent)
    },

    // { path: 'admin-dashboard', component: AdminDashboardComponent },
    {
        path: 'home',
        component: LayoutComponent,
        children: [
            {
                path: 'admin-dashboard',
                component: AdminDashboardComponent
            },

            { path: '', redirectTo: 'admin-dashboard', pathMatch: 'full' },
            {
                path: 'schedule-changes',
                // component: ScheduleChangesComponent,
                loadComponent: () => import('./schedule-changes/schedule-changes.component').then(m => m.ScheduleChangesComponent
                )
            },
            {
                path: 'approval-requests',
                // component: ApprovalRequestsComponent,
                loadComponent: () => import('./approval-requests/approval-requests.component').then(m => m.ApprovalRequestsComponent)
            },
            {
                path: 'unsettled-commission',
                // component: UnsettledCommisionComponent,
                loadComponent: () => import('./unsettled-commision/unsettled-commision.component').then(m => m.UnsettledCommisionComponent)
            },
            {
                path: 'organization',
                // component: AddEditOrganizationComponent,
                loadComponent: () => import('./add-edit-organization/add-edit-organization.component').then(m => m.AddEditOrganizationComponent)
            },
            {
                path: 'oraganization-list',
                // component: OrganizationListComponent,
                loadComponent: () => import('./organization-list/organization-list.component').then(m => m.OrganizationListComponent)
            },
            {
                path: 'practice',
                children: [
                    {
                        path: 'list',
                        // component: PracticeListComponent,
                        loadComponent: () => import('./practice-list/practice-list.component').then(m => m.PracticeListComponent)
                    },
                    {
                        path: 'add-edit',
                        // component: PracticeAddEditComponent,
                        loadComponent: () => import('./practice-add-edit/practice-add-edit.component').then(m => m.PracticeAddEditComponent)
                    }
                ]
            },
            {
                path: 'provider',
                children: [
                    {
                        path: 'list',
                        // component: ProviderListComponent,
                        loadComponent: () => import('./provider-list/provider-list.component').then(m => m.ProviderListComponent)
                    },
                    {
                        path: 'add-edit',
                        // component: AddEditProviderComponent,
                        loadComponent: () => import('./add-edit-provider/add-edit-provider.component').then(m => m.AddEditProviderComponent)
                    }
                ]
            },
            {
                path: 'user',
                children: [
                    {
                        path: 'add-edit',
                        // component: UserAddEditComponent,
                        loadComponent: () => import('./user/user-add-edit/user-add-edit.component').then(m => m.UserAddEditComponent)
                    },
                    {
                        path: 'list',
                        // component: UserListComponent,
                        loadComponent: () => import('./user/user-list/user-list.component').then(m => m.UserListComponent)
                    }
                ]
            },
            {
                path: 'role',
                children: [
                    {
                        path: 'add-edit',
                        // component: AddEditRoleComponent,
                        loadComponent: () => import('./add-edit-role/add-edit-role.component').then(m => m.AddEditRoleComponent)
                    },
                    {
                        path: 'list',
                        // component: RoleListComponent,
                        loadComponent: () => import('./role-list/role-list.component').then(m => m.RoleListComponent)
                    },
                    {
                        path: 'permissions',
                        // component: ManagePermissionsComponent,
                        loadComponent: () => import('./manage-permissions/manage-permissions.component').then(m => m.ManagePermissionsComponent)
                    }
                ]
            },
            {
                path: 'notification',
                children: [
                    {
                        path: 'add-edit',
                        // component: AddEditNotificationComponent,
                        loadComponent: () => import('./notification/add-edit-notification/add-edit-notification.component').then(m => m.AddEditNotificationComponent)
                    },
                    {
                        path: 'list',
                        // component: NotificationListComponent,
                        loadComponent: () => import('./notification/notification-list/notification-list.component').then(m => m.NotificationListComponent)
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
                                loadComponent: () => import('./commission/add-edit-commission/add-edit-commission.component').then(m => m.AddEditCommissionComponent)
                            },
                            {
                                path: 'list',
                                loadComponent: () => import('./commission/commission-list/commission-list.component').then(m => m.CommissionListComponent)
                            }
                        ]

                    },
                    {
                        path: 'working-hours',
                        loadComponent: () => import('./workingHours/working-hours-add-edit/working-hours-add-edit.component').then(m => m.WorkingHoursAddEditComponent)
                    },
                    {
                        path: 'consultation-charges',
                        loadComponent: () => import('./consultation-charges/consultation-charges.component').then(m => m.ConsultationChargesComponent)
                    }

                ]
            },
            {
                path: 'profile',
                loadComponent: () => import('./user-profile/user-profile.component').then(m => m.UserProfileComponent)
            },
            {
                path: 'patient',
                children: [
                    {
                        path: 'add-edit',
                        loadComponent: () => import('./patient/patient-add-edit/patient-add-edit.component').then(m => m.PatientAddEditComponent)
                    },
                    {
                        path: 'list',
                        loadComponent: () => import('./patient/patient-list/patient-list.component').then(m => m.PatientListComponent)
                    }
                ]            },
        ]
    },
    { path: '', redirectTo: '/list', pathMatch: 'full' }
];
