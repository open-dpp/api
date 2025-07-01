import { randomUUID } from 'crypto';
import { SectionType } from '../../data-modelling/domain/section-base';
import { DataFieldValidationResult } from './data-field';
import { DataSection } from './section';
import { GranularityLevel } from '../../data-modelling/domain/granularity-level';
import { DataValue } from '../../product-passport/domain/data-value';

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

export type ProductDataModelDbProps = {
  id: string;
  name: string;
  version: string;
  createdByUserId: string;
  ownedByOrganizationId: string;
  visibility: VisibilityLevel;
  sections: DataSection[];
};

export class ProductDataModel {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly version: string,
    private _createdByUserId: string,
    private _ownedByOrganizationId: string,
    private _visibility: VisibilityLevel,
    public readonly sections: DataSection[],
  ) {}

  static create(plain: {
    name: string;
    userId: string;
    organizationId: string;
    visibility?: VisibilityLevel;
  }) {
    return new ProductDataModel(
      randomUUID(),
      plain.name,
      '1.0.0',
      plain.userId,
      plain.organizationId,
      plain.visibility || VisibilityLevel.PRIVATE,
      [],
    );
  }

  static loadFromDb(data: ProductDataModelDbProps) {
    return new ProductDataModel(
      data.id,
      data.name,
      data.version,
      data.createdByUserId,
      data.ownedByOrganizationId,
      data.visibility,
      data.sections,
    );
  }

  publish() {
    this._visibility = VisibilityLevel.PUBLIC;
  }

  public isOwnedBy(organizationId: string) {
    return this.ownedByOrganizationId === organizationId;
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

  findSectionByIdOrFail(id: string): DataSection {
    const section = this.findSectionById(id);
    if (!section) {
      throw new Error(`Section with id ${id} not found`);
    }
    return section;
  }

  findSectionById(id: string): DataSection | undefined {
    return this.sections.find((s) => s.id === id);
  }

  validate(
    values: DataValue[],
    granularity: GranularityLevel,
    includeSectionIds: string[] = [],
  ): ValidationResult {
    const validationOutput = new ValidationResult();
    const sectionsToValidate =
      includeSectionIds.length === 0
        ? this.sections
        : this.sections.filter((s) => includeSectionIds.includes(s.id));
    for (const section of sectionsToValidate) {
      section
        .validate(this.version, values, granularity)
        .map((v) => validationOutput.addValidationResult(v));
    }
    return validationOutput;
  }
  public createInitialDataValues(granularity: GranularityLevel): DataValue[] {
    const rootGroupSections = this.sections
      .filter((s) => s.parentId === undefined)
      .filter((s) => s.type === SectionType.GROUP);
    const relevantGroupSections = rootGroupSections.concat(
      rootGroupSections
        .map((g) => g.subSections.map((s) => this.findSectionByIdOrFail(s)))
        .flat(),
    );

    return relevantGroupSections
      .map((s) =>
        s.dataFields
          .filter((f) => f.granularityLevel === granularity)
          .map((f) =>
            DataValue.create({
              dataSectionId: s.id,
              dataFieldId: f.id,
              value: undefined,
              row: 0,
            }),
          ),
      )
      .flat();
  }
}
