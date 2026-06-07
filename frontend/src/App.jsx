import React, { useCallback, useEffect, useMemo, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AuthPanel from "./components/AuthPanel";
import TopNav from "./components/TopNav";
import Footer from "./components/Footer";
import { AppProvider } from "./context/AppContext";
import RootLayout from "./layouts/RootLayout";
import Account from "./pages/Account";
import Catalog from "./pages/Catalog";
import EquipmentDetail from "./pages/EquipmentDetail";
import Home from "./pages/Home";
import Reservations from "./pages/Reservations";
import { cancelMyReservation, fetchMyReservations, signIn, signOut, signUp } from "./lib/api";

const defaultAuthForm = {
  fullName: "",
  email: "",
  password: ""
};

function normalizeReservation(reservation) {
  return {
    ...reservation,
    id: Number(reservation.id),
    status: String(reservation.status || "CONFIRMED").trim().toUpperCase()
  };
}

export default function App() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("padelgo-user");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("padelgo-token") || "");
  const [authMode, setAuthMode] = useState("signin");
  const [authForm, setAuthForm] = useState(defaultAuthForm);
  const [reservations, setReservations] = useState([]);
  const [reservationsLoading, setReservationsLoading] = useState(Boolean(token));
  const [message, setMessage] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authError, setAuthError] = useState("");
  const [reservationConfirmation, setReservationConfirmation] = useState(null);
  const [availabilityVersion, setAvailabilityVersion] = useState(0);

  useEffect(() => {
    if (token) {
      refreshReservations(token);
      setAuthModalOpen(false);
    } else {
      setReservations([]);
      setReservationsLoading(false);
    }
  }, [token]);

  const refreshReservations = useCallback(
    async (activeToken = token, options = {}) => {
      if (!activeToken) {
        setAuthModalOpen(true);
        return;
      }

      if (!options.silent) {
        setReservationsLoading(true);
      }
      try {
        const payload = await fetchMyReservations(activeToken);
        const normalized = payload.map(normalizeReservation);
        setReservations(normalized);
        return normalized;
      } catch (error) {
        if (error.status === 401) {
          setToken("");
          setUser(null);
          setReservations([]);
          localStorage.removeItem("padelgo-token");
          localStorage.removeItem("padelgo-user");
          setAuthError("Votre session a expiré. Connectez-vous à nouveau.");
          setAuthModalOpen(true);
          return;
        }

        setMessage({ type: "error", text: error.message });
        return [];
      } finally {
        if (!options.silent) {
          setReservationsLoading(false);
        }
      }
    },
    [token]
  );

  const submitAuth = useCallback(
    async (event) => {
      event.preventDefault();
      setMessage(null);
      setAuthError("");

      try {
        const payload =
          authMode === "signin" ? await signIn(authForm) : await signUp(authForm);
        setToken(payload.token);
        setUser(payload.user);
        localStorage.setItem("padelgo-token", payload.token);
        localStorage.setItem("padelgo-user", JSON.stringify(payload.user));
        setMessage({ type: "success", text: `Bienvenue ${payload.user.fullName}.` });
      } catch (error) {
        setAuthError(error.message);
      }
    },
    [authForm, authMode]
  );

  const handleSignOut = useCallback(async () => {
    try {
      if (token) {
        await signOut(token);
      }
    } catch {
      // Déconnexion locale même si la session serveur a expiré.
    } finally {
      setToken("");
      setUser(null);
      setReservations([]);
      localStorage.removeItem("padelgo-token");
      localStorage.removeItem("padelgo-user");
      setMessage({ type: "success", text: "Vous êtes déconnecté." });
    }
  }, [token]);

  const handleCancelReservation = useCallback(
    async (reservationId) => {
      if (!token) {
        setAuthModalOpen(true);
        return;
      }

      try {
        const cancelledReservation = await cancelMyReservation(token, reservationId);
        const normalizedReservation = normalizeReservation(cancelledReservation);
        setReservations((current) =>
          current.map((reservation) =>
            Number(reservation.id) === Number(reservationId)
              ? normalizeReservation({ ...reservation, ...normalizedReservation })
              : reservation
          )
        );
        setAvailabilityVersion((version) => version + 1);
        refreshReservations(token, { silent: true });
        setMessage({ type: "success", text: "Réservation annulée. Le créneau est à nouveau disponible." });
      } catch (error) {
        if (error.status === 401) {
          setToken("");
          setUser(null);
          setReservations([]);
          localStorage.removeItem("padelgo-token");
          localStorage.removeItem("padelgo-user");
          setAuthError("Votre session a expiré. Connectez-vous à nouveau.");
          setAuthModalOpen(true);
          return;
        }

        setMessage({ type: "error", text: error.message });
      }
    },
    [refreshReservations, token]
  );

  const contextValue = useMemo(
    () => ({
      user,
      token,
      authMode,
      authForm,
      reservations,
      reservationsLoading,
      availabilityVersion,
      message,
      setMessage,
      addReservation: (reservation) => {
        const normalizedReservation = normalizeReservation(reservation);
        setReservations((current) => [
          normalizedReservation,
          ...current.filter((item) => Number(item.id) !== normalizedReservation.id)
        ]);
        setAvailabilityVersion((version) => version + 1);
      },
      refreshReservations,
      onAuthModeChange: setAuthMode,
      onAuthFormChange: setAuthForm,
      onSubmitAuth: submitAuth,
      onSignOut: handleSignOut,
      onCancelReservation: handleCancelReservation,
      openAuthModal: () => {
        setAuthError("");
        setAuthModalOpen(true);
      },
      closeAuthModal: () => {
        setAuthError("");
        setAuthModalOpen(false);
      },
      showReservationConfirmation: setReservationConfirmation
    }),
    [
      user,
      token,
      authMode,
      authForm,
      reservations,
      reservationsLoading,
      availabilityVersion,
      message,
      refreshReservations,
      submitAuth,
      handleSignOut,
      handleCancelReservation
    ]
  );

  return (
    <BrowserRouter>
      <AppProvider value={contextValue}>
        <div className="app-shell">
          <TopNav />
          <Routes>
            <Route element={<RootLayout />}>
              <Route index element={<Home />} />
              <Route path="catalog" element={<Catalog />} />
              <Route path="courts/:id" element={<EquipmentDetail />} />
              <Route path="reservations" element={<Reservations />} />
              <Route path="account" element={<Account />} />
            </Route>
          </Routes>
          <Footer />
          {authModalOpen && !user && (
            <div className="auth-modal" role="dialog" aria-modal="true" aria-label="Connexion">
              <div className="auth-modal-backdrop" onClick={() => setAuthModalOpen(false)} />
              <div className="auth-modal-panel">
                <button className="modal-close" type="button" onClick={() => setAuthModalOpen(false)}>
                  Fermer
                </button>
                <AuthPanel
                  user={user}
                  authMode={authMode}
                  authForm={authForm}
                  onChangeMode={(mode) => {
                    setAuthMode(mode);
                    setAuthError("");
                  }}
                  onChangeForm={setAuthForm}
                  onSubmit={submitAuth}
                  onSignOut={handleSignOut}
                  reservationsCount={reservations.length}
                  error={authError}
                />
              </div>
            </div>
          )}
          {reservationConfirmation && (
            <div className="confirmation-modal" role="dialog" aria-modal="true" aria-label="Réservation confirmée">
              <div className="auth-modal-backdrop" onClick={() => setReservationConfirmation(null)} />
              <div className="confirmation-panel">
                <span className="confirmation-icon">OK</span>
                <h2>Réservation confirmée</h2>
                <p>{reservationConfirmation.court?.name}</p>
                <div className="confirmation-details">
                  <span>{reservationConfirmation.startDate || "Date sélectionnée"}</span>
                  <span>{reservationConfirmation.slotTime} - {reservationConfirmation.durationMinutes} min</span>
                  <strong>{reservationConfirmation.totalPrice} EUR</strong>
                </div>
                <button type="button" onClick={() => setReservationConfirmation(null)}>
                  Parfait
                </button>
              </div>
            </div>
          )}
          {message && (
            <div className="confirmation-modal" role="dialog" aria-modal="true" aria-label={message.type === "error" ? "Erreur" : "Information"}>
              <div className="auth-modal-backdrop" onClick={() => setMessage(null)} />
              <div className="confirmation-panel message-modal">
                <span className={message.type === "error" ? "confirmation-icon warning" : "confirmation-icon"}>
                  {message.type === "error" ? "!" : "OK"}
                </span>
                <h2>{message.type === "error" ? "Action impossible" : "C'est fait"}</h2>
                <p>{message.text}</p>
                <button type="button" onClick={() => setMessage(null)}>
                  Compris
                </button>
              </div>
            </div>
          )}
        </div>
      </AppProvider>
    </BrowserRouter>
  );
}
