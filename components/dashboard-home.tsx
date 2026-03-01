"use client"

import { useMemo } from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import {
  ClipboardList,
  Users,
  Activity,
  Calendar,
  TrendingUp,
  Trophy,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

export function DashboardHome() {
  const { user, isAdmin } = useAuth()
  const today = new Date().toISOString().slice(0, 10)

  // Helper para tiempo relativo
  const getRelativeTime = (isoString?: string, defaultDateStr?: string) => {
    if (!isoString && !defaultDateStr) return "hace poco";
    
    // Si no hay timestamp ISO, usamos la fecha default pero es menos preciso
    const date = isoString ? new Date(isoString) : new Date(defaultDateStr + "T00:00:00");
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "hace unos segundos";
    if (diffMins < 60) return `hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "hace 1 día";
    if (diffDays < 30) return `hace ${diffDays} días`;
    
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths === 1) return "hace 1 mes";
    return `hace ${diffMonths} meses`;
  };

  // ==========================================
  // CONFIGURACIÓN: CAMBIA ESTE NÚMERO PARA MOSTRAR MÁS O MENOS PROFESIONALES EN EL TOP
  // ==========================================
  const TOP_N_PROFESIONALES = 10;

  const [atenciones, setAtenciones] = useState<any[]>([])
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [programas, setProgramas] = useState<any[]>([])
  const [currentStageStart, setCurrentStageStart] = useState<string | null>(null)

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      if (!user) return
      
      try {
        setLoading(true)
        const [resAt, resUs, resPr, resStage] = await Promise.all([
          fetch("/api/atenciones"),
          fetch("/api/users"),
          fetch("/api/programas"),
          fetch("/api/settings/stage")
        ])

        if (resAt.ok) setAtenciones(await resAt.json())
        if (resUs.ok) setUsuarios(await resUs.json())
        if (resPr.ok) setProgramas(await resPr.json())
        if (resStage.ok) {
          const data = await resStage.json()
          setCurrentStageStart(data.currentStageStart)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user])

  // Todas las atenciones filtradas por la etapa actual (si existe)
  const filteredAtenciones = useMemo(() => {
    if (!currentStageStart) return atenciones;
    return atenciones.filter(a => new Date(a.createdAtISO || (a.fecha + "T00:00:00")) >= new Date(currentStageStart));
  }, [atenciones, currentStageStart]);

  // Todas las atenciones de hoy (basadas en las filtradas por etapa)
  const todayAtenciones = useMemo(() => filteredAtenciones.filter(a => a.fecha.startsWith(today)), [filteredAtenciones, today])
  
  // Atenciones especificas del profesional que inició sesión (basadas en etapa)
  const misAtenciones = useMemo(() => filteredAtenciones.filter(a => a.profesionalId === user?.id), [filteredAtenciones, user])
  
  const profesionalesActivos = useMemo(
    () => usuarios.filter((u) => u.rol === "profesional" && u.activo !== false).length,
    [usuarios]
  )

  const getProgramaById = (id: string) => programas.find(p => p.id === id)

  // Datos del gráfico: atenciones por programa globales
  const chartData = useMemo(() => {
    return programas.map((p) => ({
      nombre: p.nombre.length > 12 ? p.nombre.slice(0, 12) + "..." : p.nombre,
      atenciones: filteredAtenciones.filter((a) => a.programaId === p.id).length,
    })).filter((d) => d.atenciones > 0)
  }, [programas, filteredAtenciones])

  // Atenciones recientes
  const recentAtenciones = useMemo(() => {
    if (isAdmin) {
      return [...filteredAtenciones].slice(0, 5)
    } else {
      // Mostrar atenciones de TODOS los profesionales del MISMO programa
      return filteredAtenciones.filter(
        a => a.programaId === user?.programaId
      ).slice(0, 5)
    }
  }, [filteredAtenciones, isAdmin, user])

  // Top Profesionales
  const top10Profesionales = useMemo(() => {
    if (!usuarios.length) return [];
    const profs = usuarios.filter((u) => u.rol === "profesional");
    
    const counts = profs.map(p => {
      const atencionesProf = filteredAtenciones.filter(a => a.profesionalId === p.id);
      const atencCount = atencionesProf.length;
      
      // Determina la marca de tiempo de su última atención para desempatar
      // Utilizamos createdAtISO. Las atenciones vienen ordenadas 'desc' desde el backend, por lo que [0] es la más reciente.
      const ultimaAtencion = atencionesProf.length > 0 
        ? new Date(atencionesProf[0].createdAtISO || `${atencionesProf[0].fecha}T00:00:00.000Z`).getTime() 
        : 0;

      const prog = getProgramaById(p.programaId);
      return { ...p, atencCount, ultimaAtencion, programaNombre: prog?.nombre || "Sin programa" };
    });
    
    counts.sort((a, b) => {
      // Priorizar cantidad de atenciones (mayor a menor)
      if (b.atencCount !== a.atencCount) {
        return b.atencCount - a.atencCount;
      }

      // Si tienen la MISMA cantidad, priorizar el que llegó a esa cantidad PRIMERO.
      // Quien llegó primero, tiene la fecha de su "última atención" más vieja (menor timestamp).
      if (a.ultimaAtencion !== b.ultimaAtencion) {
        return a.ultimaAtencion - b.ultimaAtencion;
      }
      
      // Si todo sigue empatado (por ej. 0 atenciones), el propio usuario primero u orden alfabético
      if (a.atencCount === 0 && b.atencCount === 0) {
        if (a.id === user?.id) return -1;
        if (b.id === user?.id) return 1;
      }
      return 0; 
    });

    return counts.slice(0, TOP_N_PROFESIONALES);
  }, [usuarios, filteredAtenciones, user, programas]);

  const kpis = isAdmin
    ? [
        {
          label: "Total atenciones",
          value: filteredAtenciones.length,
          icon: <ClipboardList className="h-5 w-5" />,
          color: "bg-primary/10 text-primary",
        },
        {
          label: "Atenciones hoy",
          value: todayAtenciones.length,
          icon: <Calendar className="h-5 w-5" />,
          color: "bg-chart-3/10 text-chart-3",
        },
        {
          label: "Profesionales activos",
          value: profesionalesActivos,
          icon: <Users className="h-5 w-5" />,
          color: "bg-chart-2/10 text-chart-2",
        },
        {
          label: "Programas",
          value: programas.length,
          icon: <Activity className="h-5 w-5" />,
          color: "bg-chart-4/10 text-chart-4",
        },
      ]
    : [
        {
          label: "Mi programa",
          value: getProgramaById(user?.programaId || "")?.nombre || "—",
          icon: <Activity className="h-5 w-5" />,
          color: "bg-chart-2/10 text-chart-2",
        },
        {
          label: "Mis atenciones",
          value: misAtenciones.length,
          icon: <ClipboardList className="h-5 w-5" />,
          color: "bg-primary/10 text-primary",
        },
        {
          label: "Todas las atenciones de hoy",
          value: todayAtenciones.length,
          icon: <Calendar className="h-5 w-5" />,
          color: "bg-chart-3/10 text-chart-3",
        }
      ]

  if (loading) {
    return (
      <div className="flex w-full items-center justify-center p-8 text-muted-foreground text-sm">
        Cargando panel de resumen...
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 w-full min-w-0 overflow-hidden">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Bienvenid@, {user?.nombre}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isAdmin
            ? "Panel general del sistema de atenciones"
            : "Resumen institucional y personal de gestión de atenciones"}
        </p>
      </div>

      {/* KPI Cards */}
      <div className={`grid gap-4 ${isAdmin ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-3"}`}>
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm"
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${kpi.color}`}>
              {kpi.icon}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Chart */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              Todas las Atenciones por Programa
            </h2>
          </div>
          {chartData.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              No hay datos para mostrar.
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.90 0.02 285)" />
                  <XAxis
                    dataKey="nombre"
                    tick={{ fontSize: 11 }}
                    angle={-35}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(1 0 0)",
                      border: "1px solid oklch(0.90 0.02 285)",
                      borderRadius: "8px",
                      fontSize: "13px",
                    }}
                  />
                  <Bar dataKey="atenciones" name="Atenciones" fill="oklch(0.50 0.18 285)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Atenciones recientes */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              {isAdmin 
                ? "Atenciones Recientes" 
                : `Atenciones recientes del programa de ${getProgramaById(user?.programaId || "")?.nombre || ""}`}
            </h2>
          </div>
          {recentAtenciones.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              No hay atenciones registradas.
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {recentAtenciones.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center gap-4 rounded-lg border border-border p-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {a.pacienteNombre
                      .split(" ")
                      .map((w: string) => w[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {a.pacienteNombre}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isAdmin 
                        ? `${getProgramaById(a.programaId)?.nombre} — ${getRelativeTime(a.createdAtISO, a.fecha)}`
                        : `Por: ${a.profesionalNombre} - ${getRelativeTime(a.createdAtISO, a.fecha)}`
                      }
                    </p>
                    {isAdmin && (
                      <p className="text-[11px] text-muted-foreground/80 mt-0.5">
                        Por: <span className="font-medium text-foreground/80">{a.profesionalNombre}</span>
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Top 10 Profesionales (Sección centrada en escritorio) */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm mx-auto w-full lg:w-3/4 xl:w-2/3">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-warning fill-chart-4 text-chart-4" />
            <h2 className="text-lg font-semibold text-foreground">
              Top {TOP_N_PROFESIONALES} Profesionales con más atenciones
            </h2>
          </div>
          <div className="text-xs bg-muted/40 text-muted-foreground px-3 py-1.5 rounded-full border border-border">
            Ránking Institucional
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-semibold text-foreground w-12 sm:w-16">Rank</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Profesional</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground hidden sm:table-cell">Programa</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">Atenciones</th>
              </tr>
            </thead>
            <tbody>
              {top10Profesionales.map((prof, index) => (
                <tr 
                  key={prof.id} 
                  className={`border-b border-border last:border-0 transition-colors ${
                    prof.id === user?.id ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/20"
                  }`}
                >
                  <td className="px-4 py-3 font-bold text-muted-foreground">
                    {index === 0 ? <Trophy className="h-4 w-4 text-warning" /> : `#${index + 1}`}
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <div className="flex items-center gap-2 line-clamp-1">
                      {prof.id === user?.id && <span className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Tú</span>}
                      <span className="sm:hidden">{prof.nombre.split(' ')[0]} {prof.apellidos?.split(' ')[0]}</span>
                      <span className="hidden sm:inline">{prof.nombre} {prof.apellidos}</span>
                    </div>
                    {/* En móvil, mostrar el programa debajo del nombre */}
                    <span className="text-[11px] text-muted-foreground sm:hidden">{prof.programaNombre}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{prof.programaNombre}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center bg-primary/10 text-primary font-bold rounded-md px-2.5 py-1 min-w-[3rem]">
                      {prof.atencCount}
                    </span>
                  </td>
                </tr>
              ))}
              {top10Profesionales.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-muted-foreground">
                    No hay profesionales registrados en el sistema.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
