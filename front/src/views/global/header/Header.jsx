import "./style/Header.scss";
import React, { useEffect } from "react";
import { useAuth } from "../../../store/auth/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";

export default function Header() {
  const { isAuth, userRole, logout, userId } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    logout();
    navigate("/");
  };

  return (
    <header>
      <button onClick={handleSignOut}>
        <i className="fa-solid fa-arrow-right-from-bracket"></i>
      </button>
    </header>
  );
}
