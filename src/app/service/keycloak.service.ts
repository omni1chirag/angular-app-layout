import { Injectable, inject } from '@angular/core';
import Keycloak, { KeycloakProfile } from 'keycloak-js';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { PlatformService } from './platform.service';
import { ApiService } from './api.service';
import { MenuService } from './menu.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppUserProfile, AuthUserResponse } from '@interface/common.interface';
import { en } from 'node_modules/@fullcalendar/core/internal-common';
import { ROUTES } from '@constants/app-routes.constant';





@Injectable({
    providedIn: 'root'
})
export class KeycloakService {
    private keycloak: Keycloak | null = null; // Initialize as null
    private authenticatedSubject = new BehaviorSubject<boolean>(false);
    authenticated$ = this.authenticatedSubject.asObservable();
    isInitialized = false;
    private initializationPromise: Promise<void> | null = null;
    private initialized = false;
    private redirectUri: string | null = null;
    private menuItemsSubject = new BehaviorSubject<any[]>([]);
    menuItems$ = this.menuItemsSubject.asObservable();

    get endpoints() {
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

    constructor(private platformService: PlatformService,
        private httpClient: HttpClient,
        private menuService: MenuService
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
        if (this.initializationPromise) {
            return this.initializationPromise;
        }

        if (this.initialized) {
            return Promise.resolve();
        }

        this.initializationPromise = new Promise(async (resolve, reject) => {
            if (!this.platformService.isBrowser()) {
                resolve();
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
                    await this.keycloak.updateToken(30); // Refresh if needed
                }

                this.authenticatedSubject.next(!!this.keycloak?.authenticated);
                this.initialized = true;
                this.setupTokenRefresh();
                this.storeToken();
                resolve();
            } catch (err) {
                console.error('Keycloak initialization failed:', err);
                this.authenticatedSubject.next(false);
                reject(err);
            }
        });

        return this.initializationPromise;
    }

    login(redirectUrl: string = ROUTES.HOME): void {
        if (this.platformService.isBrowser()) {
            const targetUrl = redirectUrl.startsWith('/')
                ? `${window.location.origin}${redirectUrl}`
                : redirectUrl;

            this.redirectUri = targetUrl;
            // localStorage.setItem('kc-redirect', targetUrl);

            this.keycloak?.login({
                redirectUri: targetUrl,
                prompt: 'login'
            });
        }
    }

    logout(redirectUrl: string = ROUTES.LOGOUT): void {
        if (this.platformService.isBrowser()) {
            // localStorage.removeItem('kc-redirect');
            const postLogoutRedirect = window.location.origin + redirectUrl;
            this.keycloak?.logout({ redirectUri: postLogoutRedirect });
        }
    }

    hasRole(role: string): boolean {
        return this.keycloak?.hasRealmRole(role) || false;
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
            }, 30000); // Check every 30 seconds
        }
    }

    isAuthenticated(): boolean {
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
                const response = await lastValueFrom(
                    this.httpClient.get<AuthUserResponse>(
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

                this.menuService.updateMenuItems(menuItems);


                return extendedProfile;
            } catch (error) {

                console.error('Error loading profile:', error);
                return null;
            }
        }
        return null;

    }

    getToken(): string {
        return this.keycloak?.token || '';
    }

    private storeToken() {
        if (this.platformService.isBrowser() && this.keycloak?.token) {
            localStorage.setItem('kc-token', this.keycloak.token);
        }
    }

    private initializeFromStorage() {
        if (this.platformService.isBrowser()) {
            const storedToken = localStorage.getItem('kc-token');
            if (storedToken) {
                this.keycloak!.token = storedToken;
                this.authenticatedSubject.next(true);
            }
        }
    }

    startAutoRefresh() {
        setInterval(() => {
            if (this.isAuthenticated()) {
                this.updateToken(30);
            }
        }, 30000);
    }

    async updateToken(minValidity: number) {
        try {
            return await this.keycloak?.updateToken(minValidity);
        } catch (error) {
            console.error('Token refresh failed:', error);
            this.logout();
            return false;
        }
    }
}
