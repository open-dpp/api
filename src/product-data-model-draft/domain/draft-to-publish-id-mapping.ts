import { DataSectionDraft } from './section-draft';
import { randomUUID } from 'crypto';

export class DraftToPublishIdMapping {
  private idMap = new Map<string, string>();
  constructor(sectionDrafts: DataSectionDraft[]) {
    sectionDrafts.forEach((s) => {
      this.idMap.set(s.id, randomUUID());
    });
  }

  getPublicationId(draftId: string) {
    return this.idMap.get(draftId);
  }
}
