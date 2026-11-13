import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  CalendarCheck,
  Clock,
  Zap,
  MapPin,
  CheckCircle,
  AlertCircle,
  X,
  RefreshCw,
  Trash2,
  Calendar,
  DollarSign,
} from 'lucide-react';

export default function BookingView({
  stations = [],
  selectedStation,
  onSelectStation,
  vehicle,
}) {
  const [stationId, setStationId] = useState(selectedStation ? selectedStation.id : (stations[0]?.id || 1));
  const [slotDate, setSlotDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlotTime, setSelectedSlotTime] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [connectorType, setConnectorType] = useState('CCS2');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Reschedule modal state
  const [reschedulingBooking, setReschedulingBooking] = useState(null);
  const [newRescheduleDate, setNewRescheduleDate] = useState(new Date().toISOString().split('T')[0]);
  const [newRescheduleTime, setNewRescheduleTime] = useState('14:00 - 15:00');

  // Load user bookings
  const loadBookings = async () => {
    try {
      const list = await api.getUserBookings();
      setUserBookings(list);
    } catch (e) {
      console.error(e);
    }
  };

  // Load slots for chosen station and date
  const loadSlots = async () => {
    if (!stationId) return;
    setLoadingSlots(true);
    try {
      const slots = await api.getStationSlots(stationId, slotDate);
      setAvailableSlots(slots);
      if (slots.length > 0 && !selectedSlotTime) {
        setSelectedSlotTime(slots[0].slotTime);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    if (selectedStation) {
      setStationId(selectedStation.id);
    }
  }, [selectedStation]);

  useEffect(() => {
    loadSlots();
  }, [stationId, slotDate]);

  const activeStation = stations.find((s) => s.id === Number(stationId)) || stations[0];

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlotTime) {
      setErrorMsg('Please select an available time slot.');
      return;
    }

    setErrorMsg('');
    setSubmitting(true);
    try {
      const result = await api.createBooking({
        stationId: Number(stationId),
        slotDate,
        slotTime: selectedSlotTime,
        durationMinutes: Number(durationMinutes),
        connectorType,
        vehicleModel: `${vehicle?.brand || 'Tata'} ${vehicle?.model || 'Nexon EV'}`,
      });

      setConfirmedBooking(result);
      loadBookings();
      loadSlots();
    } catch (err) {
      setErrorMsg(err.message || 'Error completing booking.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this reservation? The slot will be released.')) return;
    try {
      await api.cancelBooking(bookingId);
      loadBookings();
      loadSlots();
    } catch (err) {
      alert(err.message || 'Failed to cancel.');
    }
  };

  const handleRescheduleSubmit = async () => {
    if (!reschedulingBooking) return;
    try {
      await api.rescheduleBooking(reschedulingBooking.bookingId, newRescheduleDate, newRescheduleTime);
      setReschedulingBooking(null);
      loadBookings();
      loadSlots();
    } catch (err) {
      alert(err.message || 'Failed to reschedule.');
    }
  };

  // Cost calculation
  const estKwh = Math.round(((activeStation?.maxPowerKw || 120) * (durationMinutes / 60) * 0.85) * 10) / 10;
  const estCost = Math.round(estKwh * (activeStation?.costPerKwh || 18.5) * 10) / 10;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <CalendarCheck className="w-6 h-6 text-teal-600" />
          <span>EV Charging Slot Reservation Engine</span>
        </h2>
        <p className="text-xs text-slate-500">
          Guaranteed charger reservation with transactional concurrency locking to prevent double bookings.
        </p>
      </div>

      {/* Confirmation Dialog Banner */}
      {confirmedBooking && (
        <div className="glass-panel p-6 rounded-2xl border-2 border-emerald-500 bg-emerald-50 relative overflow-hidden shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block mb-0.5">
                  Reservation Confirmed
                </span>
                <h3 className="text-xl font-black text-slate-900 font-mono">{confirmedBooking.bookingId}</h3>
                <p className="text-xs text-slate-700 mt-1">
                  Reserved for {confirmedBooking.stationName} on {confirmedBooking.slotDate} ({confirmedBooking.slotTime}).
                </p>
                <div className="flex flex-wrap gap-4 text-xs font-mono mt-3 text-slate-700">
                  <span>Duration: {confirmedBooking.durationMinutes} min</span>
                  <span>Connector: {confirmedBooking.connectorType}</span>
                  <span>Est. Energy: {confirmedBooking.estimatedEnergyKwh} kWh</span>
                  <span className="text-emerald-700 font-bold">Est. Cost: ₹{confirmedBooking.estimatedCost}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setConfirmedBooking(null)}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-emerald-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Booking Form (Left) */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-6 border border-slate-200 bg-white shadow-sm space-y-5">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
            <Zap className="w-4 h-4 text-teal-600" />
            <span>Select Station & Slot</span>
          </h3>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleBookingSubmit} className="space-y-4">
            {/* Station selector */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">EV Charging Hub</label>
              <select
                value={stationId}
                onChange={(e) => {
                  setStationId(e.target.value);
                  const st = stations.find((s) => s.id === Number(e.target.value));
                  if (st && onSelectStation) onSelectStation(st);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white"
              >
                {stations.map((st) => (
                  <option key={st.id || st.stationCode} value={st.id}>
                    {st.name} — {st.city} ({st.maxPowerKw} kW DC • {st.availableChargers}/{st.totalChargers} Available)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Date Picker */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Reservation Date</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={slotDate}
                  onChange={(e) => setSlotDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white"
                  required
                />
              </div>

              {/* Duration */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Charging Duration</label>
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white"
                >
                  <option value={30}>30 Minutes (Quick Boost)</option>
                  <option value={45}>45 Minutes (Recommended)</option>
                  <option value={60}>60 Minutes (Standard Full)</option>
                  <option value={90}>90 Minutes (Deep Charge)</option>
                </select>
              </div>
            </div>

            {/* Connector Type */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Connector Type</label>
              <div className="grid grid-cols-3 gap-2">
                {['CCS2', 'Type 2', 'CHAdeMO'].map((conn) => (
                  <button
                    key={conn}
                    type="button"
                    onClick={() => setConnectorType(conn)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      connectorType === conn
                        ? 'bg-teal-50 border-teal-500 text-teal-800 ring-2 ring-teal-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {conn}
                  </button>
                ))}
              </div>
            </div>

            {/* Available Time Slots Grid */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700">Available Hourly Slots</label>
                {loadingSlots && <span className="text-[10px] text-teal-600 font-bold animate-pulse">Refreshing slots...</span>}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto pr-1">
                {availableSlots.map((slot) => {
                  const isAvailable = slot.status === 'AVAILABLE' && slot.bookedCount < slot.maxCapacity;
                  const isSelected = selectedSlotTime === slot.slotTime;

                  return (
                    <button
                      key={slot.id || slot.slotTime}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => setSelectedSlotTime(slot.slotTime)}
                      className={`p-2.5 rounded-xl border text-xs font-mono transition-all text-left flex flex-col justify-between ${
                        !isAvailable
                          ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                          : isSelected
                          ? 'bg-teal-600 text-white font-bold border-teal-600 ring-2 ring-teal-600/30'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <span className="font-bold">{slot.slotTime}</span>
                      <span className="text-[10px] opacity-80 mt-1">
                        {isAvailable ? `${slot.maxCapacity - slot.bookedCount} spots left` : 'Sold Out'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Booking Cost Breakdown Preview */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 block">Est. Energy Delivery:</span>
                <span className="font-bold text-slate-900 font-mono text-sm">{estKwh} kWh</span>
              </div>
              <div>
                <span className="text-slate-500 block">Tariff Rate:</span>
                <span className="font-mono text-slate-700">₹{activeStation?.costPerKwh || 18.5} / kWh</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block">Estimated Cost:</span>
                <span className="font-black text-emerald-700 font-mono text-base">₹{estCost}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 transition-all hover:scale-[1.01] disabled:opacity-50"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>{submitting ? 'Locking Slot...' : 'Confirm & Reserve Charging Slot'}</span>
            </button>
          </form>
        </div>

        {/* User's Existing Reservations List (Right) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-600" />
              <span>Your Reservations</span>
            </h3>
            <span className="text-xs text-slate-500">Total: {userBookings.length}</span>
          </div>

          <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
            {userBookings.length === 0 ? (
              <div className="glass-panel rounded-2xl p-8 text-center text-slate-500 text-xs bg-white border border-slate-200">
                No active or previous reservations found on this device session.
              </div>
            ) : (
              userBookings.map((b) => {
                const isConfirmed = b.status === 'CONFIRMED' || b.status === 'RESCHEDULED';

                return (
                  <div
                    key={b.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2 relative"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono text-teal-700 font-bold uppercase block">
                          {b.bookingId}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 mt-0.5">{b.stationName}</h4>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          b.status === 'CONFIRMED' || b.status === 'RESCHEDULED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 font-mono pt-1">
                      <div>Date: {b.slotDate}</div>
                      <div>Time: {b.slotTime}</div>
                      <div>Port: {b.connectorType}</div>
                      <div className="text-emerald-700 font-bold">Est: ₹{b.estimatedCost}</div>
                    </div>

                    {isConfirmed && (
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => setReschedulingBooking(b)}
                          className="flex-1 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                        >
                          <RefreshCw className="w-3 h-3 text-teal-600" />
                          <span>Reschedule</span>
                        </button>
                        <button
                          onClick={() => handleCancelBooking(b.bookingId)}
                          className="flex-1 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center gap-1 transition-colors border border-rose-200"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Reschedule Modal */}
      {reschedulingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white shadow-xl max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">Reschedule: {reschedulingBooking.bookingId}</h4>
              <button
                onClick={() => setReschedulingBooking(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs text-slate-700 block mb-1 font-semibold">Select New Date</label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={newRescheduleDate}
                onChange={(e) => setNewRescheduleDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="text-xs text-slate-700 block mb-1 font-semibold">Select New Time Slot</label>
              <select
                value={newRescheduleTime}
                onChange={(e) => setNewRescheduleTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900"
              >
                <option value="09:00 - 10:00">09:00 - 10:00</option>
                <option value="11:00 - 12:00">11:00 - 12:00</option>
                <option value="14:00 - 15:00">14:00 - 15:00</option>
                <option value="16:00 - 17:00">16:00 - 17:00</option>
                <option value="18:00 - 19:00">18:00 - 19:00</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setReschedulingBooking(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleRescheduleSubmit}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm"
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
