# ElderEase — 10-Minute Grocery AI & Autonomous Multimodal Web Agent

> **MCA Final Project Full-Stack Implementation**  
> Connects your actual **Playwright Visual Web Agent** (powered by **LM Studio Qwen3-VL-8B** and **Google Gemini**) with an **Accessibility-First Web Application** engineered for **Elderly & Visually Impaired Users** with bilingual support for **English and தமிழ் (Tamil)**.

---

## 🌟 Architecture Overview

```
[ Elderly / Low-Vision User ]
   🎙️ Voice Input (Web Speech API: en-IN / ta-IN)
   💬 Chat Input & Big Keypad Touch Targets
                 ↕ (Real-Time WebSocket: ws://localhost:8000/ws)
[ FastAPI Live Agent Server (backend/live_agent_server.py) ]
   ├── Stage 1: Clarification Generator (LM Studio / Gemini)
   ├── Stage 2: Actionable Command Dispatcher
   └── Stage 3: Autonomous Visual Multimodal Loop
                 ↕ (Playwright Chromium)
[ Blinkit.com Web Automation ]
   ├── Injects .ai-agent-label red bounding boxes
   ├── Takes visual screenshots for multimodal vision model
   ├── Interactively serves Top 5 Product Cards to user UI
   ├── Prompts phone number & OTP verification
   └── Completes checkout and order placement
```

---

## 🚀 Quick Start Guide

### Step 1: Install Python Backend Dependencies
```bash
python -m pip install -r backend/requirements.txt
```

*(If running Playwright for the first time, install the Chromium browser binary)*:
```bash
playwright install chromium
```

### Step 2: Install Frontend Dependencies
```bash
npm install
```

### Step 3: Launch the Full Application

#### Terminal 1: Run the Live Agent WebSocket Backend
```bash
python backend/live_agent_server.py
```
> Runs at `http://localhost:8000` with WebSocket endpoint `ws://localhost:8000/ws`.

#### Terminal 2: Run the React Web UI
```bash
npm run dev
```
> Opens `http://localhost:3000` in your browser.

---

## 💡 Key Features for Viva & Project Presentation

1. **Elimination of Blocking `input()`**:
   Replaced synchronous console `input()` with an asynchronous threadsafe event bridge, enabling the Playwright agent to interact smoothly with the browser.
2. **Interactive Top 5 Product Cards (`show_results`)**:
   Top 5 Blinkit search results render as accessible product cards with direct touch and voice selection (*"Select number 1"* / *"ஒன்று"*).
3. **Live Visual Reasoning Stream**:
   Every visual step (`--- STEP N ---`, `AI Reasoning`, `Typing address...`, `Clicking cart...`) streams live to the web UI.
4. **Phone & Big Numeric OTP Keypad**:
   One-tap phone confirmation (`8508990457`) and large 60px numeric keypad with `autoComplete="one-time-code"` for native mobile SMS auto-fill.
5. **Language Bridge (English & தமிழ்)**:
   Elderly users can speak in Tamil, while the agent translates product names for Blinkit's English search bar and speaks back in Tamil.
6. **Offline Demo Simulator Mode**:
   Allows you to demonstrate the entire 10-Minute Kurkure ordering pipeline directly inside the browser even if LM Studio is not running on that network.
