import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermalinkEntity } from './permalink.entity';
import { Permalink } from '../domain/permalink';

@Injectable()
export class PermalinksService {
  constructor(
    @InjectRepository(PermalinkEntity)
    private permalinkRepository: Repository<PermalinkEntity>,
  ) {}

  convertToDomain(permalinkEntity: PermalinkEntity) {
    const permalink = new Permalink(permalinkEntity.uuid, permalinkEntity.view);
    permalink.linkTo(permalinkEntity.referencedId);
    return permalink;
  }

  async save(permalink: Permalink) {
    return this.convertToDomain(
      await this.permalinkRepository.save({
        uuid: permalink.uuid,
        view: permalink.view,
        referencedId: permalink.getReference(),
      }),
    );
  }

  async findOne(uuid: string) {
    return this.convertToDomain(
      await this.permalinkRepository.findOne({
        where: { uuid },
      }),
    );
  }

  async findAllByReferencedId(referenceId: string) {
    const permalinks = await this.permalinkRepository.find({
      where: { referencedId: referenceId },
    });
    return permalinks.map((permalink) => this.convertToDomain(permalink));
  }
}
