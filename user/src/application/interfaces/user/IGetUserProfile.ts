export interface IGetUserProfile {
  exec(id: string): Promise<{
    name?: string;
    username?: string;
    phoneNumber?: string;
    avatarUrl?: string;
    bannerUrl?: string;
    timezone?: string;
    location?: {
      latitude: number;
      longitude: number;
    };
    about?: string;
    socialLinks: string[];
    languages: string[];
  } | null>;
}
