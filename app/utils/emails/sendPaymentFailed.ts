import paymentFailedTemplate from "./paymentFailedTemplate";
import { getRemitent, getSesTransport } from "./ses";

export const sendPaymentFailedEmail = async ({
  email,
  customerName,
  serviceName,
  orgName,
  retryLink,
}: {
  email: string;
  customerName: string;
  serviceName: string;
  orgName: string;
  retryLink: string;
}) => {
  const sesTransport = getSesTransport();

  return sesTransport
    .sendMail({
      from: getRemitent(),
      subject: "⚠️ Tu pago no pudo procesarse",
      to: email,
      html: paymentFailedTemplate({
        customerName,
        serviceName,
        orgName,
        retryLink,
      }),
    })
    .catch((e: unknown) => {
      console.error("Error sending payment failed email:", e);
    });
};
