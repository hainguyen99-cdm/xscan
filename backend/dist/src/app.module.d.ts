import { MiddlewareConsumer } from '@nestjs/common';
export declare class TestWidgetController {
    testRoute(): {
        message: string;
        timestamp: string;
    };
}
export declare class AppModule {
    configure(consumer: MiddlewareConsumer): void;
}
