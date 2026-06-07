import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { fetchCourts, todayDateValue } from "../lib/api";
import EquipmentCard from "../components/EquipmentCard";

export default function Home() {
  const { user, openAuthModal, availabilityVersion } = useAppContext();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchCourts({ sort: "rating", order: "desc", pageSize: 3, date: todayDateValue() })
      .then((payload) => {
        if (active) {
          setFeatured(payload.items || []);
        }
      })
      .catch(() => {
        if (active) {
          setFeatured([]);
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
  }, [availabilityVersion]);

  return (
    <div className="home">
      <section className="hero home-hero">
        <div className="hero-copy">
          <p className="eyebrow">Le spot padel autour de Paris</p>
          <h1>Joue sur les meilleurs terrains indoor près de chez toi.</h1>
          <p className="subtitle">
            Trouve un club, choisis un créneau disponible et confirme ta réservation en quelques secondes.
          </p>
          <div className="hero-actions">
            <Link className="primary-button" to="/catalog">
              Voir les créneaux
            </Link>
            {user ? (
              <Link className="ghost-button" to="/reservations">
                Mes réservations
              </Link>
            ) : (
              <button className="ghost-button" type="button" onClick={openAuthModal}>
                Connexion
              </button>
            )}
          </div>
          <div className="hero-highlights">
            <div>
              <strong>Instantané</strong>
              <span>Confirmation immédiate</span>
            </div>
            <div>
              <strong>7</strong>
              <span>Clubs autour de Paris</span>
            </div>
            <div>
              <strong>38 EUR</strong>
              <span>Prix dès le premier créneau</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Disponibilités</p>
            <h2>Clubs populaires</h2>
          </div>
          <Link className="ghost-button" to="/catalog">
            Voir tout
          </Link>
        </div>
        <div className="grid">
          {loading
            ? Array.from({ length: 3 }).map((_, index) => <div className="card skeleton" key={index} />)
            : featured.map((equipment) => <EquipmentCard key={equipment.id} equipment={equipment} />)}
        </div>
      </section>
    </div>
  );
}
