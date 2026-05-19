# Expo EAS Build Skill

## Overview
Automated APK building for React Native/Expo projects using Expo Application Services (EAS).

## Prerequisites
- Expo account (linked to GitHub)
- Expo access token
- Project with eas.json configured

## Setup

### 1. Get Expo Access Token
1. Go to https://expo.dev/settings/access-tokens
2. Create new token
3. Save token securely

### 2. Configure Project
Ensure `eas.json` exists:
```json
{
  "cli": { "version": ">= 5.0.0" },
  "build": {
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" }
    }
  }
}
```

## Usage

### Build APK
```bash
# Set token
export EXPO_TOKEN=your_token_here

# Install EAS CLI
npm install -g eas-cli

# Build
cd [project-directory]
eas build -p android --profile preview --non-interactive
```

### Check Build Status
```bash
eas build:list --json
```

### Download APK
```bash
eas build:download --url [build-url]
```

## API Alternative
```bash
curl -X POST \
  -H "Authorization: Bearer $EXPO_TOKEN" \
  -H "Content-Type: application/json" \
  https://api.expo.dev/v2/projects/[project-id]/builds \
  -d '{
    "platform": "android",
    "profile": "preview",
    "gitCommitHash": "[commit-hash]"
  }'
```

## Automation
- Trigger on git push
- Schedule nightly builds
- Build on release tags

## Cost
- Free tier: 30 builds/month
- Paid: $29/month unlimited
