import { Injectable, effect, signal, computed } from '@angular/core';
import { LayoutConfig, LayoutState, MenuChangeEvent } from '@interface/layout.interface';
import { Subject } from 'rxjs';

interface ViewTransition {
  ready?: Promise<void>;
  finished?: Promise<void>;
}

type StartViewTransitionFn = (callback: () => void) => ViewTransition | undefined;

@Injectable({
    providedIn: 'root'
})
export class LayoutService {
    _config: LayoutConfig = {
        preset: 'Aura',
        primary: 'emerald',
        surface: null,
        darkTheme: false,
        menuMode: 'overlay' // overlay, static
    };

    _state: LayoutState = {
        staticMenuDesktopInactive: false,
        overlayMenuActive: false,
        configSidebarVisible: false,
        staticMenuMobileActive: false,
        menuHoverActive: false,
        userMenuVisible: false,
    };

    layoutConfig = signal<LayoutConfig>(this._config);

    layoutState = signal<LayoutState>(this._state);

    private readonly configUpdate = new Subject<LayoutConfig>();

    private readonly overlayOpen = new Subject<null>();

    private readonly menuSource = new Subject<MenuChangeEvent>();

    private readonly resetSource = new Subject();

    menuSource$ = this.menuSource.asObservable();

    resetSource$ = this.resetSource.asObservable();

    configUpdate$ = this.configUpdate.asObservable();

    overlayOpen$ = this.overlayOpen.asObservable();

    theme = computed(() => (this.layoutConfig()?.darkTheme ? 'light' : 'dark'));

    isSidebarActive = computed(() => this.layoutState().overlayMenuActive || this.layoutState().staticMenuMobileActive);

    isDarkTheme = computed(() => this.layoutConfig().darkTheme);

    getPrimary = computed(() => this.layoutConfig().primary);

    getSurface = computed(() => this.layoutConfig().surface);

    isOverlay = computed(() => this.layoutConfig().menuMode === 'overlay');

    transitionComplete = signal<boolean>(false);

    private initialized = false;

    constructor() {
        effect(() => {
            const config = this.layoutConfig();
            if (config) {
                this.onConfigUpdate();
            }
        });

        effect(() => {
            const config = this.layoutConfig();

            if (!this.initialized || !config) {
                this.initialized = true;
                return;
            }

            this.handleDarkModeTransition(config);
        });
    }

    private handleDarkModeTransition(config: LayoutConfig): void {
        if ((document as Document & { startViewTransition?: StartViewTransitionFn }).startViewTransition) {

            this.startViewTransition(config);
        } else {
            this.toggleDarkMode(config);
            this.onTransitionEnd();
        }
    }

    private startViewTransition(config: LayoutConfig): void {
        const transition = (document as Document & { startViewTransition?: StartViewTransitionFn }).startViewTransition(() => {
            this.toggleDarkMode(config);
        });

        transition.ready
            .then(() => {
                this.onTransitionEnd();
            });
    }

    toggleDarkMode(config?: LayoutConfig): void {
        const _config = config || this.layoutConfig();
        if (_config.darkTheme) {
            document.documentElement.classList.add('app-dark');
        } else {
            document.documentElement.classList.remove('app-dark');
        }
    }

    private onTransitionEnd() {
        this.transitionComplete.set(true);
        setTimeout(() => {
            this.transitionComplete.set(false);
        });
    }

    onMenuToggle(): void {
        if (this.isOverlay()) {
            this.layoutState.update((prev) => ({ ...prev, overlayMenuActive: !this.layoutState().overlayMenuActive }));

            if (this.layoutState().overlayMenuActive) {
                this.overlayOpen.next(null);
            }
        }

        if (this.isDesktop()) {
            this.layoutState.update((prev) => ({ ...prev, staticMenuDesktopInactive: !this.layoutState().staticMenuDesktopInactive }));
        } else {
            this.layoutState.update((prev) => ({ ...prev, staticMenuMobileActive: !this.layoutState().staticMenuMobileActive }));

            if (this.layoutState().staticMenuMobileActive) {
                this.overlayOpen.next(null);
            }
        }
    }

    isDesktop(): boolean {
        return window.innerWidth > 991;
    }

    isMobile(): boolean {
        return !this.isDesktop();
    }

    onConfigUpdate(): void {
        this._config = { ...this.layoutConfig() };
        this.configUpdate.next(this.layoutConfig());
    }

    onMenuStateChange(event: MenuChangeEvent): void {
        this.menuSource.next(event);
    }

    reset(): void {
        this.resetSource.next(true);
    }

    onToggleUserMenu(): void {
        if (this.isOverlay()) {
            this.layoutState.update((prev) => ({ ...prev, userMenuVisible: !this.layoutState().userMenuVisible }));
        }
    }
}
