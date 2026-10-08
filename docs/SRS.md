# Software Requirements Specification (SRS)

## ClimaticEdge — Live Weather & News Dashboard

**Version:** 1.1  
**Date:** October 2026  
**Author:** Sudhan  
**Course:** 25PCA3ES02A — Advanced Application Development and Deployment (NSQF – SSC/Q8403)

---

### 1. Introduction

**1.1 Purpose.** This document specifies the functional and non-functional requirements of **ClimaticEdge**, a client-side web application that delivers live weather data and current news headlines through a single responsive dashboard. It serves as the baseline for design, implementation, testing, and stakeholder acceptance.

**1.2 Scope.** ClimaticEdge is a React + TypeScript single-page application (SPA) with no custom backend. It consumes free public REST APIs directly from the browser and includes: an authentication gate with a custom password-hashing algorithm, a home dashboard (latest news + weather for 22 world cities), a paginated news page, and a searchable city weather page. Stock-market features are out of scope for v1.0.

**1.3 Definitions.** SPA — Single-Page Application; API — Application Programming Interface; SRS — Software Requirements Specification; FR — Functional Requirement; NFR — Non-Functional Requirement; SPA routing — hash-based client-side navigation.

**1.4 References.** Open-Meteo API Docs (https://open-meteo.com/en/docs); Spaceflight News API Docs (https://api.spaceflightnewsapi.net/v4/documentation/); React Docs (https://react.dev/); Tailwind CSS Docs (https://tailwindcss.com/docs).

---

### 2. Overall Description

**2.1 Product Perspective.** ClimaticEdge is a standalone, front-end-only SPA. All data is fetched at runtime from third-party services; the only persisted state (user records, session, hash pepper) lives in the browser's `localStorage`.

**2.2 User Characteristics.** General end users with no technical expertise; they need only the ability to log in and navigate.

**2.3 Constraints.**
- Implemented with React 18, TypeScript (strict), Tailwind CSS, Webpack.
- Only free, key-less public APIs may be used (no paid or secret-key services).
- Must run in modern desktop and mobile browsers and be responsive at 360 px+.
- Build must succeed with a single command (`npm run build`).

**2.4 Assumptions.** Internet connectivity is available; third-party APIs are externally available and rate-limited; user accounts are stored client-side for demonstration purposes only.

---

### 3. Functional Requirements

**3.1 Authentication & Session (Module: Security)**

| ID | Requirement |
|----|-------------|
| FR-01 | The system shall deny access to all content routes and redirect to `/login` until the user is authenticated. |
| FR-02 | The system shall allow user registration with a username and password. |
| FR-03 | Passwords shall never be stored in plain text; they shall be stored as salted, stretched hashes produced by the custom *ClimaticHash* algorithm (16-byte random salt → salt-driven scramble → N rounds of SHA-256 with an application-level pepper → constant-time verification). |
| FR-04 | The system shall terminate a session on logout and clear the stored session token. |

**3.2 Home Dashboard**

| ID | Requirement |
|----|-------------|
| FR-05 | The system shall display the 10 most recent news articles with title, summary, and outbound link. |
| FR-06 | The system shall display current temperature, weather condition, and wind speed for 22 preset world cities in a single batched API request. |
| FR-07 | The system shall show a loading indicator while data is pending and a visible error message if a request fails. |

**3.3 News Module**

| ID | Requirement |
|----|-------------|
| FR-08 | The system shall display news articles as image cards in a responsive 1/2/3-column grid, loading 27 articles (3 pages × 9) by default. |
| FR-09 | The system shall provide a **Load more news** control that appends the next 9 articles, de-duplicating already-rendered items and hiding itself when no further pages exist. |
| FR-10 | Articles without an image shall render a branded placeholder tile. |

**3.4 Weather Module**

| ID | Requirement |
|----|-------------|
| FR-11 | The system shall provide type-ahead city search (up to 5 suggestions) using a geocoding service. |
| FR-12 | The system shall show temperature (°C), humidity, wind speed, pressure, cloud cover, visibility, sunrise/sunset, and a human-readable condition for the selected city. |
| FR-13 | The system shall reject duplicate city selections and display an error state when no match is found. |

**3.5 Navigation**

| ID | Requirement |
|----|-------------|
| FR-14 | The system shall provide navigation among Home, News, and Weather routes via a persistent header and hash-based routing. |
| FR-15 | The system shall render a persistent footer with copyright information. |

---

### 4. Non-Functional Requirements

| ID | Category | Requirement |
|----|----------|-------------|
| NFR-01 | Usability | UI must be intuitive for non-technical users; no manual/instructions required. |
| NFR-02 | Usability | All pages must render correctly on mobile, tablet, and desktop viewports. |
| NFR-03 | Reliability | API failures must be handled gracefully with user-facing messages; the UI must never crash or block while awaiting network responses. |
| NFR-04 | Performance | Initial dashboard load must complete within 3 seconds on a standard broadband connection; news/weather data appears within 2 seconds of a successful response. |
| NFR-05 | Security | Secrets (hash pepper, keys) must be supplied only via the git-ignored `.env` file; no secret may be committed to source control. |
| NFR-06 | Security | Password comparison must be constant-time to prevent timing attacks. |
| NFR-07 | Maintainability | Code must compile under TypeScript `strict` mode and be organized into reusable page/component modules. |
| NFR-08 | Portability | The production bundle must build reproducibly with `npm run build` on Windows/Linux/macOS. |

---

### 5. External Interface Requirements

**5.1 Software Interfaces (third-party APIs — all free, no API key required):**

| Service | Endpoint | Purpose |
|---------|----------|---------|
| Open-Meteo Forecast | `https://api.open-meteo.com/v1/forecast` | Current weather (single-city and 22-city batch) |
| Open-Meteo Geocoding | `https://geocoding-api.open-meteo.com/v1/search` | City search / type-ahead |
| Spaceflight News API v4 | `https://api.spaceflightnewsapi.net/v4/articles/` | News articles with offset-based pagination |

**5.2 Hardware Interfaces.** Any device with a modern web browser (desktop, tablet, smartphone).

**5.3 User Interfaces.** Responsive Tailwind CSS layout; blue brand theme; visible loading, empty, and error states; card-based news grid; city weather tiles.

---

### 6. Requirement Traceability

| Requirement IDs | Module | Priority |
|-----------------|--------|----------|
| FR-01 – FR-04 | Authentication & Security | High |
| FR-05 – FR-07 | Home Dashboard | High |
| FR-08 – FR-10 | News | High |
| FR-11 – FR-13 | Weather | High |
| FR-14 – FR-15 | Navigation | Medium |
| NFR-01 – NFR-08 | Global | High |

---

### 7. Revision History

| Version | Date | Description | Author |
|---------|------|-------------|--------|
| 1.0 | 2026-10-06 | Initial SRS document | Sudhan |
| 1.1 | 2026-10-08 | Revised to match implemented system: real API endpoints (Open-Meteo, Spaceflight News), ClimaticHash security module, news pagination; removed unused stock module | Sudhan |
