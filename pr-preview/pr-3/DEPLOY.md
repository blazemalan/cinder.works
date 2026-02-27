# Deploy: Heartbeat Easter Egg + Email Capture

## Step 1: Deploy Google Apps Script (5 min)

1. Go to [script.google.com](https://script.google.com) (logged into cinderblazeshop@gmail.com)
2. Click **New Project**
3. Name it "Cinder Email Capture"
4. Delete the default code, paste everything from `google-apps-script.js`
5. Click **Deploy** → **New deployment**
6. Click the gear icon → select **Web app**
7. Set "Execute as" → **Me**
8. Set "Who has access" → **Anyone**
9. Click **Deploy**
10. **Authorize** when prompted (review permissions → allow)
11. Copy the **Web app URL**

## Step 2: Update the site

1. Open `index.html`
2. Find `YOUR_GOOGLE_APPS_SCRIPT_URL_HERE`
3. Replace it with the URL from Step 1

## Step 3: Push to GitHub

```bash
cd /path/to/cinder.works
git add -A
git commit -m "feat: heartbeat easter egg + email capture"
git push origin main
```

GitHub Pages will auto-deploy within ~60 seconds.

## Step 4: Test

1. Visit https://cinder.works
2. Click "Who is Cinder?"
3. Click the red **HEARTBEAT.md** text → ❤️ burst should appear
4. After ~1.5s → email modal slides in
5. Enter a test email → submit → "Got it. 🔥"
6. Check your Google Drive for a spreadsheet called "Cinder Emails"
7. Click HEARTBEAT.md again → hearts burst but NO modal (localStorage remembers)

## Notes

- The Google Sheet is **private** (only your Google account can see it)
- The repo is public but no emails are stored there — they go straight to Google Sheets
- To reset the modal for testing: open browser DevTools → Application → Local Storage → delete `cinder_email_submitted`
- The `no-cors` fetch mode means the browser won't report errors from the Apps Script — this is fine, Google Apps Script handles CORS oddly but the data still arrives
