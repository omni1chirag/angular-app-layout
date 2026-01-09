export interface LayoutConfig {
    preset?: string;
    primary?: string;
    surface?: string | null;
    darkTheme?: boolean;
    menuMode?: string;
}

export interface LayoutState {
    staticMenuDesktopInactive?: boolean;
    overlayMenuActive?: boolean;
    configSidebarVisible?: boolean;
    staticMenuMobileActive?: boolean;
    menuHoverActive?: boolean;
    userMenuVisible?: boolean;
}

export interface MenuChangeEvent {
    key: string;
    routeEvent?: boolean;
}