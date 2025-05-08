'use client';
import { useState } from 'react';
import { ScoreResult } from '../types';

export default function HomePage() {
  const [postalCode, setPostalCode] = useState('');
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setResult(null);
    const res = await fetch(`/api/score?postalCode=${postalCode}`);
    const data: ScoreResult = await res.json();
    setResult(data);
    setLoading(false);
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
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={handleSearch}
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Get Score'}
      </button>

      {result && result.scores && (
  <div className="mt-6 p-4 bg-gray-100 rounded shadow">
    <h2 className="text-2xl font-semibold mb-4">Scores for {result.postalCode}</h2>
    <div className="grid grid-cols-2 gap-4">
      {Object.entries(result.scores).map(([key, value]) => (
        <div
          key={key}
          className="bg-white rounded p-4 shadow text-center"
        >
          <div className="text-sm text-gray-500 capitalize">
            {key.replace(/([A-Z])/g, ' $1')}
          </div>
          <div className="text-2xl font-bold">{value}</div>
        </div>
      ))}
    </div>
  </div>
)}
    </main>
  );
}