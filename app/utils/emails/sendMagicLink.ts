import { generateUserToken } from "../tokens"
import magicLinkTemplate from "./magicLinkTemplate"
import { getRemitent, getSesTransport } from "./ses"

export const sendMagicLink = async (
  email: string,
  uri: string = "http://localhost:3000",
  subject?: string,
) => {
  // generate token
  const token = await generateUserToken(email)
  // Use APP_URL in production to avoid localhost issues behind reverse proxy
  const baseUrl = process.env.APP_URL || uri
  const url = new URL(baseUrl)
  url.pathname = "/signin"
  url.searchParams.set("token", token)

  const sesTransport = getSesTransport()

  try {
    const result = await sesTransport.sendMail({
      from: getRemitent(),
      subject: subject || "🗓️ Inicia sesión en Denik.me",
      to: email,
      html: magicLinkTemplate({ link: url.toString() }),
    })
    return result
  } catch (error) {
    console.error("Error sending magic link:", error)
    throw error
  }
}
