import os
import smtplib
import logging
from datetime import datetime, timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from apscheduler.schedulers.background import BackgroundScheduler
from database import SessionLocal
from models import Asset

logger = logging.getLogger(__name__)

SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")
ALERT_EMAIL = os.getenv("ALERT_EMAIL", "")
WARRANTY_DAYS = int(os.getenv("WARRANTY_ALERT_DAYS", "30"))


def check_warranties():
    if not all([SMTP_HOST, SMTP_USER, SMTP_PASS, ALERT_EMAIL]):
        logger.info("SMTP not configured — skipping warranty check")
        return

    db = SessionLocal()
    try:
        cutoff = (datetime.utcnow() + timedelta(days=WARRANTY_DAYS)).strftime("%Y-%m-%d")
        today = datetime.utcnow().strftime("%Y-%m-%d")
        assets = db.query(Asset).filter(
            Asset.warranty_expiry != None,
            Asset.warranty_expiry <= cutoff,
            Asset.warranty_expiry >= today,
            Asset.status != "retired",
        ).all()

        if not assets:
            return

        rows = "\n".join(
            f"  - {a.asset_tag} | {a.name} | Expires: {a.warranty_expiry} | Assigned: {a.assigned_to or 'unassigned'}"
            for a in assets
        )
        body = f"""AssetTrack — Warranty Alert

{len(assets)} asset(s) have warranty expiring within {WARRANTY_DAYS} days:

{rows}

Please review and arrange renewals or replacements.

-- AssetTrack System
"""
        msg = MIMEMultipart()
        msg["From"] = SMTP_USER
        msg["To"] = ALERT_EMAIL
        msg["Subject"] = f"[AssetTrack] {len(assets)} warranty(s) expiring in {WARRANTY_DAYS} days"
        msg.attach(MIMEText(body, "plain"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.send_message(msg)

        logger.info(f"Warranty alert sent for {len(assets)} assets")
    except Exception as e:
        logger.error(f"Warranty email failed: {e}")
    finally:
        db.close()


def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(check_warranties, "cron", hour=8, minute=0)
    scheduler.start()
    return scheduler
