import React from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import padelLogo from "../assets/logo.png";

export default function Footer() {
  const { user, openAuthModal, onSignOut } = useAppContext();

  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-column">
          <h3>Navigation</h3>
          <Link to="/">Accueil</Link>
          <Link to="/catalog">Terrains</Link>
        </div>
        <div className="footer-column">
          <h3>Espace joueur</h3>
          <Link to="/reservations">Réservations</Link>
          <Link to="/account">Compte</Link>
        </div>
        <div className="footer-column">
          <h3>Session</h3>
          {user ? (
            <button type="button" onClick={onSignOut}>Déconnexion</button>
          ) : (
            <button type="button" onClick={openAuthModal}>Connexion</button>
          )}
        </div>
        <div className="footer-column">
          <h3>Disponibilités</h3>
          <Link to="/catalog">Clubs autour de Paris</Link>
          <Link to="/catalog">Créneaux du jour</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="footer-brand">
          <img className="brand-mark" src={padelLogo} alt="" />
          <strong>PadelGo</strong>
          <span>© 2026 PadelGo. Tous droits réservés.</span>
        </div>
      </div>
    </footer>
  );
}
