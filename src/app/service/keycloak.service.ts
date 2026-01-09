import { inject, Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { PlatformService } from './platform.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppUserProfile, AuthUserResponse, MenuItem } from '@interface/common.interface';
import { APP_ROUTES } from '@constants/app.constants';
import { MenuService } from './menu.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiResponse } from '@interface/api-response.interface';


@Injectable({
    providedIn: 'root'
})
export class KeycloakService {

    private readonly platformService = inject(PlatformService);
    private readonly httpClient = inject(HttpClient);
    private readonly menuService = inject(MenuService);
    private readonly router = inject(Router);
    private readonly activatedRoute = inject(ActivatedRoute);

    private readonly keycloak: Keycloak | null = null; // Initialize as null
    private readonly authenticatedSubject = new BehaviorSubject<boolean>(false);
    authenticated$ = this.authenticatedSubject.asObservable();
    isInitialized = false;
    private initializationPromise: Promise<void> | null = null;
    private initialized = false;
    private redirectUri: string | null = null;
    private readonly menuItemsSubject = new BehaviorSubject<MenuItem[]>([]);
    menuItems$ = this.menuItemsSubject.asObservable();
    readonly kcTokenKey = 'kc-token';


    get endpoints(): { base: string; keycloakrealm: string; keycloakurl: string; keycloakclientid: string; authentication: string; } {
        const base = environment.host;
        const keycloakurl = environment.keycloakurl;
        const keycloakrealm = environment.keycloakrealm;
        const keycloakclientid = environment.keycloakclientid;
        return {
            base,
            keycloakrealm,
            keycloakurl,
            keycloakclientid,
            authentication: `${base}/ebplp-api/users/authentication`,
        }
    }

    constructor(
    ) {
        if (this.platformService.isBrowser()) {
            this.keycloak = new Keycloak({
                url: this.endpoints.keycloakurl,
                realm: this.endpoints.keycloakrealm,
                clientId: this.endpoints.keycloakclientid
            });
        }
    }

    async init(): Promise<void> {
        if (this.platformService.isBrowser()) {
            this.initializeFromStorage();
        }
        if (this.initializationPromise !== null) {
            return this.initializationPromise;
        }

        if (this.initialized) {
            return Promise.resolve();
        }

        this.initializationPromise = (async () => {
            if (!this.platformService.isBrowser()) {
                return;
            }

            try {
                const authenticated = await this.keycloak?.init({
                    onLoad: 'check-sso',
                    checkLoginIframe: false,
                    enableLogging: true,
                    flow: 'standard'
                });


                if (authenticated && window.location.hash) {
                    this.redirectUri = window.location.href;
                }

                if (this.keycloak?.authenticated) {
                    await this.keycloak.updateToken(30);
                    await this.getUserProfile();
                }

                this.authenticatedSubject.next(!!this.keycloak?.authenticated);
                this.initialized = true;
                this.setupTokenRefresh();
                this.storeToken();
            } catch (err) {
                console.error('Keycloak initialization failed:', err);
                this.authenticatedSubject.next(false);
                throw err;
            }
        })();

        return this.initializationPromise;
    }

    login(redirectUrl: string = APP_ROUTES.HOME): void {
        if (!this.platformService.isBrowser()) return;

        const targetUrl = redirectUrl.startsWith('/')
            ? `${window.location.origin}${redirectUrl}`
            : redirectUrl;

        this.redirectUri = targetUrl;

        if (this.keycloak && typeof this.keycloak.login === 'function') {
            this.keycloak.login({
                redirectUri: targetUrl,
                prompt: 'login'
            }).catch(err => {
                console.error('Keycloak login threw an error, falling back to patient-portal', err);
                this.router.navigateByUrl('/patient-portal');
            });
        } else {
            this.router.navigateByUrl('/patient-portal');
        }
    }

    logout(redirectUrl: string = APP_ROUTES.LOGOUT): void {
        if (this.platformService.isBrowser()) {
            localStorage.clear();
            const postLogoutRedirect = window.location.origin + redirectUrl;
            this.keycloak?.logout({ redirectUri: postLogoutRedirect });
        }
    }

    hasRole(role: string): boolean {
        if (!this.keycloak?.authenticated || !this.keycloak?.tokenParsed) {
            return false;
        }

        const claims = this.jwtClaims();
        if (!claims) return false;
        const roles: string[] = Array.isArray(claims['user_group']) ? claims['user_group'] : [];
        return roles.includes(role);
    }

    isPatient(): boolean {
        return this.hasRole('patient');
    }

    private setupTokenRefresh() {
        if (this.platformService.isBrowser()) {
            setInterval(async () => {
                if (this.keycloak?.authenticated) {
                    try {
                        const refreshed = await this.keycloak.updateToken(30);
                        if (refreshed) {
                            console.debug('Token refreshed');
                        }
                    } catch (error) {
                        console.error('Failed to refresh token:', error);
                    }
                }
            }, 30000);
        }
    }

    isAuthenticated(): boolean {
        this.isPatient();
        return this.keycloak?.authenticated || this.authenticatedSubject.value;
    }

    async getUserProfile(): Promise<AppUserProfile | null> {
        if (this.platformService.isBrowser()) {
            try {
                if (!this.keycloak?.authenticated) {
                    throw new Error('User not logged in');
                }

                const baseProfile = await this.keycloak.loadUserProfile();
                const token = this.getToken();
                let headers = new HttpHeaders();

                if (token) {
                    headers = headers.set('Authorization', `Bearer ${token}`);
                }
                const response: ApiResponse<AuthUserResponse> = await lastValueFrom(
                    this.httpClient.get<ApiResponse<AuthUserResponse>>(
                        this.endpoints.authentication, { headers }
                    )
                );

                if (!response?.data?.dashboardRoute) {
                    throw new Error('Invalid API response structure');
                }

                const extendedProfile: AppUserProfile = {
                    ...baseProfile,
                    dashboardRoute: response.data.dashboardRoute
                };


                const menuItems = response.data.menuItems;

                localStorage.setItem('menuItems', JSON.stringify(menuItems));
                this.menuItemsSubject.next(menuItems);
                localStorage.setItem('userProfile', JSON.stringify(response.data.user));
                localStorage.setItem('userClinics', JSON.stringify(response.data.userClinics));
                localStorage.setItem('dashboardRoute', response.data.dashboardRoute);
                localStorage.setItem('patientProfiles', JSON.stringify(response.data.patientProfiles));
                localStorage.setItem('activePatientProfile', response.data.activePatientProfile);
                this.menuService.updateMenuItems(menuItems);

                this.checkAndRedirect(response.data.dashboardRoute);

                return extendedProfile;
            } catch (error) {

                console.error('Error loading profile:', error);
                return null;
            }
        }
        return null;

    }

    checkAndRedirect(dashboardUrl: string): void {
        const currentRoute = window.location.pathname;
        console.error('Current route:', currentRoute);

        if (!currentRoute.includes('/jitsi/jitsi-integration')) {
            this.router.navigateByUrl(dashboardUrl);
        }
    }

    getToken(): string {
        return this.keycloak?.token || '';
    }

    private storeToken() {
        if (this.platformService.isBrowser() && this.keycloak?.token) {
            localStorage.setItem(this.kcTokenKey, this.keycloak.token);
        }
    }

    private initializeFromStorage() {
        if (this.platformService.isBrowser()) {
            const storedToken = localStorage.getItem(this.kcTokenKey);
            if (storedToken) {
                this.keycloak.token = storedToken;
                this.authenticatedSubject.next(true);
            }
        }
    }

    startAutoRefresh(): void {
        setInterval(() => {
            if (this.isAuthenticated()) {
                this.updateToken(30);
            }
        }, 30000);
    }

    async updateToken(minValidity: number): Promise<boolean> {
        try {
            return await this.keycloak?.updateToken(minValidity);
        } catch (error) {
            console.error('Token refresh failed:', error);
            this.logout();
            return false;
        }
    }

    get userId(): string | undefined {
        if (this.platformService.isBrowser()) {
            const claims = this.jwtClaims();
            if (!claims) return undefined;
            return claims['sub'] as string;
        }
        return undefined;
    }

    get userRole(): string | undefined {
        if (this.platformService.isBrowser()) {
            const claims = this.jwtClaims();
            if (!claims) return undefined;
            const roles: string[] = claims['user_group'] as string[] || [];
            return roles.length > 0 ? roles[0] : undefined;
        }
        return undefined;
    }

    jwtClaims(): Record<string, unknown> | undefined {
        const claims = this.keycloak.tokenParsed as Record<string, unknown> | undefined;
        if (!claims) {
            console.warn('[AuthService] tokenParsed is undefined');
            return undefined;
        }
        return claims;

    }
}
