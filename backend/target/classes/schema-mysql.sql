-- MySQL Schema Definition for SMART EV Platform
-- Database: smartev_db

CREATE DATABASE IF NOT EXISTS smartev_db;
USE smartev_db;

-- 1. vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
    id BIGINT AUTO-INCREMENT PRIMARY KEY,
    device_id VARCHAR(100) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    battery_capacity_kwh DOUBLE NOT NULL,
    current_soc_percentage DOUBLE NOT NULL,
    efficiency_km_per_kwh DOUBLE NOT NULL,
    connector_type VARCHAR(50) DEFAULT 'CCS2',
    is_manual_entry BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_vehicle_device (device_id)
);

-- 2. charging_stations table
CREATE TABLE IF NOT EXISTS charging_stations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    station_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    operator_name VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    total_chargers INT NOT NULL,
    available_chargers INT NOT NULL,
    occupied_chargers INT NOT NULL,
    offline_chargers INT NOT NULL,
    max_power_kw DOUBLE NOT NULL,
    operating_hours VARCHAR(100) DEFAULT '24/7',
    cost_per_kwh DOUBLE DEFAULT 18.5,
    is_live_status BOOLEAN DEFAULT TRUE,
    status_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_station_geo (latitude, longitude),
    INDEX idx_station_city (city)
);

-- 3. charging_connectors table
CREATE TABLE IF NOT EXISTS charging_connectors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    station_id BIGINT NOT NULL,
    connector_type VARCHAR(50) NOT NULL,
    power_kw DOUBLE NOT NULL,
    current_type VARCHAR(20) DEFAULT 'DC', -- AC or DC
    status VARCHAR(30) DEFAULT 'AVAILABLE', -- AVAILABLE, CHARGING, OFFLINE
    FOREIGN KEY (station_id) REFERENCES charging_stations(id) ON DELETE CASCADE
);

-- 4. charging_slots table
CREATE TABLE IF NOT EXISTS charging_slots (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    station_id BIGINT NOT NULL,
    slot_date DATE NOT NULL,
    slot_time VARCHAR(20) NOT NULL, -- e.g. "10:00 - 11:00"
    max_capacity INT NOT NULL DEFAULT 4,
    booked_count INT NOT NULL DEFAULT 0,
    status VARCHAR(30) DEFAULT 'AVAILABLE',
    FOREIGN KEY (station_id) REFERENCES charging_stations(id) ON DELETE CASCADE,
    UNIQUE KEY uk_station_slot (station_id, slot_date, slot_time)
);

-- 5. bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id VARCHAR(50) UNIQUE NOT NULL,
    device_id VARCHAR(100) NOT NULL,
    station_id BIGINT NOT NULL,
    station_name VARCHAR(150) NOT NULL,
    slot_date DATE NOT NULL,
    slot_time VARCHAR(50) NOT NULL,
    duration_minutes INT NOT NULL,
    connector_type VARCHAR(50) NOT NULL,
    vehicle_model VARCHAR(100),
    estimated_energy_kwh DOUBLE,
    estimated_cost DOUBLE,
    status VARCHAR(30) DEFAULT 'CONFIRMED', -- CONFIRMED, COMPLETED, CANCELLED, RESCHEDULED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (station_id) REFERENCES charging_stations(id),
    INDEX idx_booking_device (device_id),
    INDEX idx_booking_status (status)
);

-- 6. charging_sessions table
CREATE TABLE IF NOT EXISTS charging_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(50) UNIQUE NOT NULL,
    device_id VARCHAR(100) NOT NULL,
    station_id BIGINT NOT NULL,
    station_name VARCHAR(150) NOT NULL,
    start_soc DOUBLE NOT NULL,
    current_soc DOUBLE NOT NULL,
    target_soc DOUBLE NOT NULL,
    power_kw DOUBLE NOT NULL,
    energy_delivered_kwh DOUBLE NOT NULL,
    duration_seconds BIGINT NOT NULL,
    status VARCHAR(30) DEFAULT 'IN_PROGRESS', -- IN_PROGRESS, COMPLETED, STOPPED
    is_simulated BOOLEAN DEFAULT TRUE,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP NULL,
    FOREIGN KEY (station_id) REFERENCES charging_stations(id),
    INDEX idx_session_device (device_id)
);

-- 7. vehicle_tracking_history table
CREATE TABLE IF NOT EXISTS vehicle_tracking_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(100) NOT NULL,
    target_station_id BIGINT,
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    speed_kmh DOUBLE DEFAULT 0.0,
    heading DOUBLE DEFAULT 0.0,
    battery_percentage DOUBLE,
    remaining_distance_km DOUBLE,
    estimated_arrival_minutes INT,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tracking_device (device_id)
);

-- 8. solar_systems table
CREATE TABLE IF NOT EXISTS solar_systems (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(100) NOT NULL,
    system_type VARCHAR(20) DEFAULT 'INSTALLED', -- POTENTIAL or INSTALLED
    system_capacity_kw DOUBLE NOT NULL DEFAULT 5.0,
    panel_efficiency_pct DOUBLE NOT NULL DEFAULT 19.5,
    tilt_angle DOUBLE DEFAULT 20.0,
    location_name VARCHAR(150),
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_solar_device (device_id)
);

-- 9. solar_generation_history table
CREATE TABLE IF NOT EXISTS solar_generation_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(100) NOT NULL,
    recorded_date DATE NOT NULL,
    solar_irradiance_wm2 DOUBLE NOT NULL,
    generation_kwh DOUBLE NOT NULL,
    peak_power_kw DOUBLE NOT NULL,
    carbon_offset_kg DOUBLE,
    INDEX idx_solar_hist_device (device_id, recorded_date)
);

-- 10. notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(100) NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- LOW_BATTERY, SOLAR_WINDOW, BOOKING, SECURITY, WEATHER
    severity VARCHAR(20) DEFAULT 'INFO', -- INFO, SUCCESS, WARNING, DANGER
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_notif_device (device_id)
);

-- 11. security_events table
CREATE TABLE IF NOT EXISTS security_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    client_ip VARCHAR(50) NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    http_method VARCHAR(10),
    risk_level VARCHAR(20) NOT NULL, -- LOW, MEDIUM, HIGH, CRITICAL
    details TEXT,
    is_blocked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_sec_event (created_at, risk_level)
);
