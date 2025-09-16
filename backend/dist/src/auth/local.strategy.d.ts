import { Strategy } from 'passport-local';
import { UsersService } from '../users/users.service';
declare const LocalStrategy_base: new (...args: [] | [options: import("passport-local").IStrategyOptionsWithRequest] | [options: import("passport-local").IStrategyOptions]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class LocalStrategy extends LocalStrategy_base {
    private usersService;
    constructor(usersService: UsersService);
    validate(email: string, password: string): Promise<any>;
}
export {};
