#!/usr/bin/env npx tsx
import { sendWelcome } from "../../app/utils/emails/sendWelcome"
import { sendTrialWarning } from "../../app/utils/emails/sendTrialWarning"
import { sendTrialExpired } from "../../app/utils/emails/sendTrialExpired"

const TO = "brenda@fixter.org"
const NAME = "Brenda"

async function main() {
  console.log(`Sending trial-flow emails to ${TO}...`)

  const welcome = await sendWelcome(TO, NAME)
  console.log("✓ welcome sent:", welcome.messageId)

  const warning = await sendTrialWarning(TO, NAME, 7)
  console.log("✓ trial warning (7 días) sent:", warning.messageId)

  const expired = await sendTrialExpired(TO, NAME)
  console.log("✓ trial expired sent:", expired.messageId)

  console.log("Done.")
}

main().catch((err) => {
  console.error("Failed:", err)
  process.exit(1)
})
