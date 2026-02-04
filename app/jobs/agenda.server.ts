/**
 * Job Scheduler using Agenda.js with MongoDB backend
 *
 * Features:
 * - Persistent jobs (survives server restarts)
 * - Automatic recovery of pending jobs
 * - No separate workers needed (runs in same process)
 */
import { Agenda } from "@hokify/agenda";

// Singleton instance
let agenda: Agenda | null = null;

/**
 * Get or create the Agenda instance
 * Uses MongoDB as the backend (same database as Prisma)
 */
export const getAgenda = (): Agenda => {
  if (!agenda) {
    const mongoConnectionString = process.env.DATABASE_URL;

    if (!mongoConnectionString) {
      throw new Error("DATABASE_URL is required for job scheduler");
    }

    agenda = new Agenda({
      db: {
        address: mongoConnectionString,
        collection: "agendaJobs", // Collection name for jobs
      },
      processEvery: "30 seconds", // How often to poll for jobs
      maxConcurrency: 10, // Max concurrent jobs
    });

    // Error handling
    agenda.on("error", (error) => {
      console.error("[Agenda] Error:", error);
    });

    agenda.on("ready", () => {
      console.log("[Agenda] Job scheduler ready");
    });

    agenda.on("start", (job) => {
      console.log(`[Agenda] Job started: ${job.attrs.name}`, {
        id: job.attrs._id,
        data: job.attrs.data,
      });
    });

    agenda.on("complete", (job) => {
      console.log(`[Agenda] Job completed: ${job.attrs.name}`, {
        id: job.attrs._id,
      });
    });

    agenda.on("fail", (error, job) => {
      console.error(`[Agenda] Job failed: ${job.attrs.name}`, {
        id: job.attrs._id,
        error: error.message,
      });
    });
  }

  return agenda;
};

/**
 * Start the job processor
 * Call this once when the server starts
 */
export const startAgenda = async (): Promise<void> => {
  const ag = getAgenda();

  // Import job definitions
  await import("./definitions.server");

  await ag.start();
  console.log("[Agenda] Job processor started");
};

/**
 * Gracefully stop the job processor
 * Call this when shutting down the server
 */
export const stopAgenda = async (): Promise<void> => {
  if (agenda) {
    await agenda.stop();
    console.log("[Agenda] Job processor stopped");
  }
};

/**
 * Cancel all jobs for a specific event
 * Useful when an event is cancelled or deleted
 */
export const cancelEventJobs = async (eventId: string): Promise<number> => {
  const ag = getAgenda();
  return ag.cancel({ "data.eventId": eventId });
};
