# 📱 GigClaw Build Instructions

## Prerequisites

### Option 1: Windows with Android Studio (Recommended)

1. **Install Android Studio**
   - Download from: https://developer.android.com/studio
   - Install with default settings

2. **Install Node.js**
   - Download from: https://nodejs.org/ (LTS version)
   - Verify: `node --version`

3. **Install Java JDK 17**
   - Download from: https://adoptium.net/
   - Set JAVA_HOME environment variable

4. **Install Expo CLI**
   ```bash
   npm install -g expo-cli
   ```

### Option 2: Mac with Android Studio

Same as Windows, but use Homebrew for dependencies:
```bash
brew install node
brew install --cask adoptopenjdk17
brew install --cask android-studio
```

## Build Steps

### 1. Clone/Download the Repository

```bash
git clone https://github.com/Swiftsoftware143/gigclaw.git
cd gigclaw
```

Or download and extract the ZIP file.

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create `.env` file in project root:
```
GOOGLE_GEOCODING_API_KEY=your_key_here
```

### 4. Build Android App

#### Development Build (for testing):
```bash
npx expo run:android
```

#### Production APK:
```bash
cd android
./gradlew assembleRelease
```

APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

### 5. Install on Phone

```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

Or transfer APK to phone and install manually.

## First-Time Setup on Phone

### 1. Enable Developer Options
- Settings → About Phone → Tap "Build Number" 7 times

### 2. Enable USB Debugging
- Settings → Developer Options → USB Debugging

### 3. Install APK
- Connect phone via USB
- Run: `adb install app-release.apk`

### 4. Grant Permissions

**Critical: Enable Accessibility Service**
1. Settings → Accessibility → Installed Services
2. Find "PhoneClaw" or "GigClaw"
3. Toggle ON
4. Accept all permission prompts

**Other Permissions:**
- Location (Always Allow)
- Display over other apps
- Battery optimization → Don't optimize

### 5. Configure GigClaw

1. Open GigClaw app
2. Go to **⚙️ App Settings**
   - Enable desired gig apps
   - Set minimum pay per app
3. Go to **📅 Schedule & Zones**
   - Set your weekly schedule
   - Define work zones
4. Go to **🛡️ Guardrails**
   - Configure anti-detection settings
   - Start conservative!
5. Enter Telegram credentials
6. Enter Google Geocoding API key

### 6. Test

1. Open a gig app (Senpex, Curri, etc.)
2. Wait for an order to appear
3. Check if GigClaw detects it
4. Verify Telegram notifications

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails | Check JAVA_HOME, Android SDK path |
| App won't install | Enable "Install from unknown sources" |
| No accessibility option | Reinstall app, restart phone |
| Orders not detected | Check app package names in config |
| Location not working | Grant "Always" permission, not "While Using" |
| Telegram not working | Verify bot token and chat ID |

## Updating

To update after code changes:
```bash
git pull
npm install
npx expo run:android
```

## Support

See `GIGCLAW-README.md` for feature documentation.

See `TROUBLESHOOTING.md` for common issues.
