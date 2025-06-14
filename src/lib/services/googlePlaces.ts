// Google Places API service for fetching city photos
// Using the new Google Places API (Places API (New))

interface PlacePhoto {
  name: string; // Photo reference
  widthPx: number;
  heightPx: number;
  authorAttributions: Array<{
    displayName: string;
    uri: string;
    photoUri: string;
  }>;
}

interface Place {
  id: string;
  displayName: {
    text: string;
    languageCode: string;
  };
  photos?: PlacePhoto[];
  types: string[];
}

interface TextSearchResponse {
  places: Place[];
}

export interface GooglePlacesPhotoResult {
  photoUrl: string | null;
  attribution?: string;
  error?: string;
}

/**
 * Search for a place using Google Places API Text Search
 */
async function searchPlaces(query: string): Promise<Place[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  
  if (!apiKey) {
    throw new Error('Google Places API key not configured');
  }

  try {
    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.photos,places.types'
      },
      body: JSON.stringify({
        textQuery: query,
        maxResultCount: 10, // Increased to get more options for filtering
        // Focus on localities but we'll filter for cities in post-processing
        includedType: 'locality',
        languageCode: 'en'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Places API error:', response.status, errorText);
      throw new Error(`Google Places API error: ${response.status}`);
    }

    const data: TextSearchResponse = await response.json();
    return data.places || [];
  } catch (error) {
    console.error('Error searching places:', error);
    throw error;
  }
}

/**
 * Get photo URL from Google Places photo reference
 */
async function getPhotoUrl(photoName: string, maxWidth: number = 1200): Promise<string> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  
  if (!apiKey) {
    throw new Error('Google Places API key not configured');
  }

  // Google Places Photo API URL format for new API
  const photoUrl = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${maxWidth}&key=${apiKey}`;
  
  return photoUrl;
}

/**
 * Find the best photo for a city from the place results
 * Prioritizes actual cities over towns or smaller localities
 */
function selectBestCityPhoto(places: Place[]): PlacePhoto | null {
  // Priority order for place types that typically represent cities (not towns)
  const preferredCityTypes = [
    'locality', // City/town - but we'll prioritize by other factors
    'administrative_area_level_1', // State/province capitals
    'administrative_area_level_2', // County seats (often cities)
    'political', // Political entities (often cities)
    'tourist_attraction' // Major tourist spots (usually in cities)
  ];

  // Filter out places that are likely to be towns or small localities
  const cityLikePlaces = places.filter(place => {
    // Prefer places that have multiple photos (usually indicates a more significant place)
    const hasMultiplePhotos = place.photos && place.photos.length >= 2;
    
    // Prefer places with certain type combinations that suggest cities
    const hasCityIndicators = place.types.some(type => 
      ['locality', 'political', 'administrative_area_level_1', 'administrative_area_level_2'].includes(type)
    );
    
    // Exclude places that are clearly not cities
    const isNotSmallLocality = !place.types.some(type => 
      ['neighborhood', 'sublocality_level_1', 'sublocality_level_2', 'route', 'street_address'].includes(type)
    );
    
    return hasCityIndicators && isNotSmallLocality && (hasMultiplePhotos || (place.photos?.length ?? 0) > 0);
  });

  // First, try to find a place with preferred types that has photos
  for (const type of preferredCityTypes) {
    const placeWithType = cityLikePlaces.find(place => 
      place.types.includes(type) && place.photos && place.photos.length > 0
    );
    
    if (placeWithType && placeWithType.photos) {
      // Sort photos by size (prefer larger photos)
      const sortedPhotos = [...placeWithType.photos].sort((a, b) => 
        (b.widthPx * b.heightPx) - (a.widthPx * a.heightPx)
      );
      return sortedPhotos[0];
    }
  }

  // Fallback: find any city-like place with photos, preferring those with more photos
  const sortedCityPlaces = cityLikePlaces
    .filter(place => place.photos && place.photos.length > 0)
    .sort((a, b) => (b.photos?.length || 0) - (a.photos?.length || 0));

  if (sortedCityPlaces.length > 0 && sortedCityPlaces[0].photos) {
    const sortedPhotos = [...sortedCityPlaces[0].photos].sort((a, b) => 
      (b.widthPx * b.heightPx) - (a.widthPx * a.heightPx)
    );
    return sortedPhotos[0];
  }

  return null;
}

/**
 * Get a city photo using Google Places API
 * Focuses specifically on cities rather than towns or smaller localities
 */
export async function getCityPhoto(cityName: string): Promise<GooglePlacesPhotoResult> {
  try {
    console.log(`Fetching Google Places photo for city: ${cityName}`);
    
    // Search for the city with more specific query to avoid towns
    const searchQuery = `${cityName} major city`;
    const places = await searchPlaces(searchQuery);
    
    if (!places || places.length === 0) {
      console.log(`No places found for city: ${cityName}`);
      return { photoUrl: null, error: 'No places found' };
    }

    // Find the best photo from city-level results
    const bestPhoto = selectBestCityPhoto(places);
    
    if (!bestPhoto) {
      console.log(`No city photos found for: ${cityName}`);
      return { photoUrl: null, error: 'No city photos found' };
    }

    // Get the photo URL
    const photoUrl = await getPhotoUrl(bestPhoto.name, 1600); // Higher resolution for hero images
    
    // Get attribution if available
    let attribution = '';
    if (bestPhoto.authorAttributions && bestPhoto.authorAttributions.length > 0) {
      attribution = bestPhoto.authorAttributions[0].displayName;
    }

    console.log(`Successfully fetched Google Places photo for city: ${cityName}`);
    return { 
      photoUrl, 
      attribution: attribution || undefined 
    };

  } catch (error) {
    console.error(`Failed to fetch Google Places photo for city ${cityName}:`, error);
    return { 
      photoUrl: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Alternative search with broader query if initial search fails
 * Still focuses on cities rather than towns
 */
export async function getCityPhotoWithFallback(cityName: string, country?: string): Promise<GooglePlacesPhotoResult> {
  // Try primary search first
  let result = await getCityPhoto(cityName);
  
  if (result.photoUrl) {
    return result;
  }

  // Try with country if provided
  if (country && country.toLowerCase() !== 'unknown') {
    console.log(`Trying fallback search for city: ${cityName}, ${country}`);
    result = await getCityPhoto(`${cityName}, ${country} city`);
    
    if (result.photoUrl) {
      return result;
    }
  }

  // Try with more specific city search
  console.log(`Trying alternative city search for: ${cityName}`);
  const places = await searchPlaces(`${cityName} downtown city center`);
  
  if (places && places.length > 0) {
    const bestPhoto = selectBestCityPhoto(places);
    
    if (bestPhoto) {
      const photoUrl = await getPhotoUrl(bestPhoto.name, 1600);
      let attribution = '';
      if (bestPhoto.authorAttributions && bestPhoto.authorAttributions.length > 0) {
        attribution = bestPhoto.authorAttributions[0].displayName;
      }
      
      return { 
        photoUrl, 
        attribution: attribution || undefined 
      };
    }
  }

  return { photoUrl: null, error: 'No city photos found after fallback attempts' };
} 