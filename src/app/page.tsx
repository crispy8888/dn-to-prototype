'use client';
import { useState } from 'react';

export default function HomePage() {
  const [postalCode, setPostalCode] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setResult(null);
    const res = await fetch(`/api/score?postalCode=${postalCode}`);
    const data = await res.json();
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
        <div className="mt-4">
          <h2 className="text-xl font-semibold">Scores for {result.postalCode}</h2>
          <ul className="list-disc ml-5">
            {Object.entries(result.scores).map(([key, value]) => (
              <li key={key} className="capitalize">
                {key.replace(/([A-Z])/g, ' $1')}: {String(value)}
              </li>
            ))}
          </ul>
        </div>
      )}  
    </main>
  );
}