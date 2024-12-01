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
  const formatedDate = new Date(when).toLocaleDateString("es-MX", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const formatTime = new Date().toLocaleTimeString("es-MX", {
    hour: "numeric",
    timeZone: "America/Mexico_City",
  });

  return sendgridTransport
    .sendMail({
      from: "hola@formmy.app",
      subject: subject || "🔧 Experimentando 🪛",
      bcc: emails,
      html: `
      <article>
      <h1>Bliss' experiments</h1>
      <p>Hola pelusina, este corre debería llegarte a las ${formatTime} el ${formatedDate}</p>
      <p>DEBUGGING::${when}</p>
      </article>
      `,
    })
    .then((r: unknown) => {
      console.log(r);
    })
    .catch((e: unknown) => console.log(e));
};
