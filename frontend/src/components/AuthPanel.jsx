import React from "react";

const defaultAuthForm = {
  fullName: "",
  email: "",
  password: ""
};

export default function AuthPanel({
  user,
  authMode,
  authForm,
  onChangeMode,
  onChangeForm,
  onSubmit,
  onSignOut,
  reservationsCount,
  error
}) {
  if (user) {
    return (
      <div className="auth-card">
        <div className="panel-header">
          <span className="panel-label">Compte</span>
          <button className="ghost-button" type="button" onClick={onSignOut}>
            Déconnexion
          </button>
        </div>
        <div className="account-summary">
          <strong>{user.fullName}</strong>
          <span>{user.email}</span>
          <p>{reservationsCount} réservation{reservationsCount > 1 ? "s" : ""} en cours.</p>
        </div>
      </div>
    );
  }

  const formState = authForm || defaultAuthForm;

  return (
    <div className="auth-card">
      <div className="panel-header">
        <span className="panel-label">Accès client</span>
      </div>
      <form className="auth-form" onSubmit={onSubmit}>
        <div className="tabs" role="tablist" aria-label="Authentification">
          <button
            type="button"
            className={authMode === "signin" ? "active" : ""}
            onClick={() => onChangeMode("signin")}
          >
            Connexion
          </button>
          <button
            type="button"
            className={authMode === "signup" ? "active" : ""}
            onClick={() => onChangeMode("signup")}
          >
            Créer un compte
          </button>
        </div>
        {authMode === "signup" && (
          <label>
            Nom complet
            <input
              value={formState.fullName}
              placeholder="Dhia Padel"
              onChange={(event) => onChangeForm({ ...formState, fullName: event.target.value })}
            />
          </label>
        )}
        <label>
          Email
          <input
            type="email"
            value={formState.email}
            placeholder="dhia.padel@gmail.com"
            onChange={(event) => onChangeForm({ ...formState, email: event.target.value })}
          />
        </label>
        <label>
          Mot de passe
          <input
            type="password"
            value={formState.password}
            placeholder="Mot de passe"
            onChange={(event) => onChangeForm({ ...formState, password: event.target.value })}
          />
        </label>
        {error && <p className="auth-error">{error}</p>}
        <button type="submit">{authMode === "signin" ? "Se connecter" : "Créer le compte"}</button>
        <button
          className="auth-switch"
          type="button"
          onClick={() => onChangeMode(authMode === "signin" ? "signup" : "signin")}
        >
          {authMode === "signin" ? "Pas encore de compte ? Créer un compte" : "Déjà inscrit ? Se connecter"}
        </button>
      </form>
    </div>
  );
}
