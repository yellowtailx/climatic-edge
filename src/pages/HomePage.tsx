// src/pages/HomePage.tsx
import React, { useState, useEffect } from 'react';

interface NewsArticle {
  title: string;
  description: string;
  url: string;
}

interface CityWeather {
  name: string;
  temp: number;
  windspeed: number;
  weathercode: number;
}

const CITIES: Array<[string, number, number]> = [
  ['London', 51.51, -0.13],
  ['Paris', 48.85, 2.35],
  ['New York', 40.71, -74.01],
  ['Cairo', 30.04, 31.24],
  ['Sydney', -33.87, 151.21],
  ['Mumbai', 19.08, 72.88],
  ['Cape Town', -33.92, 18.42],
  ['Tokyo', 35.68, 139.69],
  ['Los Angeles', 34.05, -118.24],
  ['Dubai', 25.2, 55.27],
  ['Rome', 41.9, 12.5],
  ['Moscow', 55.76, 37.62],
  ['Berlin', 52.52, 13.4],
  ['Rio de Janeiro', -22.91, -43.17],
  ['Istanbul', 41.01, 28.98],
  ['Toronto', 43.65, -79.38],
  ['Hong Kong', 22.32, 114.17],
  ['Mexico City', 19.43, -99.13],
  ['Barcelona', 41.39, 2.17],
  ['Shanghai', 31.23, 121.47],
  ['Delhi', 28.63, 77.21],
  ['Buenos Aires', -34.6, -58.38],
];

const WEATHER_CODES: Record<number, string> = {
  0: 'Clear',
  1: 'Partly cloudy',
  2: 'Cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Fog',
  51: 'Light drizzle',
  53: 'Drizzle',
  55: 'Heavy drizzle',
  61: 'Light rain',
  63: 'Rain',
  65: 'Heavy rain',
  71: 'Light snow',
  73: 'Snow',
  75: 'Heavy snow',
  80: 'Showers',
  81: 'Showers',
  82: 'Violent showers',
  95: 'Thunderstorm',
};

const HomePage: React.FC = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [weatherData, setWeatherData] = useState<CityWeather[]>([]);
  const [weatherError, setWeatherError] = useState<string>('');
  const [newsError, setNewsError] = useState<string>('');

  useEffect(() => {
    // News - free Spaceflight News API, no key needed.
    fetch('https://api.spaceflightnewsapi.net/v4/articles/?limit=10&ordering=-published_at')
      .then((response) => {
        if (!response.ok) throw new Error('Failed to fetch news.');
        return response.json();
      })
      .then((data) => {
        const articles: NewsArticle[] = (data.results ?? []).map((a: any) => ({
          title: a.title,
          description: a.summary,
          url: a.url,
        }));
        setNews(articles);
      })
      .catch((err) => {
        setNewsError(err.message);
      });

    // Weather - free Open-Meteo API, no key needed. All cities in one request.
    const lat = CITIES.map((c) => c[1]).join(',');
    const lon = CITIES.map((c) => c[2]).join(',');
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`;

    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error('Failed to fetch weather.');
        return response.json();
      })
      .then((results: any[]) => {
        if (!Array.isArray(results)) {
          throw new Error('Unexpected weather response.');
        }
        const data: CityWeather[] = results.map((r, i) => ({
          name: CITIES[i][0],
          temp: r.current_weather.temperature,
          windspeed: r.current_weather.windspeed,
          weathercode: r.current_weather.weathercode,
        }));
        setWeatherData(data);
      })
      .catch((err) => {
        setWeatherError(err.message);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <section className="bg-blue-500 text-white text-center py-6">
        <h3 className="text-2xl font-bold">Welcome to the ClimaticEdge</h3>
      </section>
      <div className="container mx-auto p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <section className="bg-white shadow-md rounded-lg p-4">
          <h2 className="text-2xl font-semibold mb-4">Latest News</h2>
          {newsError ? (
            <p className="text-red-500">{newsError}</p>
          ) : news.length > 0 ? (
            <ul>
              {news.map((article, index) => (
                <li key={index} className="mb-4">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    <h3 className="font-bold">{article.title}</h3>
                    <p>{article.description}</p>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p>Loading news...</p>
          )}
        </section>

        <section className="bg-white shadow-md rounded-lg p-4">
          <h2 className="text-2xl font-semibold mb-4">Weather</h2>
          {weatherError ? (
            <p className="text-red-500">{weatherError}</p>
          ) : weatherData.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {weatherData.map((city, index) => (
                <div key={index} className="border border-gray-200 rounded p-3">
                  <p className="font-bold">{city.name}</p>
                  <p>{Math.round(city.temp)}°C</p>
                  <p className="text-sm text-gray-600">
                    {WEATHER_CODES[city.weathercode] ?? 'Unknown'} · Wind {city.windspeed} km/h
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p>Loading weather...</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default HomePage;