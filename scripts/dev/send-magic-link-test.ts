import { sendMagicLink } from "~/utils/emails/sendMagicLink"

const recipient = process.argv[2] || "brenda@fixter.org"

sendMagicLink(recipient, process.env.APP_URL || "https://www.denik.me")
  .then((res) => {
    console.log("OK:", recipient, res?.messageId || res)
    process.exit(0)
  })
  .catch((err) => {
    console.error("ERR:", err)
    process.exit(1)
  })
