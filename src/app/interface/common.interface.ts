import { KeycloakProfile } from "keycloak-js";

export interface AppUserProfile extends KeycloakProfile {
    dashboardRoute?: string;
}

export interface AuthUserResponse {
    data: {
        menuItems: any[]; // Replace 'any' with proper type if available
        user: any;        // Replace with actual user type
        dashboardRoute: string;
        userClinics:any[]
    };
}