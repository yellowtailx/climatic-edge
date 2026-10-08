// src/pages/WeatherWidget.tsx
import React, { useState, useEffect } from 'react';

interface WeatherData {
  city: string;
  temperature: string;
  description: string;
  icon: string;
  humidity: string;
  windSpeed: string;
  pressure: string;
  visibility: string;
  cloudiness: string;
  sunrise: string;
  sunset: string;
}

const WEATHER_TEXT: Record<number, string> = {
  0: 'Clear', 1: 'Partly cloudy', 2: 'Cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Fog', 51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle',
  61: 'Light rain', 63: 'Rain', 65: 'Heavy rain', 71: 'Light snow', 73: 'Snow',
  75: 'Heavy snow', 80: 'Showers', 81: 'Showers', 82: 'Violent showers',
  95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Thunderstorm with hail',
};

const WEATHER_ICON: Record<number, string> = {
  0: '☀️', 1: '🌤️', 2: '☁️', 3: '☁️', 45: '🌫️', 48: '🌫️',
  51: '🌦️', 53: '🌦️', 55: '🌧️', 61: '🌧️', 63: '🌧️', 65: '🌧️',
  71: '❄️', 73: '❄️', 75: '❄️', 80: '🌦️', 81: '🌧️', 82: '⛈️',
  95: '⛈️', 96: '⛈️', 99: '⛈️',
};


const DEFAULT_CITIES = ['New York', 'London', 'Tokyo', 'Paris', 'Sydney', 'Mumbai'];

const WeatherWidget = () => {
  const [locations, setLocations] = useState<string[]>(DEFAULT_CITIES);
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [newLocation, setNewLocation] = useState<string>('');
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const geocode = async (city: string) => {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.results || data.results.length === 0) {
      throw new Error(`City not found: ${city}`);
    }
    return data.results[0] as { name: string; latitude: number; longitude: number };
  };

  const fetchWeather = async (city: string): Promise<WeatherData> => {
    const loc = await geocode(city);
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,relative_humidity_2m,weather_code,cloud_cover,surface_pressure,wind_speed_10m,visibility&daily=sunrise,sunset&timezone=auto`;
    const res = await fetch(url);
    const data = await res.json();
    const cur = data.current;
    const day = data.daily;
    return {
      city: loc.name,
      temperature: `${Math.round(cur.temperature_2m)}°C`,
      description: WEATHER_TEXT[cur.weather_code] ?? 'Unknown',
      icon: WEATHER_ICON[cur.weather_code] ?? '🌡️',
      humidity: `${cur.relative_humidity_2m}%`,
      windSpeed: `${cur.wind_speed_10m} km/h`,
      pressure: cur.surface_pressure,
      visibility: (cur.visibility / 1000).toFixed(1),
      cloudiness: `${cur.cloud_cover}%`,
      sunrise: new Date(day.sunrise[0]).toLocaleTimeString(),
      sunset: new Date(day.sunset[0]).toLocaleTimeString(),
    };
  };

  useEffect(() => {
    setWeatherData([]);
    setLoading(true);
    setError(null);

    Promise.allSettled(locations.map((location) => fetchWeather(location))).then(
      (results) => {
        const ok = results
          .filter((r): r is PromiseFulfilledResult<WeatherData> => r.status === 'fulfilled')
          .map((r) => r.value);
        setWeatherData(ok);
        setLoading(false);
        if (ok.length === 0) {
          setError('Could not fetch weather. Try adding a different city.');
        }
      },
    );
  }, [locations]);

  const fetchCitySuggestions = async (query: string) => {
    if (query.trim() === '') {
      setCitySuggestions([]);
      return;
    }
    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5`;
      const res = await fetch(url);
      const data = await res.json();
      const suggestions = (data.results ?? []).map(
        (r: any) => `${r.name}${r.country ? ', ' + r.country : ''}`,
      );
      setCitySuggestions(suggestions);
    } catch {
      setCitySuggestions([]);
    }
  };

  const handleAddLocation = () => {
    const cityName = newLocation.split(',')[0].trim();
    if (cityName && !locations.some((l) => l.toLowerCase() === cityName.toLowerCase())) {
      setLocations((prev) => [...prev, cityName]);
      setNewLocation('');
      setCitySuggestions([]);
    }
  };

  const handleCityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewLocation(value);
    fetchCitySuggestions(value);
  };

  const handleCitySelect = (city: string) => {
    setNewLocation(city);
    setCitySuggestions([]);
  };

  return (
    <div className="flex flex-col min-h-screen bg-blue-100 p-4">
      <header className="text-center bg-gradient-to-r from-blue-500 to-blue-600 text-white py-6 mb-6 w-full">
        <h1 className="text-3xl font-bold">Global Weather Forecast</h1>
      </header>

      <div className="mb-4 flex justify-center w-full relative">
        <input
          type="text"
          value={newLocation}
          onChange={handleCityInputChange}
          placeholder="Add a location"
          className="p-2 border border-gray-300 rounded mr-2 w-1/2 md:w-1/3 lg:w-1/4"
        />
        <button onClick={handleAddLocation} className="bg-blue-500 text-white p-2 rounded">
          Add Location
        </button>
        {citySuggestions.length > 0 && (
          <ul className="absolute top-12 mt-1 w-1/2 md:w-1/7 lg:w-1/7 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-auto z-10">
            {citySuggestions.map((city, index) => (
              <li
                key={index}
                onClick={() => handleCitySelect(city)}
                className="p-2 cursor-pointer hover:bg-blue-100"
              >
                {city}
              </li>
            ))}
          </ul>
        )}
      </div>

      {loading && <p>Loading...</p>}
      {error && (
        <div className="flex justify-center items-center w-full h-full">
          <p className="text-red-500 text-lg">{error}</p>
        </div>
      )}
      {!loading && weatherData.length === 0 && !error && <p>No weather data available.</p>}

      <div className="flex flex-wrap justify-center w-full gap-6 mb-auto">
        {!loading && !error && weatherData.length > 0 && weatherData.map((item, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
            <h4 className="text-xl font-semibold text-center">{item.city}</h4>
            <p className="text-center text-gray-600 text-sm">{item.description}</p>
            <div className="flex justify-center items-center mt-4">
              <span className="text-4xl">{item.icon}</span>
              <p className="text-xl ml-2">{item.temperature}</p>
            </div>

            <div className="mt-4 text-center text-sm">
              <p>Humidity: {item.humidity}</p>
              <p>Wind Speed: {item.windSpeed}</p>
              <p>Pressure: {item.pressure} hPa</p>
              <p>Visibility: {item.visibility} km</p>
              <p>Cloudiness: {item.cloudiness}</p>
              <p>Sunrise: {item.sunrise}</p>
              <p>Sunset: {item.sunset}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherWidget;
