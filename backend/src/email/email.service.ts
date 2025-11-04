import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    if (!this.configService) {
      this.logger.warn('ConfigService not available. Using fallback email configuration.');
      this.transporter = nodemailer.createTransport({
        streamTransport: true,
        newline: 'unix',
      });
      return;
    }

    const emailUser = this.configService.get('EMAIL_USER');
    const emailPass = this.configService.get('EMAIL_PASS');

    if (!emailUser || !emailPass) {
      this.logger.warn(
        'Email credentials not configured. Emails will be logged to console only.',
      );
      // Create a test transporter that logs instead of sending
      this.transporter = nodemailer.createTransport({
        streamTransport: true,
        newline: 'unix',
      });
      return;
    }

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass, // Use App Password, not regular password
      },
    });
  }

  /**
   * Send teacher invitation email with setup link
   */
  async sendTeacherInvitation(
    email: string,
    name: string,
    invitationLink: string,
  ) {
    const subject = 'Welcome to EcoBlox! - Set Your Password';
    const html = this.getTeacherInvitationTemplate(name, invitationLink);

    try {
      const info = await this.transporter.sendMail({
        from: `"EcoBlox" <${this.configService.get('EMAIL_USER') || 'noreply@ecoblox.com'}>`,
        to: email,
        subject,
        html,
      });

      this.logger.log(`Teacher invitation email sent to ${email}`);
      this.logger.debug(`Message ID: ${info.messageId}`);

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      this.logger.error(`Failed to send email to ${email}:`, error);

      // In development, log the email content instead
      this.logger.log('=== EMAIL CONTENT (Dev Mode) ===');
      this.logger.log(`To: ${email}`);
      this.logger.log(`Subject: ${subject}`);
      this.logger.log(`Link: ${invitationLink}`);
      this.logger.log('================================');

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * HTML template for teacher invitation email
   */
  private getTeacherInvitationTemplate(
    name: string,
    invitationLink: string,
  ): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .content {
      padding: 30px;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background: #10b981;
      color: white !important;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
    }
    .footer {
      background: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to EcoBlox!</h1>
    </div>
    <div class="content">
      <p>Hello ${name},</p>

      <p>You've been invited to join EcoBlox as a teacher! We're excited to have you on board.</p>

      <p>To get started, please click the button below to set your password and activate your account:</p>

      <center>
        <a href="${invitationLink}" class="button">Set Your Password</a>
      </center>

      <p>Or copy and paste this link into your browser:</p>
      <p style="background: #f8f9fa; padding: 10px; border-radius: 5px; word-break: break-all;">
        ${invitationLink}
      </p>

      <p><strong>Note:</strong> This link will expire in 24 hours for security reasons.</p>

      <p>Once you've set your password, you'll be able to:</p>
      <ul>
        <li>Create and manage student accounts</li>
        <li>Monitor student progress</li>
        <li>View class leaderboards</li>
        <li>Access course materials</li>
      </ul>

      <p>If you have any questions, please don't hesitate to reach out!</p>

      <p>Best regards,<br>The EcoBlox Team</p>
    </div>
    <div class="footer">
      <p>This email was sent to ${name}. If you didn't expect this email, please ignore it.</p>
      <p>&copy; ${new Date().getFullYear()} EcoBlox. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Send student welcome email with login credentials
   */
  async sendStudentWelcome(email: string, name: string, pin: string) {
    const subject = 'Welcome to EcoBlox! - Your Login Credentials';
    const loginUrl = `${this.configService.get('FRONTEND_URL') || 'http://localhost:3000'}`;
    const html = this.getStudentWelcomeTemplate(name, email, pin, loginUrl);

    try {
      const info = await this.transporter.sendMail({
        from: `"EcoBlox" <${this.configService.get('EMAIL_USER') || 'noreply@ecoblox.com'}>`,
        to: email,
        subject,
        html,
      });

      this.logger.log(`Student welcome email sent to ${email}`);
      this.logger.debug(`Message ID: ${info.messageId}`);

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      this.logger.error(`Failed to send email to ${email}:`, error);

      // In development, log the email content instead
      this.logger.log('=== EMAIL CONTENT (Dev Mode) ===');
      this.logger.log(`To: ${email}`);
      this.logger.log(`Subject: ${subject}`);
      this.logger.log(`Email: ${email}`);
      this.logger.log(`PIN: ${pin}`);
      this.logger.log(`Login URL: ${loginUrl}`);
      this.logger.log('================================');

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * HTML template for student welcome email
   */
  private getStudentWelcomeTemplate(
    name: string,
    email: string,
    pin: string,
    loginUrl: string,
  ): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .content {
      padding: 30px;
    }
    .credentials-box {
      background: #f0fdf4;
      border: 2px solid #10b981;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .credential-item {
      margin: 15px 0;
    }
    .credential-label {
      font-weight: bold;
      color: #047857;
      display: block;
      margin-bottom: 5px;
    }
    .credential-value {
      font-size: 18px;
      font-family: 'Courier New', monospace;
      background: white;
      padding: 10px;
      border-radius: 5px;
      border: 1px solid #bbf7d0;
      display: block;
    }
    .pin-value {
      font-size: 32px;
      font-weight: bold;
      color: #059669;
      letter-spacing: 4px;
    }
    .button {
      display: inline-block;
      padding: 15px 40px;
      background: #10b981;
      color: white !important;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: bold;
      font-size: 16px;
    }
    .instructions {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 20px 0;
    }
    .footer {
      background: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎓 Welcome to EcoBlox!</h1>
    </div>
    <div class="content">
      <p>Hello ${name},</p>

      <p>Your student account has been created! We're excited to have you start your coding journey with us.</p>

      <div class="credentials-box">
        <h3 style="margin-top: 0; color: #047857;">Your Login Credentials</h3>

        <div class="credential-item">
          <span class="credential-label">Email:</span>
          <span class="credential-value">${email}</span>
        </div>

        <div class="credential-item">
          <span class="credential-label">PIN Code:</span>
          <span class="credential-value pin-value">${pin}</span>
        </div>
      </div>

      <center>
        <a href="${loginUrl}" class="button">Go to EcoBlox</a>
      </center>

      <div class="instructions">
        <h4 style="margin-top: 0;">📝 How to Login:</h4>
        <ol style="margin: 10px 0 0 20px; padding: 0;">
          <li>Click the button above or visit: <strong>${loginUrl}</strong></li>
          <li>Enter your email: <strong>${email}</strong></li>
          <li>Enter your 4-digit PIN: <strong>${pin}</strong></li>
          <li>Start learning and earning XP!</li>
        </ol>
      </div>

      <p><strong>Keep your PIN safe!</strong> This is your personal code to access your account and track your progress.</p>

      <p>Once you log in, you'll be able to:</p>
      <ul>
        <li>🎮 Complete interactive Roblox coding tutorials</li>
        <li>⚡ Earn XP points and badges</li>
        <li>🏆 Compete on class leaderboards</li>
        <li>📊 Track your learning progress</li>
      </ul>

      <p>If you have any questions or need help, ask your teacher!</p>

      <p>Happy coding!<br>The EcoBlox Team</p>
    </div>
    <div class="footer">
      <p>This email was sent to ${email}. If you didn't expect this email, please contact your teacher.</p>
      <p>&copy; ${new Date().getFullYear()} EcoBlox. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Send parent notification email when student account is created
   */
  async sendParentNotification(
    parentEmail: string,
    parentName: string,
    studentName: string,
    studentEmail: string,
    pin: string,
  ) {
    const subject = `${studentName}'s EcoBlox Account Created - Login Details Inside`;
    const loginUrl = `${this.configService.get('FRONTEND_URL') || 'http://localhost:3000'}`;
    const html = this.getParentNotificationTemplate(
      parentName,
      studentName,
      studentEmail,
      pin,
      loginUrl,
    );

    try {
      const info = await this.transporter.sendMail({
        from: `"EcoBlox" <${this.configService.get('EMAIL_USER') || 'noreply@ecoblox.com'}>`,
        to: parentEmail,
        subject,
        html,
      });

      this.logger.log(`Parent notification email sent to ${parentEmail}`);
      this.logger.debug(`Message ID: ${info.messageId}`);

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      this.logger.error(`Failed to send email to ${parentEmail}:`, error);

      // In development, log the email content instead
      this.logger.log('=== PARENT EMAIL CONTENT (Dev Mode) ===');
      this.logger.log(`To: ${parentEmail}`);
      this.logger.log(`Subject: ${subject}`);
      this.logger.log(`Student Email: ${studentEmail}`);
      this.logger.log(`PIN: ${pin}`);
      this.logger.log(`Login URL: ${loginUrl}`);
      this.logger.log('========================================');

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * HTML template for parent notification email
   */
  private getParentNotificationTemplate(
    parentName: string,
    studentName: string,
    studentEmail: string,
    pin: string,
    loginUrl: string,
  ): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .content {
      padding: 30px;
    }
    .credentials-box {
      background: #f0fdf4;
      border: 2px solid #10b981;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .credential-item {
      margin: 15px 0;
    }
    .credential-label {
      font-weight: bold;
      color: #047857;
      display: block;
      margin-bottom: 5px;
    }
    .credential-value {
      font-size: 18px;
      font-family: 'Courier New', monospace;
      background: white;
      padding: 10px;
      border-radius: 5px;
      border: 1px solid #bbf7d0;
      display: block;
    }
    .pin-value {
      font-size: 32px;
      font-weight: bold;
      color: #059669;
      letter-spacing: 4px;
    }
    .button {
      display: inline-block;
      padding: 15px 40px;
      background: #10b981;
      color: white !important;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: bold;
      font-size: 16px;
    }
    .instructions {
      background: #ecfdf5;
      border-left: 4px solid #10b981;
      padding: 15px;
      margin: 20px 0;
    }
    .important {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 20px 0;
    }
    .footer {
      background: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>👨‍👩‍👧‍👦 EcoBlox Student Account Created</h1>
    </div>
    <div class="content">
      <p>Hello ${parentName || 'Parent/Guardian'},</p>

      <p>A student account has been created for <strong>${studentName}</strong> on EcoBlox, our interactive coding education platform!</p>

      <p>Below are ${studentName}'s login credentials. Please keep this information safe and share it with your student:</p>

      <div class="credentials-box">
        <h3 style="margin-top: 0; color: #047857;">Login Credentials for ${studentName}</h3>

        <div class="credential-item">
          <span class="credential-label">Student Email:</span>
          <span class="credential-value">${studentEmail}</span>
        </div>

        <div class="credential-item">
          <span class="credential-label">PIN Code:</span>
          <span class="credential-value pin-value">${pin}</span>
        </div>
      </div>

      <center>
        <a href="${loginUrl}" class="button">Visit EcoBlox</a>
      </center>

      <div class="instructions">
        <h4 style="margin-top: 0;">📝 How Your Student Can Login:</h4>
        <ol style="margin: 10px 0 0 20px; padding: 0;">
          <li>Visit: <strong>${loginUrl}</strong></li>
          <li>Enter the email: <strong>${studentEmail}</strong></li>
          <li>Enter the 4-digit PIN: <strong>${pin}</strong></li>
          <li>Start learning and having fun with coding!</li>
        </ol>
      </div>

      <div class="important">
        <h4 style="margin-top: 0;">⚠️ Important - Keep This Safe!</h4>
        <p style="margin: 5px 0;">Please save these login credentials in a safe place. Your student will need them to access their account and continue their learning journey.</p>
      </div>

      <p><strong>What ${studentName} Can Do on EcoBlox:</strong></p>
      <ul>
        <li>🎮 Learn coding through interactive Roblox game development</li>
        <li>⚡ Earn XP points by completing coding challenges</li>
        <li>🏆 Earn badges and compete on class leaderboards</li>
        <li>📊 Track learning progress in real-time</li>
        <li>🎯 Build real games while learning programming concepts</li>
      </ul>

      <p>We're excited to help ${studentName} start this coding adventure! If you have any questions or concerns, please don't hesitate to contact your student's teacher.</p>

      <p>Best regards,<br>The EcoBlox Team</p>
    </div>
    <div class="footer">
      <p>This email was sent regarding ${studentName}'s student account.</p>
      <p>If you have questions, please contact your student's teacher or administrator.</p>
      <p>&copy; ${new Date().getFullYear()} EcoBlox. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Send test email to verify configuration
   */
  async sendTestEmail(to: string) {
    try {
      const info = await this.transporter.sendMail({
        from: `"EcoBlox" <${this.configService.get('EMAIL_USER') || 'noreply@ecoblox.com'}>`,
        to,
        subject: 'Test Email from EcoBlox',
        html: '<h1>Email Service is Working!</h1><p>If you received this, your email configuration is correct.</p>',
      });

      this.logger.log(`Test email sent to ${to}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      this.logger.error(`Failed to send test email:`, error);
      return { success: false, error: error.message };
    }
  }
}
