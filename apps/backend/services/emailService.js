export const sendAdminRegistrationConfirmation = async (adminData) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@alertx.com",
      to: adminData.email,
      subject: "📝 Admin Registration Received - AlertX",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3B82F6, #1D4ED8); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🛡️ AlertX Admin Panel</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Registration Received</p>
          </div>
          <div style="padding: 30px; background: #f8fafc;">
            <h2 style="color: #1e293b; margin-bottom: 20px;">Hello ${adminData.name},</h2>
            <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
              Your admin registration request has been received. Our team will review your request and notify you by email once your account is approved.
            </p>
            <div style="background: #fef3c7; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #92400e; font-weight: 500;">
                ⚠️ You will not be able to access the admin dashboard until your request is approved.
              </p>
            </div>
            <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
              If you have any questions, please contact support.
            </p>
          </div>
          <div style="background: #e2e8f0; padding: 20px; text-align: center; color: #64748b; font-size: 12px;">
            <p style="margin: 0;">AlertX Emergency Response System</p>
            <p style="margin: 5px 0 0 0;">This is an automated notification. Please do not reply to this email.</p>
          </div>
        </div>
      `,
    };
    await transporter.sendMail(mailOptions);
    console.log(`✅ Registration confirmation sent to: ${adminData.email}`);
  } catch (error) {
    console.error(
      `❌ Failed to send registration confirmation to ${adminData.email}:`,
      error
    );
  }
};
import nodemailer from "nodemailer";
import User from "../models/User.js";
import { USER_ROLES } from "../utils/constants.js";

// Email configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Get all super admins (existing active admins)
const getSuperAdmins = async () => {
  try {
    const superAdmins = await User.find({
      role: USER_ROLES.ADMIN,
      isActive: true,
      approvalStatus: "approved",
    }).select("email name");

    return superAdmins;
  } catch (error) {
    console.error("Error fetching super admins:", error);
    return [];
  }
};

// Send admin approval request notification
export const sendAdminApprovalRequest = async (newAdminData) => {
  try {
    const superAdmins = await getSuperAdmins();

    if (superAdmins.length === 0) {
      console.log("No super admins found to notify");
      return;
    }

    const transporter = createTransporter();

    const emailPromises = superAdmins.map(async (superAdmin) => {
      const mailOptions = {
        from: process.env.EMAIL_FROM || "noreply@alertx.com",
        to: superAdmin.email,
        subject: "🔐 New Admin Access Request - AlertX",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #3B82F6, #1D4ED8); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🛡️ AlertX Admin Panel</h1>
              <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">New Admin Access Request</p>
            </div>
            
            <div style="padding: 30px; background: #f8fafc;">
              <h2 style="color: #1e293b; margin-bottom: 20px;">Hello ${superAdmin.name},</h2>
              
              <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
                A new administrator access request has been submitted for the AlertX emergency response system.
              </p>
              
              <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #3B82F6;">
                <h3 style="color: #1e293b; margin-top: 0;">Applicant Details:</h3>
                <p style="margin: 5px 0; color: #475569;"><strong>Name:</strong> ${newAdminData.name}</p>
                <p style="margin: 5px 0; color: #475569;"><strong>Email:</strong> ${newAdminData.email}</p>
                <p style="margin: 5px 0; color: #475569;"><strong>Phone:</strong> ${newAdminData.phone}</p>
                <p style="margin: 5px 0; color: #475569;"><strong>Request Date:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
              
              <div style="background: #fef3c7; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #92400e; font-weight: 500;">
                  ⚠️ Please review this request carefully as admin access grants full system privileges.
                </p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/controls?section=users&tab=pending" 
                   style="background: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">
                  Review Request
                </a>
              </div>
              
              <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
                You can approve or reject this request from the Admin Dashboard → Controls → User Management section.
              </p>
            </div>
            
            <div style="background: #e2e8f0; padding: 20px; text-align: center; color: #64748b; font-size: 12px;">
              <p style="margin: 0;">AlertX Emergency Response System</p>
              <p style="margin: 5px 0 0 0;">This is an automated notification. Please do not reply to this email.</p>
            </div>
          </div>
        `,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(
          `✅ Admin approval notification sent to: ${superAdmin.email}`
        );
      } catch (error) {
        console.error(
          `❌ Failed to send notification to ${superAdmin.email}:`,
          error.message
        );
      }
    });

    await Promise.allSettled(emailPromises);
    console.log(
      `📧 Admin approval notifications sent to ${superAdmins.length} super admin(s)`
    );
  } catch (error) {
    console.error("Error sending admin approval notifications:", error);
  }
};

// Send admin approval confirmation
export const sendAdminApprovalConfirmation = async (adminData, approved) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@alertx.com",
      to: adminData.email,
      subject: approved
        ? "✅ Admin Access Approved - AlertX"
        : "❌ Admin Access Request Denied - AlertX",
      html: approved
        ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10B981, #059669); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Welcome to AlertX!</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Admin Access Approved</p>
          </div>
          
          <div style="padding: 30px; background: #f8fafc;">
            <h2 style="color: #1e293b; margin-bottom: 20px;">Hello ${adminData.name},</h2>
            
            <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
              Great news! Your administrator access request for the AlertX emergency response system has been approved.
            </p>
            
            <div style="background: #ecfdf5; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #10B981;">
              <h3 style="color: #065f46; margin-top: 0;">✅ Access Granted</h3>
              <p style="margin: 5px 0; color: #047857;">You now have full administrative privileges in the AlertX system.</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/controls" 
                 style="background: #10B981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">
                Go to Admin Controls
              </a>
            </div>
            
            <div style="background: #f1f5f9; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <h4 style="color: #1e293b; margin-top: 0;">Your Admin Credentials:</h4>
              <p style="margin: 5px 0; color: #475569;"><strong>Email:</strong> ${adminData.email}</p>
              <p style="margin: 5px 0; color: #64748b; font-size: 14px;">Use the password you set during registration</p>
            </div>
          </div>
          
          <div style="background: #e2e8f0; padding: 20px; text-align: center; color: #64748b; font-size: 12px;">
            <p style="margin: 0;">AlertX Emergency Response System</p>
          </div>
        </div>
      `
        : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #EF4444, #DC2626); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">❌ Access Request Denied</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">AlertX Admin Request</p>
          </div>
          
          <div style="padding: 30px; background: #f8fafc;">
            <h2 style="color: #1e293b; margin-bottom: 20px;">Hello ${adminData.name},</h2>
            
            <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
              We regret to inform you that your administrator access request for the AlertX emergency response system has been denied.
            </p>
            
            <div style="background: #fef2f2; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #EF4444;">
              <h3 style="color: #991b1b; margin-top: 0;">Request Status: Denied</h3>
              <p style="margin: 5px 0; color: #b91c1c;">If you believe this was an error, please contact our support team.</p>
            </div>
            
            <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
              If you have questions about this decision, please reach out to our support team for further assistance.
            </p>
          </div>
          
          <div style="background: #e2e8f0; padding: 20px; text-align: center; color: #64748b; font-size: 12px;">
            <p style="margin: 0;">AlertX Emergency Response System</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Approval confirmation sent to: ${adminData.email}`);
  } catch (error) {
    console.error(
      `❌ Failed to send confirmation to ${adminData.email}:`,
      error
    );
  }
};

export default {
  sendAdminApprovalRequest,
  sendAdminApprovalConfirmation,
  sendAdminRegistrationConfirmation,
};
