package com.smartev.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartev.model.ChargingConnector;
import com.smartev.model.ChargingSlot;
import com.smartev.model.ChargingStation;
import com.smartev.repository.ChargingConnectorRepository;
import com.smartev.repository.ChargingSlotRepository;
import com.smartev.repository.ChargingStationRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class StationService {

    private final ChargingStationRepository stationRepository;
    private final ChargingSlotRepository slotRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Cache to respect Overpass API rate limits and avoid repeated queries
    private final Map<String, CacheEntry> overpassCache = new ConcurrentHashMap<>();

    private static class CacheEntry {
        final List<ChargingStation> stations;
        final long timestamp;
        CacheEntry(List<ChargingStation> stations) {
            this.stations = stations;
            this.timestamp = System.currentTimeMillis();
        }
        boolean isExpired() {
            return (System.currentTimeMillis() - timestamp) > (10 * 60 * 1000L); // 10 minutes
        }
    }

    public StationService(ChargingStationRepository stationRepository, ChargingSlotRepository slotRepository) {
        this.stationRepository = stationRepository;
        this.slotRepository = slotRepository;
    }

    @PostConstruct
    @Transactional
    public void initDefaultStations() {
        if (stationRepository.count() > 0) return;

        // Curated high-speed verified hubs across urban centers
        List<ChargingStation> seedStations = List.of(
            // Delhi NCR
            createStation("DL-EV-01", "Tata Power EZ Charge - Connaught Place", "Tata Power", "Barakhamba Road, Connaught Place", "New Delhi", 28.6315, 77.2215, 6, 4, 2, 150.0, 18.0),
            createStation("DL-EV-02", "Jio-bp pulse - Aerocity Express Hub", "Jio-bp pulse", "Asset 5B, Hospitality District, Aerocity", "New Delhi", 28.5521, 77.1218, 8, 6, 2, 240.0, 19.5),
            createStation("DL-EV-03", "Statiq EV Hypercharger - Cyber City", "Statiq", "DLF Cyber City, Phase 2, Sector 24", "Gurugram", 28.4952, 77.0891, 10, 7, 2, 180.0, 17.5),
            createStation("DL-EV-04", "Fortum Charge & Drive - Sector 18", "Fortum Charge & Drive", "Mall of India Parking, Sector 18", "Noida", 28.5677, 77.3210, 4, 3, 1, 60.0, 16.0),
            createStation("DL-EV-05", "Zeon Fast Charging - Ambience Hub", "Zeon", "Ambience Island, NH 48", "Gurugram", 28.5042, 77.0970, 6, 4, 1, 120.0, 18.5),

            // Bengaluru
            createStation("BLR-EV-01", "Ather Grid & Tata Power - Indiranagar", "Tata Power", "100 Feet Road, HAL 2nd Stage", "Bengaluru", 12.9719, 77.6412, 6, 4, 2, 120.0, 17.0),
            createStation("BLR-EV-02", "Zeon Ultra Fast Hub - Electronic City", "Zeon", "Velankani Tech Park, Phase 1", "Bengaluru", 12.8452, 77.6602, 8, 5, 2, 180.0, 18.0),
            createStation("BLR-EV-03", "Jio-bp pulse - Whitefield Tech Zone", "Jio-bp pulse", "ITPB Main Road, Whitefield", "Bengaluru", 12.9866, 77.7381, 6, 3, 3, 120.0, 18.5),
            createStation("BLR-EV-04", "BESCOM EV Fast Charger - MG Road", "BESCOM", "Public Utility Building, MG Road", "Bengaluru", 12.9754, 77.6094, 4, 2, 1, 50.0, 14.5),

            // Mumbai
            createStation("MUM-EV-01", "Tata Power Mega Fast Hub - BKC", "Tata Power", "G Block, Bandra Kurla Complex", "Mumbai", 19.0657, 72.8683, 12, 8, 3, 240.0, 19.0),
            createStation("MUM-EV-02", "Magenta ChargeGrid - Lower Parel", "Magenta", "Senapati Bapat Marg, Lower Parel", "Mumbai", 18.9953, 72.8258, 6, 4, 2, 60.0, 16.5),
            createStation("MUM-EV-03", "Statiq Supercharge - Navi Mumbai Vashi", "Statiq", "Palm Beach Galleria, Sector 19D", "Navi Mumbai", 19.0712, 73.0031, 6, 5, 1, 120.0, 17.5),

            // Hyderabad & Chennai
            createStation("HYD-EV-01", "Zeon Fast Charger - HITEC City", "Zeon", "Cyber Towers Roundabout, HITEC City", "Hyderabad", 17.4504, 78.3808, 8, 6, 1, 150.0, 18.0),
            createStation("CHN-EV-01", "Tata Power EZ Charge - Anna Nagar", "Tata Power", "2nd Avenue, Anna Nagar", "Chennai", 13.0850, 80.2101, 6, 4, 2, 120.0, 17.5)
        );

        for (ChargingStation station : seedStations) {
            ChargingStation saved = stationRepository.save(station);
            generateDefaultSlots(saved);
        }
    }

    private ChargingStation createStation(String code, String name, String operator, String address, String city,
                                          Double lat, Double lon, int total, int avail, int occ, double power, double cost) {
        ChargingStation s = new ChargingStation(code, name, operator, address, city, lat, lon, total, avail, occ, power, cost);
        s.addConnector(new ChargingConnector("CCS2", power, "DC", "AVAILABLE"));
        s.addConnector(new ChargingConnector("Type 2", 22.0, "AC", "AVAILABLE"));
        if (power >= 120) {
            s.addConnector(new ChargingConnector("CHAdeMO", 50.0, "DC", "AVAILABLE"));
            s.addConnector(new ChargingConnector("GB/T", 60.0, "DC", "AVAILABLE"));
        }
        return s;
    }

    private void generateDefaultSlots(ChargingStation station) {
        LocalDate today = LocalDate.now();
        List<String> slotTimes = List.of(
            "08:00 - 09:00", "09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00",
            "12:00 - 13:00", "13:00 - 14:00", "14:00 - 15:00", "15:00 - 16:00",
            "16:00 - 17:00", "17:00 - 18:00", "18:00 - 19:00", "19:00 - 20:00"
        );
        for (int dayOffset = 0; dayOffset < 3; dayOffset++) {
            LocalDate date = today.plusDays(dayOffset);
            for (String time : slotTimes) {
                ChargingSlot slot = new ChargingSlot(station, date, time, station.getTotalChargers());
                slotRepository.save(slot);
            }
        }
    }

    public List<ChargingStation> getNearbyStations(Double userLat, Double userLon, Double radiusKm,
                                                  String connectorType, Double minPowerKw, String searchQuery) {
        if (userLat == null || userLon == null) {
            userLat = 28.6139;
            userLon = 77.2090;
        }

        final double lat = userLat;
        final double lon = userLon;
        final double radius = radiusKm != null ? radiusKm : 50.0;

        // 1. Fetch internal verified stations
        List<ChargingStation> dbStations = (searchQuery != null && !searchQuery.isBlank())
                ? stationRepository.searchStations(searchQuery.trim())
                : stationRepository.findAll();

        List<ChargingStation> results = new ArrayList<>(dbStations);

        // 2. Fetch real live OpenStreetMap Overpass stations for this location if within reasonable radius
        try {
            List<ChargingStation> osmStations = fetchOverpassChargingStations(lat, lon, Math.min(25.0, radius) * 1000.0);
            if (osmStations != null && !osmStations.isEmpty()) {
                // Avoid duplicates by coordinates proximity
                for (ChargingStation os : osmStations) {
                    boolean alreadyExists = results.stream().anyMatch(existing ->
                        calculateDistanceKm(existing.getLatitude(), existing.getLongitude(), os.getLatitude(), os.getLongitude()) < 0.2
                    );
                    if (!alreadyExists) {
                        results.add(os);
                    }
                }
            }
        } catch (Exception e) {
            // Graceful fallback to verified stations
        }

        // 3. Compute distance and filter
        return results.stream()
                .peek(s -> s.setDistanceKm(calculateDistanceKm(lat, lon, s.getLatitude(), s.getLongitude())))
                .filter(s -> s.getDistanceKm() <= radius)
                .filter(s -> minPowerKw == null || s.getMaxPowerKw() >= minPowerKw)
                .filter(s -> connectorType == null || connectorType.equalsIgnoreCase("ALL") ||
                             s.getConnectors().stream().anyMatch(c -> c.getConnectorType().equalsIgnoreCase(connectorType)))
                .sorted(Comparator.comparingDouble(ChargingStation::getDistanceKm))
                .collect(Collectors.toList());
    }

    /**
     * Query OpenStreetMap Overpass API for real charging stations within radiusMeters
     */
    public List<ChargingStation> fetchOverpassChargingStations(Double lat, Double lon, Double radiusMeters) {
        if (lat == null || lon == null) return Collections.emptyList();
        if (radiusMeters == null || radiusMeters <= 0) radiusMeters = 10000.0; // 10 km default

        // Cache key based on 0.05 degree grid (approx 5.5 km)
        String cacheKey = String.format(Locale.US, "%.2f_%.2f_%.0f", lat, lon, radiusMeters);
        CacheEntry cached = overpassCache.get(cacheKey);
        if (cached != null && !cached.isExpired()) {
            return cached.stations;
        }

        List<ChargingStation> list = new ArrayList<>();
        try {
            String overpassUrl = "https://overpass-api.de/api/interpreter";
            String query = String.format(Locale.US,
                "[out:json][timeout:12];" +
                "(" +
                "  node[\"amenity\"=\"charging_station\"](around:%.0f,%.6f,%.6f);" +
                "  way[\"amenity\"=\"charging_station\"](around:%.0f,%.6f,%.6f);" +
                ");" +
                "out center tags 40;",
                radiusMeters, lat, lon, radiusMeters, lat, lon
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            HttpEntity<String> request = new HttpEntity<>("data=" + query, headers);

            String json = restTemplate.postForObject(overpassUrl, request, String.class);
            if (json != null) {
                JsonNode root = objectMapper.readTree(json);
                JsonNode elements = root.get("elements");
                if (elements != null && elements.isArray()) {
                    long syntheticId = 100000L;
                    for (JsonNode el : elements) {
                        syntheticId++;
                        double stLat;
                        double stLon;
                        if (el.has("lat") && el.has("lon")) {
                            stLat = el.get("lat").asDouble();
                            stLon = el.get("lon").asDouble();
                        } else if (el.has("center")) {
                            stLat = el.get("center").get("lat").asDouble();
                            stLon = el.get("center").get("lon").asDouble();
                        } else {
                            continue;
                        }

                        JsonNode tags = el.get("tags");
                        String name = "EV Charging Station";
                        String operator = "OpenStreetMap Listed";
                        String address = String.format(Locale.US, "GPS: %.4f, %.4f", stLat, stLon);
                        double powerKw = 50.0;

                        if (tags != null) {
                            if (tags.has("name")) name = tags.get("name").asText();
                            else if (tags.has("brand")) name = tags.get("brand").asText() + " Station";
                            else if (tags.has("operator")) name = tags.get("operator").asText() + " Charger";

                            if (tags.has("operator")) operator = tags.get("operator").asText();
                            else if (tags.has("brand")) operator = tags.get("brand").asText();

                            StringBuilder addrBuilder = new StringBuilder();
                            if (tags.has("addr:street")) addrBuilder.append(tags.get("addr:street").asText()).append(" ");
                            if (tags.has("addr:housenumber")) addrBuilder.append(tags.get("addr:housenumber").asText()).append(", ");
                            if (tags.has("addr:city")) addrBuilder.append(tags.get("addr:city").asText());
                            if (!addrBuilder.isEmpty()) address = addrBuilder.toString().trim();

                            if (tags.has("socket:type2_combo:output")) {
                                try {
                                    String pStr = tags.get("socket:type2_combo:output").asText().replaceAll("[^0-9.]", "");
                                    powerKw = Double.parseDouble(pStr);
                                } catch (Exception ignored) {}
                            } else if (tags.has("output")) {
                                try {
                                    String pStr = tags.get("output").asText().replaceAll("[^0-9.]", "");
                                    powerKw = Double.parseDouble(pStr);
                                } catch (Exception ignored) {}
                            }
                        }

                        ChargingStation osmStation = new ChargingStation(
                            "OSM-" + (el.has("id") ? el.get("id").asText() : syntheticId),
                            name,
                            operator,
                            address,
                            "Nearby Area",
                            stLat,
                            stLon,
                            2, // default known charging spots
                            2,
                            0,
                            powerKw,
                            18.5
                        );
                        osmStation.setId(syntheticId);
                        osmStation.setIsLiveStatus(false); // Static OSM data source

                        // Connectors
                        osmStation.addConnector(new ChargingConnector("CCS2", powerKw, "DC", "AVAILABLE"));
                        osmStation.addConnector(new ChargingConnector("Type 2", 22.0, "AC", "AVAILABLE"));

                        list.add(osmStation);
                    }
                }
            }
        } catch (Exception e) {
            // Overpass temporary rate limit or timeout - return empty, fallback to seed
        }

        overpassCache.put(cacheKey, new CacheEntry(list));
        return list;
    }

    public Optional<ChargingStation> getStationById(Long id, Double userLat, Double userLon) {
        return stationRepository.findById(id).map(s -> {
            if (userLat != null && userLon != null) {
                s.setDistanceKm(calculateDistanceKm(userLat, userLon, s.getLatitude(), s.getLongitude()));
            }
            return s;
        });
    }

    public List<ChargingSlot> getSlotsForStation(Long stationId, LocalDate date) {
        if (date == null) date = LocalDate.now();
        List<ChargingSlot> slots = slotRepository.findByStationIdAndSlotDate(stationId, date);
        if (slots.isEmpty()) {
            Optional<ChargingStation> stationOpt = stationRepository.findById(stationId);
            if (stationOpt.isPresent()) {
                ChargingStation station = stationOpt.get();
                List<String> slotTimes = List.of(
                    "08:00 - 09:00", "09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00",
                    "12:00 - 13:00", "13:00 - 14:00", "14:00 - 15:00", "15:00 - 16:00",
                    "16:00 - 17:00", "17:00 - 18:00", "18:00 - 19:00", "19:00 - 20:00"
                );
                for (String time : slotTimes) {
                    ChargingSlot slot = new ChargingSlot(station, date, time, station.getTotalChargers());
                    slots.add(slotRepository.save(slot));
                }
            }
        }
        return slots;
    }

    public static double calculateDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        double earthRadius = 6371.0; // km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(earthRadius * c * 10.0) / 10.0;
    }
}
