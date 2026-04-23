/**
 * Job Definitions for the Agenda scheduler
 *
 * Defines:
 * - send-reminder: Sends appointment reminder X hours before
 * - send-survey: Sends satisfaction survey after appointment ends
 */

import { db } from "~/utils/db.server"
import { sendReminder } from "~/utils/emails/sendReminder"
import { sendSurvey } from "~/utils/emails/sendSurvey"
import { sendTrialExpired } from "~/utils/emails/sendTrialExpired"
import { sendTrialWarning } from "~/utils/emails/sendTrialWarning"
import { getAgenda } from "./agenda.server"

const DEFAULT_REMINDER_HOURS = 4
const SURVEY_DELAY_MINUTES = 60 * 24 // 24 hours

type ReminderJobData = {
  eventId: string
}

type SurveyJobData = {
  eventId: string
}

const agenda = getAgenda()

/**
 * Send Reminder Job
 * Sends an email reminder to the customer before their appointment
 */
agenda.define("send-reminder", async (job) => {
  const { eventId } = job.attrs.data as ReminderJobData

  const event = await db.event.findUnique({
    where: { id: eventId },
    include: {
      customer: true,
      service: {
        include: {
          org: true,
        },
      },
    },
  })

  // Skip if event doesn't exist, is cancelled, or reminder already sent
  if (!event || event.status === "CANCELLED" || event.reminderSentAt) {
    console.log(
      `[send-reminder] Skipping event ${eventId}: not found, cancelled, or already sent`,
    )
    return
  }

  if (!event.customer || !event.service) {
    console.log(
      `[send-reminder] Skipping event ${eventId}: missing customer or service`,
    )
    return
  }

  try {
    await sendReminder({
      email: event.customer.email,
      event: event as any,
    })

    // Mark reminder as sent
    await db.event.update({
      where: { id: eventId },
      data: { reminderSentAt: new Date() },
    })

    console.log(`[send-reminder] Sent reminder for event ${eventId}`)
  } catch (error) {
    console.error(
      `[send-reminder] Failed to send reminder for event ${eventId}:`,
      error,
    )
    throw error // Re-throw to mark job as failed
  }
})

/**
 * Send Survey Job
 * Sends a satisfaction survey email after the appointment ends
 */
agenda.define("send-survey", async (job) => {
  const { eventId } = job.attrs.data as SurveyJobData

  const event = await db.event.findUnique({
    where: { id: eventId },
    include: {
      customer: true,
      service: {
        include: {
          org: true,
        },
      },
    },
  })

  // Skip if event doesn't exist, is cancelled, or survey already sent
  if (!event || event.status === "CANCELLED" || event.surveySentAt) {
    console.log(
      `[send-survey] Skipping event ${eventId}: not found, cancelled, or already sent`,
    )
    return
  }

  if (!event.customer || !event.service) {
    console.log(
      `[send-survey] Skipping event ${eventId}: missing customer or service`,
    )
    return
  }

  try {
    await sendSurvey({
      email: event.customer.email,
      event: event as any,
    })

    // Mark survey as sent
    await db.event.update({
      where: { id: eventId },
      data: { surveySentAt: new Date() },
    })

    console.log(`[send-survey] Sent survey for event ${eventId}`)
  } catch (error) {
    console.error(
      `[send-survey] Failed to send survey for event ${eventId}:`,
      error,
    )
    throw error
  }
})

/**
 * Schedule a reminder for an event
 * @param eventId - The event ID
 * @param eventStart - When the event starts
 * @param reminderHours - Hours before event to send reminder (default: 4)
 */
export const scheduleReminder = async (
  eventId: string,
  eventStart: Date,
  reminderHours: number = DEFAULT_REMINDER_HOURS,
): Promise<void> => {
  const reminderTime = new Date(
    eventStart.getTime() - reminderHours * 60 * 60 * 1000,
  )

  // Don't schedule if reminder time is in the past
  if (reminderTime <= new Date()) {
    console.log(
      `[scheduleReminder] Skipping event ${eventId}: reminder time already passed`,
    )
    return
  }

  await agenda.schedule(reminderTime, "send-reminder", { eventId })
  console.log(
    `[scheduleReminder] Scheduled reminder for event ${eventId} at ${reminderTime.toISOString()}`,
  )
}

/**
 * Schedule a survey for an event
 * @param eventId - The event ID
 * @param eventEnd - When the event ends
 */
export const scheduleSurvey = async (
  eventId: string,
  eventEnd: Date,
): Promise<void> => {
  const surveyTime = new Date(
    eventEnd.getTime() + SURVEY_DELAY_MINUTES * 60 * 1000,
  )

  // Don't schedule if survey time is in the past
  if (surveyTime <= new Date()) {
    console.log(
      `[scheduleSurvey] Skipping event ${eventId}: survey time already passed`,
    )
    return
  }

  await agenda.schedule(surveyTime, "send-survey", { eventId })
  console.log(
    `[scheduleSurvey] Scheduled survey for event ${eventId} at ${surveyTime.toISOString()}`,
  )
}

/**
 * Check Trials Job
 * Runs weekly (Mondays 9 AM CDMX). For each user with plan="TRIAL":
 * - Day 20-29: send warning email (once, idempotent via trialWarningEmailSentAt)
 * - Day >=30: send expired email, flip plan to "EXPIRED" (once, idempotent via trialExpiredEmailSentAt)
 */
agenda.define("check-trials", async () => {
  const now = new Date()
  const day20Cutoff = new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000)

  const warning = await db.user.findMany({
    where: {
      plan: "TRIAL",
      trialStartsAt: { lte: day20Cutoff },
      trialEndsAt: { gt: now },
      trialWarningEmailSentAt: null,
    },
  })

  for (const u of warning) {
    try {
      const daysLeft = u.trialEndsAt
        ? Math.max(
            0,
            Math.ceil(
              (u.trialEndsAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000),
            ),
          )
        : 0
      await sendTrialWarning(u.email, u.displayName, daysLeft)
      await db.user.update({
        where: { id: u.id },
        data: { trialWarningEmailSentAt: now },
      })
      console.log(`[check-trials] warning sent to ${u.email}`)
    } catch (err) {
      console.error(`[check-trials] warning failed for ${u.id}:`, err)
    }
  }

  const expired = await db.user.findMany({
    where: {
      plan: "TRIAL",
      trialEndsAt: { lte: now },
      trialExpiredEmailSentAt: null,
    },
  })

  for (const u of expired) {
    try {
      await sendTrialExpired(u.email, u.displayName)
      await db.user.update({
        where: { id: u.id },
        data: { plan: "EXPIRED", trialExpiredEmailSentAt: now },
      })
      console.log(`[check-trials] expired processed for ${u.email}`)
    } catch (err) {
      console.error(`[check-trials] expired failed for ${u.id}:`, err)
    }
  }

  console.log(
    `[check-trials] done: ${warning.length} warnings, ${expired.length} expirations`,
  )
})

/**
 * Schedule both reminder and survey for an event based on service config
 */
export const scheduleEventNotifications = async (
  eventId: string,
  eventStart: Date,
  eventEnd: Date,
  serviceConfig?: {
    reminder?: boolean
    survey?: boolean
    reminderHours?: number | null
  },
): Promise<void> => {
  const config = serviceConfig || {}

  if (config.reminder !== false) {
    const reminderHours = config.reminderHours ?? DEFAULT_REMINDER_HOURS
    await scheduleReminder(eventId, eventStart, reminderHours)
  }

  if (config.survey !== false) {
    await scheduleSurvey(eventId, eventEnd)
  }
}
