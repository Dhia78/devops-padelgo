import React from "react";
import { NavLink, Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import padelLogo from "../assets/logo.png";

export default function TopNav() {
  const { user, openAuthModal } = useAppContext();

  return (
    <header className="topbar">
      <div className="top-info">
        <span>Paris et alentours</span>
        <span>Ouvert 7j/7 - 8:00 à 23:00</span>
        <span>Réservations instantanées</span>
      </div>
      <div className="topbar-inner">
        <Link className="brand" to="/">
          <img className="brand-mark" src={padelLogo} alt="" />
          PadelGo
        </Link>
        <nav className="top-links">
          <NavLink to="/" end>
            Accueil
          </NavLink>
          <NavLink to="/catalog">Terrains</NavLink>
          {user && <NavLink to="/reservations">Réservations</NavLink>}
          {user && <NavLink to="/account">Compte</NavLink>}
        </nav>
        <div className="top-actions">
          <div className="status-group">
            <span className="status-dot" />
            Places disponibles
          </div>
          {user ? (
            <>
              <span className="user-chip">{user.fullName}</span>
              <Link className="reserve-pill" to="/catalog">
                Réserver
              </Link>
            </>
          ) : (
            <button className="login-pill" type="button" onClick={openAuthModal}>
              Connexion
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
