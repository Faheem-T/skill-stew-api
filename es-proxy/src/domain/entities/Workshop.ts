export interface WorkshopSession {
  title: string;
  description: string;
}

export class Workshop {
  id: string;
  expertId: string;
  title: string;
  description: string | null;
  targetAudience: string | null;
  bannerImageKey: string | null;
  publishedAt: string;
  sessionTitles: string[];
  sessionDescriptions: string[];

  constructor(id: string) {
    this.id = id;
    this.expertId = "";
    this.title = "";
    this.description = null;
    this.targetAudience = null;
    this.bannerImageKey = null;
    this.publishedAt = "";
    this.sessionTitles = [];
    this.sessionDescriptions = [];
  }
}
