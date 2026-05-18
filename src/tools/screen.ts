/**
 * Screen Tools — read screen content, get UI tree, take screenshots
 */

import ClawAccessibilityModule from '../native/ClawAccessibilityModule';
import type { Tool } from './index';

// Direct exports for GigClaw
export async function getScreenText(): Promise<string> {
    return await ClawAccessibilityModule.getScreenText();
}

export async function captureScreen(): Promise<string> {
    return await ClawAccessibilityModule.takeScreenshot();
}

export const screenTools: Tool[] = [
    {
        name: 'getScreenText',
        description: 'Read all visible text on the current screen. Returns a concatenated string of all text and content descriptions.',
        parameters: [],
        execute: async () => {
            return await ClawAccessibilityModule.getScreenText();
        },
    },
    {
        name: 'getUITree',
        description: 'Get the full UI accessibility tree as structured JSON. Each node includes: className, text, contentDescription, bounds, isClickable, isScrollable, isEditable, viewId, childCount.',
        parameters: [],
        execute: async () => {
            return await ClawAccessibilityModule.getUITree();
        },
    },
    {
        name: 'takeScreenshot',
        description: 'Take a screenshot of the current screen and return the base64-encoded image',
        parameters: [],
        execute: async () => {
            return await ClawAccessibilityModule.takeScreenshot();
        },
    },
    {
        name: 'isServiceRunning',
        description: 'Check if the PhoneClaw accessibility service is currently enabled and connected',
        parameters: [],
        execute: async () => {
            return await ClawAccessibilityModule.isServiceRunning();
        },
    },
];
