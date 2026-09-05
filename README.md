# 🌤️ WeatherGPT

> **Next-Generation Conversational AI for Weather Forecasting, Early Hazard Alerts & Regional Climate Intelligence**

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

---

## 📌 Overview

**WeatherGPT** is an operational AI meteorological intelligence platform designed to deliver authoritative, hyper-localized weather forecasts, severe hazard bulletins, agro-climate advisories, and interactive geospatial telemetry across India and global territories.

By combining real-time meteorological models (GFS, ECMWF, IMD telemetry, INSAT satellite layers) with advanced conversational AI, WeatherGPT empowers citizens, farmers, emergency responders, and regional authorities with instant, actionable climate intelligence in both English and major Indic languages (Hindi, Hinglish, Marathi, Bengali, Tamil, Telugu, Gujarati, and more).

---

## 🌟 Key Features

### 🎙️ 1. Real-Time Live Voice AI (Gemini Live API)
- **Native Speech-to-Speech**: Spoken voice interaction with near-zero latency powered by Google's bidirectional `models/gemini-2.5-flash-native-audio-latest` model.
- **Mid-Session Tool Calling**: Live voice agent autonomously calls WeatherGPT meteorological tools (`get_live_weather`, `get_weather_alerts`, `get_agro_climate_advisory`) mid-conversation to speak verified real-time numbers.
- **ChatGPT / Claude Style Voice HUD**: Pulsing audio-reactive visualizer orb, listening/thinking/speaking state indicators, and tap-to-interrupt barge-in.
- **Live Streaming Dual Captions**: Real-time partial transcription as you speak, with streaming assistant captions as audio plays.
- **Secure Server-Side Relay**: `GEMINI_API_KEY` is strictly held on the backend relay (`server/relay.mjs`), never exposed to the client or browser bundle.
- **Seamless Multimodal Switching**: Users can talk or type interchangeably within the same conversation thread.

### 🤖 2. Multilingual WeatherGPT Conversational AI Assistant
- **Bilingual & Hinglish Support**: Natural conversational fluency in English, Hindi, Hinglish (*"aaj mausam kaisa rahega"*), Marathi, Tamil, Bengali, Telugu, and more.
- **Meteorological Domain Guardrails**: Strict safety filters ensuring 100% focused, authoritative weather, climate, and agro-met outputs while rejecting off-topic prompts.
- **Dual Engine Architecture**: Integrated with OpenRouter API (Gemini Flash, LLaMA 3.3) and backed by an offline meteorological simulation engine for network resilience.
- **Structured Telemetry Reporting**: Outputs forecasts with Markdown tables, temperature extremes, precipitation probability, wind velocities, and civic directives.

### 🗺️ 2. Interactive Geospatial Weather & Radar Map
- Powered by **MapLibre GL** with high-resolution vector layers.
- Real-time toggles for:
  - Precipitation & Radar Echoes
  - Wind Velocity Vectors & Particle Streams
  - Severe Cloudburst & Cyclone Track Overlays
  - Regional Station Telemetry Nodes

### 🚨 3. Severe Hazard Early Warning System
- Real-time alerts for Cyclones, Heatwaves (Loo), Flash Floods, Cloudbursts, and Maritime Swell Warnings.
- Visual severity indicators (Red, Orange, Yellow alerts) adhering to standard meteorological protocols.
- One-click action checklists and emergency civic advisories.

### 🌾 4. Agro-Climate & Farm Advisory Engine
- Tailored intelligence for Kharif, Rabi, and Zaid crop cycles.
- Soil moisture indices, optimal sowing windows, irrigation timing, and pesticide/fertilizer spraying conditions.

### 🌐 5. 3D WebGL Globe & Telemetry Dashboard
- Interactive 3D globe visualization powered by WebGL (`cobe`, `globe.gl`, `three.js`).
- Global atmospheric circulation and hemispheric temperature distribution displays.

---

## 🛠️ Technology Stack

- **Frontend Core**: React 19, TypeScript, Vite 8
- **Styling**: Tailwind CSS v4, Modern Glassmorphic Dark UI
- **Animations**: Framer Motion 12, GSAP, Lenis Smooth Scroll
- **Mapping & 3D**: MapLibre GL, Three.js, Cobe, Globe.gl, OGL
- **Icons & UI**: Lucide React, Custom SVG Meteorological Indicators
- **State & Routing**: React Router v7, React Context API

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or yarn or pnpm

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/shubhamrawat-gh/WeatherGPT.git
   cd WeatherGPT
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Configure `.env` with your API keys:
   ```env
   # OpenRouter API Key for text chat (optional fallback)
   VITE_OPENROUTER_API_KEY=your_openrouter_api_key_here

   # Gemini Live Voice API Key (Strictly server-side for voice relay, never exposed to browser)
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the Voice Relay Service:**
   In a separate terminal, launch the secure WebSocket relay (runs on port 3001):
   ```bash
   npm run relay
   ```

5. **Start Frontend Development Server:**
   ```bash
   npm run dev
   ```
   *(The Vite dev server automatically proxies `/voice-relay` WebSocket traffic to the local relay service on port 3001.)*

6. **Build for Production:**
   ```bash
   npm run build
   ```

7. **Preview Production Build:**
   ```bash
   npm run preview
   ```

---

## 📁 Project Structure

```
WeatherGPT/
├── src/
│   ├── components/                 # Reusable UI & Weather Components
│   │   ├── dashboard/              # Navigation, sidebars, headers
│   │   │   ├── weather/            # Specialized Weather telemetry widgets
│   │   │   └── maps/               # MapLibre GL radar & interactive map wrappers
│   │   └── auth/                   # Authentication layouts and guards
│   ├── context/                    # Auth, Data, and Theme context providers
│   ├── data/                       # Telemetry data, mock meteorological records
│   ├── pages/
│   │   ├── LandingPage.tsx         # Modern landing hero with smooth animations
│   │   └── dashboard/
│   │       ├── ChatAssistant.tsx   # Conversational WeatherGPT interface
│   │       ├── LiveMapPage.tsx     # Fullscreen interactive weather map
│   │       ├── AlertsPage.tsx      # Severe hazard alerts & warnings
│   │       ├── ClimatePage.tsx     # Macro-climate & seasonal trends
│   │       └── SettingsPage.tsx    # User preferences & telemetry config
│   ├── routes/                     # Centralized React Router configuration
│   ├── services/
│   │   ├── aiService.ts            # WeatherGPT LLM pipeline & domain guardrails
│   │   ├── weatherService.ts       # Meteorological data provider
│   │   └── firebase.ts             # Firebase client configuration
│   └── index.css                   # Global styles & design system tokens
├── public/                         # Static assets & icons
├── .env.example                    # Sample environment template
└── package.json                    # Project metadata and dependencies
```

---

## 🔒 Security & Privacy

- **Safe Credential Management**: Sensitive tokens (`.env`, local configs) are strictly ignored by `.gitignore`.
- **Domain Guardrails**: Automatic prompt sanitization to maintain meteorological integrity and prevent malicious prompt injection.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
