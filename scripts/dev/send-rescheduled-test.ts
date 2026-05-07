import eventRescheduledTemplate from "~/utils/emails/eventRescheduledTemplate"
import { getRemitent, getSesTransport } from "~/utils/emails/ses"

const recipient = process.argv[2] || "brenda@fixter.org"
const sesTransport = getSesTransport()

const base = {
  oldDateString: "Lunes 12 de mayo, 2026 a las 11:00 hrs",
  newDateString: "Miércoles 14 de mayo, 2026 a las 16:30 hrs",
  serviceName: "Consulta general",
  minutes: 60,
  displayName: "Brenda",
  address: "Av. Reforma 123, CDMX",
  orgName: "Denik Demo",
  customerName: "Brenda",
  meetingLink: "https://meet.google.com/abc-defg-hij",
  termsAndConditions: undefined,
}

;(async () => {
  await sesTransport.sendMail({
    from: getRemitent(),
    subject: "[prueba] 🗓️ Tu cita cambió de fecha (cliente)",
    to: recipient,
    html: eventRescheduledTemplate({
      ...base,
      recipient: "customer",
      confirmLink: "https://www.denik.me/event/action?token=confirm",
      manageLink: "https://www.denik.me/mi-cuenta",
    }),
  })
  console.log("OK: cliente")

  await sesTransport.sendMail({
    from: getRemitent(),
    subject: "[prueba] 🗓️ Una cita se reagendó (owner)",
    to: recipient,
    html: eventRescheduledTemplate({
      ...base,
      recipient: "owner",
      meetingLink: undefined,
      manageLink: "https://www.denik.me/dash/agenda",
    }),
  })
  console.log("OK: owner")
  process.exit(0)
})()
