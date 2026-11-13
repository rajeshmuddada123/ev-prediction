# SMART EV – AI-Powered Range Prediction & Solar-Aware Charging Platform

A modern, responsive, automotive-grade full-stack EV platform built with **React.js**, **MapLibre GL JS**, **OpenStreetMap**, **Java 21/25**, and **Spring Boot 3**.

---

## 🚀 Live Working Localhost URLs

- **Frontend Web Dashboard**: [http://localhost:3000](http://localhost:3000)
- **Backend REST API**: [http://localhost:8080/api](http://localhost:8080/api)
- **H2 Interactive Database Console**: [http://localhost:8080/h2-console](http://localhost:8080/h2-console) (JDBC URL: `jdbc:h2:file:./data/smartev_db`, User: `sa`, Password: *blank*)
- **WebSocket STOMP Broker**: `ws://localhost:8080/ws`

---

## 🌟 Key Architecture & Compliance

1. **Direct Home Access**:
   - Zero login or mandatory account creation.
   - Zero Gmail/OTP gates or administrative roadblocks.
   - Browser GPS detection with manual city picker fallback (Delhi NCR, Bengaluru, Mumbai, Hyderabad, Chennai).
   - Anonymous device identity (`dev_xxx` stored in localStorage) persists vehicle parameters, bookings, and preferences.

2. **OpenStreetMap + MapLibre GL JS**:
   - Strictly utilizes OpenStreetMap Carto Dark Matter raster tiles via MapLibre GL JS.
   - **No Leaflet, No Google Maps**.
   - Interactive SVG pins with power indicators (e.g. `150kW (4/6)`).
   - OSRM route line rendering.

3. **10 Main Navigation Views**:
   - **Home**: Dynamic telemetry hero, battery gauge snapshot, solar potential overview, live station map, and nearby high-speed chargers.
   - **EV Battery**: SOC percentage slider, pack capacity, usable energy kWh, efficiency (km/kWh), range calculation, model presets (Tata, MG, Hyundai, Kia, BYD, Tesla).
   - **Range Prediction**: AI kinetic & electrochemical model with inputs for distance, ambient temperature, traffic dynamics (Light/Heavy/Congested), road profile (Flat/Highway/Hilly), HVAC climate control, and aerodynamic wind drag.
   - **Find Charging Stations**: OpenStreetMap station directory with search by name/city, connector filters (CCS2, Type 2, CHAdeMO, GB/T), speed filters, and distance slider.
   - **Slot Booking**: 3-step reservation wizard with atomic slot locking preventing double-bookings, receipt generation (`SEV-2026-XXXX`), reschedule, and cancel actions.
   - **Live Tracking**: Real-time vehicle navigation simulation, speed gauge, distance countdown, arrival ETA, and battery drain rate.
   - **Solar Monitoring**: Diurnal irradiance (W/m²), sunlight intensity, PV power output (kW), Mode A (Local Potential) vs Mode B (Installed System), and 24-hr forecast curve.
   - **Solar-Aware Charging Prediction**: Recommends optimal charging window (e.g., 11:00 AM - 03:30 PM), solar share percentage, cost savings, and CO₂ reduction.
   - **Weather**: Local meteorological telemetry from Open-Meteo API with dynamic "EV Range Impact Factor".
   - **Security Monitoring**: Proactive WAF inspection, sliding-window rate limiting (120 req/min), SQLi/XSS attack filtering, and interactive sandbox tester.
   - **History & Analytics**: Archive of bookings, completed charging sessions, 7-day energy trends, and CO₂ offset.

---

## 🛠️ Project Structure

```
ev dti/
├── backend/
│   ├── src/main/java/com/smartev/
│   │   ├── config/               # WebSocketConfig, WebMvcConfig
│   │   ├── controller/           # Station, Booking, Range, Solar, Weather, Tracking, Session, Security
│   │   ├── dto/                  # RangePrediction, BookingRequest, SolarForecast, WeatherResponse
│   │   ├── model/                # VehicleConfig, ChargingStation, Slot, Booking, Session, SecurityEvent
│   │   ├── repository/           # Spring Data JPA Repositories
│   │   ├── security/             # SecurityFilter (Rate limiting & Attack inspection)
│   │   ├── service/              # StationService, RangePredictionService, SolarService, BookingService, etc.
│   │   └── SmartEvApplication.java
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   └── schema-mysql.sql      # Production MySQL DDL Schema
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── api/client.js         # REST & OSRM routing client with persistent deviceId
│   │   ├── components/           # BatteryVisualizer, MapLibreView, Sidebar, Header, NotificationDrawer, ActiveSessionBar
│   │   ├── views/                # 10 Dashboard Views (Home, Battery, Range, Stations, Booking, Tracking, Solar, Weather, Security, History)
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── tools/maven/                  # Bundled Maven 3.10.0 binary
└── README.md
```

---

## ⚙️ Running Locally

### 1. Spring Boot Backend
```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-25.0.2"
cd backend
..\tools\maven\bin\mvn.cmd package -DskipTests
java -jar target/smart-ev-platform-1.0.0.jar
```

### 2. React Frontend
```powershell
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 3000
```

### 3. MySQL Database Configuration (Optional)
The backend runs automatically with an embedded, persistent H2 file database (`./data/smartev_db`). To connect to an external MySQL 8.0 instance, provide environment variables or update `application.properties`:
```properties
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/smartev_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=your_password
```
Execute `backend/src/main/resources/schema-mysql.sql` to initialize standard tables.
