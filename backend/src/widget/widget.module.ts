import { Module } from '@nestjs/common';
import { WidgetController } from '../obs-settings/widget.controller';
import { OBSSettingsModule } from '../obs-settings/obs-settings.module';

@Module({
  imports: [OBSSettingsModule],
  controllers: [WidgetController],
})
export class WidgetModule {} 