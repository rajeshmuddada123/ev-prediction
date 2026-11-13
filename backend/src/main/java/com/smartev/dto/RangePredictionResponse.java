package com.smartev.dto;

import com.smartev.model.ChargingStation;
import java.util.List;
import java.util.Map;

public class RangePredictionResponse {
    private Double currentRangeKm;
    private Double predictedConsumptionKwh;
    private Double predictedRemainingEnergyKwh;
    private Double predictedSocAfterJourney;
    private Double maxTravelDistanceKm;
    private Boolean isDestinationReachable;
    private Double safetyMarginKm;
    private String confidenceScore; // e.g. "94.2% AI Confidence"
    private List<ChargingStation> recommendedStations;
    private Map<String, String> lossFactors; // temperature loss, traffic loss, HVAC loss, aerodynamic loss
    private List<String> assumptionsAndLimitations;

    public RangePredictionResponse() {}

    public Double getCurrentRangeKm() { return currentRangeKm; }
    public void setCurrentRangeKm(Double currentRangeKm) { this.currentRangeKm = currentRangeKm; }

    public Double getPredictedConsumptionKwh() { return predictedConsumptionKwh; }
    public void setPredictedConsumptionKwh(Double predictedConsumptionKwh) { this.predictedConsumptionKwh = predictedConsumptionKwh; }

    public Double getPredictedRemainingEnergyKwh() { return predictedRemainingEnergyKwh; }
    public void setPredictedRemainingEnergyKwh(Double predictedRemainingEnergyKwh) { this.predictedRemainingEnergyKwh = predictedRemainingEnergyKwh; }

    public Double getPredictedSocAfterJourney() { return predictedSocAfterJourney; }
    public void setPredictedSocAfterJourney(Double predictedSocAfterJourney) { this.predictedSocAfterJourney = predictedSocAfterJourney; }

    public Double getMaxTravelDistanceKm() { return maxTravelDistanceKm; }
    public void setMaxTravelDistanceKm(Double maxTravelDistanceKm) { this.maxTravelDistanceKm = maxTravelDistanceKm; }

    public Boolean getIsDestinationReachable() { return isDestinationReachable; }
    public void setIsDestinationReachable(Boolean destinationReachable) { isDestinationReachable = destinationReachable; }

    public Double getSafetyMarginKm() { return safetyMarginKm; }
    public void setSafetyMarginKm(Double safetyMarginKm) { this.safetyMarginKm = safetyMarginKm; }

    public String getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(String confidenceScore) { this.confidenceScore = confidenceScore; }

    public List<ChargingStation> getRecommendedStations() { return recommendedStations; }
    public void setRecommendedStations(List<ChargingStation> recommendedStations) { this.recommendedStations = recommendedStations; }

    public Map<String, String> getLossFactors() { return lossFactors; }
    public void setLossFactors(Map<String, String> lossFactors) { this.lossFactors = lossFactors; }

    public List<String> getAssumptionsAndLimitations() { return assumptionsAndLimitations; }
    public void setAssumptionsAndLimitations(List<String> assumptionsAndLimitations) { this.assumptionsAndLimitations = assumptionsAndLimitations; }
}
