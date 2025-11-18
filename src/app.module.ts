import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { MapModule } from './map/map.module';

@Module({
  imports: [UserModule, MapModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
