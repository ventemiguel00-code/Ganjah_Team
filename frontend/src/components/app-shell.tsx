"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { BrandMark } from "@/components/brand-mark";
import { AuthProvider, type UserRole } from "@/components/auth-context";

export function AppShell({ children, username, role }: { children: React.ReactNode; username: string; role: UserRole }) {
  const pathname = usePathname();
  const isHomePanel = pathname === "/panel";
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  async function logout() {
    setLoggingOut(true);
    try {
      const response = await fetch("/api/auth/session", { method: "DELETE" });
      if (!response.ok) {
        setLogoutError("No fue posible cerrar la sesión de forma segura.");
        return;
      }
      router.replace("/ingreso");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <AuthProvider username={username} role={role}>
    <div className="app-shell app-shell-home">
      <a className="skip-link" href="#contenido">Saltar al contenido</a>
      <header className="app-topbar">
        <BrandMark compact />
        {!isHomePanel && <Link className="button button-ghost app-back" href="/panel">← Volver a opciones</Link>}
        <div className="app-account">
          <span>{username} · {role === "ADMIN" ? "Administrador" : "Solo consulta"}</span>
          <button className="text-button" type="button" onClick={logout} disabled={loggingOut}>
            {loggingOut ? "Saliendo…" : "Salir"}
          </button>
        </div>
        {logoutError && <span className="app-logout-error" role="alert">{logoutError}</span>}
      </header>

      <main id="contenido" className="app-content">{children}</main>
    </div>
    </AuthProvider>
  );
}

