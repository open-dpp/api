import { Page } from './page';
import { randomUUID } from 'crypto';
import { Template } from '../../templates/domain/template';
import { template } from 'lodash';

export class View {
  private constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly templateId: string,
    public readonly pages: Page[],
    private _createdByUserId: string,
    private _ownedByOrganizationId: string,
  ) {}
  static create(data: { title: string; template: Template }) {
    const pages = View.buildPages(data.template, undefined);
    return new View(
      randomUUID(),
      data.title,
      data.template.id,
      pages,
      data.template.createdByUserId,
      data.template.ownedByOrganizationId,
    );
  }

  get createdByUserId() {
    return this._createdByUserId;
  }

  public isOwnedBy(organizationId: string): boolean {
    return this._ownedByOrganizationId === organizationId;
  }

  private static buildPages(
    template: Template,
    parentId: string | undefined,
  ): Page[] {
    const parentSection = parentId
      ? template.findSectionByIdOrFail(parentId)
      : undefined;
    const rootSections = template.sections.filter(
      (s) => s.parentId === parentId,
    );
    const page = Page.create({
      id: parentId,
      title: parentSection?.name ?? 'Home',
      sections: rootSections,
    });
    const subPages = rootSections.map((r) => View.buildPages(template, r.id));
    return [page, ...subPages.flat()];
  }
}
