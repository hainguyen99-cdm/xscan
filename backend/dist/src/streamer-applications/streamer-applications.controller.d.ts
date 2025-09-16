import { StreamerApplicationsService } from './streamer-applications.service';
import { CreateStreamerApplicationDto } from './dto/create-streamer-application.dto';
export declare class StreamerApplicationsController {
    private readonly applicationsService;
    constructor(applicationsService: StreamerApplicationsService);
    getMyApplication(req: any): Promise<import("./streamer-application.schema").StreamerApplication>;
    apply(body: CreateStreamerApplicationDto, req: any): Promise<import("./streamer-application.schema").StreamerApplication>;
}
