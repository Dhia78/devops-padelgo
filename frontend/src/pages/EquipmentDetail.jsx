import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { createReservation, fetchCourt } from "../lib/api";

export default function EquipmentDetail() {
  const { id } = useParams();
  const { user, token, setMessage, addReservation, refreshReservations, openAuthModal, showReservationConfirmation } = useAppContext();
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState({
    startDate: toLocalDateValue(new Date()),
    slotTime: ""
  });
  const [saving, setSaving] = useState(false);
  const availableSlots = equipment?.slots.filter((slot) => !slot.reserved) || [];
  const selectedSlot =
    equipment?.slots.find((slot) => slot.time === booking.slotTime && !slot.reserved) ||
    availableSlots[0] ||
    equipment?.slots[0];
  const dateOptions = buildDateOptions(equipment?.pricePerDay || 0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchCourt(id, { date: booking.startDate })
      .then((payload) => {
        if (active) {
          setEquipment(payload);
          setBooking((current) => ({
            ...current,
            slotTime:
              payload.slots?.find((slot) => slot.time === current.slotTime && !slot.reserved)?.time ||
              payload.slots?.find((slot) => !slot.reserved)?.time ||
              payload.slots?.[0]?.time ||
              ""
          }));
        }
      })
      .catch(() => {
        if (active) {
          setEquipment(null);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [id, booking.startDate]);

  async function handleReservation() {
    if (!user) {
      openAuthModal();
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      if (!selectedSlot || selectedSlot.reserved) {
        setMessage({ type: "error", text: "Ce créneau n'est plus disponible." });
        return;
      }

      const payload = await createReservation(token, {
        courtId: equipment.id,
        startDate: booking.startDate,
        slotTime: selectedSlot.time
      });
      setEquipment(payload.court);
      setBooking((current) => ({
        ...current,
        slotTime: payload.court.slots.find((slot) => !slot.reserved)?.time || payload.court.slots[0]?.time || ""
      }));
      if (payload.reservation) {
        addReservation(payload.reservation);
      }
      refreshReservations(undefined, { silent: true });
      showReservationConfirmation(payload);
    } catch (error) {
      if (error.status === 401) {
        openAuthModal();
      } else {
        setMessage({ type: "error", text: error.message });
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="section">
        <div className="detail-skeleton" />
      </section>
    );
  }

  if (!equipment) {
    return (
      <section className="section empty-state">
        <p>Terrain introuvable.</p>
        <Link className="ghost-button" to="/catalog">
          Retour au catalogue
        </Link>
      </section>
    );
  }

  return (
    <div className="detail">
      <section
        className="detail-hero detail-hero-premium"
        style={{ backgroundImage: `linear-gradient(90deg, rgb(6 19 28 / 86%), rgb(6 19 28 / 44%)), url("${equipment.imageUrl}")` }}
      >
        <div className="detail-content">
          <p className="eyebrow">Réservation padel</p>
          <h1>{equipment.name}</h1>
          <p className="subtitle">{equipment.description}</p>
          <div className="detail-tags">
            <span>{equipment.category}</span>
            <span>{equipment.surface}</span>
            <span>{equipment.distanceKm} km</span>
            <span>{equipment.rating.toFixed(1)} / 5</span>
          </div>
        </div>
      </section>

      <section className="booking-composer">
        <div className="booking-date-strip">
          {dateOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={booking.startDate === option.value ? "date-chip active" : "date-chip"}
              onClick={() => setBooking({ ...booking, startDate: option.value })}
            >
              <span>{option.label}</span>
              {option.badge && <small>{option.badge}</small>}
            </button>
          ))}
        </div>

        <div className="booking-main-card">
          <div className="court-preview">
            <img src={equipment.imageUrl} alt={equipment.name} />
            <div className="court-badges">
              <span>Court dur</span>
              <span>{equipment.surface}</span>
              <span>Éclairé</span>
            </div>
            <span className="court-type">Padel</span>
            <strong>Dès {equipment.pricePerDay} EUR</strong>
          </div>

          <div className="slot-panel">
            <div className="slot-panel-header">
              <div>
                <p className="eyebrow">Sélectionner un créneau</p>
                <h2>{equipment.address}</h2>
              </div>
              <span>{availableSlots.length} disponibilité{availableSlots.length > 1 ? "s" : ""}</span>
            </div>

            <div className="slot-picker">
              {equipment.slots.map((slot, index) => (
                <button
                  key={`${slot.time}-${slot.duration}`}
                  type="button"
                  className={[
                    "slot-card",
                    booking.slotTime === slot.time && !slot.reserved ? "active" : "",
                    slot.reserved ? "reserved" : ""
                  ].filter(Boolean).join(" ")}
                  onClick={() => !slot.reserved && setBooking({ ...booking, slotTime: slot.time })}
                  disabled={slot.reserved}
                >
                  <strong>{slot.time}</strong>
                  <span>{slot.price} EUR</span>
                  <small>{slot.duration} min</small>
                  <b>{slot.reserved ? "Réservé" : index === equipment.slots.length - 1 ? "Dernier !" : "Disponible"}</b>
                </button>
              ))}
            </div>

            <div className="booking-summary">
              <div>
                <span>Total</span>
                <strong>{selectedSlot?.price || equipment.pricePerDay} EUR</strong>
                <small>{selectedSlot?.time || "--:--"} - {selectedSlot?.duration || 60} min</small>
              </div>
              <button type="button" onClick={handleReservation} disabled={!equipment.available || !availableSlots.length || saving}>
                {saving ? "Réservation..." : availableSlots.length ? "Confirmer" : "Complet"}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="practical-info">
        <div>
          <p className="eyebrow">Infos pratiques</p>
          <h2>{equipment.category}</h2>
          <p>{equipment.description}</p>
        </div>
        <div className="info-grid">
          <article>
            <span>Adresse</span>
            <strong>{equipment.address}</strong>
          </article>
          <article>
            <span>Surface</span>
            <strong>{equipment.surface}</strong>
          </article>
          <article>
            <span>Avis</span>
            <strong>{equipment.ratingCount} vérifiés</strong>
          </article>
        </div>
      </section>
    </div>
  );
}

function buildDateOptions(price) {
  const formatter = new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric", month: "short" });

  return Array.from({ length: 4 }).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    const value = toLocalDateValue(date);

    return {
      value,
      label: index === 0 ? "Aujourd'hui" : index === 1 ? "Demain" : formatter.format(date),
      badge: index === 3 ? "Meilleur prix" : "",
      price
    };
  });
}

function toLocalDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
