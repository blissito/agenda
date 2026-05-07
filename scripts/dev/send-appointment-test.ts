import appointmentCustomerTemplate from "~/utils/emails/appointmentCustomerTemplate"
import { getRemitent, getSesTransport } from "~/utils/emails/ses"

const recipient = process.argv[2] || "brenda@fixter.org"

const html = appointmentCustomerTemplate({
  displayName: "Brenda",
  confirmLink: "https://www.denik.me/event/action?token=test",
  amount: 500,
  address: "Av. Reforma 123, CDMX",
  dateString: "Lunes 12 de mayo, 2026 a las 11:00 hrs",
  minutes: 60,
  reservationNumber: "test-reservation-123",
  serviceName: "Consulta general",
  orgName: "Denik Demo",
  customerName: "Brenda",
  meetingLink: "https://meet.google.com/abc-defg-hij",
  termsAndConditions: undefined,
})

getSesTransport()
  .sendMail({
    from: getRemitent(),
    subject: "🗓️ ¡Cita agendada! (prueba)",
    to: recipient,
    html,
  })
  .then((res) => {
    console.log("OK:", recipient, res?.messageId || res)
    process.exit(0)
  })
  .catch((err) => {
    console.error("ERR:", err)
    process.exit(1)
  })
