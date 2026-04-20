import { getRemitent, getSesTransport } from "./ses"
import trialWarningTemplate from "./trialWarningTemplate"

export const sendTrialWarning = async (
  email: string,
  displayName: string | null | undefined,
  daysLeft: number,
) => {
  const baseUrl = process.env.APP_URL || "https://denik.me"
  const plansUrl = new URL(baseUrl)
  plansUrl.pathname = "/planes"

  const sesTransport = getSesTransport()

  try {
    const result = await sesTransport.sendMail({
      from: getRemitent(),
      subject: "Tu prueba gratis termina pronto ⏳",
      to: email,
      html: trialWarningTemplate({
        plansUrl: plansUrl.toString(),
        displayName,
        daysLeft,
      }),
    })
    return result
  } catch (error) {
    console.error("Error sending trial warning email:", error)
    throw error
  }
}
