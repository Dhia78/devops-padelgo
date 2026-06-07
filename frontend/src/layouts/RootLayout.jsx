import React from "react";
import { Outlet, useLocation } from "react-router-dom";

export default function RootLayout() {
  const location = useLocation();

  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location.pathname]);

  return (
    <div className="page">
      <Outlet />
    </div>
  );
}
