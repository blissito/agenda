/**
 * Initialize the job scheduler
 *
 * This module should be imported once when the server starts.
 * It initializes Agenda.js and starts processing jobs.
 */
import { startAgenda, stopAgenda } from "./agenda.server"

let initialized = false

/**
 * Initialize the job scheduler if not already initialized
 * Safe to call multiple times - will only initialize once
 */
export async function initJobScheduler(): Promise<void> {
  if (initialized) {
    return
  }

  try {
    await startAgenda()
    initialized = true
    console.log("[JobScheduler] Initialized successfully")

    // Graceful shutdown handlers
    const shutdown = async () => {
      console.log("[JobScheduler] Shutting down...")
      await stopAgenda()
      process.exit(0)
    }

    process.on("SIGTERM", shutdown)
    process.on("SIGINT", shutdown)
  } catch (error) {
    console.error("[JobScheduler] Failed to initialize:", error)
    // Don't throw - let the app continue without job scheduling
  }
}

// Auto-initialize when this module is imported
initJobScheduler().catch(console.error)
