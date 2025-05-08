'use client';

import { useState } from 'react';

// --- TYPES ---
type PlaceSummary = {
  restaurants: number;
  cafes: number;
  schools: number;
  parks: number;
  gyms: number;
};

type ScoreResult = {
  postalCode: string;
  location: {
    displayName: string;
    lat: number;
    lon: number;
  };
  placeSummary: PlaceSummary;
  scores: Record<string, number>;
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
      setResult(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-8 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">DNTO Neighbourhood Score</h1>

      <input
        className="border p-2 w-full mb-2"
        type="text"
        placeholder="Enter postal code"
        value={postalCode}
        onChange={(e) => setPostalCode(e.target.value)}
      />

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        onClick={handleSearch}
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Get Score'}
      </button>

      {error && <p className="text-red-600 mt-2">{error}</p>}

      {result && (
        <div className="mt-6 space-y-6">
          <div className="p-4 bg-gray-100 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Location</h2>
            <p className="text-gray-700">
              <strong>Address:</strong> {result.location.displayName} <br />
              <strong>Coordinates:</strong> {result.location.lat}, {result.location.lon}
            </p>
          </div>

          <div className="p-4 bg-gray-100 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Nearby Places Summary</h2>
            <ul className="list-disc ml-5">
              {Object.entries(result.placeSummary).map(([key, count]) => (
                <li key={key} className="capitalize">
                  {key.replace(/([A-Z])/g, ' $1')}: {count}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 bg-gray-100 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Lifestyle Scores</h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(result.scores).map(([key, value]) => (
                <div
                  key={key}
                  className="bg-white rounded p-4 shadow text-center"
                >
                  <div className="text-sm text-gray-500 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
                  </div>
                  <div className="text-2xl font-bold">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
