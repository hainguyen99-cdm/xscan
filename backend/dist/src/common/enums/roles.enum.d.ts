export declare enum UserRole {
    ADMIN = "admin",
    STREAMER = "streamer",
    DONOR = "donor"
}
export declare const USER_ROLES: UserRole[];
export declare const ROLE_HIERARCHY: {
    admin: number;
    streamer: number;
    donor: number;
};
export declare const ROLE_PERMISSIONS: {
    admin: string[];
    streamer: string[];
    donor: string[];
};
