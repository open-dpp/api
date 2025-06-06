import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Repository } from 'typeorm';
import { UniqueProductIdentifierEntity } from './unique.product.identifier.entity';
import { UniqueProductIdentifier } from '../domain/unique.product.identifier';

@Injectable()
export class UniqueProductIdentifierSqlService {
  constructor(
    @InjectRepository(UniqueProductIdentifierEntity)
    private uniqueProductIdentifierRepository: Repository<UniqueProductIdentifierEntity>,
  ) {}

  convertToDomain(
    uniqueProductIdentifierEntity: UniqueProductIdentifierEntity,
  ) {
    const uniqueProductIdentifier = UniqueProductIdentifier.fromPlain({
      uuid: uniqueProductIdentifierEntity.uuid,
    });
    uniqueProductIdentifier.linkTo(uniqueProductIdentifierEntity.referencedId);
    return uniqueProductIdentifier;
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
