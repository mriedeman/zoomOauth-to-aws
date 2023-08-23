import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ZoomService } from './zoom/zoom.service';
import { HttpModule } from '@nestjs/axios';
import { ZoomController } from './zoom/zoom.controller';
import { AuthService } from './auth/auth.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, ConfigModule.forRoot({
    isGlobal: true, // this makes the ConfigModule global, so you don't have to import it again in other modules
    envFilePath: '.env', // location of your environment file
  })],
  controllers: [AppController, ZoomController],
  providers: [AppService, ZoomService, AuthService],
})
export class AppModule {}
