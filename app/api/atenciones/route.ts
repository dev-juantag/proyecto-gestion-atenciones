export const runtime = "nodejs"

import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const profesionalId = searchParams.get('profesionalId')

    const whereClause = profesionalId ? { profesionalId } : {}

    const atenciones = await prisma.atencion.findMany({
      where: whereClause,
      include: {
        paciente: true,
        profesional: true,
        programa: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const formattedAtenciones = atenciones.map(a => ({
      id: a.id,
      programaId: a.programaId,
      pacienteId: a.pacienteId,
      pacienteNombre: a.paciente.nombreCompleto,
      pacienteDocumento: a.paciente.documento,
      pacienteTipoDoc: a.paciente.tipoDocumento,
      pacienteGenero: a.paciente.genero,
      pacienteTelefono: a.paciente.telefono,
      pacienteDireccion: a.paciente.direccion,
      pacienteFechaNac: a.paciente.fechaNacimiento.toISOString().split('T')[0],
      notaValoracion: a.nota,
      profesionalId: a.profesionalId,
      profesionalNombre: `${a.profesional.nombre} ${a.profesional.apellidos}`,
      fecha: a.createdAt.toISOString().split('T')[0],
      createdAtISO: a.createdAt.toISOString(),
    }))

    return NextResponse.json(formattedAtenciones)

  } catch (error) {
    console.error("GET ATENCIONES ERROR:", error)
    return NextResponse.json(
      { error: "Error al obtener atenciones" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      nombreCompleto,
      tipoDocumento,
      documento,
      genero,
      telefono,
      direccion,
      fechaNacimiento,
      nota,
      profesionalId,
      programaId,
    } = body

    let paciente = await prisma.paciente.findUnique({
      where: { documento }
    })

    if (!paciente) {
      paciente = await prisma.paciente.create({
        data: {
          nombreCompleto,
          tipoDocumento,
          documento,
          genero,
          telefono,
          direccion,
          fechaNacimiento: new Date(fechaNacimiento),
        },
      })
    } else {
      paciente = await prisma.paciente.update({
        where: { id: paciente.id },
        data: {
          nombreCompleto,
          tipoDocumento,
          genero,
          telefono,
          direccion,
          fechaNacimiento: new Date(fechaNacimiento),
        },
      })
    }

    const nuevaAtencion = await prisma.atencion.create({
      data: {
        pacienteId: paciente.id,
        profesionalId,
        programaId,
        nota,
      },
      include: {
        paciente: true,
        profesional: true,
        programa: true,
      }
    })

    const responseFormat = {
      id: nuevaAtencion.id,
      programaId: nuevaAtencion.programaId,
      pacienteId: nuevaAtencion.pacienteId,
      pacienteNombre: nuevaAtencion.paciente.nombreCompleto,
      pacienteDocumento: nuevaAtencion.paciente.documento,
      pacienteTipoDoc: nuevaAtencion.paciente.tipoDocumento,
      pacienteGenero: nuevaAtencion.paciente.genero,
      pacienteTelefono: nuevaAtencion.paciente.telefono,
      pacienteDireccion: nuevaAtencion.paciente.direccion,
      pacienteFechaNac: nuevaAtencion.paciente.fechaNacimiento.toISOString().split('T')[0],
      notaValoracion: nuevaAtencion.nota,
      profesionalId: nuevaAtencion.profesionalId,
      profesionalNombre: `${nuevaAtencion.profesional.nombre} ${nuevaAtencion.profesional.apellidos}`,
      fecha: nuevaAtencion.createdAt.toISOString().split('T')[0],
      createdAtISO: nuevaAtencion.createdAt.toISOString(),
    }

    return NextResponse.json(responseFormat)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al guardar atención" }, { status: 500 })
  }
}