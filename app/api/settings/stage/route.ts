export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    let settings = await prisma.systemSettings.findFirst()

    // If no settings exist yet, create the default one
    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {}
      })
    }

    return NextResponse.json({ currentStageStart: settings.currentStageStart })
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json(
      { error: "Error al obtener la configuración" },
      { status: 500 }
    )
  }
}

export async function POST() {
  try {
    // 1. Get or create settings
    let settings = await prisma.systemSettings.findFirst()
    
    // We update the stage start to now
    if (settings) {
      settings = await prisma.systemSettings.update({
        where: { id: settings.id },
        data: { currentStageStart: new Date() }
      })
    } else {
      settings = await prisma.systemSettings.create({
        data: { currentStageStart: new Date() }
      })
    }

    // 2. Deactivate all Professionals
    const resultDeactivations = await prisma.user.updateMany({
      where: {
        rol: "PROFESIONAL"
      },
      data: {
        activo: false
      }
    })

    return NextResponse.json({ 
      success: true, 
      currentStageStart: settings.currentStageStart,
      professionalsDeactivated: resultDeactivations.count
    })
  } catch (error) {
    console.error("Error restarting stage:", error)
    return NextResponse.json(
      { error: "Error al reiniciar la etapa" },
      { status: 500 }
    )
  }
}
