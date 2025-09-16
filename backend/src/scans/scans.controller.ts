import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ScansService } from './scans.service';
import { CreateScanDto } from './dto/create-scan.dto';
import { UpdateScanDto } from './dto/update-scan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { OwnershipGuard } from '../common/guards/ownership.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { RequireOwnership } from '../common/decorators/ownership.decorator';
import { UserRole } from '../common/enums/roles.enum';

@ApiTags('Scans')
@Controller('scans')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiBearerAuth()
export class ScansController {
  constructor(private readonly scansService: ScansService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.STREAMER)
  @RequirePermissions('scans.create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new scan (Admin and Streamer only)' })
  @ApiResponse({ status: 201, description: 'Scan created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin or Streamer role required',
  })
  create(@Body() createScanDto: CreateScanDto, @Request() req) {
    // Set the user ID from the authenticated user
    createScanDto.userId = req.user.sub;
    return this.scansService.create(createScanDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @RequirePermissions('scans.read')
  @ApiOperation({ summary: 'Get all scans (Admin only)' })
  @ApiResponse({ status: 200, description: 'Scans retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  findAll() {
    return this.scansService.findAll();
  }

  @Get('my-scans')
  @RequirePermissions('scans.read.own')
  @ApiOperation({ summary: 'Get current user scans' })
  @ApiResponse({
    status: 200,
    description: 'User scans retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getMyScans(@Request() req) {
    return this.scansService.findByUser(req.user.sub);
  }

  @Get('public')
  @RequirePermissions('scans.read.public')
  @ApiOperation({
    summary: 'Get public scans (visible to all authenticated users)',
  })
  @ApiResponse({
    status: 200,
    description: 'Public scans retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getPublicScans() {
    return this.scansService.findPublicScans();
  }

  @Get('user/:userId')
  @UseGuards(OwnershipGuard)
  @RequireOwnership()
  @RequirePermissions('scans.read.own')
  @ApiOperation({ summary: 'Get scans by user ID (own scans or admin)' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User scans retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only access own scans',
  })
  findByUser(@Param('userId') userId: string) {
    return this.scansService.findByUser(userId);
  }

  @Get(':id')
  @RequirePermissions('scans.read')
  @ApiOperation({ summary: 'Get scan by ID' })
  @ApiParam({ name: 'id', description: 'Scan ID' })
  @ApiResponse({ status: 200, description: 'Scan retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Scan not found' })
  findOne(@Param('id') id: string) {
    return this.scansService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(OwnershipGuard)
  @RequireOwnership()
  @RequirePermissions('scans.update.own')
  @ApiOperation({ summary: 'Update scan by ID (own scans or admin)' })
  @ApiParam({ name: 'id', description: 'Scan ID' })
  @ApiResponse({ status: 200, description: 'Scan updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only update own scans',
  })
  @ApiResponse({ status: 404, description: 'Scan not found' })
  update(@Param('id') id: string, @Body() updateScanDto: UpdateScanDto) {
    return this.scansService.update(id, updateScanDto);
  }

  @Delete(':id')
  @UseGuards(OwnershipGuard)
  @RequireOwnership()
  @RequirePermissions('scans.delete.own')
  @ApiOperation({ summary: 'Delete scan by ID (own scans or admin)' })
  @ApiParam({ name: 'id', description: 'Scan ID' })
  @ApiResponse({ status: 200, description: 'Scan deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only delete own scans',
  })
  @ApiResponse({ status: 404, description: 'Scan not found' })
  remove(@Param('id') id: string) {
    return this.scansService.remove(id);
  }

  @Post(':id/start')
  @UseGuards(OwnershipGuard)
  @RequireOwnership()
  @RequirePermissions('scans.start.own')
  @ApiOperation({ summary: 'Start a scan (own scans or admin)' })
  @ApiParam({ name: 'id', description: 'Scan ID' })
  @ApiResponse({ status: 200, description: 'Scan started successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only start own scans',
  })
  @ApiResponse({ status: 404, description: 'Scan not found' })
  startScan(@Param('id') id: string) {
    return this.scansService.startScan(id);
  }

  @Post(':id/complete')
  @UseGuards(OwnershipGuard)
  @RequireOwnership()
  @RequirePermissions('scans.complete.own')
  @ApiOperation({ summary: 'Complete a scan (own scans or admin)' })
  @ApiParam({ name: 'id', description: 'Scan ID' })
  @ApiResponse({ status: 200, description: 'Scan completed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only complete own scans',
  })
  @ApiResponse({ status: 404, description: 'Scan not found' })
  completeScan(@Param('id') id: string, @Body() body: { results: any }) {
    return this.scansService.completeScan(id, body.results);
  }

  @Post(':id/fail')
  @UseGuards(OwnershipGuard)
  @RequireOwnership()
  @RequirePermissions('scans.fail.own')
  @ApiOperation({ summary: 'Mark a scan as failed (own scans or admin)' })
  @ApiParam({ name: 'id', description: 'Scan ID' })
  @ApiResponse({
    status: 200,
    description: 'Scan marked as failed successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only fail own scans',
  })
  @ApiResponse({ status: 404, description: 'Scan not found' })
  failScan(@Param('id') id: string, @Body() body: { errorMessage: string }) {
    return this.scansService.failScan(id, body.errorMessage);
  }
}
