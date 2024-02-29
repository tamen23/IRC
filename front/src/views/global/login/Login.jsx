import "./style/Login.scss";
import Logo from "/public/logo.png";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../store/auth/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const { login, userRole } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      const response = await axios.post("http://localhost:3002/api/login", {
        email,
        password,
      });
      const token = response.data.token;
      const role = response.data.user.status;
      const userId = response.data.user.id;

      login(token, role, userId);

      console.log(response);
      console.log(role);
      if (role === "user") {
        navigate("/home");
      } else if (role === "admin") {
        navigate("/admin");
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage("Error with connection");
      }
    }
  };

  return (
    <div className="home__container section__padding">
      <div className="connection__container">
        <div className="logo-container">
          <img src={Logo} alt="logo-easy-talk" />
        </div>

        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
            </div>
            <button type="submit" className="btn">
              Soumettre
            </button>
          </form>
        </div>

        <p className="no-account">
          <i>Tu n&apos;a pas encore de compte ? Viens t&apos;inscrire !</i>
        </p>
      </div>
    </div>
  );
}
