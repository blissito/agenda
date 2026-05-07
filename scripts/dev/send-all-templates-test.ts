import appointmentCustomerTemplate from "~/utils/emails/appointmentCustomerTemplate"
import appointmentOwnerTemplate from "~/utils/emails/appointmentOwnerTemplate"
import confirmAppointmentTemplate from "~/utils/emails/confirmAppointmentTemplate"
import inviteCollaboratorTemplate from "~/utils/emails/inviteCollaboratorTemplate"
import magicLinkTemplate from "~/utils/emails/magicLinkTemplate"
import negativeReviewTemplate from "~/utils/emails/negativeReviewTemplate"
import paymentFailedTemplate from "~/utils/emails/paymentFailedTemplate"
import reminderTemplate from "~/utils/emails/reminderTemplate"
import { getRemitent, getSesTransport } from "~/utils/emails/ses"
import trialExpiredTemplate from "~/utils/emails/trialExpiredTemplate"
import trialWarningTemplate from "~/utils/emails/trialWarningTemplate"
import welcomeTemplate from "~/utils/emails/welcomeTemplate"

const recipient = process.argv[2] || "brenda@fixter.org"
const sesTransport = getSesTransport()

const baseAppointment = {
  displayName: "Brenda",
  amount: 500,
  address: "Av. Reforma 123, CDMX",
  dateString: "Lunes 12 de mayo, 2026 a las 11:00 hrs",
  minutes: 60,
  reservationNumber: "test-reservation-123",
  serviceName: "Consulta general",
  orgName: "Denik Demo",
  customerName: "Brenda",
  termsAndConditions: undefined,
}

const samples: { subject: string; html: string }[] = [
  {
    subject: "[prueba] 🪄 Magic link",
    html: magicLinkTemplate({ link: "https://www.denik.me/signin?token=test" }),
  },
  {
    subject: "[prueba] 🗓️ Cita agendada (cliente)",
    html: appointmentCustomerTemplate({
      ...baseAppointment,
      confirmLink: "https://www.denik.me/event/action?token=test",
      meetingLink: "https://meet.google.com/abc-defg-hij",
    }),
  },
  {
    subject: "[prueba] 🗓️ Nueva cita (owner)",
    html: appointmentOwnerTemplate({
      ...baseAppointment,
      link: "https://www.denik.me/dash",
    }),
  },
  {
    subject: "[prueba] ⏰ Recordatorio de cita",
    html: reminderTemplate({
      ...baseAppointment,
      modifyLink: "https://www.denik.me/event/action?token=modify",
      cancelLink: "https://www.denik.me/event/action?token=cancel",
      hoursUntil: 2,
    }),
  },
  {
    subject: "[prueba] 💳 Pago rechazado",
    html: paymentFailedTemplate({
      customerName: "Brenda",
      serviceName: "Consulta general",
      orgName: "Denik Demo",
      retryLink: "https://www.denik.me/retry",
    }),
  },
  {
    subject: "[prueba] ⭐ Reseña negativa",
    html: negativeReviewTemplate({
      customerName: "Brenda",
      serviceName: "Consulta general",
      rating: 2,
      comment: "El servicio fue bueno pero la espera muy larga.",
      orgName: "Denik Demo",
      dashboardUrl: "https://www.denik.me/dash",
    }),
  },
  {
    subject: "[prueba] 🎉 Bienvenida",
    html: welcomeTemplate({
      dashUrl: "https://www.denik.me/dash",
      displayName: "Brenda",
    }),
  },
  {
    subject: "[prueba] ⚠️ Trial por terminar",
    html: trialWarningTemplate({
      plansUrl: "https://www.denik.me/planes",
      displayName: "Brenda",
      daysLeft: 3,
    }),
  },
  {
    subject: "[prueba] 🚀 Trial expirado",
    html: trialExpiredTemplate({
      plansUrl: "https://www.denik.me/planes",
      displayName: "Brenda",
    }),
  },
  {
    subject: "[prueba] 👋 Invitación a colaborar",
    html: inviteCollaboratorTemplate({
      orgName: "Denik Demo",
      link: "https://www.denik.me/signin?token=invite",
    }),
  },
]

;(async () => {
  for (const { subject, html } of samples) {
    try {
      const res = await sesTransport.sendMail({
        from: getRemitent(),
        subject,
        to: recipient,
        html,
      })
      console.log("OK:", subject, "→", res?.messageId)
    } catch (err) {
      console.error("ERR:", subject, err)
    }
  }
  process.exit(0)
})()
