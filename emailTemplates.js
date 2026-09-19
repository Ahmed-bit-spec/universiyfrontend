// emailTemplates.js
// Professional HTML email templates with consistent design system
// All templates use: UNISO logo, green/black/white colors, clean typography, subtle animations

const LOGO_URL = "https://yoursite.com/logo-uniso.png"; // Replace with your CDN URL
const BRAND_COLOR = "#16a34a"; // Green
const DARK_BG = "#111827"; // Almost black
const LIGHT_BG = "#f9fafb"; // Very light gray
const TEXT_DARK = "#1f2937"; // Dark gray
const TEXT_LIGHT = "#6b7280"; // Medium gray

/**
 * Email wrapper with consistent branding
 */
const emailWrapper = (title, content, footerMessage = "") => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
      background-color: #f5f5f5;
      color: ${TEXT_DARK};
      line-height: 1.6;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .email-header {
      background: linear-gradient(135deg, ${DARK_BG} 0%, #1f3a1f 100%);
      padding: 40px 30px;
      text-align: center;
      border-bottom: 3px solid ${BRAND_COLOR};
    }
    .logo {
      height: 50px;
      width: auto;
      margin-bottom: 15px;
      animation: fadeInDown 0.6s ease-out;
    }
    .header-title {
      color: ${BRAND_COLOR};
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 5px;
      animation: fadeInUp 0.6s ease-out;
    }
    .header-subtitle {
      color: #d1d5db;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 1px;
      animation: fadeInUp 0.7s ease-out;
    }
    .email-body {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 16px;
      color: ${TEXT_DARK};
      margin-bottom: 20px;
      font-weight: 500;
    }
    .content-section {
      margin-bottom: 30px;
    }
    .content-section p {
      margin-bottom: 15px;
      color: ${TEXT_LIGHT};
      font-size: 15px;
    }
    .content-box {
      background: ${LIGHT_BG};
      border-left: 4px solid ${BRAND_COLOR};
      padding: 20px;
      border-radius: 6px;
      margin: 20px 0;
      animation: slideInLeft 0.5s ease-out;
    }
    .content-box-title {
      color: ${TEXT_DARK};
      font-weight: 600;
      margin-bottom: 12px;
      font-size: 15px;
    }
    .content-box p {
      margin: 8px 0;
      color: ${TEXT_DARK};
      font-size: 14px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      color: ${TEXT_LIGHT};
      font-weight: 500;
      font-size: 14px;
    }
    .info-value {
      color: ${TEXT_DARK};
      font-weight: 600;
      font-size: 14px;
    }
    .cta-button {
      display: inline-block;
      background: ${BRAND_COLOR};
      color: white;
      padding: 12px 30px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      margin: 20px 0;
      transition: background 0.3s ease;
      border: 2px solid ${BRAND_COLOR};
    }
    .cta-button:hover {
      background: #15803d;
    }
    .alert-box {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      border-radius: 6px;
      margin: 20px 0;
    }
    .alert-box p {
      color: #92400e;
      font-size: 14px;
    }
    .success-box {
      background: #dcfce7;
      border-left: 4px solid ${BRAND_COLOR};
      padding: 15px;
      border-radius: 6px;
      margin: 20px 0;
    }
    .success-box p {
      color: #166534;
      font-size: 14px;
    }
    .timer-box {
      background: #f3f4f6;
      border: 2px dashed ${BRAND_COLOR};
      padding: 25px;
      text-align: center;
      border-radius: 8px;
      margin: 20px 0;
      animation: pulse 2s ease-in-out infinite;
    }
    .timer-value {
      font-size: 48px;
      font-weight: 900;
      color: ${BRAND_COLOR};
      margin: 10px 0;
      letter-spacing: 2px;
    }
    .timer-label {
      font-size: 12px;
      color: ${TEXT_LIGHT};
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .email-footer {
      background: ${LIGHT_BG};
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .footer-text {
      color: ${TEXT_LIGHT};
      font-size: 13px;
      margin-bottom: 15px;
    }
    .footer-links {
      margin-bottom: 15px;
    }
    .footer-links a {
      color: ${BRAND_COLOR};
      text-decoration: none;
      font-size: 13px;
      margin: 0 10px;
    }
    .footer-links a:hover {
      text-decoration: underline;
    }
    .support-text {
      color: ${TEXT_LIGHT};
      font-size: 12px;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #d1d5db;
    }
    
    /* Animations */
    @keyframes fadeInDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    @keyframes slideInLeft {
      from {
        opacity: 0;
        transform: translateX(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.8;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <img src="${LOGO_URL}" alt="UNISO Library" class="logo">
      <h1 class="header-title">${title}</h1>
      <p class="header-subtitle">UNISO Digital Library</p>
    </div>
    <div class="email-body">
      ${content}
    </div>
    <div class="email-footer">
      ${footerMessage ? `<p class="footer-text">${footerMessage}</p>` : ""}
      <div class="footer-links">
        <a href="https://yoursite.com/dashboard">Dashboard</a>
        <a href="https://yoursite.com/help">Help</a>
        <a href="https://yoursite.com/contact">Contact</a>
      </div>
      <div class="support-text">
        <p>Need help? Contact our support team at <strong>support@uniso.edu</strong></p>
        <p style="margin-top: 10px; font-size: 11px;">© 2024 UNISO Library. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

/**
 * 1. WELCOME EMAIL (after registration)
 */
export const welcomeEmail = (userName) => {
  const content = `
    <div class="greeting">Welcome to UNISO Library, <strong>${userName}</strong>! 👋</div>
    
    <div class="content-section">
      <p>We're excited to have you join our digital library community. Your account has been created successfully.</p>
      
      <div class="success-box">
        <p>✓ Email verified and account activated</p>
      </div>
      
      <p><strong>What you can do now:</strong></p>
      <div class="content-box">
        <div class="content-box-title">📚 Explore & Borrow</div>
        <p>Browse thousands of books and reserve seats in our library.</p>
      </div>
      
      <div class="content-box">
        <div class="content-box-title">🪑 Reserve Study Seats</div>
        <p>Book your preferred study spot and arrive on time with QR check-in.</p>
      </div>
      
      <div class="content-box">
        <div class="content-box-title">✓ Verify Your Identity</div>
        <p>Link your university ID to unlock all library features.</p>
      </div>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://yoursite.com/dashboard" class="cta-button">Go to Dashboard</a>
    </div>
  `;
  
  return emailWrapper("Welcome to UNISO", content, "Get started by exploring the library or setting up your profile.");
};

/**
 * 2. EMAIL VERIFICATION CODE
 */
export const verificationCodeEmail = (userName, code, expiresMinutes = 15) => {
  const content = `
    <div class="greeting">Hi <strong>${userName}</strong>,</div>
    
    <div class="content-section">
      <p>To complete your account registration, please enter the verification code below:</p>
      
      <div class="timer-box">
        <div class="timer-label">Verification Code</div>
        <div class="timer-value">${code}</div>
        <div class="timer-label">Expires in ${expiresMinutes} minutes</div>
      </div>
      
      <div class="alert-box">
        <p>⏱️ This code expires in ${expiresMinutes} minutes. If you didn't request this, please ignore this email.</p>
      </div>
      
      <p>Paste this code on the verification page to activate your account.</p>
    </div>
  `;
  
  return emailWrapper("Verify Your Email", content);
};

/**
 * 3. RESERVATION CREATED
 */
export const reservationCreatedEmail = (userName, seatNumber, startTime, endTime, zone, qrCode) => {
  const start = new Date(startTime).toLocaleString("en-US", { 
    weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" 
  });
  const end = new Date(endTime).toLocaleString("en-US", { 
    hour: "2-digit", minute: "2-digit", hour12: true 
  });
  
  const content = `
    <div class="greeting">Hi <strong>${userName}</strong>,</div>
    
    <div class="content-section">
      <p>Your seat reservation has been confirmed! ✓</p>
      
      <div class="success-box">
        <p>Your reservation is ready. Please arrive on time for check-in.</p>
      </div>
      
      <div class="content-box">
        <div class="content-box-title">📍 Reservation Details</div>
        <div class="info-row">
          <span class="info-label">Seat Number</span>
          <span class="info-value">${seatNumber}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Zone</span>
          <span class="info-value">${zone || "Study Area"}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Date & Time</span>
          <span class="info-value">${start} – ${end}</span>
        </div>
        <div class="info-row">
          <span class="info-label">QR Code</span>
          <span class="info-value">${qrCode.substring(0, 8)}...</span>
        </div>
      </div>
      
      <div class="alert-box">
        <p>⏰ Check-in opens 15 minutes before your session. Be early!</p>
      </div>
      
      <p>You can view, reschedule, or cancel your reservation from your dashboard.</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://yoursite.com/reservations" class="cta-button">View Reservation</a>
    </div>
  `;
  
  return emailWrapper("Seat Reserved ✓", content);
};

/**
 * 4. RESERVATION REMINDER - 15 MINUTES LEFT
 */
export const reservation15minEmail = (userName, seatNumber, endTime) => {
  const end = new Date(endTime).toLocaleString("en-US", { 
    hour: "2-digit", minute: "2-digit", hour12: true 
  });
  
  const content = `
    <div class="greeting">Hi <strong>${userName}</strong>,</div>
    
    <div class="content-section">
      <p>⏰ Your study session ends in <strong>15 minutes!</strong></p>
      
      <div class="alert-box">
        <p>Seat <strong>${seatNumber}</strong> will be released at <strong>${end}</strong></p>
      </div>
      
      <p>Please wrap up your work and leave the seat for the next student. If you need more time, you can extend your reservation from the dashboard.</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://yoursite.com/reservations" class="cta-button">Extend Session</a>
    </div>
  `;
  
  return emailWrapper("15 Minutes Left ⏱️", content);
};

/**
 * 5. RESERVATION REMINDER - 10 MINUTES LEFT
 */
export const reservation10minEmail = (userName, seatNumber, endTime) => {
  const end = new Date(endTime).toLocaleString("en-US", { 
    hour: "2-digit", minute: "2-digit", hour12: true 
  });
  
  const content = `
    <div class="greeting">Hi <strong>${userName}</strong>,</div>
    
    <div class="content-section">
      <p>⏰ Your study session ends in <strong>10 minutes!</strong></p>
      
      <div class="alert-box">
        <p>Urgent: Seat <strong>${seatNumber}</strong> will be released at <strong>${end}</strong></p>
      </div>
      
      <p>Please save your work and prepare to leave. Thank you for using UNISO Library!</p>
    </div>
  `;
  
  return emailWrapper("10 Minutes Left ⏱️", content, "Your session will automatically end in 10 minutes.");
};

/**
 * 6. RESERVATION CANCELLED (Auto-cancelled due to no check-in)
 */
export const reservationAutoCancelledEmail = (userName, seatNumber, sessionTime) => {
  const content = `
    <div class="greeting">Hi <strong>${userName}</strong>,</div>
    
    <div class="content-section">
      <p>Your reservation has been automatically cancelled because you didn't check in within 15 minutes of your session start time.</p>
      
      <div class="content-box">
        <div class="content-box-title">❌ Cancelled Reservation</div>
        <div class="info-row">
          <span class="info-label">Seat Number</span>
          <span class="info-value">${seatNumber}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Session Time</span>
          <span class="info-value">${sessionTime}</span>
        </div>
      </div>
      
      <p>This seat is now available for other students to book. If you still need to study, you can make a new reservation anytime.</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://yoursite.com/book-seat" class="cta-button">Book Another Seat</a>
    </div>
  `;
  
  return emailWrapper("Reservation Cancelled", content);
};

/**
 * 7. BOOK BORROWED (Book Issued)
 */
export const bookBorrowedEmail = (userName, bookTitle, author, dueDate) => {
  const due = new Date(dueDate).toLocaleString("en-US", { 
    weekday: "long", year: "numeric", month: "long", day: "numeric" 
  });
  
  const content = `
    <div class="greeting">Hi <strong>${userName}</strong>,</div>
    
    <div class="content-section">
      <p>You have successfully borrowed a book from UNISO Library! 📚</p>
      
      <div class="success-box">
        <p>✓ Book issued and added to your account</p>
      </div>
      
      <div class="content-box">
        <div class="content-box-title">📖 Book Details</div>
        <div class="info-row">
          <span class="info-label">Title</span>
          <span class="info-value">${bookTitle}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Author</span>
          <span class="info-value">${author}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Due Date</span>
          <span class="info-value">${due}</span>
        </div>
      </div>
      
      <div class="alert-box">
        <p>⏰ Please return this book before the due date to avoid late fees.</p>
      </div>
      
      <p>You can view your active borrows and due dates from your dashboard.</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://yoursite.com/my-books" class="cta-button">View My Books</a>
    </div>
  `;
  
  return emailWrapper("Book Borrowed ✓", content);
};

/**
 * 8. BOOK RETURN REMINDER - 2 DAYS BEFORE DUE DATE
 */
export const bookReturnReminderEmail = (userName, bookTitle, daysLeft, dueDate) => {
  const due = new Date(dueDate).toLocaleString("en-US", { 
    weekday: "short", month: "short", day: "numeric" 
  });
  
  const content = `
    <div class="greeting">Hi <strong>${userName}</strong>,</div>
    
    <div class="content-section">
      <p>Reminder: You have a book to return soon! 📚</p>
      
      <div class="alert-box">
        <p>📖 <strong>${bookTitle}</strong> is due on <strong>${due}</strong> (${daysLeft} days left)</p>
      </div>
      
      <p>Please return this book to the library before the due date. Late returns may result in fines.</p>
      
      <p><strong>How to return:</strong></p>
      <div class="content-box">
        <p>Visit the library returns desk and provide your student ID. You can also check if renewal is available from your dashboard.</p>
      </div>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://yoursite.com/my-books" class="cta-button">Check Your Books</a>
    </div>
  `;
  
  return emailWrapper("Book Return Reminder 📚", content);
};

/**
 * 9. BOOK DUE DATE REACHED
 */
export const bookDueReachedEmail = (userName, bookTitle, dueDate) => {
  const due = new Date(dueDate).toLocaleString("en-US", { 
    weekday: "long", month: "long", day: "numeric" 
  });
  
  const content = `
    <div class="greeting">Hi <strong>${userName}</strong>,</div>
    
    <div class="content-section">
      <p>⚠️ Your book is now overdue!</p>
      
      <div class="alert-box">
        <p>📖 <strong>${bookTitle}</strong> was due on <strong>${due}</strong></p>
      </div>
      
      <p>Please return this book as soon as possible. Late fees may apply if not returned promptly.</p>
      
      <p><strong>Action Required:</strong></p>
      <div class="content-box">
        <p>Visit the library immediately or contact the library office to arrange a return or renewal.</p>
      </div>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://yoursite.com/contact" class="cta-button">Contact Library</a>
    </div>
  `;
  
  return emailWrapper("Book Overdue ⚠️", content);
};

/**
 * 10. BOOK RETURNED CONFIRMATION
 */
export const bookReturnedConfirmEmail = (userName, bookTitle) => {
  const content = `
    <div class="greeting">Hi <strong>${userName}</strong>,</div>
    
    <div class="content-section">
      <p>Thank you for returning your book! ✓</p>
      
      <div class="success-box">
        <p>📖 <strong>${bookTitle}</strong> has been received and processed.</p>
      </div>
      
      <p>Your account has been updated. You may now borrow another book if you'd like.</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://yoursite.com/books" class="cta-button">Browse More Books</a>
    </div>
  `;
  
  return emailWrapper("Book Returned ✓", content);
};