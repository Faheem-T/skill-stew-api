import { ILocationProvider } from "../../application/ports/ILocationProvider";
import { ENV } from "../../utils/dotenv";

type GooglePlaceDetailsResponse = {
  id: string;
  formattedAddress: string;
  location: {
    latitude: number;
    longitude: number;
  };
  displayName: {
    text: string;
    languageCode: string;
  };
};

export class GoogleLocationProvider implements ILocationProvider {
  getPlaceById = async (
    id: string,
  ): Promise<{
    placeId: string;
    latitude: number;
    longitude: number;
    formattedAddress: string;
  } | null> => {
    try {
      const response = await fetch(
        `https://places.googleapis.com/v1/places/${id}?key=${ENV.GOOGLE_MAPS_API_KEY}`,
        {
          headers: {
            "X-Goog-FieldMask": "id,formattedAddress,location",
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error when fetching from google places API:");
        console.error(errorData.error.message);
        return null;
      }

      const data: GooglePlaceDetailsResponse = await response.json();

      return {
        placeId: data.id,
        latitude: data.location.latitude,
        longitude: data.location.longitude,
        formattedAddress: data.formattedAddress,
      };
    } catch (error) {
      console.error("Fetch error:", error);
      return null;
    }
  };
}
