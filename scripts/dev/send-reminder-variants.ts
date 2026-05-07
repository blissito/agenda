import reminderTemplate from "~/utils/emails/reminderTemplate"
import { getRemitent, getSesTransport } from "~/utils/emails/ses"

const recipient = process.argv[2] || "brenda@fixter.org"
const sesTransport = getSesTransport()

const base = {
  displayName: "Brenda",
  address: "Av. Reforma 123, CDMX",
  dateString: "Lunes 12 de mayo, 2026 a las 11:00 hrs",
  minutes: 60,
  serviceName: "Consulta general",
  orgName: "Denik Demo",
  customerName: "Brenda",
  hoursUntil: 4,
  termsAndConditions: undefined,
  modifyLink: "https://www.denik.me/event/action?token=modify",
  cancelLink: "https://www.denik.me/event/action?token=cancel",
  confirmLink: "https://www.denik.me/event/action?token=confirm",
}

;(async () => {
  await sesTransport.sendMail({
    from: getRemitent(),
    subject: "[prueba] ⏰ Recordatorio (cita NO confirmada)",
    to: recipient,
    html: reminderTemplate({ ...base, isConfirmed: false }),
  })
  console.log("OK: recordatorio NO confirmada")

  await sesTransport.sendMail({
    from: getRemitent(),
    subject: "[prueba] ⏰ Recordatorio (cita YA confirmada)",
    to: recipient,
    html: reminderTemplate({ ...base, isConfirmed: true }),
  })
  console.log("OK: recordatorio confirmada")
  process.exit(0)
})()
