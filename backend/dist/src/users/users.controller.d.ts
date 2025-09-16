import { UsersService } from './users.service';
import { FileUploadService } from './services/file-upload.service';
import { ProfileService } from './services/profile.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ProfilePrivacyDto } from './dto/profile-privacy.dto';
import { ProfileExportDto } from './dto/profile-export.dto';
import { ProfileDeletionDto } from './dto/profile-deletion.dto';
import { BankAccountService } from './services/bank-account.service';
import { CreateBankAccountDto, UpdateBankAccountDto } from './dto/bank-account.dto';
export declare class UsersController {
    private readonly usersService;
    private readonly fileUploadService;
    private readonly profileService;
    private readonly bankAccountService;
    constructor(usersService: UsersService, fileUploadService: FileUploadService, profileService: ProfileService, bankAccountService: BankAccountService);
    discoverStreamers(search?: string, category?: string, page?: number, limit?: number): Promise<{
        streamers: any[];
        pagination: any;
    }>;
    create(createUserDto: CreateUserDto): Promise<import("./schemas/user.schema").UserDocument>;
    findAll(role?: string, active?: string): Promise<import("./schemas/user.schema").UserDocument[]>;
    getProfile(req: any): Promise<import("./schemas/user.schema").UserDocument>;
    getProfileStats(req: any): Promise<any>;
    getDonationTotals(req: any): Promise<{
        totalViaSystem: number;
        totalViaBank: number;
        totalAll: number;
    }>;
    getProfileCompletion(req: any): Promise<number>;
    getPublicProfile(id: string, req: any): Promise<any>;
    getStats(): Promise<{
        totalUsers: number;
        activeUsers: number;
        inactiveUsers: number;
    }>;
    findOne(id: string): Promise<import("./schemas/user.schema").UserDocument>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<import("./schemas/user.schema").UserDocument>;
    updateProfile(req: any, updateUserDto: UpdateUserDto): Promise<import("./schemas/user.schema").UserDocument>;
    updatePrivacySettings(req: any, privacyDto: ProfilePrivacyDto): Promise<import("./schemas/user.schema").UserDocument>;
    uploadProfilePicture(req: any, file: Express.Multer.File): Promise<{
        message: string;
        profilePicture: string;
        user: import("./schemas/user.schema").UserDocument;
    }>;
    uploadCoverPhoto(req: any, file: Express.Multer.File): Promise<{
        message: string;
        coverPhoto: string;
        user: import("./schemas/user.schema").UserDocument;
    }>;
    exportProfile(req: any, exportDto: ProfileExportDto): Promise<any>;
    requestDeletion(req: any, deletionDto: ProfileDeletionDto): Promise<void>;
    cancelDeletionRequest(req: any): Promise<void>;
    changePassword(req: any, changePasswordDto: ChangePasswordDto): Promise<void>;
    activate(id: string): Promise<import("./schemas/user.schema").UserDocument>;
    deactivate(id: string): Promise<import("./schemas/user.schema").UserDocument>;
    addVerificationBadge(id: string, badge: string): Promise<void>;
    removeVerificationBadge(id: string, badge: string): Promise<void>;
    remove(id: string): Promise<void>;
    getStreamerProfile(username: string, req: any): Promise<{
        id: string;
        email: string;
        name: string;
        username: string;
        role: string;
        profilePicture: string;
        coverPhoto: string;
        isEmailVerified: boolean;
        twoFactorEnabled: boolean;
        status: string;
        createdAt: Date;
        totalDonations: number;
        isLive: boolean;
        category: string;
        platform: "twitch" | "youtube" | "kick" | "facebook" | "other";
        channelUrl: string;
        monthlyViewers: number;
        followers: number;
        streamTitle: any;
        game: any;
        bio: string;
        location: string;
        website: string;
        isFollowed: boolean;
        donationLink: any;
        streamerApplication: {
            platform: "twitch" | "youtube" | "kick" | "facebook" | "other";
            channelUrl: string;
            description: string;
            monthlyViewers: number;
            contentCategory: string;
            reasonForApplying: string;
            referrer: string;
            reviewedAt: Date;
            reviewNotes: string;
        };
    }>;
    toggleFollow(req: any, streamerId: string): Promise<{
        isFollowed: boolean;
        followers: number;
        message: string;
    }>;
    getUserBankAccounts(req: any): Promise<import("./dto/bank-account.dto").BankAccountResponseDto[]>;
    createBankAccount(req: any, createBankAccountDto: CreateBankAccountDto): Promise<import("./dto/bank-account.dto").BankAccountResponseDto>;
    getBankAccount(req: any, accountId: string): Promise<import("./dto/bank-account.dto").BankAccountResponseDto>;
    updateBankAccount(req: any, accountId: string, updateBankAccountDto: UpdateBankAccountDto): Promise<import("./dto/bank-account.dto").BankAccountResponseDto>;
    deleteBankAccount(req: any, accountId: string): Promise<void>;
    setDefaultBankAccount(req: any, accountId: string): Promise<import("./dto/bank-account.dto").BankAccountResponseDto>;
    getBankAccountStats(req: any): Promise<{
        totalAccounts: number;
        activeAccounts: number;
        defaultAccount: import("./dto/bank-account.dto").BankAccountResponseDto | null;
    }>;
}
