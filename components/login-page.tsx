"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Heart, Loader2, Eye, EyeOff } from "lucide-react"
import { COMPANY_NAME } from "@/lib/constants"

export function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState<"login" | "recovery">("login")
  const [recoveryError, setRecoveryError] = useState("")
  const [recoverySuccess, setRecoverySuccess] = useState("")

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setError("")
  setLoading(true)

  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    let data;
    try {
      data = await res.json()
    } catch (e) {
      data = { error: "Error desconocido del servidor." }
    }

    if (!res.ok) {
      setError(data.error || "Error al iniciar sesión")
      setLoading(false)
      return
    }

    login(data.user, data.token) // 🔥 ahora usa el backend real
  } catch (err) {
    setError("Error de conexión")
  }

  setLoading(false)
}

const handleRecoverySubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setRecoveryError("")
  setRecoverySuccess("")
  setLoading(true)

  try {
    const res = await fetch("/api/auth/recuperar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
    
    let data;
    try {
      data = await res.json()
    } catch {
      data = { error: "Error desconocido del servidor." }
    }

    if (!res.ok) {
      setRecoveryError(data.error || "Error al intentar recuperar contraseña")
    } else {
      setRecoverySuccess(data.message || "Te hemos enviado una contraseña a tu correo.")
      // Podemos limpiar el form o dejar un boton para regresar
    }
  } catch (err) {
    setRecoveryError("Error de conexión con el servidor.")
  }

  setLoading(false)
}

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary/5 px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5" />
      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-xl border border-border bg-card p-8 shadow-lg">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center gap-3">
            {/* 
              CAMBIAR LOGO AQUI: 
              Ejemplo: <img src="/tu-logo.png" alt="Logo" className="h-16 w-16" /> 
            */}
            <img src="/logo-ese-salud-pereira.png" alt={`Logo ${COMPANY_NAME}`} className="h-24 w-auto max-w-full object-contain" />

            <div className="text-center">
              {/*CAMBIAR NOMBRE DEL APLICATIVO AQUI */}
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {COMPANY_NAME}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Sistema de Gestion de Atenciones
              </p>
            </div>
          </div>

          {/* Formularios Condicionales */}
          {view === "login" ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <h2 className="text-center text-lg font-semibold text-foreground">
                Iniciar sesion
              </h2>

              {error && (
                <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Correo electronico
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@saludpereira.gov.co"
                  className="h-11 rounded-lg border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Contrasena
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingrese su contrasena"
                    className="h-11 w-full rounded-lg border border-input bg-background px-4 pr-11 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex h-11 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors cursor-pointer mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Ingresando...
                  </>
                ) : (
                  "Ingresar"
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setView("recovery")
                  setError("")
                  setRecoveryError("")
                  setRecoverySuccess("")
                }}
                className="text-sm text-primary hover:underline transition-colors mt-2"
              >
                ¿Olvidó su contraseña?
              </button>
            </form>
          ) : (
            <form onSubmit={handleRecoverySubmit} className="flex flex-col gap-5">
              <h2 className="text-center text-lg font-semibold text-foreground">
                Recuperar contraseña
              </h2>
              <p className="text-center text-sm text-muted-foreground mb-2">
                Ingresa el correo electrónico asociado a tu cuenta y te enviaremos una clave temporal de acceso.
              </p>

              {recoveryError && (
                <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {recoveryError}
                </div>
              )}

              {recoverySuccess && (
                <div className="rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-700 dark:text-green-400">
                  {recoverySuccess}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label htmlFor="recovery-email" className="text-sm font-medium text-foreground">
                  Correo electrónico registrado
                </label>
                <input
                  id="recovery-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@correo.com"
                  className="h-11 rounded-lg border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex h-11 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Solicitar nueva contraseña"
                )}
              </button>

              <button
                type="button"
                onClick={() => setView("login")}
                className="text-sm text-muted-foreground hover:text-foreground hover:underline transition-colors mt-2"
              >
                Volver al inicio de sesión
              </button>
            </form>
          )}
        </div>
        <p className="mt-6 text-center text-sm font-medium text-muted-foreground/60">
          © 2026 Juan Taguado – Todos los derechos reservados
        </p>
      </div>
    </div>
  )
}
