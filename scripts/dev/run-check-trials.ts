/**
 * Ejecuta el job `check-trials` una vez contra la DB actual.
 * Uso: npx tsx scripts/dev/run-check-trials.ts
 *
 * Para probar en dev:
 * 1. Crear/pickear un user con plan="TRIAL" y manipular trialStartsAt/trialEndsAt.
 *    Ej: set trialStartsAt a hace 21 días → dispara el mail de warning.
 *    Ej: set trialEndsAt a hace 1 hora → dispara expired + flip a EXPIRED.
 * 2. Correr este script. Debe mandar el mail y setear el campo *SentAt.
 * 3. Correr de nuevo: NO debe duplicar (los campos *SentAt funcionan como guard).
 */

import { getAgenda, startAgenda, stopAgenda } from "../../app/jobs/agenda.server"

async function main() {
  console.log("[run-check-trials] starting agenda…")
  await startAgenda()
  const ag = getAgenda()

  console.log("[run-check-trials] enqueueing check-trials…")
  await ag.now("check-trials")

  // Give the job a moment to pick up and run (processEvery = 30s by default)
  console.log("[run-check-trials] waiting 45s for job to complete…")
  await new Promise((resolve) => setTimeout(resolve, 45_000))

  await stopAgenda()
  console.log("[run-check-trials] done")
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
