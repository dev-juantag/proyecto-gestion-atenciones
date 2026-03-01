"use client"

import { useState, useMemo, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Plus, Search, Pencil, Trash2, X, Upload } from "lucide-react"

type Role = "superadmin" | "admin" | "profesional"

interface User {
  id: string
  nombre: string
  apellidos: string
  documento: string
  email: string
  rol: Role
  programaId?: string | null
}

interface Programa {
  id: string
  nombre: string
}

export function AdminUsuarios() {
  const { user, logout } = useAuth()
  const [search, setSearch] = useState("")
  const [filterRol, setFilterRol] = useState("")
  const [filterPrograma, setFilterPrograma] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [programas, setProgramas] = useState<Programa[]>([])

  useEffect(() => {
    fetchUsers()
    fetchProgramas()
  }, [])

  async function fetchUsers() {
    const res = await fetch("/api/users")
    const data = await res.json()
    setUsers(data)
  }

  async function fetchProgramas() {
    const res = await fetch("/api/programas")
    const data = await res.json()
    setProgramas(data)
  }

  const filtered = useMemo(() => {
    let result = users.filter((u) => {
      const matchSearch =
        !search ||
        `${u.nombre} ${u.apellidos}`.toLowerCase().includes(search.toLowerCase()) ||
        u.documento.includes(search) ||
        u.email.toLowerCase().includes(search.toLowerCase())

      const matchRol = !filterRol || u.rol === filterRol
      const matchPrograma = !filterPrograma || u.programaId === filterPrograma

      return matchSearch && matchRol && matchPrograma
    })

    // Ordenar: primero superadmin, luego admin, finalmente profesional. Alfabético dentro de cada grupo.
    const rolWeight: Record<Role, number> = {
      superadmin: 1,
      admin: 2,
      profesional: 3,
    }

    result = result.sort((a, b) => {
      if (rolWeight[a.rol] !== rolWeight[b.rol]) {
        return rolWeight[a.rol] - rolWeight[b.rol]
      }
      const nombreA = `${a.nombre} ${a.apellidos}`.toLowerCase()
      const nombreB = `${b.nombre} ${b.apellidos}`.toLowerCase()
      return nombreA.localeCompare(nombreB)
    })

    return result
  }, [users, search, filterRol, filterPrograma])

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setShowForm(true)
  }

  const handleDelete = async (u: User) => {
    if (u.rol === "superadmin") {
      alert("No se puede eliminar a un Super Administrador.")
      return
    }
    if (user?.rol === "admin" && u.rol === "admin") {
      alert("Un administrador no puede eliminar a otro administrador.")
      return
    }

    if (!confirm(`¿Está seguro de eliminar al usuario ${u.nombre}?`)) return

    const res = await fetch(`/api/users/${u.id}`, { method: "DELETE" })
    if (!res.ok) {
      const errorData = await res.json()
      alert(errorData.error || "Error al eliminar usuario")
      return
    }
    
    // Si el usuario eliminado es el logueado actualmente, cerrar sesión
    if (user?.id === u.id) {
      logout()
      return
    }

    fetchUsers()
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingUser(null)
  }

  const handleSave = async (data: any) => {
    let res;
    if (editingUser) {
      res = await fetch(`/api/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
    } else {
      res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
    }

    if (!res.ok) {
      const errorData = await res.json()
      alert(errorData.error || "Error al guardar el usuario")
      return;
    }

    fetchUsers()
    handleFormClose()
  }

  return (
    <div className="flex flex-col gap-6">

      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
          <p className="text-sm text-muted-foreground">
            Administre los usuarios del sistema
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <Upload className="h-4 w-4" />
            Importar (CSV)
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Crear usuario
          </button>
        </div>
      </div>

      {/* FILTROS */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border pl-10 pr-4 text-sm"
          />
        </div>

        <select
          value={filterRol}
          onChange={(e) => setFilterRol(e.target.value)}
          className="h-10 rounded-lg border px-3 text-sm"
        >
          <option value="">Todos los roles</option>
          <option value="admin">Administrador</option>
          <option value="profesional">Profesional</option>
        </select>

        <select
          value={filterPrograma}
          onChange={(e) => setFilterPrograma(e.target.value)}
          className="h-10 rounded-lg border px-3 text-sm"
        >
          <option value="">Todos los programas</option>
          {programas.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* TABLA */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Documento</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Rol</th>
                <th className="px-4 py-3 text-left">Programa</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((u) => {
                const programa = programas.find((p) => p.id === u.programaId)

                return (
                  <tr key={u.id} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      {u.nombre} {u.apellidos}
                    </td>
                    <td className="px-4 py-3">{u.documento}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">
                      {u.rol === "superadmin"
                        ? "Súper Admin"
                        : u.rol === "admin"
                        ? "Administrador"
                        : "Profesional"}
                    </td>
                    <td className="px-4 py-3">
                      {programa?.nombre || "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {/* Lógica de Edición:
                          SuperAdmin puede editar a todos.
                          Admin puede editarse a sí mismo o a Profesionales.
                      */}
                      {(user?.rol === "superadmin" || user?.id === u.id || (user?.rol === "admin" && u.rol === "profesional")) && (
                        <button onClick={() => handleEdit(u)} title="Editar Usuario">
                          <Pencil className="h-4 w-4 inline" />
                        </button>
                      )}

                      {/* Lógica de Eliminación:
                          SuperAdmin no puede ser eliminado por nadie desde la interfaz.
                          Admin Normal puede eliminar Profesionales, pero no a otros Admins.
                          SuperAdmin puede eliminar Admins y Profesionales.
                      */}
                      {u.rol !== "superadmin" && (user?.rol === "superadmin" || (user?.rol === "admin" && u.rol === "profesional")) && (
                        <button onClick={() => handleDelete(u)} title="Eliminar Usuario">
                          <Trash2 className="h-4 w-4 inline ml-2 text-red-500" />
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <UserFormModal
          user={editingUser}
          programas={programas}
          onClose={handleFormClose}
          onSave={handleSave}
        />
      )}

      {showImport && (
        <ImportUsersModal
          programas={programas}
          onClose={() => setShowImport(false)}
          onSuccess={() => {
            setShowImport(false)
            fetchUsers()
          }}
        />
      )}
    </div>
  )
}

function ImportUsersModal({ programas, onClose, onSuccess }: any) {
  const [file, setFile] = useState<File | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0, errors: [] as string[] })

  const handleImport = async () => {
    if (!file) return

    setIsImporting(true)
    const text = await file.text()
    
    // Análisis básico
    const rows = text.split('\n').map(r => r.trim()).filter(Boolean)
    if (rows.length < 2) {
      alert("El archivo parece estar vacío o no tiene encabezados.")
      setIsImporting(false)
      return
    }

    const separator = rows[0].includes(';') ? ';' : (rows[0].includes('\t') ? '\t' : ',')
    const dataRows = rows.slice(1) // Ignorar encabezados

    setProgress({ current: 0, total: dataRows.length, errors: [] })
    const errs: string[] = []

    for (let i = 0; i < dataRows.length; i++) {
       const cols = dataRows[i].split(separator).map(c => c.trim().replace(/^"|"$/g, ''))
       
       if (cols.length < 5) continue // Se necesitan al menos 5 columnas

       const nombreCompleto = cols[0] || ""
       const documento = cols[1] || ""
       const email = cols[2] || ""
       // 3 = Contraseña (ignorada, lo generamos nosotros)
       const rolCol = cols[4] || ""
       const programaCol = cols[5] || ""

       const partesNombre = nombreCompleto.split(' ')
       const nombre = partesNombre[0] || ''
       const apellidos = partesNombre.slice(1).join(' ') || ''
       
       const firstLetter = nombre.charAt(0).toUpperCase()
       const password = firstLetter + documento

       const rol = rolCol.toLowerCase().includes("admin") ? "admin" : "profesional"

       let programaId = null
       if (rol === "profesional" && programaCol) {
          const matched = programas.find((p: any) => 
            programaCol.toLowerCase().includes(p.nombre.toLowerCase()) ||
            p.nombre.toLowerCase().includes(programaCol.toLowerCase())
          )
          if (matched) {
             programaId = matched.id
          } else {
             errs.push(`Fila ${i+2}: No se encontró un programa coincidente con '${programaCol}'. Se asignó al usuario sin programa específico.`)
          }
       }

       try {
         const res = await fetch("/api/users", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ nombre, apellidos, documento, email, password, rol, programaId })
         })
         if (!res.ok) {
           const err = await res.json()
           errs.push(`Fila ${i+2} (${nombre}): ${err.error}`)
         }
       } catch (e: any) {
         errs.push(`Fila ${i+2} (${nombre}): Error de conexión`)
       }

       setProgress(prev => ({ ...prev, current: i + 1, errors: errs }))
    }

    setIsImporting(false)
    if (errs.length > 0) {
       alert(`Importación completada con ${errs.length} observaciones/errores:\n\n` + errs.slice(0,10).join("\n") + (errs.length > 10 ? "\n...y más" : ""))
    } else {
       alert("Importación de usuarios completada exitosamente. ¡Todos los usuarios cargados correctamente!")
    }
    onSuccess()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-[500px] rounded-2xl bg-card p-6 shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-bold text-foreground mb-6">
          Importar Usuarios (CSV Masivo)
        </h2>

        <div className="flex flex-col gap-4">
          <p className="text-sm text-foreground leading-relaxed">
            Suba un archivo CSV en formato (Valores Separados por Comas).<br/><br/>
            Orden de columnas (<strong>Obligatorio</strong>):<br/>
            <span className="font-semibold px-2 py-1 bg-muted rounded inline-block mt-2">
              Nombre Completo | Documento | Email | Contraseña | Rol | Programa
            </span>
            <br/><br/>
            <span className="text-xs text-muted-foreground">
              <b>Notas:</b> <br/>
              * Lo ideal es que sea solo el primer nombre con los apellidos. <br/>
              * La columna de contraseña siempre es ignorada. El sistema la genera sola 
              (1ra letra del nombre en mayúscula + documento). <br/>
              * Debes colocar el nombre del programa tal cual como aparece en la lista de programas.
            </span>
          </p>

          <input 
            type="file" 
            accept=".csv, .txt, .tsv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full text-sm mt-2 file:cursor-pointer file:mr-4 file:rounded-xl file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer"
          />

          {isImporting && (
             <div className="mt-4 px-4 py-3 rounded-lg bg-primary/10 text-sm font-medium text-primary animate-pulse flex items-center gap-2">
               Procesando e ingresando a base de datos... ({progress.current} / {progress.total})
             </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isImporting}
              className="rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleImport}
              disabled={isImporting || !file}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {isImporting ? "Importando..." : "Iniciar Importación"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function UserFormModal({ user, programas, onClose, onSave }: any) {
  const { user: currentUser } = useAuth()
  const [nombre, setNombre] = useState(user?.nombre || "")
  const [apellidos, setApellidos] = useState(user?.apellidos || "")
  const [documento, setDocumento] = useState(user?.documento || "")
  const [email, setEmail] = useState(user?.email || "")
  const [password, setPassword] = useState("")
  // Si el usuario actual es admin normal, forzar a profesional
  const defaultRol = currentUser?.rol === "superadmin" ? "admin" : "profesional"
  const [rol, setRol] = useState<Role>(user?.rol || defaultRol)
  const [programaId, setProgramaId] = useState(user?.programaId || "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    await onSave({
      nombre,
      apellidos,
      documento,
      email,
      password,
      rol,
      programaId: (rol === "admin" || rol === "superadmin") ? null : programaId,
    })
    setIsSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-[500px] rounded-2xl bg-card p-6 shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-bold text-foreground mb-6">
          {user ? "Editar Usuario" : "Crear Usuario"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground">Nombre</label>
              <input
                required
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground">Apellidos</label>
              <input
                required
                type="text"
                value={apellidos}
                onChange={(e) => setApellidos(e.target.value)}
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">Documento</label>
            <input
              required
              type="text"
              value={documento}
              onChange={(e) => setDocumento(e.target.value)}
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">
              {user ? "Nueva Contraseña (Opcional)" : "Contraseña"}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!user}
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">Rol</label>
            <select
              value={rol}
              onChange={(e) => setRol(e.target.value as Role)}
              disabled={currentUser?.rol === "admin" && rol !== "superadmin"}
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all disabled:opacity-50"
            >
              <option value="profesional">Profesional</option>
              {currentUser?.rol === "superadmin" && (
                <option value="admin">Administrador</option>
              )}
              {/* Si se está editando a un superadmin, no permitir cambiarlo, pero mostrar su opción si ya lo es */}
              {rol === "superadmin" && (
                <option value="superadmin">Súper Admin</option>
              )}
            </select>
          </div>

          {rol === "profesional" && (
            <div className="flex flex-col gap-1.5 mb-2">
              <label className="text-sm font-semibold text-foreground">Programa asignado</label>
              <select
                required
                value={programaId}
                onChange={(e) => setProgramaId(e.target.value)}
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
              >
                <option value="">Seleccione un programa</option>
                {programas.map((p: Programa) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Guardando..." : user ? "Guardar cambios" : "Crear usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}