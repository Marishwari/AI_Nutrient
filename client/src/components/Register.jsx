import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Register.css";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [height, setHeight] = useState(""); // cm
  const [weight, setWeight] = useState(""); // kg
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!window.google) return;
    window.google.accounts.id.initialize({
      client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      callback: async (response) => {
        try {
          setLoading(true);
          const r = await axios.post("http://localhost:5000/api/auth/google", {
            id_token: response.credential,
          });
          localStorage.setItem("token", r.data.token);
          axios.defaults.headers.common["Authorization"] = `Bearer ${r.data.token}`;
          navigate("/"); // or dashboard
        } catch (err) {
          console.error("Google signup error", err);
          alert(err.response?.data?.error || "Google signup failed");
        } finally {
          setLoading(false);
        }
      },
    });
    window.google.accounts.id.renderButton(
      document.getElementById("googleBtn"),
      { theme: "outline", size: "large", width: "300" }
    );
  }, [navigate]);

  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name,
        email,
        password,
        age: age ? Number(age) : undefined,
        gender,
        height: height ? Number(height) : undefined,
        weight: weight ? Number(weight) : undefined,
        goal,
      };
      const res = await axios.post("http://localhost:5000/api/auth/register", payload);
      localStorage.setItem("token", res.data.token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
      navigate("/"); // or /dashboard
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="reg-container">
      <div className="reg-card">
        <h2 className="reg-title">Create an account</h2>

        <form className="reg-form" onSubmit={handleRegister}>
          <div className="row">
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min="1"
            />
          </div>

          <div className="row">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <select value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="">Gender (optional)</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
              <option value="prefer_not">Prefer not to say</option>
            </select>
          </div>

          <div className="row">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Nutrition goal (e.g. Build muscle)"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
          </div>

          <div className="row">
            <input
              type="number"
              placeholder="Height (cm)"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              min="0"
            />
            <input
              type="number"
              placeholder="Weight (kg)"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              min="0"
            />
          </div>

          <button className="btn-primary" disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        <div className="divider">OR</div>

        <div id="googleBtn" className="google-btn-container"></div>

        <div className="reg-footer">
          <span>Already have an account?</span>
          <button className="link-btn" onClick={() => navigate("/login")}>
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
