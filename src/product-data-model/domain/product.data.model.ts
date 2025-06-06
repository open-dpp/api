import { randomUUID } from 'crypto';
import {
  Expose,
  instanceToPlain,
  plainToInstance,
  Type,
} from 'class-transformer';
import { SectionType } from '../../data-modelling/domain/section-base';
import { User } from '../../users/domain/user';
import { Organization } from '../../organizations/domain/organization';
import { DataFieldValidationResult } from './data-field';
import { DataSection, sectionSubTypes } from './section';
import { DataValue } from '../../passport/passport';

export class ValidationResult {
  private readonly _validationResults: DataFieldValidationResult[] = [];
  private _isValid: boolean = true;

  public get isValid() {
    return this._isValid;
  }
  public get validationResults() {
    return this._validationResults;
  }

  public addValidationResult(validationResult: DataFieldValidationResult) {
    if (!validationResult.isValid) {
      this._isValid = false;
    }
    this._validationResults.push(validationResult);
  }
  public toJson() {
    return {
      isValid: this.isValid,
      errors: this.validationResults
        .filter((v) => !v.isValid)
        .map((v) => v.toJson()),
    };
  }
}

export enum VisibilityLevel {
  PUBLIC = 'Public',
  PRIVATE = 'Private',
}

export class ProductDataModel {
  @Expose()
  readonly id: string = randomUUID();
  @Expose()
  readonly name: string;
  @Expose()
  readonly version: string;
  @Expose({ name: 'createdByUserId' })
  private _createdByUserId: string;

  @Expose({ name: 'ownedByOrganizationId' })
  private _ownedByOrganizationId: string;

  @Expose({ name: 'visibility' })
  private _visibility: VisibilityLevel = VisibilityLevel.PRIVATE;

  @Expose()
  @Type(() => DataSection, {
    discriminator: {
      property: 'type',
      subTypes: sectionSubTypes,
    },
    keepDiscriminatorProperty: true,
  })
  readonly sections: DataSection[] = [];

  static create(plain: {
    name: string;
    user: User;
    organization: Organization;
    visibility?: VisibilityLevel;
  }) {
    return ProductDataModel.fromPlain({
      ...plain,
      version: '1.0.0',
      ownedByOrganizationId: plain.organization.id,
      createdByUserId: plain.user.id,
    });
  }

  publish() {
    this._visibility = VisibilityLevel.PUBLIC;
  }

  public isOwnedBy(organization: Organization) {
    return this.ownedByOrganizationId === organization.id;
  }

  public isPublic() {
    return this.visibility === VisibilityLevel.PUBLIC;
  }

  public get visibility() {
    return this._visibility;
  }

  public get createdByUserId() {
    return this._createdByUserId;
  }

  public get ownedByOrganizationId() {
    return this._ownedByOrganizationId;
  }

  // TODO: Partial seems not to work with data field id not set. Even type-fest deep partial is not enough
  static fromPlain(plain: unknown): ProductDataModel {
    return plainToInstance(ProductDataModel, plain, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }

  toPlain() {
    return instanceToPlain(this);
  }

  findSectionByIdOrFail(id: string): DataSection {
    const section = this.sections.find((s) => s.id === id);
    if (!section) {
      throw new Error(`Section with id ${id} not found`);
    }
    return section;
  }

  validate(
    values: DataValue[],
    includeSectionIds: string[] = [],
  ): ValidationResult {
    const validationOutput = new ValidationResult();
    const sectionsToValidate =
      includeSectionIds.length === 0
        ? this.sections
        : this.sections.filter((s) => includeSectionIds.includes(s.id));
    for (const section of sectionsToValidate) {
      section
        .validate(this.version, values)
        .map((v) => validationOutput.addValidationResult(v));
    }
    return validationOutput;
  }
  public createInitialDataValues(): DataValue[] {
    const filteredSections = this.sections.filter(
      (s) => s.type === SectionType.GROUP,
    );
    return filteredSections
      .map((s) =>
        s.dataFields.map((f) =>
          DataValue.create({
            dataSectionId: s.id,
            dataFieldId: f.id,
            value: undefined,
          }),
        ),
      )
      .flat();
  }
}
