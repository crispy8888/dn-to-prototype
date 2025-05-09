export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const postalCode = searchParams.get('postalCode');

  if (!postalCode) {
    return Response.json({ error: 'Missing postalCode' }, { status: 400 });
  }

  try {
    // Geocode postal code to lat/lon
    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/search?postalcode=${postalCode}&country=Canada&format=json`
    );
    const geoData = await geoRes.json();
    const location = geoData[0];
    if (!location) {
      return Response.json({ error: 'Location not found' }, { status: 404 });
    }

    const lat = parseFloat(location.lat);
    const lon = parseFloat(location.lon);

    // Step 1: Get aggregate insights + place IDs
    const insightsRequest = {
      insights: ['INSIGHT_COUNT', 'INSIGHT_PLACES'],
      filter: {
        locationFilter: {
          circle: {
            latLng: {
              latitude: lat,
              longitude: lon,
            },
            radius: 5000,
          },
        },
        typeFilter: {
          includedTypes: ['restaurant', 'cafe', 'gym', 'school', 'park'],
        },
      },
    };

    const insightsRes = await fetch(
      'https://areainsights.googleapis.com/v1:computeInsights',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': process.env.GOOGLE_PLACES_AGGREGATE_API_KEY!,
        },
        body: JSON.stringify(insightsRequest),
      }
    );

    if (!insightsRes.ok) {
      const errorText = await insightsRes.text();
      throw new Error(`ComputeInsights API error: ${errorText}`);
    }

    const insightsData = await insightsRes.json();
    console.log('Raw insights data:', JSON.stringify(insightsData, null, 2));

    // Step 2: Extract place IDs
    const placeIds: string[] = [];
    if (insightsData.placeInsights && Array.isArray(insightsData.placeInsights)) {
      insightsData.placeInsights.forEach((placeObj: any) => {
        const placeId = placeObj.place.split('/')[1]; // Extract the ID part after 'places/'
        if (placeId) {
          placeIds.push(placeId);
        }
      });
    }

console.log('Extracted place IDs:', placeIds);

    console.log('Extracted place IDs:', placeIds);

    // Step 3: Fetch details for each place
    const detailedPlaces: any[] = [];
    for (const placeId of placeIds) {
      console.log(`https://places.googleapis.com/v1/places/${placeId}?fields=displayName,formattedAddress,location`);
      const placeDetailsRes = await fetch(
        `https://places.googleapis.com/v1/places/${placeId}?fields=displayName,formattedAddress,location`,
        {
          headers: {
            'X-Goog-Api-Key': process.env.GOOGLE_PLACES_AGGREGATE_API_KEY!,
          },
        }
      );

      if (placeDetailsRes.ok) {
        const placeDetails = await placeDetailsRes.json();
        detailedPlaces.push(placeDetails);
        console.log(`Fetched details for place ${placeId}:`, JSON.stringify(placeDetails, null, 2));
      }

      


      if (!placeDetailsRes.ok) {
        const errorText = await placeDetailsRes.text();
        console.warn(`Failed to fetch details for place ${placeId}: ${errorText}`);
        console.warn(`Status: ${placeDetailsRes.status} ${placeDetailsRes.statusText}`);
        console.warn(`Headers: ${JSON.stringify([...placeDetailsRes.headers], null, 2)}`);
      }
    }

    return Response.json({
      postalCode,
      location: {
        displayName: location.display_name,
        lat,
        lon,
      },
      aggregateInsights: insightsData,
      detailedPlaces,
    });
  } catch (error) {
    console.error('Backend error:', error);
    return Response.json(
      { error: 'Failed to fetch aggregate + place data', details: String(error) },
      { status: 500 }
    );
  }
}
