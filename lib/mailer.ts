import nodemailer from "nodemailer";

/*
  CAMBIAR O ADMINISTRAR CORREO DE GESTION DE ENVIO DE EMAILS PARA RECUPERAR LA CONTRASEÑA:
  Puedes cambiar estos valores creando un archivo .env en la raíz del proyecto.
  Por ejemplo, para usar un correo de Gmail deberás usar una contraseña de aplicación de Google.
*/
const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587");
const SMTP_USER = process.env.SMTP_USER || ""; 
const SMTP_PASS = process.env.SMTP_PASS || "";

export const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465, // true for 465, false for other ports
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

export const sendRecoveryEmail = async (to: string, tempPassword: string, primerNombre: string, isAdminRequest: boolean = false) => {
  if (!SMTP_USER || !SMTP_PASS) {
    console.warn("⚠️ Nodemailer no está configurado. La contraseña generada es:", tempPassword);
    // Solo simularemos el envío si las credenciales no están enviadas, útil para pruebas locales
    return true; 
  }

  try {
    const info = await transporter.sendMail({
      from: `"Sistema Gestión de Atenciones - ESE Salud Pereira" <${SMTP_USER}>`,
      to,
      subject: "Recuperación de Contraseña - ESE Salud Pereira",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #2F1160; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">ESE Salud Pereira</h1>
          </div>
          <div style="padding: 30px; background-color: #ffffff;">
            <p style="font-size: 16px; color: #334155;">Hola, ${primerNombre}</p>
            <p style="font-size: 16px; color: #334155;">
              ${
                isAdminRequest 
                  ? "Un administrador ha solicitado restablecer tu contraseña para acceder al <strong>Sistema de Gestión de Atenciones</strong>." 
                  : "Has solicitado recuperar tu contraseña para acceder al <strong>Sistema de Gestión de Atenciones</strong>."
              }
            </p>
            
            <div style="background-color: #f8fafc; border-left: 4px solid #2F1160; padding: 15px; margin: 25px 0;">
              <p style="margin: 0; font-size: 14px; color: #64748b;">Tu contraseña es:</p>
              <p style="margin: 10px 0 0 0; font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #0f172a;">${tempPassword}</p>
            </div>
            
            <p style="font-size: 14px; color: #64748b; margin-top: 30px;">
              <strong>Nota:</strong> Ya podras iniciar sesión con tu correo y esta contraseña.
            </p>
            
            <p style="font-size: 14px; color: #94a3b8; margin-top: 20px;">
              Si no solicitaste este cambio, por favor contacta al administrador del sistema.
            </p>
          </div>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error("Error enviando email:", error);
    return false;
  }
};
