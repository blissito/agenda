import { generateUserToken } from "../tokens";
import magicLinkTemplate from "./magicLinkTemplate";
import nodemailer from "nodemailer";

// create transporter
export const sendgridTransport = nodemailer.createTransport({
  host: "smtp.sendgrid.net",
  port: 465,
  auth: {
    user: "apikey",
    pass: process.env.SENDGRID_KEY,
  },
});

export const sendMagicLink = async (email: string, uri: string) => {
  // generate token
  const token = await generateUserToken(email);
  const url = new URL(uri);
  url.pathname = "/signin";
  url.searchParams.set("token", token);
  //   return;
  return sendgridTransport
    .sendMail({
      from: "hola@formmy.app",
      subject: "🗓️ Inicia sesión en Denik.me",
      bcc: [email],
      html: magicLinkTemplate({ link: url.toString() }),
    })
    .then((r: any) => {
      console.log(r);
    })
    .catch((e: any) => console.log(e));
};
