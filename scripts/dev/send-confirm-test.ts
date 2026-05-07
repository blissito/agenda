import appointmentCustomerTemplate from "~/utils/emails/appointmentCustomerTemplate"
import confirmAppointmentTemplate from "~/utils/emails/confirmAppointmentTemplate"
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
  termsAndConditions: undefined,
}

;(async () => {
  await sesTransport.sendMail({
    from: getRemitent(),
    subject: "[prueba] 🗓️ ¡Cita agendada! (sin botón confirmar)",
    to: recipient,
    html: appointmentCustomerTemplate({
      ...base,
      amount: 500,
      reservationNumber: "test-reservation-123",
      meetingLink: "https://meet.google.com/abc-defg-hij",
    }),
  })
  console.log("OK: cita agendada")

  await sesTransport.sendMail({
    from: getRemitent(),
    subject: "[prueba] ✅ Confirma tu cita (12h antes)",
    to: recipient,
    html: confirmAppointmentTemplate({
      ...base,
      confirmLink: "https://www.denik.me/event/action?token=confirm",
      meetingLink: "https://meet.google.com/abc-defg-hij",
      hoursUntil: 12,
    }),
  })
  console.log("OK: confirmación")
  process.exit(0)
})()
