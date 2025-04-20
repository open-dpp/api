import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Repository } from 'typeorm';
import { UniqueProductIdentifierEntity } from './unique.product.identifier.entity';
import { UniqueProductIdentifier } from '../domain/unique.product.identifier';
import { NotFoundInDatabaseException } from '../../exceptions/service.exceptions';
import { DppEventsService } from '../../dpp-events/infrastructure/dpp-events.service';
import { DppEvent } from '../../dpp-events/domain/dpp-event';
import { DppEventType } from '../../dpp-events/domain/dpp-event-type.enum';

@Injectable()
export class UniqueProductIdentifierService {
  constructor(
    @InjectRepository(UniqueProductIdentifierEntity)
    private uniqueProductIdentifierRepository: Repository<UniqueProductIdentifierEntity>,
    private readonly dppEventsService: DppEventsService,
  ) {}

  convertToDomain(
    uniqueProductIdentifierEntity: UniqueProductIdentifierEntity,
  ) {
    const uniqueProductIdentifier = UniqueProductIdentifier.fromPlain({
      uuid: uniqueProductIdentifierEntity.uuid,
      view: uniqueProductIdentifierEntity.view,
    });
    uniqueProductIdentifier.linkTo(uniqueProductIdentifierEntity.referencedId);
    return uniqueProductIdentifier;
  }

  async save(uniqueProductIdentifier: UniqueProductIdentifier) {
    const domainObject = this.convertToDomain(
      await this.uniqueProductIdentifierRepository.save({
        uuid: uniqueProductIdentifier.uuid,
        view: uniqueProductIdentifier.view,
        referencedId: uniqueProductIdentifier.referenceId,
      }),
    );
    const event = DppEvent.create({
      source: uniqueProductIdentifier.uuid,
      type: DppEventType.OPEN_DPP,
      eventJsonData: JSON.stringify(domainObject),
    });
    await this.dppEventsService.save(event);
    return domainObject;
  }

  async findOne(uuid: string) {
    const uniqueProductIdentifierEntity =
      await this.uniqueProductIdentifierRepository.findOne({
        where: { uuid: Equal(uuid) },
      });
    if (!uniqueProductIdentifierEntity) {
      throw new NotFoundInDatabaseException(UniqueProductIdentifier.name);
    }
    return this.convertToDomain(uniqueProductIdentifierEntity);
  }

  async findAllByReferencedId(referenceId: string) {
    const uniqueProductIdentifiers =
      await this.uniqueProductIdentifierRepository.find({
        where: { referencedId: Equal(referenceId) },
      });
    return uniqueProductIdentifiers.map((permalink) =>
      this.convertToDomain(permalink),
    );
  }
}
