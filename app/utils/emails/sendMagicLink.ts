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

  return sesTransport
    .sendMail({
      from: getRemitent(),
      subject: subject || "🗓️ Inicia sesión en Denik.me",
      to: email,
      html: magicLinkTemplate({ link: url.toString() }),
    })
    .then((r: unknown) => {
      console.log(r);
    })
    .catch((e: unknown) => console.log(e));
};
