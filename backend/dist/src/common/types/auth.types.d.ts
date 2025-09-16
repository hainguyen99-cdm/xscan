import { Request } from 'express';
export interface AuthenticatedUser {
    id: string;
    sub: string;
    email: string;
    username: string;
    role: string;
    isActive: boolean;
}
export interface AuthenticatedRequest extends Request {
    user?: AuthenticatedUser;
}
