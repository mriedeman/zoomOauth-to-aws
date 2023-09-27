import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ZoomService } from './zoom/zoom.service';
import { HttpModule } from '@nestjs/axios';
import { ZoomController } from './zoom/zoom.controller';
import { AuthService } from './auth/auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { VttService } from './vtt/vtt.service';
import { VttController } from './vtt/vtt.controller';
import {TypeOrmModule} from '@nestjs/typeorm'
import { TransactionLogger } from './database-logger/database-logger.entity'; 
import { TransactionLoggerModule } from './database-logger/database-logger.module';

@Module({
  imports: [HttpModule,
            ConfigModule.forRoot({
                                  isGlobal: true, // this makes the ConfigModule global, so you don't have to import it again in other modules
                                  envFilePath: '.env', // location of your environment file
                                  }),
            TypeOrmModule.forRootAsync({
              imports: [ConfigModule],
              useFactory: (configService: ConfigService) => ({
                //TypeScript interprets it as any generic string, which might not match one of the expected types for database connections.
                type: configService.get('DB_TYPE') as 'postgres',
                host: configService.get<string>('DB_HOST'),
                port: configService.get<number>('DB_PORT'),
                username: configService.get<string>('DB_USERNAME'),
                password: configService.get<string>('DB_PASSWORD'),
                database: configService.get<string>('DB_NAME'),
                entities: [TransactionLogger],
                synchronize: true,
                migrationsRun: false,
                migrationsTableName: 'migration_history'
              }),
              inject: [ConfigService],
            }),
            TransactionLoggerModule
  ],
  controllers: [AppController, ZoomController, VttController],
  providers: [AppService, ZoomService, AuthService, VttService],
})
export class AppModule {}
