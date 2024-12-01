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

export const sendExperiment = async (
  emails: string[],
  { when, subject }: { when?: string | Date; subject?: string }
) => {
  const formatedDate = new Date(when).toLocaleString("es-MX", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formatedTime = new Date(when).toLocaleString("es-MX", {
    timeZone: "America/Mexico_City",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  });

  return sendgridTransport
    .sendMail({
      from: "hola@formmy.app",
      subject: subject || "🔧 Experimentando 🪛",
      bcc: emails,
      html: `
      <article>
      <h1>Bliss' experiments</h1>
      <p>Hola pelusina, este corre debería llegarte a las ${formatedTime} del ${formatedDate}</p>
      <p>DEBUGGING::${when}</p>
      </article>
      `,
    })
    .then((r: unknown) => {
      console.log(r);
    })
    .catch((e: unknown) => console.log(e));
};
