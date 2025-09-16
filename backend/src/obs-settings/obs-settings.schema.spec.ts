import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OBSSettings, OBSSettingsSchema } from './obs-settings.schema';

describe('OBSSettings Schema', () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
        }),
        MongooseModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            uri: configService.get('MONGODB_URI') || 'mongodb://localhost:27017/test',
          }),
          inject: [ConfigService],
        }),
        MongooseModule.forFeature([
          { name: OBSSettings.name, schema: OBSSettingsSchema },
        ]),
      ],
    }).compile();
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(OBSSettingsSchema).toBeDefined();
  });

  it('should have the correct schema structure', () => {
    const schema = OBSSettingsSchema;
    
    // Check if required fields exist
    expect(schema.paths.streamerId).toBeDefined();
    expect(schema.paths.alertToken).toBeDefined();
    expect(schema.paths.isActive).toBeDefined();
    expect(schema.paths.totalAlerts).toBeDefined();
    
    // Check if timestamp fields exist
    expect(schema.paths.createdAt).toBeDefined();
    expect(schema.paths.updatedAt).toBeDefined();
  });

  it('should have timestamps', () => {
    const schema = OBSSettingsSchema;
    expect(schema.options.timestamps).toBe(true);
  });

  it('should have proper indexes', () => {
    const schema = OBSSettingsSchema;
    
    // Check if indexes are defined
    expect(schema.indexes()).toBeDefined();
    
    // Find the compound index for streamerId and isActive
    const indexes = schema.indexes();
    const streamerActiveIndex = indexes.find(index => 
      JSON.stringify(index[0]) === '{"streamerId":1,"isActive":1}'
    );
    expect(streamerActiveIndex).toBeDefined();
  });

  it('should have the correct model name', () => {
    expect(OBSSettings.name).toBe('OBSSettings');
  });
}); 