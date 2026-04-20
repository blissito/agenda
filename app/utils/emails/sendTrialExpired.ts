import { getRemitent, getSesTransport } from "./ses"
import trialExpiredTemplate from "./trialExpiredTemplate"

export const sendTrialExpired = async (
  email: string,
  displayName: string | null | undefined,
) => {
  const baseUrl = process.env.APP_URL || "https://denik.me"
  const plansUrl = new URL(baseUrl)
  plansUrl.pathname = "/planes"

  const sesTransport = getSesTransport()

  try {
    const result = await sesTransport.sendMail({
      from: getRemitent(),
      subject: "Tu prueba gratis terminó — actualiza tu plan 🚀",
      to: email,
      html: trialExpiredTemplate({
        plansUrl: plansUrl.toString(),
        displayName,
      }),
    })
    return result
  } catch (error) {
    console.error("Error sending trial expired email:", error)
    throw error
  }
}
