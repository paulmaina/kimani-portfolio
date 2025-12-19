import os, re, datetime, requests, json
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import gspread
from google.oauth2 import service_account
from dotenv import load_dotenv

# Load environment variables from .env file (if it exists)
load_dotenv()

app = FastAPI()

# Feature flag: temporarily disable Supabase without removing the implementation.
# Set DISABLE_SUPABASE=false (or unset it) when you want to re‑enable Supabase.
DISABLE_SUPABASE = (os.getenv("DISABLE_SUPABASE") or "true").lower() in ("1", "true", "yes")

SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL") or ""
SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or ""
REST_URL = f"{SUPABASE_URL.rstrip('/')}/rest/v1/messages" if SUPABASE_URL else ""

HEADERS = {
  "apikey": SERVICE_KEY,
  "Authorization": f"Bearer {SERVICE_KEY}",
  "Content-Type": "application/json",
  "Prefer": "return=representation"
}

EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")

HCAPTCHA_SECRET = os.getenv("HCAPTCHA_SECRET") or ""

# Google Sheets configuration (optional)
GOOGLE_SHEET_ID = os.getenv("GOOGLE_SHEET_ID") or ""
GOOGLE_SHEET_NAME = os.getenv("GOOGLE_SHEET_NAME") or "Messages"
GOOGLE_CREDENTIALS_JSON = os.getenv("GOOGLE_CREDENTIALS_JSON") or ""

# Initialize Google Sheets client (optional)
sheets_client = None
if GOOGLE_CREDENTIALS_JSON and GOOGLE_SHEET_ID:
  try:
    creds_dict = json.loads(GOOGLE_CREDENTIALS_JSON)
    credentials = service_account.Credentials.from_service_account_info(
      creds_dict,
      scopes=['https://www.googleapis.com/auth/spreadsheets']
    )
    sheets_client = gspread.authorize(credentials)
  except Exception as e:
    print(f"Warning: Failed to initialize Google Sheets client: {e}")

def save_to_google_sheets(name: str, email: str, subject: str, message: str, ip: str):
  """Save message to Google Sheets (optional, won't fail if not configured)"""
  if not sheets_client or not GOOGLE_SHEET_ID:
    return None
  
  try:
    sheet = sheets_client.open_by_key(GOOGLE_SHEET_ID)
    try:
      worksheet = sheet.worksheet(GOOGLE_SHEET_NAME)
    except gspread.exceptions.WorksheetNotFound:
      # Create worksheet if it doesn't exist
      worksheet = sheet.add_worksheet(title=GOOGLE_SHEET_NAME, rows=1000, cols=10)
      # Add headers
      worksheet.append_row(["Timestamp", "Name", "Email", "Subject", "Message", "IP Address"])
    
    timestamp = datetime.datetime.utcnow().isoformat() + "Z"
    row_data = [timestamp, name, email, subject, message, ip]
    worksheet.append_row(row_data)
    return True
  except Exception as e:
    print(f"Error saving to Google Sheets: {e}")
    return None

@app.post("/api/submit-message")
async def submit_message(req: Request):
  try:
    body = await req.json()
  except Exception:
    return JSONResponse({"error": "Invalid JSON body"}, status_code=400)

  name = (body.get("name") or "").strip()
  email = (body.get("email") or "").strip()
  subject = (body.get("subject") or "").strip()
  message = (body.get("message") or "").strip()
  company = (body.get("company") or "").strip()
  captcha_token = (body.get("captchaToken") or "").strip()

  # Honeypot
  if company:
    return JSONResponse({"ok": True})

  if not (name and email and subject and message):
    return JSONResponse({"error": "Missing required fields"}, status_code=400)
  if not EMAIL_RE.match(email):
    return JSONResponse({"error": "Invalid email"}, status_code=400)

  # Verify hCaptcha when configured
  if HCAPTCHA_SECRET:
    try:
      verify = requests.post(
        "https://hcaptcha.com/siteverify",
        data={"secret": HCAPTCHA_SECRET, "response": captcha_token},
        timeout=10,
      )
      vj = verify.json()
      if not vj.get("success"):
        return JSONResponse({"error": "CAPTCHA verification failed"}, status_code=400)
    except Exception:
      return JSONResponse({"error": "CAPTCHA verification failed"}, status_code=400)

  ip = (req.headers.get("x-forwarded-for", "").split(",")[0].strip()) or (req.client.host if req.client else "unknown") or "unknown"
  payload = {"name": name, "email": email, "subject": subject, "message": message, "ip": ip}
  
  # -----------------------------
  # Supabase (rate limiting + save)
  # -----------------------------
  supabase_saved = False
  supabase_data = None
  supabase_error = None

  if not DISABLE_SUPABASE and SUPABASE_URL and SERVICE_KEY and REST_URL:
    # Naive rate limit: 1/min per IP
    minute_start = datetime.datetime.utcnow().replace(second=0, microsecond=0).isoformat()+"Z"
    query = {
      "select": "id,created_at",
      "ip": f"eq.{ip}",
      "created_at": f"gte.{minute_start}"
    }
    try:
      r = requests.get(REST_URL, headers=HEADERS, params=query, timeout=10)
    except Exception:
      return JSONResponse({"error": "Rate check failed"}, status_code=500)
    if r.status_code >= 400:
      return JSONResponse({"error": "Rate check failed"}, status_code=500)
    try:
      recent = r.json()
    except Exception:
      recent = []
    if recent:
      return JSONResponse({"error": "Too many requests. Please try again later."}, status_code=429)

    # Try to save to Supabase
    try:
      r2 = requests.post(REST_URL, headers=HEADERS, json=payload, timeout=10)
      if r2.status_code < 400:
        try:
          supabase_data = r2.json()
          supabase_data = supabase_data[0] if isinstance(supabase_data, list) else supabase_data
          supabase_saved = True
        except Exception:
          pass
      else:
        try:
          supabase_error = r2.json()
        except Exception:
          supabase_error = {"error": "Insert failed"}
    except Exception:
      supabase_error = {"error": "Insert failed"}
  else:
    # Supabase is intentionally disabled; keep the code but do not call it.
    supabase_error = {"error": "Supabase integration is currently disabled"}

  # Try to save to Google Sheets (even if Supabase failed)
  google_sheets_saved = False
  if sheets_client and GOOGLE_SHEET_ID:
    try:
      save_to_google_sheets(name, email, subject, message, ip)
      google_sheets_saved = True
    except Exception:
      pass  # Don't fail if Google Sheets save fails
  
  # Return success if at least one save succeeded
  if supabase_saved or google_sheets_saved:
    response_data = {
      "ok": True,
      "message": supabase_data,
      "saved_to": {
        "supabase": supabase_saved,
        "google_sheets": google_sheets_saved
      }
    }
    # Include warnings if one backend failed
    if not supabase_saved and supabase_error:
      response_data["warnings"] = [f"Supabase save failed: {supabase_error.get('error', 'Unknown error')}"]
    return JSONResponse(response_data)
  else:
    # Both failed
    errors = []
    if supabase_error:
      errors.append(f"Supabase: {supabase_error.get('error', 'Unknown error')}")
    if not google_sheets_saved and sheets_client:
      errors.append("Google Sheets: Save failed")
    return JSONResponse({"error": "Failed to save message. " + "; ".join(errors)}, status_code=500)


