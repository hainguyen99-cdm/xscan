export declare class CreateStreamerApplicationDto {
    username: string;
    displayName: string;
    email: string;
    platform: 'twitch' | 'youtube' | 'kick' | 'facebook' | 'other';
    channelUrl: string;
    description: string;
    monthlyViewers: number;
    contentCategory: string;
    reasonForApplying: string;
    referrer?: string;
}
