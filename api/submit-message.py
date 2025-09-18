import os, re, datetime, requests
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()

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

@app.post("/api/submit-message")
async def submit_message(req: Request):
  if not SUPABASE_URL or not SERVICE_KEY:
    return JSONResponse({"error": "Server not configured: missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"}, status_code=500)

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

  payload = {"name": name, "email": email, "subject": subject, "message": message, "ip": ip}
  try:
    r2 = requests.post(REST_URL, headers=HEADERS, json=payload, timeout=10)
  except Exception:
    return JSONResponse({"error": "Insert failed"}, status_code=500)

  if r2.status_code >= 400:
    try:
      err = r2.json()
    except Exception:
      err = {"error": "Insert failed"}
    return JSONResponse(err, status_code=500)

  try:
    data = r2.json()
    data = data[0] if isinstance(data, list) else data
  except Exception:
    data = None
  return JSONResponse({"ok": True, "message": data})


