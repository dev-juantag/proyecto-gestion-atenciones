export const runtime = "nodejs"

import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcrypt"

// ──────────── PUT (Editar usuario) ────────────

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await req.json()
    const { id } = await params

    const {
      nombre,
      apellidos,
      documento,
      email,
      password,
      rol,
      programaId,
    } = body

    const dataToUpdate: any = {
      nombre,
      apellidos,
      documento,
      email,
      rol: rol.toUpperCase(),
      programaId: rol === "admin" || !programaId ? null : programaId,
    }

    if (password) {
      dataToUpdate.password = await bcrypt.hash(password, 10)
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
    })

    return NextResponse.json({
      ...updatedUser,
      rol: updatedUser.rol.toLowerCase(),
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Error al actualizar usuario" },
      { status: 500 }
    )
  }
}

// ──────────── DELETE (Eliminar usuario) ────────────

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log("ID recibido:", id)

    const user = await prisma.user.findUnique({
      where: { id },
    })

    console.log("Usuario encontrado:", user)

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    if ((user.rol as string) === "SUPERADMIN") {
      return NextResponse.json(
        { error: "No se puede eliminar a un Super Administrador" },
        { status: 403 }
      )
    }

    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Usuario eliminado" })
  } catch (error: any) {
    console.error("DELETE ERROR:", error)
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: "No se puede eliminar el usuario porque tiene atenciones asociadas." },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Error al eliminar usuario" },
      { status: 500 }
    )
  }
}