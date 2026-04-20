import { getRemitent, getSesTransport } from "./ses"
import welcomeTemplate from "./welcomeTemplate"

export const sendWelcome = async (
  email: string,
  displayName?: string | null,
) => {
  const baseUrl = process.env.APP_URL || "https://denik.me"
  const dashUrl = new URL(baseUrl)
  dashUrl.pathname = "/dash"

  const sesTransport = getSesTransport()

  try {
    const result = await sesTransport.sendMail({
      from: getRemitent(),
      subject: "¡Bienvenid@ a Denik! Tu prueba gratis de 30 días ya empezó 🎉",
      to: email,
      html: welcomeTemplate({ dashUrl: dashUrl.toString(), displayName }),
    })
    return result
  } catch (error) {
    console.error("Error sending welcome email:", error)
    throw error
  }
}
