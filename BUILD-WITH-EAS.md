# 🚀 Build GigClaw with Expo EAS (Easier Method)

If GitHub Actions keeps failing, use **Expo EAS Build** — it's more reliable for React Native apps.

## What is EAS?

**Expo Application Services (EAS)** — Cloud build service by Expo
- Builds your APK in the cloud
- No Android Studio needed
- More reliable than GitHub Actions for RN apps
- Free tier: 30 builds/month

## Setup Steps

### 1. Install EAS CLI

```bash
npm install -g eas-cli
```

### 2. Login to Expo

```bash
eas login
```
- Create account at https://expo.dev if needed
- Free account works fine

### 3. Configure Project

Already done — `eas.json` is in the repo.

### 4. Build APK

```bash
cd gigclaw
eas build -p android --profile preview
```

### 5. Wait for Build

- Takes 10-15 minutes
- You'll get a link to download APK
- Or run `eas build:list` to see status

### 6. Download APK

```bash
eas build:list
# Find your build, copy the URL
eas build:download --url <URL>
```

Or download from the link emailed to you.

---

## Alternative: Build Locally

If you have Android Studio:

```bash
cd gigclaw
npm install
npx expo run:android
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "eas: command not found" | Run `npm install -g eas-cli` |
| Build fails | Check `eas build:logs` |
| Need to cancel | `eas build:cancel` |
| Out of builds | Free tier = 30/month, or $29/month unlimited |

---

## Recommendation

**Use EAS Build** — it's what Expo recommends and handles all the Android SDK complexity for you.
