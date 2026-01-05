import { generateUserToken } from "../tokens";
import magicLinkTemplate from "./magicLinkTemplate";
import { getSesTransport, getRemitent } from "./ses";

export const sendMagicLink = async (
  email: string,
  uri: string = "http://localhost:3000",
  subject?: string
) => {
  // generate token
  const token = await generateUserToken(email);
  const url = new URL(uri);
  url.pathname = "/signin";
  url.searchParams.set("token", token);

  const sesTransport = getSesTransport();

  try {
    const result = await sesTransport.sendMail({
      from: getRemitent(),
      subject: subject || "🗓️ Inicia sesión en Denik.me",
      to: email,
      html: magicLinkTemplate({ link: url.toString() }),
    });
    console.log("Magic link sent successfully:", result);
    return result;
  } catch (error) {
    console.error("Error sending magic link:", error);
    throw error; // Propagar el error para que el action lo maneje
  }
};
