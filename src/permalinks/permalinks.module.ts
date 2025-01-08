import { Module } from '@nestjs/common';
import { PermalinksService } from './infrastructure/permalinks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermalinkEntity } from './infrastructure/permalink.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PermalinkEntity])],
  providers: [PermalinksService],
  exports: [PermalinksService],
})
export class PermalinksModule {}
