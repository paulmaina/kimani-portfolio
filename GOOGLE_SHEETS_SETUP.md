# Google Sheets Setup Guide

The code integration is **complete**, but you need to configure Google Sheets credentials. Follow these steps:

## Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com/)
2. Create a new spreadsheet
3. Name it (e.g., "Portfolio Messages")
4. Copy the **Sheet ID** from the URL:
   - URL looks like: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`
   - Copy the `SHEET_ID_HERE` part

## Step 2: Create a Service Account in Google Cloud

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select or create a project
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **Service Account**
5. Fill in:
   - **Name**: `portfolio-messages-service` (or any name)
   - Click **Create and Continue**
   - Skip optional steps, click **Done**

## Step 3: Create and Download Service Account Key

1. In **Credentials** page, find your service account
2. Click on the service account email
3. Go to **Keys** tab
4. Click **Add Key** > **Create new key**
5. Select **JSON** format
6. Click **Create** - this downloads a JSON file
7. **Important**: Keep this file secure, never commit it to git

## Step 4: Enable Google Sheets API

1. In Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Google Sheets API"
3. Click on it and press **Enable**

## Step 5: Share Google Sheet with Service Account

1. Open your Google Sheet
2. Click **Share** button (top right)
3. Add the service account email (found in the JSON file as `client_email`)
4. Give it **Editor** permissions
5. Click **Send** (uncheck "Notify people" if you want)

## Step 6: Set Environment Variables

You need to set these environment variables:

### Required:
- `GOOGLE_SHEET_ID`: The Sheet ID from Step 1
- `GOOGLE_CREDENTIALS_JSON`: The entire contents of the JSON file (as a single-line JSON string)

### Optional:
- `GOOGLE_SHEET_NAME`: Worksheet name (default: "Messages")

### For Local Development:

You have **two options** to set environment variables:

#### Option 1: Create a `.env` file (Recommended - Easier)

**Good news!** The code automatically loads `.env` files, so this is the easiest method.

1. In your project root folder (same folder as `package.json`), create a file named `.env` (just `.env`, no extension)
2. Open the JSON file you downloaded from Google Cloud (the service account key)
3. Copy the **entire contents** of that JSON file
4. In your `.env` file, add these lines:

```env
GOOGLE_SHEET_ID=your-actual-sheet-id-here
GOOGLE_CREDENTIALS_JSON={"type":"service_account","project_id":"your-project","private_key_id":"abc123","private_key":"-----BEGIN PRIVATE KEY-----\nYourKeyHere\n-----END PRIVATE KEY-----\n","client_email":"your-service@project.iam.gserviceaccount.com","client_id":"123456789","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/your-service%40project.iam.gserviceaccount.com"}
GOOGLE_SHEET_NAME=Messages
```

**Important Notes:**
- Replace `your-actual-sheet-id-here` with the Sheet ID from Step 1
- Replace the entire `GOOGLE_CREDENTIALS_JSON` value with your actual JSON file content
- The JSON must be on **one single line** (no line breaks)
- Keep the quotes around the JSON
- If your JSON has newlines, remove them or replace `\n` with actual newlines (but it's easier to keep it as one line)

**Example of what your `.env` file should look like:**
```env
GOOGLE_SHEET_ID=1a2b3c4d5e6f7g8h9i0j
GOOGLE_CREDENTIALS_JSON={"type":"service_account","project_id":"my-portfolio-123","private_key_id":"xyz789","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n","client_email":"portfolio-service@my-portfolio-123.iam.gserviceaccount.com","client_id":"987654321","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/portfolio-service%40my-portfolio-123.iam.gserviceaccount.com"}
GOOGLE_SHEET_NAME=Messages
```

**How to convert your JSON file to one line:**
- **Windows**: Open the JSON file in Notepad, select all (Ctrl+A), copy (Ctrl+C), then paste it into the `.env` file on one line
- **Online tool**: Use https://jsonformatter.org/json-minify to minify your JSON
- **Manual**: Just remove all the line breaks and spaces between the JSON properties

#### Option 2: Export in Terminal/Command Prompt

If you prefer to set them in your terminal session:

**Windows (PowerShell):**
```powershell
$env:GOOGLE_SHEET_ID="your-sheet-id-here"
$env:GOOGLE_CREDENTIALS_JSON='{"type":"service_account",...}'  # Your full JSON here
$env:GOOGLE_SHEET_NAME="Messages"
```

**Windows (Command Prompt):**
```cmd
set GOOGLE_SHEET_ID=your-sheet-id-here
set GOOGLE_CREDENTIALS_JSON={"type":"service_account",...}
set GOOGLE_SHEET_NAME=Messages
```

**Mac/Linux:**
```bash
export GOOGLE_SHEET_ID="your-sheet-id-here"
export GOOGLE_CREDENTIALS_JSON='{"type":"service_account",...}'
export GOOGLE_SHEET_NAME="Messages"
```

**Note**: With Option 2, these variables only last for that terminal session. When you close the terminal, you'll need to set them again. Option 1 (`.env` file) is permanent.

### For Production (Vercel/Netlify/etc.):

1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add:
   - `GOOGLE_SHEET_ID`: Your sheet ID
   - `GOOGLE_CREDENTIALS_JSON`: The entire JSON content (as a single line)
   - `GOOGLE_SHEET_NAME`: "Messages" (optional)

## Step 7: Install Dependencies

Make sure you have the required packages:
```bash
pip install -r requirements.txt
```

This will install:
- `gspread` - For Google Sheets API
- `google-auth` - For Google authentication
- `python-dotenv` - For automatically loading `.env` files (makes setup easier!)

**Note**: After installing, the `.env` file will be automatically loaded when you run the FastAPI server. You don't need to do anything else!

## Step 8: Test It

1. Start your FastAPI server:
   ```bash
   uvicorn api.submit-message:app --reload
   ```

2. Submit a test message through your contact form

3. Check your Google Sheet - you should see a new row with:
   - Timestamp
   - Name
   - Email
   - Subject
   - Message
   - IP Address

## Troubleshooting

### "Warning: Failed to initialize Google Sheets client"
- Check that `GOOGLE_CREDENTIALS_JSON` is valid JSON
- Make sure the JSON is properly formatted (single line or escaped)
- Verify the service account credentials are correct

### "Error saving to Google Sheets"
- Check that the service account email has been shared with the Google Sheet
- Verify the Sheet ID is correct
- Ensure Google Sheets API is enabled in Google Cloud Console

### Messages not appearing in Google Sheets
- Check that the worksheet name matches `GOOGLE_SHEET_NAME` (default: "Messages")
- Verify the service account has Editor permissions
- Check server logs for error messages

## Important Notes

1. **The integration is optional** - Your Supabase integration will continue to work even if Google Sheets isn't configured
2. **If Supabase fails, it will still try to save to Google Sheets** (and vice versa)
3. **Never commit** the service account JSON file to version control
4. The worksheet will be **automatically created** with headers if it doesn't exist

## Current Status

✅ Code integration: **Complete**  
⏳ Configuration: **You need to do this** (Steps 1-6 above)

Once you complete the configuration, messages will automatically save to both Supabase and Google Sheets!

