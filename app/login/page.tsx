"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (mode === "register") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          setMessage(error.message);
        } else {
          setMessage(
            "Cuenta creada. Revisá tu correo para confirmar tu cuenta."
          );
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
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

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={{
              width: "100%",
              padding: "13px",
              marginBottom: "15px",
              borderRadius: "10px",
              border: "1px solid #374151",
              background: "#111827",
              color: "white",
            }}
          />

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
