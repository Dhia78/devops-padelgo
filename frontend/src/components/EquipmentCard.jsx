import React from "react";
import { Link } from "react-router-dom";

function renderStars(value) {
  const rounded = Math.round(value);
  return Array.from({ length: 5 }).map((_, index) => (
    <span key={index} className={index < rounded ? "star filled" : "star"}>
      *
    </span>
  ));
}

export default function EquipmentCard({ equipment }) {
  const availableSlots = equipment.slots?.filter((slot) => !slot.reserved) || [];
  const visibleSlots = availableSlots.slice(0, 3);
  const availabilityLabel =
    availableSlots.length > 0
      ? `${availableSlots.length} créneau${availableSlots.length > 1 ? "x" : ""}`
      : equipment.availableUpcoming
        ? "Prochains jours"
        : "Complet";

  return (
    <article className="card">
      <div className="card-media">
        <img src={equipment.imageUrl} alt={equipment.name} loading="lazy" />
        <span className={`availability ${availableSlots.length > 0 || equipment.availableUpcoming ? "ok" : "busy"}`}>
          {availabilityLabel}
        </span>
      </div>
      <div className="card-content">
        <p className="category">{equipment.category} - {equipment.distanceKm} km</p>
        <h3>{equipment.name}</h3>
        <div className="rating">
          <div className="stars">{renderStars(equipment.rating)}</div>
          <span>{equipment.rating.toFixed(1)}</span>
          <span className="muted">({equipment.ratingCount})</span>
        </div>
        <p className="price">A partir de {equipment.pricePerDay} EUR / heure</p>
        <p className="court-meta">{equipment.address} - {equipment.surface}</p>
        <div className="slot-list">
          {visibleSlots.length > 0
            ? visibleSlots.map((slot) => (
                <span key={`${slot.time}-${slot.duration}`}>
                  <strong>{slot.time}</strong>
                  <small>{slot.duration} min</small>
                  <b>{slot.price} EUR</b>
                </span>
              ))
            : <span>{equipment.availableUpcoming ? "Créneaux les prochains jours" : "Aucun créneau disponible"}</span>}
        </div>
      </div>
      <Link className="primary-button" to={`/courts/${equipment.id}`}>
        Voir les créneaux
      </Link>
    </article>
  );
}
