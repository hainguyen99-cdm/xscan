import { Body, Controller, Get, Post, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StreamerApplicationsService } from './streamer-applications.service';
import { CreateStreamerApplicationDto } from './dto/create-streamer-application.dto';

@ApiTags('streamer-applications')
@Controller('streamer-applications')
export class StreamerApplicationsController {
  constructor(private readonly applicationsService: StreamerApplicationsService) {}

  @Get('my-application')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user\'s streamer application' })
  async getMyApplication(@Req() req: any) {
    const userId = req.user?.id as string;
    return await this.applicationsService.getUserApplication(userId);
  }

  @Post('apply')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit a streamer application' })
  async apply(@Body() body: CreateStreamerApplicationDto, @Req() req: any) {
    const userId = req.user?.id as string;
    return await this.applicationsService.createApplication(body, userId);
  }
}


