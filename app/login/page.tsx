"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const normalizedEmail = email.trim().toLowerCase();

  async function handleGoogleLogin() {
    setLoading(true);
    setMessage("");

    const requested = new URLSearchParams(window.location.search).get("next");
    const nextPath = requested?.startsWith("/") && !requested.startsWith("//") ? requested : "/";
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}${nextPath}`,
      },
    });

    if (error) {
      setMessage("No pudimos iniciar sesión con Google. Intentá nuevamente.");
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (mode === "register") {
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password)) {
          setMessage("8 caracteres: números, letras, una mayúscula y símbolos.");
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });

        if (error) {
          setMessage(error.message);
        } else if (data.session) {
          window.location.href = "/";
        } else {
          setMessage(
            "Cuenta creada. Confirmá el correo y entrarás automáticamente a RXZ Gamer."
          );
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        if (error) {
          setMessage(error.message);
        } else {
          const requested = new URLSearchParams(window.location.search).get("next");
          window.location.href = requested?.startsWith("/") && !requested.startsWith("//") ? requested : "/";
        }
      }
    } catch {
      setMessage("Ocurrió un error. Intentá nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at top, #0c3b36 0%, #071b25 45%, #02070b 100%)",
        color: "white",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "rgba(10, 20, 28, 0.95)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "18px",
          padding: "30px",
        }}
      >
        <h1
          style={{
            marginBottom: "8px",
            fontSize: "30px",
            textAlign: "center",
          }}
        >
          RXZ Gamer
        </h1>

        <p
          style={{
            color: "#9ca3af",
            textAlign: "center",
            marginBottom: "25px",
          }}
        >
          {mode === "login"
            ? "Iniciá sesión en tu cuenta"
            : "Creá tu cuenta"}
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            autoComplete="email"
            inputMode="email"
            maxLength={200}
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "13px",
              marginBottom: "12px",
              borderRadius: "10px",
              border: "1px solid #374151",
              background: "#111827",
              color: "white",
            }}
          />

          <div style={{ position: "relative", marginBottom: "15px" }}>
            <input
              type={showPassword ? "text" : "password"}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={mode === "register" ? 8 : 6}
              style={{
                width: "100%",
                padding: "13px 82px 13px 13px",
                borderRadius: "10px",
                border: "1px solid #374151",
                background: "#111827",
                color: "white",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                border: "none",
                background: "transparent",
                color: "#60a5fa",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px",
              borderRadius: "10px",
              border: "none",
              background: "#22c55e",
              color: "#04110a",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            {loading
              ? "Procesando..."
              : mode === "login"
              ? "INICIAR SESIÓN"
              : "CREAR CUENTA"}
          </button>
        </form>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            margin: "20px 0",
            color: "#64748b",
            fontSize: "13px",
          }}
        >
          <span style={{ height: "1px", flex: 1, background: "#334155" }} />
          o
          <span style={{ height: "1px", flex: 1, background: "#334155" }} />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            width: "100%",
            padding: "13px",
            borderRadius: "10px",
            border: "1px solid #475569",
            background: "#ffffff",
            color: "#111827",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          Continuar con Google
        </button>

        {message && (
          <p
            style={{
              marginTop: "16px",
              textAlign: "center",
              color: "#d1d5db",
            }}
          >
            {message}
          </p>
        )}

        <button
          onClick={() =>
            setMode(mode === "login" ? "register" : "login")
          }
          style={{
            marginTop: "20px",
            width: "100%",
            background: "transparent",
            border: "none",
            color: "#60a5fa",
            cursor: "pointer",
          }}
        >
          {mode === "login"
            ? "¿No tenés cuenta? Crear cuenta"
            : "¿Ya tenés cuenta? Iniciar sesión"}
        </button>

        <button
          onClick={() => (window.location.href = "/")}
          style={{
            marginTop: "15px",
            width: "100%",
            background: "transparent",
            border: "none",
            color: "#9ca3af",
            cursor: "pointer",
          }}
        >
          Volver a RXZ Gamer
        </button>
      </div>
    </main>
  );
}
