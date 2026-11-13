package com.smartev.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "charging_slots", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"station_id", "slot_date", "slot_time"})
})
public class ChargingSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "station_id", nullable = false)
    @JsonIgnore
    private ChargingStation station;

    @Column(nullable = false)
    private LocalDate slotDate;

    @Column(nullable = false, length = 30)
    private String slotTime; // e.g. "09:00 - 10:00"

    private Integer maxCapacity = 4;
    private Integer bookedCount = 0;

    @Column(length = 30)
    private String status = "AVAILABLE"; // AVAILABLE, FULL

    public ChargingSlot() {}

    public ChargingSlot(ChargingStation station, LocalDate slotDate, String slotTime, Integer maxCapacity) {
        this.station = station;
        this.slotDate = slotDate;
        this.slotTime = slotTime;
        this.maxCapacity = maxCapacity;
        this.bookedCount = 0;
        this.status = "AVAILABLE";
    }

    public boolean isAvailable() {
        return bookedCount < maxCapacity;
    }

    public void incrementBooking() {
        this.bookedCount++;
        if (this.bookedCount >= this.maxCapacity) {
            this.status = "FULL";
        }
    }

    public void decrementBooking() {
        if (this.bookedCount > 0) {
            this.bookedCount--;
        }
        if (this.bookedCount < this.maxCapacity) {
            this.status = "AVAILABLE";
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ChargingStation getStation() { return station; }
    public void setStation(ChargingStation station) { this.station = station; }

    public LocalDate getSlotDate() { return slotDate; }
    public void setSlotDate(LocalDate slotDate) { this.slotDate = slotDate; }

    public String getSlotTime() { return slotTime; }
    public void setSlotTime(String slotTime) { this.slotTime = slotTime; }

    public Integer getMaxCapacity() { return maxCapacity; }
    public void setMaxCapacity(Integer maxCapacity) { this.maxCapacity = maxCapacity; }

    public Integer getBookedCount() { return bookedCount; }
    public void setBookedCount(Integer bookedCount) { this.bookedCount = bookedCount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
