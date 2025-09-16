import { Cache } from 'cache-manager';
import { ConfigService } from '../config/config.service';
export declare class RedisService {
    private cacheManager;
    private configService;
    constructor(cacheManager: Cache, configService: ConfigService);
    get<T>(key: string): Promise<T | undefined>;
    set(key: string, value: any, ttl?: number): Promise<void>;
    del(key: string): Promise<void>;
    reset(): Promise<void>;
    getTtl(key: string): Promise<number>;
    ttl(key: string): Promise<number>;
    setex(key: string, ttl: number, value: any): Promise<void>;
    exists(key: string): Promise<boolean>;
    publish(channel: string, message: string): Promise<void>;
    subscribe(channel: string): Promise<string[]>;
    private getChannelKeys;
}
