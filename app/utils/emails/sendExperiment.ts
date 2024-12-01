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
  //   uri: string = "http://localhost:3000",
  { when, subject }: { when?: string | Date; subject?: string }
) => {
  // generate token
  //   const token = await generateUserToken(email);
  //   const url = new URL(uri);
  //   url.pathname = "/signin";
  //   url.searchParams.set("token", token);
  //   return;
  return sendgridTransport
    .sendMail({
      from: "hola@formmy.app",
      subject: subject || "🔧 Experimentando 🪛",
      bcc: emails,
      html: `
      <article>
      <h1>Bliss' experiments</h1>
      <p>Hola pelusina, este corre debería llegarte en la noche del domingo ${new Date(
        when
      ).toLocaleString("es-MX", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      })}</p>
      </article>
      `,
    })
    .then((r: unknown) => {
      console.log(r);
    })
    .catch((e: unknown) => console.log(e));
};
