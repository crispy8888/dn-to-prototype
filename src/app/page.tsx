'use client';

import { useState } from 'react';

export type PlaceDetail = {
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

export type ScoreResult = {
  postalCode: string;
  location: {
    displayName: string;
    lat: number;
    lon: number;
  };
  aggregateInsights: any; // you can type this more strictly later
  detailedPlaces: PlaceDetail[];
};


export default function HomePage() {
  const [postalCode, setPostalCode] = useState('');
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!postalCode.trim()) {
      setError('Please enter a postal code.');
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch(`/api/score?postalCode=${postalCode}`);
      if (!res.ok) {
        throw new Error(`API error: ${res.statusText}`);
      }
      const data: ScoreResult = await res.json();
      console.log('Received result:', data);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-center">Neighbourhood Insights</h1>

      <div className="mb-4">
        <input
          className="border p-2 w-full rounded"
          type="text"
          placeholder="Enter postal code"
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value)}
        />
      </div>

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700 transition"
        onClick={handleSearch}
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Get Insights'}
      </button>

      {error && <p className="text-red-600 mt-2 text-center">{error}</p>}

{result && (
  <div className="mt-6 space-y-6">
    {/* Aggregate Insights Section */}

    {/* Detailed Places Section */}
    <div className="p-4 bg-gray-100 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Detailed Places</h2>
      {result.detailedPlaces?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {result.detailedPlaces.map((place, index) => (
            <div
              key={index}
              className="bg-white rounded p-4 shadow hover:shadow-lg transition"
            >
              <h3 className="text-lg font-bold mb-1">
                {place.displayName?.text || 'Unnamed Place'}
              </h3>
              <p className="text-gray-700 text-sm mb-2">
                {place.formattedAddress}
              </p>
              <p className="text-gray-500 text-xs">
                Lat: {place.location?.latitude}, Lon: {place.location?.longitude}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No detailed places found.</p>
      )}
    </div>
  </div>
)}

    </main>
  );
}
