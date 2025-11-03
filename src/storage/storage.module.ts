import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StorageService } from './storage.service';
import { UploadController } from './upload.controller';

@Global() // Jadikan service ini global agar bisa digunakan di semua modul
@Module({
  imports: [ConfigModule],
  controllers: [UploadController],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
