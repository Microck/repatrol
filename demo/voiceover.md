# Repatrol Demo Voiceover (ElevenLabs TTS)

## Settings
- **Voice:** Pick a calm, confident male or female voice (e.g., "Adam", "Rachel", or "Antoni")
- **Stability:** 0.50
- **Clarity + Similarity Enhancement:** 0.75
- **Style:** 0 (neutral — no dramatic flair)
- **Speed:** Slightly slow

## Script

Repatrol. An autonomous swarm of AI agents that visually test your web apps, finding edge cases so your QA team doesn't have to.

Manual visual testing is slow, expensive, and error-prone. UI glitches and state crashes often slip into production because human testers can't click every combination of buttons on every release. 

Here's how Repatrol changes the game.

We are deploying the swarm against SkyBoost Travel, a React booking application. This app has a hidden, deterministic crash when a user adds too many seat upgrades before confirming their payment. It's an edge case the human QA team missed.

Watch the live run. The agents launch a headless browser and begin their work.

The Explorer Agent systematically navigates the interface using vision models. It maps out the "Home" and "Booking" states, analyzing the DOM and screenshots in real-time. 

Simultaneously, the Chaos Agent begins hammering the deterministic crash path, autonomously clicking "Add Seat Upgrade" over and over again.

Once it exceeds the legacy gateway's limit and clicks "Confirm Payment," it triggers a global unhandled exception in React. The UI unmounts completely.

The Bug Hunter confirms the crash. Instantly, the Reporter Agent kicks in. 

It compiles the visual evidence, maps the exact sequence of actions that caused the failure, and drafts a complete Markdown issue file, ready to be pushed directly to GitHub. 

High functional coverage, one critical React state bug discovered, and zero human intervention required. 

Built for the Microsoft AI Dev Days Hackathon twenty twenty-six. Thank you for watching.