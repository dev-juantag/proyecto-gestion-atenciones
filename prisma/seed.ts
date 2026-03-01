import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash("[CONTRASEÑA_AQUI]", 10)

  await prisma.user.create({
    data: {
      nombre: "[NOMBRE_AQUI]",
      apellidos: "[APELLIDOS_AQUI]",
      email: "[EMAIL_AQUI]",
      password: passwordHash,
      documento: "[DOCUMENTO_AQUI]",
      rol: "SUPERADMIN",
    },
  })

  console.log("Admin creado correctamente")
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect())