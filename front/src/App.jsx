import "./index.scss";
import { AuthProvider, useAuth } from "./store/auth/AuthContext";
import { Routes, Route, HashRouter, useLocation } from "react-router-dom";
import RoutingComponent from "./routing/Routing";

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <RoutingComponent />
      </HashRouter>
    </AuthProvider>
  );
}
