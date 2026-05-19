# 🔐 GigClaw Permissions Checklist

**Print this out or save it.** Check off each permission as you grant it.

---

## ✅ CRITICAL PERMISSIONS (Required for basic operation)

### 1. Accessibility Service ⭐ MOST IMPORTANT
**What it does:** Allows GigClaw to see your screen and tap buttons
**When to grant:** First time you open GigClaw
**How to enable:**
- [ ] Open phone Settings
- [ ] Go to Accessibility
- [ ] Find "Installed Services" or "Downloaded Services"
- [ ] Find "GigClaw" or "PhoneClaw"
- [ ] Toggle ON
- [ ] Tap "Allow" or "OK" on warning dialog
- [ ] Grant "Observe your actions" permission
- [ ] Grant "Retrieve window content" permission
- [ ] Grant "Perform gestures" permission

**Why needed:** Without this, GigClaw cannot see orders or tap Accept

---

### 2. Location Permission (Always Allow)
**What it does:** Lets GigClaw know where you are for geofence/zone checks
**When to grant:** When prompted or in Settings
**How to enable:**
- [ ] Settings → Apps → GigClaw → Permissions
- [ ] Location → "Allow all the time" or "Always allow"
- [ ] NOT "While using the app" — needs to work in background

**Why needed:** Calculates distance to pickup, checks if in work zone

---

## ✅ IMPORTANT PERMISSIONS (For full functionality)

### 3. Display Over Other Apps (Draw Over Apps)
**What it does:** Lets GigClaw show notifications/alerts on top of other apps
**When to grant:** When prompted
**How to enable:**
- [ ] Settings → Apps → Special app access → Display over other apps
- [ ] Find GigClaw → Toggle ON

**Why needed:** Shows alerts without switching apps

---

### 4. Battery Optimization (Disable)
**What it does:** Prevents Android from killing GigClaw to save battery
**When to grant:** After installation
**How to enable:**
- [ ] Settings → Apps → GigClaw → Battery
- [ ] Select "Unrestricted" or "Don't optimize"
- [ ] OR: Settings → Battery → Battery Optimization → All apps → GigClaw → "Don't optimize"

**Why needed:** Android kills background apps; this keeps GigClaw running

---

### 5. Notification Access
**What it does:** Lets GigClaw read notifications from gig apps
**When to grant:** When prompted
**How to enable:**
- [ ] Settings → Apps → Special app access → Notification access
- [ ] Find GigClaw → Toggle ON

**Why needed:** Some apps show orders as notifications first

---

## ✅ OPTIONAL PERMISSIONS (Nice to have)

### 6. Storage Access
**What it does:** Saves screenshots/logs for debugging
**When to grant:** If you want logs
**How to enable:**
- [ ] Settings → Apps → GigClaw → Permissions → Files/Media → Allow

**Why needed:** Debugging, saving settings backups

---

### 7. Camera (Not used by default)
**What it does:** Future feature for QR code scanning
**When to grant:** Not needed currently
**Status:** [ ] Skip for now

---

## 📋 QUICK SETUP CHECKLIST

### First Time Setup:
- [ ] Install GigClaw APK
- [ ] Open GigClaw app
- [ ] Grant Accessibility Service (CRITICAL)
- [ ] Grant Location (Always Allow)
- [ ] Disable Battery Optimization
- [ ] Grant Display Over Other Apps
- [ ] Grant Notification Access

### Configure GigClaw:
- [ ] Enter Telegram Bot Token
- [ ] Enter Telegram Chat ID
- [ ] Enter Google Geocoding API Key
- [ ] Configure app settings (min pay, etc.)
- [ ] Set up schedule & zones
- [ ] Configure guardrails

### Test:
- [ ] Start GigClaw monitoring
- [ ] Open a gig app
- [ ] Wait for order or mock one
- [ ] Check Telegram for notification

---

## 🚨 TROUBLESHOOTING PERMISSIONS

| Problem | Likely Cause | Fix |
|---------|--------------|-----|
| "GigClaw not working" | Accessibility OFF | Re-enable in Settings → Accessibility |
| "Can't detect location" | Location permission wrong | Change to "Always Allow" |
| "App keeps stopping" | Battery optimization ON | Disable battery optimization |
| "No notifications" | Notification access OFF | Enable in Settings |
| "Screen goes black" | Display over apps OFF | Enable draw over other apps |

---

## ⚠️ PERMISSION WARNINGS (Normal)

When you enable Accessibility, Android will warn you:
> "This app can observe your actions, retrieve window content, and perform gestures."

**This is NORMAL and REQUIRED.** GigClaw needs to:
- "Observe actions" → See when you open gig apps
- "Retrieve window content" → Read order details from screen
- "Perform gestures" → Tap the Accept button

**GigClaw does NOT:**
- Send your data to external servers
- Log into your accounts
- Share your information
- Work without your permission

All processing happens on YOUR phone.

---

## 📱 ANDROID VERSION NOTES

### Android 10+ (API 29+)
- Location permission has "Allow all the time" option
- Use that, not "While using app"

### Android 12+ (API 31+)
- May ask for "Nearby devices" permission
- This is for Bluetooth, not needed for GigClaw
- Can deny if not using Bluetooth features

### Android 13+ (API 33+)
- Notifications permission is separate
- Grant when prompted

### Samsung One UI
- Settings may be in different locations
- Search "accessibility" or "draw over apps" in Settings search

### Xiaomi MIUI
- Additional "Autostart" permission needed
- Settings → Apps → Permissions → Autostart → GigClaw ON

---

## ✅ VERIFICATION TEST

After granting all permissions:

1. Open GigClaw
2. Tap "Start Monitoring"
3. You should see: "🟢 Running" status
4. Open a gig app
5. GigClaw should detect it (check logs if available)

If status shows "🔴 Stopped" or errors, check permissions again.

---

**Save this file!** You'll need it when:
- Setting up on a new phone
- Android updates reset permissions
- Troubleshooting issues
- Helping someone else set up GigClaw
