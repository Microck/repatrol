# Repatrol - Real-World Demo Script

This document details the flow for demonstrating **Repatrol** in a realistic scenario using a modern React/Vite application.

## The Scenario

You are an engineer at **SkyBoost Travel**, a platform for booking flights and seat upgrades.
Recently, users have been complaining about sporadic crashes during checkout. The QA team can't figure it out because it only happens under a very specific condition: **a user adding 7 or more seat upgrades before confirming payment**. 

Instead of manually clicking around for hours, you'll deploy **Repatrol** to automatically map the UI, find the edge case, and file the bug report.

## Setup

1. **Start the SkyBoost Web App:**
   ```bash
   cd demo/real-world-app
   npm install
   npm run dev
   ```
   Leave this terminal running. The app should be live on `http://localhost:5173/`. You can open this in your browser to briefly show the audience what the app looks like.

2. **Open a second terminal to run Repatrol:**
   ```bash
   cd projects/repatrol
   ```

## Demo Steps

### 1. Introduction
"Here is the SkyBoost Booking App. It looks fine, but we have a hidden edge case. Instead of testing it manually, we'll let Repatrol loose."

### 2. Launch the Swarm
In your second terminal, run the autonomous test suite against the live Vite server:
```bash
TARGET_GAME_URL=http://localhost:5173 npm run demo
```

**What's happening behind the scenes (Talk track):**
- **Explorer Agent** maps out the application by clicking standard actions (`Begin Booking`, `Add Seat Upgrade`, `Go Back`).
- **Chaos Agent** starts systematically hammering the deterministic crash path (clicking `Add Seat Upgrade` repeatedly).
- Once it exceeds 6 upgrades and hits `Confirm Payment`, the legacy payment gateway simulation throws an uncaught exception, which crashes the UI and logs the error.

### 3. Review the Results
Once the script completes, Repatrol will output the success summary and the path to the newly filed bug report:
```
bug_found: true
bug_path=...
```

### 4. Show the Artifacts
Navigate to the `artifacts` directory to show what the swarm collected automatically:
1. **The Issue Body (`artifacts/runs/<run_id>/issue_body.md`):** Show the markdown file Repatrol generated, which includes steps to reproduce, the exact error thrown, and the UI state path.
2. **The Screenshots (`artifacts/screenshots/`):** Show the `chaos-final.png` image that captures the exact visual state of the application the moment the crash occurred.
3. **The Coverage Data:** Show the JSON coverage payload proving the agents systematically explored the "HOME" and "BOOKING" states.

## Conclusion

"In under a minute, Repatrol autonomously navigated a completely unknown React application, discovered a critical payment overflow bug, captured visual evidence, and drafted a ready-to-merge GitHub issue."
