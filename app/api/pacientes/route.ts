export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const documento = searchParams.get('documento')

        if (!documento) {
            const pacientes = await prisma.paciente.findMany({
                orderBy: { nombreCompleto: 'asc' }
            })
            return NextResponse.json(pacientes)
        }

        const paciente = await prisma.paciente.findUnique({
            where: { documento }
        })

        if (!paciente) {
            return NextResponse.json({ error: "Paciente no encontrado" }, { status: 404 })
        }

        return NextResponse.json(paciente)

    } catch (error) {
        console.error("GET PACIENTE ERROR:", error)
        return NextResponse.json(
            { error: "Error al buscar paciente" },
            { status: 500 }
        )
    }
}
