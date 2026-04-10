import { generateUserToken } from "../tokens"
import inviteCollaboratorTemplate from "./inviteCollaboratorTemplate"
import { getRemitent, getSesTransport } from "./ses"

export const sendInviteCollaborator = async (
  email: string,
  orgName: string,
) => {
  const token = await generateUserToken(email)
  const baseUrl = process.env.APP_URL || "http://localhost:3000"
  const url = new URL(baseUrl)
  url.pathname = "/signin"
  url.searchParams.set("token", token)

  const sesTransport = getSesTransport()

  try {
    const result = await sesTransport.sendMail({
      from: getRemitent(),
      subject: `Te invitaron a colaborar en ${orgName}`,
      to: email,
      html: inviteCollaboratorTemplate({ orgName, link: url.toString() }),
    })
    return result
  } catch (error) {
    console.error("Error sending invite email:", error)
    // Don't throw — invite should succeed even if email fails
  }
}
