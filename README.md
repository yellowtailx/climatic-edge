# ClimaticEdge

ClimaticEdge is a web-based application that provides real-time weather updates and news from around the globe. Built with React and Typescript and integrated with free external APIs, ClimaticEdge delivers accurate weather forecasts and the latest news, making it the perfect platform for keeping up-to-date with global events.

## Features

- **Global Weather Forecast:** View current weather information, including temperature, humidity, wind speed, pressure, and more for multiple cities around the world.
- **Latest News:** Stay informed with the latest news headlines from trusted sources.
- **Add and Track Weather:** Add multiple locations and receive weather updates for your selected cities.
- **ClimaticHash Password Algorithm:** A custom password-securing algorithm (scramble + key-stretching + pepper) with a secure login/registration page at `/login`.

## Tech Stack

- **Frontend:** Typescript, React.js, Tailwind CSS
- **APIs:** Free keyless APIs - Open-Meteo (for weather data), Spaceflight News API (for news updates)

## Installation

To run the project locally, follow these steps:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yellowtailx/climatic-edge.git
   cd climatic-edge

2. **Create a `.env` file** in the root of the project and add the necessary environment variables. Below is an example of the environment variables you might need:

   ```
   REACT_APP_WEATHER_API_KEY=your_openweather_api_key
   REACT_APP_NEWS_API_KEY=your_news_api_key
   REACT_APP_HASH_PEPPER=your_secret_pepper_value
   ```

   The Weather and News apps use keyless free APIs, so the key variables are optional. If `REACT_APP_HASH_PEPPER` is not set, the app generates a random pepper per browser profile at runtime (no secret is hardcoded or shipped in the bundle).

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the server:
   ```bash
   npm start
   ```

