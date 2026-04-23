import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Routes, Route, Navigate } from "react-router";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import GISMap from "./pages/GISMap";
import Household from "./pages/Household";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import "./index.css";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("auth_token");
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <RequireAuth>
              <Layout>
                <Routes>
                  <Route path="/" element={<Navigate to="/gis" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/gis" element={<GISMap />} />
                  <Route path="/household" element={<Household />} />
                  <Route path="/admin" element={<Admin />} />
                </Routes>
              </Layout>
            </RequireAuth>
          }
        />
      </Routes>
    </HashRouter>
  </StrictMode>
);
