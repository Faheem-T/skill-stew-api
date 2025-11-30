export interface ILocationProvider {
  getPlaceById(id: string): Promise<{
    placeId: string;
    latitude: number;
    longitude: number;
    formattedAddress: string;
  } | null>;
}
