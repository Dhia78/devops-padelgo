import React from "react";
import AuthPanel from "../components/AuthPanel";
import { useAppContext } from "../context/AppContext";

export default function Account() {
  const {
    user,
    authMode,
    authForm,
    reservations,
    onAuthModeChange,
    onAuthFormChange,
    onSubmitAuth,
    onSignOut
  } = useAppContext();

  return (
    <div className="account-page">
      <section className="section-heading">
        <div>
          <p className="eyebrow">Compte</p>
          <h1>Votre espace personnel</h1>
        </div>
      </section>
      <div className="account-grid">
        <AuthPanel
          user={user}
          authMode={authMode}
          authForm={authForm}
          onChangeMode={onAuthModeChange}
          onChangeForm={onAuthFormChange}
          onSubmit={onSubmitAuth}
          onSignOut={onSignOut}
          reservationsCount={reservations.length}
        />
        <div className="account-card">
          <h3>Vos avantages padel</h3>
          <p>Retrouvez vos réservations, comparez les clubs et réservez un créneau en quelques secondes.</p>
          <div className="account-metrics">
            <div>
              <strong>7</strong>
              <span>clubs disponibles</span>
            </div>
            <div>
              <strong>15h</strong>
              <span>premiers créneaux</span>
            </div>
            <div>
              <strong>4.9</strong>
              <span>meilleure note</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
