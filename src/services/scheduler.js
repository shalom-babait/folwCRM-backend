import cron from 'node-cron';
import { getAppointmentsForReminders } from '../modules/appointments/appointments.repo.js';
import { sendMail } from './email.js';

/**
 * תזמון שליחת תזכורות לפגישות
 * רץ כל יום בשעה 12:00
 */
export function startReminderScheduler() {
  cron.schedule('0 12 * * *', async () => {
    console.log('🔔 Starting daily reminder job at', new Date().toLocaleString('he-IL'));
    
    try {
      const appointments = await getAppointmentsForReminders();
      
      if (!appointments || appointments.length === 0) {
        console.log('ℹ️ No appointments to remind today');
        return;
      }

      let sentCount = 0;
      const errors = [];

      for (const appointment of appointments) {
        const {
          appointment_date,
          start_time,
          end_time,
          therapist_name,
          therapist_email,
          patient_name,
          patient_email,
          room_name,
          group_name,
          type_name
        } = appointment;

        // פורמט תאריך נוח
        const formattedDate = new Date(appointment_date).toLocaleDateString('he-IL', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        const treatmentInfo = group_name || type_name || 'טיפול';

        // תוכן המייל למטופל - HTML
        const patientEmailHTML = `
        <!DOCTYPE html>
        <html dir="rtl" lang="he">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
                <tr>
                    <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                            <tr>
                                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                                    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🔔 תזכורת לפגישה</h1>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 40px 30px; text-align: center;">
                                    <p style="font-size: 18px; color: #333333; margin-bottom: 20px;">
                                        שלום <strong>${patient_name || 'מטופל יקר'}</strong>,
                                    </p>
                                    <p style="font-size: 16px; color: #666666; margin-bottom: 30px;">
                                        תזכורת לפגישה שלך במערכת Flow CRM
                                    </p>
                                    
                                    <div style="background-color: #f8f9fa; border-radius: 8px; padding: 25px; margin: 20px 0; text-align: right;">
                                        <table width="100%" cellpadding="8" cellspacing="0">
                                            <tr>
                                                <td style="font-size: 16px; color: #333333; padding: 8px;">
                                                    <strong>📅 תאריך:</strong>
                                                </td>
                                                <td style="font-size: 16px; color: #667eea; padding: 8px;">
                                                    ${formattedDate}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="font-size: 16px; color: #333333; padding: 8px;">
                                                    <strong>🕐 שעה:</strong>
                                                </td>
                                                <td style="font-size: 16px; color: #667eea; padding: 8px;">
                                                    ${start_time} - ${end_time}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="font-size: 16px; color: #333333; padding: 8px;">
                                                    <strong>👨‍⚕️ מטפל/ת:</strong>
                                                </td>
                                                <td style="font-size: 16px; color: #667eea; padding: 8px;">
                                                    ${therapist_name}
                                                </td>
                                            </tr>
                                            ${room_name ? `
                                            <tr>
                                                <td style="font-size: 16px; color: #333333; padding: 8px;">
                                                    <strong>🚪 חדר:</strong>
                                                </td>
                                                <td style="font-size: 16px; color: #667eea; padding: 8px;">
                                                    ${room_name}
                                                </td>
                                            </tr>
                                            ` : ''}
                                            ${treatmentInfo !== 'טיפול' ? `
                                            <tr>
                                                <td style="font-size: 16px; color: #333333; padding: 8px;">
                                                    <strong>💼 סוג טיפול:</strong>
                                                </td>
                                                <td style="font-size: 16px; color: #667eea; padding: 8px;">
                                                    ${treatmentInfo}
                                                </td>
                                            </tr>
                                            ` : ''}
                                        </table>
                                    </div>

                                </td>
                            </tr>
                            <tr>
                                <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
                                    <p style="margin: 0; color: #666666; font-size: 14px;">
                                        בברכה,<br>
                                        <strong style="color: #667eea;">צוות Flow CRM</strong>
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        `;

        // שליחה למטופל
        if (patient_email) {
          try {
            await sendMail({
              recipient: patient_email,
              subject: `תזכורת: פגישה מחר ב-${start_time} - Flow CRM`,
              html: patientEmailHTML
            });
            sentCount++;
            console.log(`✅ Sent reminder to patient: ${patient_name} (${patient_email})`);
          } catch (error) {
            console.error(`❌ Failed to send reminder to patient ${patient_name}:`, error);
            errors.push({ patient: patient_name, error: error.message });
          }
        }

        // תוכן מייל למטפל - HTML
        const therapistEmailHTML = `
        <!DOCTYPE html>
        <html dir="rtl" lang="he">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
                <tr>
                    <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                            <tr>
                                <td style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                                    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">👨‍⚕️ תזכורת לפגישה</h1>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 40px 30px; text-align: center;">
                                    <p style="font-size: 18px; color: #333333; margin-bottom: 20px;">
                                        שלום <strong>${therapist_name}</strong>,
                                    </p>
                                    <p style="font-size: 16px; color: #666666; margin-bottom: 30px;">
                                        תזכורת לפגישה שלך מחר
                                    </p>
                                    
                                    <div style="background-color: #f8f9fa; border-radius: 8px; padding: 25px; margin: 20px 0; text-align: right;">
                                        <table width="100%" cellpadding="8" cellspacing="0">
                                            <tr>
                                                <td style="font-size: 16px; color: #333333; padding: 8px;">
                                                    <strong>📅 תאריך:</strong>
                                                </td>
                                                <td style="font-size: 16px; color: #11998e; padding: 8px;">
                                                    ${formattedDate}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="font-size: 16px; color: #333333; padding: 8px;">
                                                    <strong>🕐 שעה:</strong>
                                                </td>
                                                <td style="font-size: 16px; color: #11998e; padding: 8px;">
                                                    ${start_time} - ${end_time}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="font-size: 16px; color: #333333; padding: 8px;">
                                                    <strong>🧑 מטופל/ת:</strong>
                                                </td>
                                                <td style="font-size: 16px; color: #11998e; padding: 8px;">
                                                    ${patient_name}
                                                </td>
                                            </tr>
                                            ${room_name ? `
                                            <tr>
                                                <td style="font-size: 16px; color: #333333; padding: 8px;">
                                                    <strong>🚪 חדר:</strong>
                                                </td>
                                                <td style="font-size: 16px; color: #11998e; padding: 8px;">
                                                    ${room_name}
                                                </td>
                                            </tr>
                                            ` : ''}
                                            ${treatmentInfo !== 'טיפול' ? `
                                            <tr>
                                                <td style="font-size: 16px; color: #333333; padding: 8px;">
                                                    <strong>💼 סוג טיפול:</strong>
                                                </td>
                                                <td style="font-size: 16px; color: #11998e; padding: 8px;">
                                                    ${treatmentInfo}
                                                </td>
                                            </tr>
                                            ` : ''}
                                        </table>
                                    </div>

                                    <p style="font-size: 18px; color: #11998e; font-weight: bold; margin-top: 30px;">
                                        בהצלחה! 🌟
                                    </p>
                                </td>
                            </tr>
                            <tr>
                                <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
                                    <p style="margin: 0; color: #666666; font-size: 14px;">
                                        בברכה,<br>
                                        <strong style="color: #11998e;">צוות Flow CRM</strong>
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        `;

        // שליחה למטפל
        if (therapist_email) {
          try {
            await sendMail({
              recipient: therapist_email,
              subject: `תזכורת: פגישה מחר ב-${start_time} עם ${patient_name}`,
              html: therapistEmailHTML
            });
            sentCount++;
            console.log(`✅ Sent reminder to therapist: ${therapist_name} (${therapist_email})`);
          } catch (error) {
            console.error(`❌ Failed to send reminder to therapist ${therapist_name}:`, error);
            errors.push({ therapist: therapist_name, error: error.message });
          }
        }
      }

      console.log(`✅ Reminder job completed: Sent ${sentCount} emails for ${appointments.length} appointments`);
      if (errors.length > 0) {
        console.log(`⚠️ Errors:`, errors);
      }

    } catch (error) {
      console.error('❌ Error in reminder scheduler:', error);
    }
  });

  console.log('✅ Reminder scheduler started - will run daily at 12:00');
}
