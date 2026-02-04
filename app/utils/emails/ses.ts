import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2"
import nodemailer from "nodemailer"

const getSesClient = () => {
  // Crear nuevo cliente cada vez para asegurar credenciales frescas
  return new SESv2Client({
    region: process.env.SES_REGION,
    credentials: {
      accessKeyId: process.env.SES_API_KEY!,
      secretAccessKey: process.env.SES_SECRET_KEY!,
    },
  })
}

export const getSesTransport = () => {
  return nodemailer.createTransport({
    SES: {
      sesClient: getSesClient(),
      SendEmailCommand,
    },
  })
}

export const getRemitent = () =>
  process.env.SES_FROM_EMAIL || "Denik <hola@denik.me>"
