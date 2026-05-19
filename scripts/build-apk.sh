#!/bin/bash
# GigClaw APK Builder - Automated EAS Build Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 GigClaw APK Builder${NC}"
echo "========================"

# Check for Expo token
if [ -z "$EXPO_TOKEN" ]; then
    echo -e "${RED}❌ EXPO_TOKEN not set${NC}"
    echo "Get your token from: https://expo.dev/settings/access-tokens"
    echo "Then run: export EXPO_TOKEN=your_token_here"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "eas.json" ]; then
    echo -e "${RED}❌ eas.json not found. Are you in the project root?${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Installing EAS CLI...${NC}"
npm install -g eas-cli

echo -e "${YELLOW}🔐 Logging in to Expo...${NC}"
eas login --token "$EXPO_TOKEN"

echo -e "${YELLOW}🏗️ Starting build...${NC}"
eas build -p android --profile preview --non-interactive

echo -e "${GREEN}✅ Build triggered successfully!${NC}"
echo ""
echo -e "${YELLOW}📧 You will receive an email with the download link.${NC}"
echo -e "${YELLOW}⏱️ Build takes 10-15 minutes.${NC}"
echo ""
echo -e "${GREEN}To check status:${NC} eas build:list"
