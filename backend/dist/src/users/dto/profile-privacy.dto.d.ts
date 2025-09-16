export declare enum ProfileVisibility {
    PUBLIC = "public",
    PRIVATE = "private",
    FRIENDS_ONLY = "friends_only"
}
export declare class ProfilePrivacyDto {
    profileVisibility?: ProfileVisibility;
    showEmail?: boolean;
    showPhone?: boolean;
    showAddress?: boolean;
    showLastLogin?: boolean;
}
