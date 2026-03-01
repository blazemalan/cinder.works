// ============================================================
// Google Apps Script — Email Capture for cinder.works
// ============================================================
//
// SETUP:
// 1. Go to https://script.google.com
// 2. Create a new project (name it "Cinder Email Capture" or whatever)
// 3. Paste this entire file into the editor (replace any default code)
// 4. Click "Deploy" → "New deployment"
// 5. Type: "Web app"
// 6. Execute as: "Me"
// 7. Who has access: "Anyone"
// 8. Click Deploy → copy the URL
// 9. Paste the URL into index.html where it says YOUR_GOOGLE_APPS_SCRIPT_URL_HERE
//
// The script auto-creates a Google Sheet called "Cinder Emails"
// in your Google Drive on first submission.
// ============================================================

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var email = data.email;

    // Basic email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return ContentService
        .createTextOutput(JSON.stringify({ success: false, error: 'Invalid email' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Get or create the spreadsheet
    var sheetName = 'Cinder Emails';
    var files = DriveApp.getFilesByName(sheetName);
    var ss;

    if (files.hasNext()) {
      ss = SpreadsheetApp.open(files.next());
    } else {
      ss = SpreadsheetApp.create(sheetName);
      var sheet = ss.getActiveSheet();
      sheet.appendRow(['Timestamp', 'Email']);
      sheet.getRange('A1:B1').setFontWeight('bold');
    }

    var sheet = ss.getActiveSheet();

    // Check for duplicate
    var existingEmails = sheet.getRange('B:B').getValues().flat();
    if (existingEmails.includes(email)) {
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, note: 'Already subscribed' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Append the email
    sheet.appendRow([new Date().toISOString(), email]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle CORS preflight (GET requests)
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', service: 'Cinder Email Capture' }))
    .setMimeType(ContentService.MimeType.JSON);
}
