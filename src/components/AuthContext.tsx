"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { getClientAuth } from "../lib/firebase/client";

export interface UsuarioInfo {
  uid: string;
  correo: string | null;
  rol: "usuario" | "admin";
}

interface AuthContextType {
  usuario: UsuarioInfo | null;
  cargando: boolean;
  iniciarSesion: (correo: string, contrasena: string) => Promise<void>;
  registrarse: (correo: string, contrasena: string) => Promise<void>;
  cerrarSesion: () => Promise<void>;
  errorAuth: string | null;
  limpiarError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioInfo | null>(null);
  const [cargando, setCargando] = useState(true);
  const [errorAuth, setErrorAuth] = useState<string | null>(null);

  // Sincronizar estado inicial con el backend /api/auth/yo
  useEffect(() => {
    async function verificarSesionServidor() {
      try {
        const res = await fetch("/api/auth/yo", { credentials: "same-origin" });
        if (res.ok) {
          const data = await res.json();
          setUsuario(data.usuario);
        } else {
          setUsuario(null);
        }
      } catch {
        setUsuario(null);
      } finally {
        setCargando(false);
      }
    }

    verificarSesionServidor();
  }, []);

  const iniciarSesion = async (correo: string, contrasena: string) => {
    setCargando(true);
    setErrorAuth(null);
    try {
      const auth = getClientAuth();
      const userCredential = await signInWithEmailAndPassword(auth, correo, contrasena);
      const idToken = await userCredential.user.getIdToken();

      // Enviar token al servidor para crear cookie HttpOnly
      const res = await fetch("/api/auth/sesion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) {
        throw new Error("No se pudo establecer la sesión segura con el servidor");
      }

      setUsuario({
        uid: userCredential.user.uid,
        correo: userCredential.user.email,
        rol: "usuario",
      });
    } catch (err: any) {
      let mensaje = "Error al iniciar sesión";
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        mensaje = "Correo electrónico o contraseña incorrectos";
      } else if (err.code === "auth/invalid-email") {
        mensaje = "El formato del correo electrónico no es válido";
      } else if (err.message) {
        mensaje = err.message;
      }
      setErrorAuth(mensaje);
      throw new Error(mensaje);
    } finally {
      setCargando(false);
    }
  };

  const registrarse = async (correo: string, contrasena: string) => {
    setCargando(true);
    setErrorAuth(null);
    try {
      const auth = getClientAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, correo, contrasena);
      const idToken = await userCredential.user.getIdToken();

      const res = await fetch("/api/auth/sesion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) {
        throw new Error("No se pudo establecer la sesión segura con el servidor");
      }

      setUsuario({
        uid: userCredential.user.uid,
        correo: userCredential.user.email,
        rol: "usuario",
      });
    } catch (err: any) {
      let mensaje = "Error al crear la cuenta";
      if (err.code === "auth/email-already-in-use") {
        mensaje = "Ya existe una cuenta con este correo electrónico";
      } else if (err.code === "auth/weak-password") {
        mensaje = "La contraseña debe tener al menos 6 caracteres";
      } else if (err.message) {
        mensaje = err.message;
      }
      setErrorAuth(mensaje);
      throw new Error(mensaje);
    } finally {
      setCargando(false);
    }
  };

  const cerrarSesion = async () => {
    setCargando(true);
    try {
      const auth = getClientAuth();
      await signOut(auth);
      await fetch("/api/auth/sesion", { method: "DELETE" });
      setUsuario(null);
    } catch (error) {
      console.error("Error cerrando sesión:", error);
    } finally {
      setCargando(false);
    }
  };

  const limpiarError = () => setErrorAuth(null);

  return (
    <AuthContext.Provider
      value={{
        usuario,
        cargando,
        iniciarSesion,
        registrarse,
        cerrarSesion,
        errorAuth,
        limpiarError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
