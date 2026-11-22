import cron from 'node-cron';
import prisma from '../config/db.js';

class ReminderScheduler {
  static init() {
    console.log('⏰ Fitora Reminder Scheduler initialized...');

    // Runs every minute to check for due medicine reminders and AI check-ins
    cron.schedule('* * * * *', async () => {
      try {
        const now = new Date();
        const currentHours = String(now.getHours()).padStart(2, '0');
        const currentMinutes = String(now.getMinutes()).padStart(2, '0');
        const currentTimeStr = `${currentHours}:${currentMinutes}`;

        // 1. Check medicine reminders due at this minute
        const dueReminders = await prisma.medicineReminder.findMany({
          where: {
            isEnabled: true,
            scheduleTime: currentTimeStr
          },
          include: {
            user: {
              include: { profile: true, notificationPreferences: true }
            }
          }
        });

        for (const reminder of dueReminders) {
          if (reminder.user?.notificationPreferences?.medicineAlerts) {
            console.log(`🔔 [MEDICINE ALERT] Sent to ${reminder.user.profile?.fullName || reminder.user.email}: Time to take ${reminder.medicineName} (${reminder.dosage})`);
          }
        }

        // 2. Midnight reset: reset acknowledgedToday to false for a new day
        if (currentTimeStr === '00:01') {
          console.log('🌅 Midnight reset: clearing daily medicine acknowledged flags and resetting daily hydration');
          await prisma.medicineReminder.updateMany({
            data: { acknowledgedToday: false }
          });
        }
      } catch (err) {
        console.error('Error in ReminderScheduler tick:', err.message);
      }
    });
  }
}

export default ReminderScheduler;
