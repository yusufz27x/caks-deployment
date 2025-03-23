'use client';

import { useState } from 'react';
import { useAmadeus } from '@/lib/hooks/useAmadeus';

export default function FlightSearch() {
  const { loading, error, data, searchFlights } = useAmadeus();
  const [formData, setFormData] = useState({
    originLocationCode: '',
    destinationLocationCode: '',
    departureDate: '',
    returnDate: '',
    adults: '1',
    travelClass: 'ECONOMY'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await searchFlights(formData);
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">Flight Search</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Origin (IATA code)</label>
            <input
              type="text"
              name="originLocationCode"
              value={formData.originLocationCode}
              onChange={handleChange}
              placeholder="e.g. NYC"
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Destination (IATA code)</label>
            <input
              type="text"
              name="destinationLocationCode"
              value={formData.destinationLocationCode}
              onChange={handleChange}
              placeholder="e.g. PAR"
              className="w-full p-2 border rounded"
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Departure Date</label>
            <input
              type="date"
              name="departureDate"
              value={formData.departureDate}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Return Date</label>
            <input
              type="date"
              name="returnDate"
              value={formData.returnDate}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Passengers</label>
            <select
              name="adults"
              value={formData.adults}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              {[1, 2, 3, 4, 5, 6].map(num => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'adult' : 'adults'}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Travel Class</label>
            <select
              name="travelClass"
              value={formData.travelClass}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="ECONOMY">Economy</option>
              <option value="PREMIUM_ECONOMY">Premium Economy</option>
              <option value="BUSINESS">Business</option>
              <option value="FIRST">First</option>
            </select>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? 'Searching...' : 'Search Flights'}
        </button>
      </form>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-800 rounded">
          {error}
        </div>
      )}
      
      {data && data.data && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">Found {data.data.length} flights</h3>
          
          <div className="space-y-4">
            {data.data.slice(0, 5).map((offer: any, index: number) => (
              <div key={index} className="border rounded p-3 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">
                    {offer.itineraries[0].segments[0].departure.iataCode} → {offer.itineraries[0].segments[offer.itineraries[0].segments.length - 1].arrival.iataCode}
                  </span>
                  <span className="text-lg font-bold">
                    {offer.price.total} {offer.price.currency}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600">
                  {new Date(offer.itineraries[0].segments[0].departure.at).toLocaleString()} - 
                  {new Date(offer.itineraries[0].segments[offer.itineraries[0].segments.length - 1].arrival.at).toLocaleString()}
                </div>
                
                <div className="mt-2 text-sm">
                  {offer.itineraries[0].segments.length > 1 
                    ? `${offer.itineraries[0].segments.length} stops` 
                    : 'Direct flight'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 