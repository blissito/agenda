import negativeReviewTemplate from "./negativeReviewTemplate";
import { getRemitent, getSesTransport } from "./ses";

export const sendNegativeReviewAlert = async ({
  email,
  customerName,
  serviceName,
  rating,
  comment,
  orgName,
}: {
  email: string;
  customerName: string;
  serviceName: string;
  rating: number;
  comment: string | null;
  orgName: string;
}) => {
  const baseUrl = process.env.APP_URL || "https://denik.me";
  const dashboardUrl = `${baseUrl}/dash/evaluaciones`;

  const sesTransport = getSesTransport();

  return sesTransport
    .sendMail({
      from: getRemitent(),
      subject: `⚠️ Nueva evaluación baja en ${serviceName}`,
      to: email,
      html: negativeReviewTemplate({
        customerName,
        serviceName,
        rating,
        comment,
        orgName,
        dashboardUrl,
      }),
    })
    .catch((e: unknown) => {
      console.error("Error sending negative review alert:", e);
    });
};
