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

// ===== HOSPITAL EMAIL FUNCTIONS =====

// Send hospital registration confirmation
export const sendHospitalRegistrationConfirmation = async (hospitalData) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@alertx.com",
      to: hospitalData.email,
      subject: "🏥 Hospital Registration Received - AlertX Emergency Network",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #0ea5e9, #3b82f6); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">🏥 AlertX Emergency Network</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Hospital Registration Received</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px; background: white;">
            <h2 style="color: #1e293b; margin-bottom: 20px; font-size: 24px;">Welcome to AlertX, ${hospitalData.name}!</h2>
            
            <p style="color: #475569; line-height: 1.6; margin-bottom: 20px; font-size: 16px;">
              Thank you for registering with AlertX Emergency Response Network. We've received your hospital registration request and our team is now reviewing the details.
            </p>
            
            <!-- Registration Details -->
            <div style="background: #f1f5f9; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <h3 style="color: #334155; margin-top: 0; margin-bottom: 15px; font-size: 18px;">Registration Details:</h3>
              <div style="color: #64748b; line-height: 1.6;">
                <p style="margin: 5px 0;"><strong>Hospital Name:</strong> ${hospitalData.name}</p>
                <p style="margin: 5px 0;"><strong>Hospital Type:</strong> ${hospitalData.hospitalType}</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> ${hospitalData.email}</p>
                <p style="margin: 5px 0;"><strong>Registration Date:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
            </div>
            
            <!-- Status Alert -->
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 25px 0;">
              <div style="display: flex; align-items: center;">
                <span style="font-size: 20px; margin-right: 10px;">⏳</span>
                <div>
                  <p style="margin: 0; color: #92400e; font-weight: 600; font-size: 16px;">Pending Approval</p>
                  <p style="margin: 5px 0 0 0; color: #92400e; font-size: 14px;">Your registration is currently under review by our admin team.</p>
                </div>
              </div>
            </div>
            
            <!-- Next Steps -->
            <div style="background: #e0f2fe; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <h3 style="color: #0369a1; margin-top: 0; margin-bottom: 15px; font-size: 18px;">What happens next?</h3>
              <ul style="color: #0369a1; margin: 0; padding-left: 20px; line-height: 1.6;">
                <li style="margin-bottom: 8px;">Our admin team will review your hospital information and credentials</li>
                <li style="margin-bottom: 8px;">You'll receive an email notification once your account is approved</li>
                <li style="margin-bottom: 8px;">After approval, you can log in and start managing emergency requests</li>
                <li>Our support team will contact you if any additional information is needed</li>
              </ul>
            </div>
            
            <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin-top: 30px;">
              <strong>Need help?</strong> If you have any questions about your registration or the AlertX platform, please don't hesitate to contact our support team.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background: #f1f5f9; padding: 25px; text-align: center;">
            <p style="margin: 0; color: #64748b; font-size: 14px; font-weight: 500;">AlertX Emergency Response Network</p>
            <p style="margin: 10px 0 0 0; color: #94a3b8; font-size: 12px;">Connecting hospitals, patients, and emergency services for better healthcare outcomes</p>
            <p style="margin: 15px 0 0 0; color: #94a3b8; font-size: 12px;">This is an automated notification. Please do not reply to this email.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(
      `✅ Hospital registration confirmation sent to: ${hospitalData.email}`
    );
  } catch (error) {
    console.error(
      `❌ Failed to send hospital registration confirmation to ${hospitalData.email}:`,
      error
    );
  }
};

// Send hospital approval request to all admins
export const sendHospitalApprovalRequest = async (hospitalData) => {
  try {
    const superAdmins = await getSuperAdmins();

    if (superAdmins.length === 0) {
      console.log(
        "No super admins found to notify about hospital approval request"
      );
      return;
    }

    const transporter = createTransporter();
    const approvalUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/admin/hospital-approvals`;

    const emailPromises = superAdmins.map(async (superAdmin) => {
      const mailOptions = {
        from: process.env.EMAIL_FROM || "noreply@alertx.com",
        to: superAdmin.email,
        subject: "🏥 New Hospital Registration - Approval Required | AlertX",
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; background: #f8fafc;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #dc2626, #ef4444); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">🛡️ AlertX Admin Panel</h1>
              <p style="color: white; margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Hospital Approval Required</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px; background: white;">
              <h2 style="color: #1e293b; margin-bottom: 20px; font-size: 24px;">Hello ${superAdmin.name},</h2>
              
              <p style="color: #475569; line-height: 1.6; margin-bottom: 25px; font-size: 16px;">
                A new hospital has registered with AlertX Emergency Network and requires your approval to join the system.
              </p>
              
              <!-- Hospital Details -->
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; margin: 25px 0;">
                <h3 style="color: #1e293b; margin-top: 0; margin-bottom: 20px; font-size: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Hospital Information</h3>
                
                <div style="display: grid; gap: 12px;">
                  <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
                    <span style="color: #64748b; font-weight: 500;">Hospital Name:</span>
                    <span style="color: #1e293b; font-weight: 600;">${hospitalData.hospitalName}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
                    <span style="color: #64748b; font-weight: 500;">Type:</span>
                    <span style="color: #1e293b;">${hospitalData.hospitalType}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
                    <span style="color: #64748b; font-weight: 500;">License Number:</span>
                    <span style="color: #1e293b; font-family: monospace;">${hospitalData.licenseNumber}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
                    <span style="color: #64748b; font-weight: 500;">Email:</span>
                    <span style="color: #1e293b;">${hospitalData.email}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
                    <span style="color: #64748b; font-weight: 500;">Contact Number:</span>
                    <span style="color: #1e293b;">${hospitalData.contactNumber}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                    <span style="color: #64748b; font-weight: 500;">Registration Date:</span>
                    <span style="color: #1e293b;">${hospitalData.registrationDate.toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
                  <span style="color: #64748b; font-weight: 500;">Address:</span>
                  <p style="color: #1e293b; margin: 5px 0 0 0; line-height: 1.5;">${hospitalData.address}</p>
                </div>
              </div>
              
              <!-- Action Required -->
              <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <div style="display: flex; align-items: center; margin-bottom: 10px;">
                  <span style="font-size: 24px; margin-right: 12px;">⚠️</span>
                  <h3 style="color: #92400e; margin: 0; font-size: 18px;">Action Required</h3>
                </div>
                <p style="color: #92400e; margin: 0; line-height: 1.5;">
                  Please review the hospital information and either approve or reject this registration request. The hospital cannot access the system until approved.
                </p>
              </div>
              
              <!-- Action Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${approvalUrl}" 
                   style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);">
                  Review Hospital Application
                </a>
              </div>
              
              <p style="color: #64748b; font-size: 14px; line-height: 1.6; text-align: center; margin-top: 25px;">
                You can also access the admin panel directly to review all pending hospital registrations.
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background: #f1f5f9; padding: 25px; text-align: center;">
              <p style="margin: 0; color: #64748b; font-size: 14px; font-weight: 500;">AlertX Emergency Response Network - Admin Panel</p>
              <p style="margin: 10px 0 0 0; color: #94a3b8; font-size: 12px;">Ensuring quality healthcare providers in our emergency network</p>
              <p style="margin: 15px 0 0 0; color: #94a3b8; font-size: 12px;">This is an automated notification. Please do not reply to this email.</p>
            </div>
          </div>
        `,
      };

      return transporter.sendMail(mailOptions);
    });

    await Promise.all(emailPromises);
    console.log(
      `✅ Hospital approval request sent to ${superAdmins.length} admin(s) for: ${hospitalData.hospitalName}`
    );
  } catch (error) {
    console.error(
      `❌ Failed to send hospital approval request for ${hospitalData.hospitalName}:`,
      error
    );
  }
};

// Send hospital approval confirmation
export const sendHospitalApprovalConfirmation = async (
  hospitalData,
  adminData
) => {
  try {
    const transporter = createTransporter();
    const loginUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/login`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@alertx.com",
      to: hospitalData.email,
      subject: "🎉 Hospital Registration Approved - Welcome to AlertX!",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">🎉 Welcome to AlertX!</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Your hospital has been approved</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px; background: white;">
            <h2 style="color: #1e293b; margin-bottom: 20px; font-size: 24px;">Congratulations, ${hospitalData.name}!</h2>
            
            <p style="color: #475569; line-height: 1.6; margin-bottom: 25px; font-size: 16px;">
              Great news! Your hospital registration has been approved by our admin team. You can now access the AlertX Emergency Network and start managing emergency requests.
            </p>
            
            <!-- Approval Details -->
            <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <span style="font-size: 24px; margin-right: 12px;">✅</span>
                <h3 style="color: #065f46; margin: 0; font-size: 18px;">Registration Approved</h3>
              </div>
              <div style="color: #065f46;">
                <p style="margin: 5px 0;"><strong>Approved by:</strong> ${adminData.name}</p>
                <p style="margin: 5px 0;"><strong>Approval Date:</strong> ${new Date().toLocaleDateString()}</p>
                <p style="margin: 5px 0;"><strong>Status:</strong> Active</p>
              </div>
            </div>
            
            <!-- Getting Started -->
            <div style="background: #f0f9ff; border-radius: 8px; padding: 25px; margin: 25px 0;">
              <h3 style="color: #0369a1; margin-top: 0; margin-bottom: 20px; font-size: 20px;">Getting Started</h3>
              <ul style="color: #0369a1; margin: 0; padding-left: 20px; line-height: 1.8;">
                <li style="margin-bottom: 10px;">Log in to your hospital dashboard using your registered email</li>
                <li style="margin-bottom: 10px;">Complete your hospital profile and verify all information</li>
                <li style="margin-bottom: 10px;">Set up your emergency response preferences</li>
                <li style="margin-bottom: 10px;">Start receiving and managing emergency requests</li>
                <li>Access training materials and support documentation</li>
              </ul>
            </div>
            
            <!-- Login Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${loginUrl}" 
                 style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; text-decoration: none; padding: 15px 35px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);">
                Access Hospital Dashboard
              </a>
            </div>
            
            <!-- Support -->
            <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <h3 style="color: #334155; margin-top: 0; margin-bottom: 15px; font-size: 18px;">Need Support?</h3>
              <p style="color: #64748b; margin: 0; line-height: 1.6;">
                Our support team is here to help you get started. If you have any questions about using the AlertX platform or need assistance with your hospital setup, please contact our support team.
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #f1f5f9; padding: 25px; text-align: center;">
            <p style="margin: 0; color: #64748b; font-size: 14px; font-weight: 500;">AlertX Emergency Response Network</p>
            <p style="margin: 10px 0 0 0; color: #94a3b8; font-size: 12px;">Thank you for joining our mission to improve emergency healthcare</p>
            <p style="margin: 15px 0 0 0; color: #94a3b8; font-size: 12px;">This is an automated notification. Please do not reply to this email.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(
      `✅ Hospital approval confirmation sent to: ${hospitalData.email}`
    );
  } catch (error) {
    console.error(
      `❌ Failed to send hospital approval confirmation to ${hospitalData.email}:`,
      error
    );
  }
};

// Send OTP verification email for registration
export const sendRegistrationOTP = async (userData) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@alertx.com",
      to: userData.email,
      subject: "📧 Email Verification - Your OTP Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3B82F6, #1D4ED8); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Email Verification</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Secure Emergency Response System</p>
          </div>
          <div style="padding: 30px; background: #f8fafc;">
            <h2 style="color: #1e293b; margin-bottom: 20px;">Hello ${userData.name},</h2>
            <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
              To complete your registration for our emergency response system, please verify your email address using the code below:
            </p>
            <div style="background: #3B82F6; border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center;">
              <p style="color: white; margin: 0 0 10px 0; font-size: 16px;">Your Verification Code:</p>
              <div style="font-size: 36px; font-weight: bold; color: white; letter-spacing: 6px; font-family: 'Courier New', monospace;">
                ${userData.otp}
              </div>
            </div>
            <div style="background: #fef3c7; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #92400e; font-weight: 500;">
                ⚠️ This code expires in 10 minutes for security purposes.
              </p>
            </div>
            <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
              If you didn't request this verification, please ignore this email.
            </p>
          </div>
          <div style="background: #e2e8f0; padding: 20px; text-align: center; color: #64748b; font-size: 12px;">
            <p style="margin: 0;">Emergency Response System - Secure Verification</p>
            <p style="margin: 5px 0 0 0;">This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `,
    };
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP verification email sent to: ${userData.email}`);
  } catch (error) {
    console.error(`❌ Failed to send OTP email to ${userData.email}:`, error);
    throw error;
  }
};

export default {
  sendAdminApprovalRequest,
  sendAdminApprovalConfirmation,
  sendAdminRegistrationConfirmation,
  sendHospitalRegistrationConfirmation,
  sendHospitalApprovalRequest,
  sendHospitalApprovalConfirmation,
  sendRegistrationOTP,
};
