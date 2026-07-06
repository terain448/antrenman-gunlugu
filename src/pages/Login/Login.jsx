import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import styles from "./Login.module.css";

export function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await login(form);
      navigate("/", { replace: true });
    } catch (loginError) {
      setError(loginError.message);
    }
  };

  return (
    <main className={styles.login}>
      <section className={styles.panel}>
        <span className={styles.eyebrow}>Antrenman Günlüğü</span>
        <h1>Günlük yaşamın kalitesini arttır.</h1>
        <p>Görevler, su takibi, antrenmanlar, rozetler ve küçük güzel planlar tek yerde.</p>
      </section>

      <form className={styles.form} onSubmit={handleSubmit}>
        <h2>Giriş Yap</h2>
        <label>
          Kullanıcı adı
          <input
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            type="text"
            autoComplete="username"
          />
        </label>
        <label>
          Şifre
          <input
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            type="password"
            autoComplete="current-password"
          />
        </label>
        {error && <p className={styles.error}>{error}</p>}
        <Button type="submit">Giriş Yapın</Button>
      </form>
    </main>
  );
}
