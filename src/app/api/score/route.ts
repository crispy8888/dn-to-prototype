import { PlacesClient } from '@googlemaps/places';

const placesClient = new PlacesClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const postalCode = searchParams.get('postalCode');

  if (!postalCode) {
    return Response.json({ error: 'Missing postalCode' }, { status: 400 });
  }

  try {
    // Step 1: Geocode postal code → get lat/lon (still using OpenStreetMap for now)
    const nominatimRes = await fetch(
      `https://nominatim.openstreetmap.org/search?postalcode=${postalCode}&country=Canada&format=json`
    );
    const nominatimData = await nominatimRes.json();
    const location = nominatimData[0];
    if (!location) {
      return Response.json({ error: 'Location not found' }, { status: 404 });
    }

    const lat = parseFloat(location.lat);
    const lon = parseFloat(location.lon);

    // Step 2: Use Places Aggregate API
    const request = {
      location: { latitude: lat, longitude: lon },
      radius: { value: 1000 }, // 1000 meters (1 km)
      includedTypes: ['restaurant', 'cafe', 'school', 'park', 'gym'],
    };

    const [response] = await placesClient.searchNearby(request, {
        otherArgs: {
          headers: {
            'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY!,
            'X-Goog-FieldMask': 'places.displayName,places.formattedAddress',
          },
        },
      });
      
      const placeCounts = {
        restaurants: response.places?.filter((p) =>
          p.types?.includes('restaurant')
        ).length || 0,
        cafes: response.places?.filter((p) =>
          p.types?.includes('cafe')
        ).length || 0,
        schools: response.places?.filter((p) =>
          p.types?.includes('school')
        ).length || 0,
        parks: response.places?.filter((p) =>
          p.types?.includes('park')
        ).length || 0,
        gyms: response.places?.filter((p) =>
          p.types?.includes('gym')
        ).length || 0,
      };
      

    return Response.json({
      postalCode,
      location: {
        displayName: location.display_name,
        lat,
        lon,
      },
      placeSummary: placeCounts,
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
