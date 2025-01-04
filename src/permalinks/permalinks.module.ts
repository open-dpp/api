import { Module } from '@nestjs/common';
import { PermalinksService } from './permalinks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permalink } from './entities/permalink.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Permalink])],
  providers: [PermalinksService],
  exports: [PermalinksService],
})
export class PermalinksModule {}
