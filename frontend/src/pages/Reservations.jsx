import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

export default function Reservations() {
  const { user, reservations, reservationsLoading, refreshReservations, openAuthModal, onCancelReservation } = useAppContext();
  const [reservationToCancel, setReservationToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (user) {
      refreshReservations();
    }
  }, [user, refreshReservations]);

  async function confirmCancellation() {
    if (!reservationToCancel) {
      return;
    }

    setCancelling(true);
    await onCancelReservation(reservationToCancel.id);
    setCancelling(false);
    setReservationToCancel(null);
  }

  return (
    <div className="reservations-page">
      <section className="reservations-hero">
        <div>
          <p className="eyebrow">Espace client</p>
          <h1>Mes réservations</h1>
          <p className="subtitle">Retrouvez vos terrains réservés et les informations de vos prochains créneaux.</p>
        </div>
        <button className="ghost-button" type="button" onClick={() => (user ? refreshReservations() : openAuthModal())}>
          Actualiser
        </button>
      </section>

      {!user ? (
        <div className="empty-state">
          <p>Connectez-vous pour afficher vos réservations.</p>
          <Link className="primary-button" to="/account">
            Accéder au compte
          </Link>
        </div>
      ) : reservationsLoading ? (
        <div className="reservation-list">
          {Array.from({ length: 3 }).map((_, index) => (
            <div className="reservation-row skeleton" key={index} />
          ))}
        </div>
      ) : reservations.length === 0 ? (
        <div className="empty-state">
          <p>Aucune réservation pour le moment.</p>
          <Link className="primary-button" to="/catalog">
            Explorer le catalogue
          </Link>
        </div>
      ) : (
        <div className="reservation-list">
          {reservations.map((reservation) => (
            <article className="reservation-row" key={reservation.id}>
              <div className="reservation-main">
                <strong>{reservation.court_name}</strong>
                <span>
                  {reservation.start_date
                    ? new Date(reservation.start_date).toLocaleDateString("fr-FR")
                    : "Date non définie"}
                  {" "}- {reservation.slot_time || "Créneau non défini"}
                  {reservation.duration_minutes ? ` - ${reservation.duration_minutes} min` : ""}
                </span>
              </div>
              <strong className="reservation-price">{reservation.total_price ? `${reservation.total_price} EUR` : ""}</strong>
              <span className={isCancelled(reservation.status) ? "status-badge cancelled" : "status-badge"}>
                {isCancelled(reservation.status) ? "Annulée" : "Confirmée"}
              </span>
              {!isCancelled(reservation.status) && (
                <button className="danger-button" type="button" onClick={() => setReservationToCancel(reservation)}>
                  Annuler
                </button>
              )}
            </article>
          ))}
        </div>
      )}

      {reservationToCancel && (
        <div className="confirmation-modal" role="dialog" aria-modal="true" aria-label="Annuler la réservation">
          <div className="auth-modal-backdrop" onClick={() => setReservationToCancel(null)} />
          <div className="confirmation-panel">
            <span className="confirmation-icon warning">!</span>
            <h2>Annuler cette réservation ?</h2>
            <p>{reservationToCancel.court_name}</p>
            <div className="confirmation-details">
              <span>
                {reservationToCancel.start_date
                  ? new Date(reservationToCancel.start_date).toLocaleDateString("fr-FR")
                  : "Date non définie"}
              </span>
              <span>{reservationToCancel.slot_time || "Créneau non défini"}</span>
              <strong>{reservationToCancel.total_price} EUR</strong>
            </div>
            <div className="modal-actions">
              <button className="ghost-button" type="button" onClick={() => setReservationToCancel(null)}>
                Garder
              </button>
              <button className="danger-button solid" type="button" onClick={confirmCancellation} disabled={cancelling}>
                {cancelling ? "Annulation..." : "Annuler la réservation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function normalizeStatus(status = "") {
  return String(status).trim().toUpperCase();
}

function isCancelled(status) {
  return ["CANCELLED", "CANCELED", "ANNULEE", "ANNULÉE"].includes(normalizeStatus(status));
}
