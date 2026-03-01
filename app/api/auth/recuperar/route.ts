export const runtime = "nodejs"

import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { sendRecoveryEmail } from "@/lib/mailer"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, isAdminRequest } = body

    if (!email) {
      return NextResponse.json(
        { error: "El correo electrónico es requerido." },
        { status: 400 }
      )
    }

    const unUsuario = await prisma.user.findUnique({
      where: { email }
    })

    if (!unUsuario) {
      // Para evitar enumeración de usuarios, siempre decimos que se envió así no exista
      // pero por buenas prácticas de UX interinas a veces se recomienda avisar si no existe
      return NextResponse.json(
        { error: "No se encontró ningún usuario con ese correo electrónico." },
        { status: 404 }
      )
    }

    const primerNombreLetra = unUsuario.nombre.charAt(0).toUpperCase() || ""
    const primerApellidoLetra = unUsuario.apellidos ? unUsuario.apellidos.charAt(0).toUpperCase() : ""
    const doc = unUsuario.documento
    // No existe "telefono" en el modelo User, así que se usa un fragmento del documento para la opción 3
    const seudoTelefono = doc.length >= 4 ? doc.slice(-4) : "1234"

    const opcionesClave = [
      `CC${doc}`,                                                  // 1
      `${primerNombreLetra}${doc}`,                                // 2
      `${seudoTelefono}${primerNombreLetra}${primerApellidoLetra}`, // 3 (pseudo-teléfono)
      `${doc}${primerNombreLetra}${primerApellidoLetra}`,          // 4
      `${primerNombreLetra}${primerApellidoLetra}${doc}`           // 5
    ]

    const randomIndex = Math.floor(Math.random() * opcionesClave.length)
    const nuevaClave = opcionesClave[randomIndex]

    // Encriptar la nueva
    const hashedTempPassword = await bcrypt.hash(nuevaClave, 10)

    // Guardar en DB
    await prisma.user.update({
      where: { id: unUsuario.id },
      data: { password: hashedTempPassword }
    })

    // Extraer el primer nombre para personalizar el correo
    const primerNombre = unUsuario.nombre.split(' ')[0]

    /* 
      CAMBIAR O ADMINISTRAR CORREO DE GESTION DE ENVIO DE EMAILS PARA RECUPERAR LA CONTRASEÑA:
      La lógica de envío real se encuentra en el archivo: @/lib/mailer.ts 
      Además, debes configurar tus credenciales SMTP (correo que envía los mensajes) 
      y tu contraseña de aplicación en el archivo oculto .env en la raíz del proyecto.
      
      Variables necesarias en .env:
      SMTP_HOST=smtp.gmail.com
      SMTP_PORT=465
      SMTP_USER=tu-correo@gmail.com
      SMTP_PASS=tu-contraseña-de-aplicacion
    */
    // Enviar el email real
    const sent = await sendRecoveryEmail(email, nuevaClave, primerNombre, isAdminRequest)

    if (!sent) {
      const msjLocalDemo = process.env.SMTP_USER 
        ? "Hubo un problema intentando enviar el correo electrónico (Verifica la credenciales SMTP)" 
        : `Simulador local: La nueva clave temporal es: ${nuevaClave}`
        
      return NextResponse.json(
        { error: msjLocalDemo },
        { status: process.env.SMTP_USER ? 500 : 200 }
      )
    }

    return NextResponse.json(
      { message: "Se ha enviado la contraseña a tu correo electrónico." },
      { status: 200 }
    )

  } catch (error: any) {
    console.error("RECUPERAR CLAVE ERROR:", error)
    return NextResponse.json(
      { error: "Error en el servidor al recuperar contraseña." },
      { status: 500 }
    )
  }
}
