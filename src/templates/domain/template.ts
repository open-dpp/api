import { randomUUID } from 'crypto';
import { SectionType } from '../../data-modelling/domain/section-base';
import { DataFieldValidationResult } from './data-field';
import {
  DataSection,
  DataSectionDbProps,
  findSectionClassByTypeOrFail,
} from './section';
import { GranularityLevel } from '../../data-modelling/domain/granularity-level';
import { DataValue } from '../../product-passport/domain/data-value';
import { Sector } from '@open-dpp/api-client';

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

export type TemplateCreateProps = {
  name: string;
  description: string;
  sectors: Sector[];
  userId: string;
  organizationId: string;
};

export type TemplateDbProps = TemplateCreateProps & {
  id: string;
  version: string;
  sections: DataSectionDbProps[];
  marketplaceResourceId: string | null;
};

export class Template {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public description: string,
    public sectors: Sector[],
    public readonly version: string,
    private _createdByUserId: string,
    private _ownedByOrganizationId: string,
    public readonly sections: DataSection[],
    public marketplaceResourceId: string | null,
  ) {}

  static create(plain: {
    name: string;
    description: string;
    sectors: Sector[];
    userId: string;
    organizationId: string;
  }) {
    return new Template(
      randomUUID(),
      plain.name,
      plain.description,
      plain.sectors,
      '1.0.0',
      plain.userId,
      plain.organizationId,
      [],
      null,
    );
  }

  static loadFromDb(data: TemplateDbProps) {
    return new Template(
      data.id,
      data.name,
      data.description,
      data.sectors,
      data.version,
      data.userId,
      data.organizationId,
      data.sections.map((s) => {
        const SectionClass = findSectionClassByTypeOrFail(s.type);
        return SectionClass.loadFromDb(s);
      }),
      data.marketplaceResourceId,
    );
  }

  public isOwnedBy(organizationId: string) {
    return this.ownedByOrganizationId === organizationId;
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

  assignMarketplaceResource(marketplaceResourceId: string) {
    this.marketplaceResourceId = marketplaceResourceId;
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
