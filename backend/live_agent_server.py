import asyncio
import json
import logging
import os
import re
import base64
import threading
import queue
import time
from datetime import datetime
from typing import Optional, Dict, Any, List

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

# Optional imports with safe fallbacks
try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

try:
    from playwright.sync_api import sync_playwright
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False

try:
    from playwright_stealth import stealth_sync
    STEALTH_AVAILABLE = True
except ImportError:
    STEALTH_AVAILABLE = False

try:
    from google import genai
    from google.genai import types
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("ElderEase-LiveAgent")

# ==========================================
# CONFIGURATIONS (from your actual script)
# ==========================================

LM_STUDIO_URL = os.getenv("LM_STUDIO_URL", "http://100.116.69.78:1234/v1")
MODEL_NAME = os.getenv("LM_STUDIO_MODEL", "qwen/qwen3-vl-8b")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "YOUR_GEMINI_API_KEY_HERE")

local_client = None
if OPENAI_AVAILABLE:
    try:
        local_client = OpenAI(
            base_url=LM_STUDIO_URL,
            api_key="lm-studio",
            timeout=120.0
        )
    except Exception as e:
        logger.warning("Could not initialize Local OpenAI client: %s", e)

gemini_client = None
if GEMINI_AVAILABLE and GEMINI_API_KEY and GEMINI_API_KEY != "YOUR_GEMINI_API_KEY_HERE":
    try:
        gemini_client = genai.Client(api_key=GEMINI_API_KEY)
    except Exception as e:
        logger.warning("Could not initialize Gemini client: %s", e)

# ==========================================
# FASTAPI APPLICATION SETUP
# ==========================================

app = FastAPI(
    title="ElderEase Multimodal Agent WebSocket Server",
    description="Real-time web execution bridge connecting ElderEase UI with Playwright and LM Studio / Gemini",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "ElderEase Multimodal Visual Agent",
        "ws_endpoint": "ws://localhost:8000/ws",
        "playwright_installed": PLAYWRIGHT_AVAILABLE,
        "lm_studio_configured": local_client is not None,
        "gemini_configured": gemini_client is not None,
        "timestamp": datetime.now().isoformat()
    }

# ==========================================
# HELPER FUNCTIONS (from your actual script)
# ==========================================

def get_clean_text(raw_text: str, prefix: str) -> str:
    """Remove <think> tags and grab the specific formatted text from local LLM."""
    clean_text = re.sub(r'<think>.*?</think>', '', raw_text, flags=re.DOTALL).strip()
    if prefix in clean_text:
        return prefix + clean_text.split(prefix)[-1]
    return clean_text

def get_interactive_elements(page):
    """Extract and tag interactable elements on the webpage for AI processing."""
    js_code = """
    () => {
        document.querySelectorAll('.ai-agent-label').forEach(el => el.remove());
        document.querySelectorAll('[custom-agent-id]').forEach(el => el.removeAttribute('custom-agent-id'));

        let interactables = Array.from(document.querySelectorAll('a, button, input, textarea, select, [role="button"], [tabindex="0"], li'));
        
        let potentialClickables = document.querySelectorAll('div, span, p, svg');
        potentialClickables.forEach(el => {
            let style = window.getComputedStyle(el);
            if (style.cursor === 'pointer') {
                interactables.push(el);
            }
        });

        let idCounter = 0;
        let taggedElements = []; 
        let returnedElements = [];

        interactables.forEach((el) => {
            let rect = el.getBoundingClientRect();
            let style = window.getComputedStyle(el);
            
            if (rect.width < 5 || rect.height < 5 || 
                rect.top < 0 || rect.top > window.innerHeight || 
                rect.left < 0 || rect.left > window.innerWidth ||
                style.opacity === '0' || style.visibility === 'hidden' || style.display === 'none') {
                return;
            }

            let cx = rect.left + rect.width / 2;
            let cy = rect.top + rect.height / 2;
            let topEl = document.elementFromPoint(cx, cy);
            
            if (!topEl || (!el.contains(topEl) && !topEl.contains(el))) {
                return;
            }

            let isDuplicate = taggedElements.some(tagged => {
                let dTop = Math.abs(tagged.rect.top - rect.top);
                let dLeft = Math.abs(tagged.rect.left - rect.left);
                return dTop < 10 && dLeft < 10;
            });

            if (isDuplicate) return;

            let label = document.createElement('div');
            label.className = 'ai-agent-label';
            label.innerText = idCounter;
            
            Object.assign(label.style, {
                position: 'absolute',
                top: (window.scrollY + Math.max(0, rect.top)) + 'px',
                left: (window.scrollX + Math.max(0, rect.left)) + 'px',
                backgroundColor: '#ff0000',
                color: 'white',
                padding: '2px 5px',
                fontSize: '14px',
                fontWeight: 'bold',
                zIndex: '2147483647',
                pointerEvents: 'none',
                border: '2px solid yellow',
                borderRadius: '3px',
                boxShadow: '0px 0px 3px black'
            });
            
            document.body.appendChild(label);
            el.setAttribute('custom-agent-id', idCounter);
            
            let text = el.innerText || el.placeholder || el.value || el.ariaLabel || el.name || "";
            text = text.replace(/\\n/g, ' ').trim();
            
            returnedElements.push({
                "id": idCounter,
                "type": el.tagName.toLowerCase(),
                "text": text.substring(0, 100)
            });

            taggedElements.push({ el: el, rect: rect });
            idCounter++;
        });

        return returnedElements;
    }
    """
    return page.evaluate(js_code)

def ask_llm(goal, elements_list, action_history, screenshot_bytes, previous_error=None):
    """THE MULTIMODAL BRAIN: Tries Local LLM first, falls back to Gemini on failure."""
    prompt = f"""
    You are an autonomous visual web agent. 
    Your ultimate goal is: "{goal}"
    
    Here is the history of actions you have ALREADY taken:
    {json.dumps(action_history, indent=2)}
    *CRITICAL RULE: Do NOT repeat the exact same action if it is already in your history!*
    
    I have drawn RED BOUNDING BOXES with numbers over clickable elements in the screenshot.
    Use these visual numbers as the "id" for your actions. 
    
    Here is a text-based list of the top elements for fallback:
    {json.dumps(elements_list[:75], indent=2)} 
    """
    
    if previous_error:
        prompt += f"\nWARNING: Your last action failed with error: {previous_error}. Try a different approach."

    prompt += """
    Based on the visual layout and goal:
    
    IMPORTANT RULES:
    1. SEARCH PHASE: Once search results are visible, return "show_results" with the top 5 products. Do NOT just click ADD.
    2. LOGIN PHASE: If you see an input field asking for a "Phone Number" or "Mobile Number", use the "input_phone" action.
    3. LOGIN PHASE: If you see an input field asking for an "OTP" or "Verification Code", use the "input_otp" action.
    4. TYPING TEXT: If you want to enter text into a search bar or address box, use the "type" action directly! DO NOT use "click" to enter text.
    5. AVOID HALLUCINATIONS: You can ONLY use the ID numbers currently drawn in RED boxes on the image. DO NOT guess or invent numbers!
    6. ERROR RECOVERY: If the webpage crashes, shows an "Oops!" error, or if your last action failed, use the "reload" action to refresh the page.
    7. MISSING INFORMATION: Do NOT hallucinate or guess addresses, payment methods, or specific choices. If you need input from the user (e.g., "What is your address?"), use the "ask_user" action.
    8. ADDRESS REQUIRED: If you explicitly need the user's delivery address, use the "ask_address" action.
    
    You MUST respond using this exact JSON format. DO NOT WRAP IN MARKDOWN.
    Include a "status" field which is a short, elder-friendly description of what you are doing (e.g. "Setting up the delivery address...", "Searching for groceries...").
    
    Valid actions:
    1. {"reasoning": "...", "status": "...", "action": "click", "id": 12}
    2. {"reasoning": "...", "status": "...", "action": "type", "id": 15, "text": "search term"}
    3. {"reasoning": "...", "status": "...", "action": "scroll"}
    4. {"reasoning": "...", "status": "...", "action": "show_results", "results": [...]}
    5. {"reasoning": "...", "status": "...", "action": "input_phone", "id": 15}
    6. {"reasoning": "...", "status": "...", "action": "input_otp", "id": 18}
    7. {"reasoning": "...", "status": "...", "action": "ask_user", "question": "..."}
    8. {"reasoning": "...", "status": "...", "action": "ask_address"}
    9. {"reasoning": "...", "status": "...", "action": "reload"}
    10. {"reasoning": "...", "status": "...", "action": "done", "summary": "..."}
    """

    if local_client:
        try:
            logger.info("🤖 Asking Local LLM (LM Studio) for the next move...")
            base64_image = base64.b64encode(screenshot_bytes).decode('utf-8')
            
            response = local_client.chat.completions.create(
                model=MODEL_NAME,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/png;base64,{base64_image}"
                                }
                            }
                        ]
                    }
                ],
                temperature=0.1
            )
            
            raw_output = response.choices[0].message.content.strip()
            raw_output = raw_output.replace("```json", "").replace("```", "").strip()
            decision = json.loads(raw_output)
            logger.info("✅ Local LLM successfully generated a valid response!")
            return decision
            
        except Exception as e:
            logger.warning("⚠️ Local LLM failed (%s). Falling back to Gemini...", str(e)[:80])

    if gemini_client:
        try:
            image_part = types.Part.from_bytes(data=screenshot_bytes, mime_type='image/png')
            response = gemini_client.models.generate_content(
                model='gemini-2.5-flash', 
                contents=[prompt, image_part],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.1 
                )
            )
            return json.loads(response.text)
        except Exception as ge:
            logger.warning("⚠️ Gemini fallback failed: %s", ge)

    # If neither LLM responds, provide a smart fallback heuristic
    return {
        "reasoning": "Executing autonomous shopping workflow for requested item.",
        "action": "scroll"
    }

# ==============================================================================
# AGENT SESSION: Bridges synchronous Playwright worker with async WebSocket
# ==============================================================================

class AgentSession:
    def __init__(self, websocket: WebSocket, loop: asyncio.AbstractEventLoop):
        self.websocket = websocket
        self.loop = loop
        self.user_input_queue: queue.Queue = queue.Queue()
        self.is_active = True
        self.stage = "init"  # init -> clarifying -> executing -> done
        self.initial_request = ""
        self.clean_question = ""
        self.user_answer = ""
        self.clean_command = ""
        self.lang = "en"
        self.thread: Optional[threading.Thread] = None

    def send_ws_threadsafe(self, data: dict):
        """Threadsafe helper to push a message into the WebSocket client."""
        if not self.is_active:
            return
        asyncio.run_coroutine_threadsafe(
            self.websocket.send_text(json.dumps(data)),
            self.loop
        )

    def wait_for_user_input(self, action: str, text: str, extra: Optional[dict] = None) -> str:
        """Sends an action message to the web UI and blocks the worker thread until user responds."""
        msg = {
            "sender": "bot",
            "action": action,
            "text": text,
            "lang": self.lang,
            "timestamp": datetime.now().strftime("%I:%M %p")
        }
        if extra:
            msg.update(extra)
        
        self.send_ws_threadsafe(msg)
        logger.info("Agent waiting for user input on action: %s", action)
        
        # Block worker thread waiting for user WebSocket message
        return self.user_input_queue.get()

    def run_stage_1_and_2(self, user_request: str, lang: str = "en"):
        """STEP 1: User preferences clarification & STEP 2: Command drafting."""
        self.initial_request = user_request
        self.lang = lang

        # Send thinking indicator
        self.send_ws_threadsafe({
            "sender": "bot",
            "action": "thinking",
            "text": "🧠 Agent is thinking about what to ask..." if lang == "en" else "🧠 உதவியாளர் உங்கள் விருப்பங்களை ஆய்வு செய்கிறார்...",
            "timestamp": datetime.now().strftime("%I:%M %p")
        })

        system_prompt_1 = """you are an autonomous agent for ordering grocery online where any order placed will be delivered within 10 minutes , so draft the steps you will take one by one to just identify User Preferences and quantity. then ask the drafted question using A1 English vocabulary. 
        final output format "Question: """

        clean_question = ""
        if local_client:
            try:
                response_1 = local_client.chat.completions.create(
                    model=MODEL_NAME, 
                    messages=[
                        {"role": "system", "content": system_prompt_1},
                        {"role": "user", "content": user_request}
                    ],
                    temperature=0.7,
                )
                raw_question = response_1.choices[0].message.content
                clean_question = get_clean_text(raw_question, "Question:")
            except Exception as e:
                logger.warning("Local client clarification failed: %s", e)

        if not clean_question and gemini_client:
            try:
                res = gemini_client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=[system_prompt_1, f"User order: {user_request}"]
                )
                clean_question = get_clean_text(res.text, "Question:")
            except Exception as e:
                logger.warning("Gemini clarification failed: %s", e)

        # Fallback question if offline
        if not clean_question:
            clean_question = f"Question: What flavor or brand of {user_request} do you want, and how many packets would you like?"

        # Adapt to Tamil if in Tamil mode
        if lang == "ta":
            clean_question = f"கேள்வி: உங்களுக்கு எந்த சுவை அல்லது பிராண்ட் {user_request} வேண்டும், எத்தனை பாக்கெட்டுகள் வேண்டும்?"

        self.clean_question = clean_question

        # Send question to UI and wait for user's answer
        user_answer = self.wait_for_user_input(
            action="ask_clarification",
            text=f"**{clean_question}**\n\n*(You can reply by speaking or typing)*" if lang == "en" else f"**{clean_question}**\n\n*(நீங்கள் தமிழில் பேசலாம் அல்லது தட்டச்சு செய்யலாம்)*"
        )
        self.user_answer = user_answer

        # STEP 3: Draft Final Command
        self.send_ws_threadsafe({
            "sender": "bot",
            "action": "thinking",
            "text": "📝 Drafting final command for the Web execution agent..." if lang == "en" else "📝 இணைய முகவருக்கான கட்டளையை உருவாக்குகிறது...",
            "timestamp": datetime.now().strftime("%I:%M %p")
        })

        system_prompt_2 = """You are a master AI dispatcher. Your job is to read the conversation history and draft a clear, direct, and actionable prompt for an autonomous ordering agent to execute the grocery order. Do not include pleasantries. 
        final output format "Command: """

        clean_command = ""
        if local_client:
            try:
                response_2 = local_client.chat.completions.create(
                    model=MODEL_NAME, 
                    messages=[
                        {"role": "system", "content": system_prompt_2},
                        {"role": "user", "content": user_request},
                        {"role": "assistant", "content": clean_question},
                        {"role": "user", "content": user_answer},
                        {"role": "user", "content": "Based on my answers, draft the final prompt to send to the autonomous ordering agent to fulfill my order."}
                    ],
                    temperature=0.7,
                )
                raw_command = response_2.choices[0].message.content
                clean_command = get_clean_text(raw_command, "Command:")
            except Exception as e:
                logger.warning("Local client command drafting failed: %s", e)

        if not clean_command and gemini_client:
            try:
                res2 = gemini_client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=[system_prompt_2, f"User order: {user_request}\nUser clarification: {user_answer}"]
                )
                clean_command = get_clean_text(res2.text, "Command:")
            except Exception as e:
                logger.warning("Gemini command drafting failed: %s", e)

        if not clean_command:
            clean_command = f"Command: Order {user_answer} of {user_request}."

        self.clean_command = clean_command

        # Send command announcement to UI
        self.send_ws_threadsafe({
            "sender": "bot",
            "action": "command_ready",
            "text": (
                f"✅ **GENERATED AGENT COMMAND:**\n\n`{clean_command}`\n\n"
                f"🚀 **Launching Multimodal Visual Agent on Blinkit...**"
            ),
            "timestamp": datetime.now().strftime("%I:%M %p")
        })

        # STEP 4: Launch Web Agent Execution
        self.execute_web_agent(clean_command)

    def execute_web_agent(self, final_command: str):
        """Runs the multimodal agent (Playwright if available)."""
        target_site = "https://blinkit.com/"
        default_address = ""
        default_phone = ""

        # Check if Playwright is available
        if PLAYWRIGHT_AVAILABLE:
            try:
                self.run_playwright_loop(target_site, final_command, default_address, default_phone)
                return
            except Exception as pe:
                logger.error("Playwright execution error: %s.", pe)
                self.send_ws_threadsafe({
                    "sender": "bot",
                    "action": "error",
                    "text": f"Playwright execution failed: {pe}",
                    "timestamp": datetime.now().strftime("%I:%M %p")
                })
        else:
            self.send_ws_threadsafe({
                "sender": "bot",
                "action": "error",
                "text": "Playwright is not available to run the agent.",
                "timestamp": datetime.now().strftime("%I:%M %p")
            })

    def run_playwright_loop(self, start_url: str, final_command: str, address: str, phone: str):
        """Real Playwright Multimodal Visual Loop."""
        goal = f"""
        User mobile: {phone}
        Address: {address}
        Target User Order: {final_command}
        
        Instructions:
        1. Handle any location/delivery popup or select delivery address.
        2. In the search bar, search for the items mentioned in the 'Target User Order'.
        3. When search results load, use the 'show_results' action to list the top 5 products.
        4. After an item is added, navigate to the cart and click Proceed/Checkout.
        5. If a login screen appears, use 'input_phone' for the mobile number and 'input_otp' for the OTP.
        """

        self.send_ws_threadsafe({
            "sender": "bot",
            "action": "step_progress",
            "step": 0,
            "text": f"🌐 **Navigating to {start_url}**\n\n🎯 Fulfilling Order: `{final_command}`",
            "timestamp": datetime.now().strftime("%I:%M %p")
        })

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=False)
            context = browser.new_context(viewport={'width': 1280, 'height': 800})
            page = context.new_page()
            
            if STEALTH_AVAILABLE:
                stealth_sync(page)

            page.goto(start_url, timeout=60000)
            time.sleep(3) 

            step = 1
            last_error = None
            action_history = [] 
            
            while step <= 25 and self.is_active:
                elements = get_interactive_elements(page)
                screenshot_bytes = page.screenshot(type="png")
                
                decision = ask_llm(goal, elements, action_history, screenshot_bytes, last_error)
                last_error = None 
                
                action = decision.get("action")
                reasoning = decision.get("reasoning", "")
                status_text = decision.get("status", f"Executing action: {action}...")

                # Broadcast Step Status to UI
                self.send_ws_threadsafe({
                    "sender": "bot",
                    "action": "step_progress",
                    "step": step,
                    "text": f"🤖 **{status_text}**",
                    "timestamp": datetime.now().strftime("%I:%M %p")
                })

                try:
                    if action == "done":
                        self.send_ws_threadsafe({
                            "sender": "bot",
                            "action": "order_success",
                            "text": f"🎉 **MISSION ACCOMPLISHED!**\n\n{decision.get('summary', 'Order placed successfully!')}",
                            "timestamp": datetime.now().strftime("%I:%M %p")
                        })
                        break

                    elif action == "ask_user":
                        # Handle general questions to the user (address, payment, etc.)
                        question = decision.get("question", "I need some information to proceed:")
                        
                        prompt_msg = f"❓ **{question}**"
                        
                        # Wait for the user to answer via the frontend
                        user_response = self.wait_for_user_input(
                            action="ask_user",
                            text=prompt_msg
                        ).strip()
                        
                        # Add their answer to the history so the LLM reads it on the next loop
                        action_history.append(f"Step {step}: Asked user '{question}'. User answered: '{user_response}'")
                        self.send_ws_threadsafe({
                            "sender": "bot",
                            "action": "info",
                            "text": "✅ Got it! Resuming task...",
                            "timestamp": datetime.now().strftime("%I:%M %p")
                        })

                    elif action == "ask_address":
                        prompt_msg = "📍 **Delivery Address Required:** Please enter your full delivery address:" if self.lang == "en" else "📍 **டெலிவரி முகவரி தேவை:** உங்கள் முழு டெலிவரி முகவரியை உள்ளிடவும்:"
                        
                        user_response = self.wait_for_user_input(
                            action="ask_address",
                            text=prompt_msg
                        ).strip()
                        
                        action_history.append(f"Step {step}: Asked user for address. User answered: '{user_response}'")
                        self.send_ws_threadsafe({
                            "sender": "bot",
                            "action": "info",
                            "text": "✅ Address received! Resuming task...",
                            "timestamp": datetime.now().strftime("%I:%M %p")
                        })

                    elif action == "show_results":
                        results = decision.get("results", [])
                        if not results:
                            self.send_ws_threadsafe({
                                "sender": "bot",
                                "action": "error",
                                "text": "No search results found or parsed.",
                                "timestamp": datetime.now().strftime("%I:%M %p")
                            })
                            continue
                            
                        top_results = results[:5]

                        # Send interactive Product Cards to UI and wait for user's selection
                        prompt_msg = (
                            "🛒 **சிறந்த தேடல் முடிவுகள்:** நீங்கள் எதை சேர்க்க விரும்புகிறீர்கள்? ஒரு பொருளைத் தட்டவும் அல்லது எண்ணைக் கூறவும்:"
                            if self.lang == "ta" else
                            "🛒 **Top Search Results:** Which item would you like to add? Tap an item or tell me the number:"
                        )
                        user_choice_str = self.wait_for_user_input(
                            action="show_results",
                            text=prompt_msg,
                            extra={"results": top_results}
                        )

                        # Parse choice (1-5 or item name)
                        choice_idx = 0
                        digits = re.findall(r'\d+', user_choice_str)
                        if digits:
                            choice_idx = max(0, min(len(top_results) - 1, int(digits[0]) - 1))
                        
                        selected_item = top_results[choice_idx]
                        target_id = selected_item.get("add_button_id", 37)

                        success_msg = (
                            f"✅ **தேர்ந்தெடுக்கப்பட்டது:** {selected_item.get('name')} (விலை: {selected_item.get('price')}). கூடைக்கு சேர்க்கப்படுகிறது..."
                            if self.lang == "ta" else
                            f"✅ **Selected:** {selected_item.get('name')} (Price: {selected_item.get('price')}). Adding to cart..."
                        )
                        self.send_ws_threadsafe({
                            "sender": "bot",
                            "action": "cart_update",
                            "text": success_msg,
                            "timestamp": datetime.now().strftime("%I:%M %p")
                        })

                        try:
                            page.locator(f'[custom-agent-id="{target_id}"]').first.click(timeout=5000)
                        except Exception:
                            page.keyboard.press("Enter")
                        time.sleep(3)
                        
                        action_history.append(f"Step {step}: User selected and added '{selected_item.get('name')}'")
                        goal = "Item added. Go to the cart, click Proceed/Checkout, and complete Login using 'input_phone' and 'input_otp'."

                    elif action == "input_phone":
                        target_id = decision.get("id")
                        phone_msg = (
                            "📱 **தொலைபேசி எண் தேவை:** உள்நுழைய உங்கள் மொபைல் எண்ணை உறுதிப்படுத்தவும்:"
                            if self.lang == "ta" else
                            "📱 **Phone Number Required:** Please confirm your mobile number to proceed with login:"
                        )
                        user_phone = self.wait_for_user_input(
                            action="input_phone",
                            text=phone_msg,
                            extra={"default_phone": phone}
                        ).strip()

                        if not user_phone:
                            user_phone = phone

                        try:
                            input_field = page.locator(f'[custom-agent-id="{target_id}"]').first
                            input_field.fill("")
                            input_field.press_sequentially(user_phone, delay=150)
                            page.keyboard.press("Enter")
                        except Exception as e:
                            logger.error("Failed to type phone: %s", e)
                        
                        action_history.append(f"Step {step}: Entered phone number {user_phone}")
                        goal = "Phone entered. Now wait for the OTP page and use 'input_otp' when you see the OTP input fields."

                    elif action == "input_otp":
                        target_id = decision.get("id")
                        otp_msg = (
                            "🔐 **OTP சரிபார்ப்பு தேவை:** உங்கள் தொலைபேசிக்கு அனுப்பப்பட்ட SMS குறியீட்டை பெரிய கீபேடில் உள்ளிடவும்:"
                            if self.lang == "ta" else
                            "🔐 **OTP Verification Required:** Blinkit sent an SMS code to your phone. Enter the code using the Big Keypad:"
                        )
                        otp_prompt = (
                            "உங்கள் தொலைபேசிக்கு அனுப்பப்பட்ட OTP ஐ உள்ளிடவும்:"
                            if self.lang == "ta" else
                            "Please enter the OTP sent to your phone:"
                        )
                        otp_code = self.wait_for_user_input(
                            action="ask_user",
                            text=otp_msg,
                            extra={"type": "otp", "prompt": otp_prompt}
                        ).strip()

                        try:
                            input_field = page.locator(f'[custom-agent-id="{target_id}"]').first
                            input_field.click() 
                            input_field.press_sequentially(otp_code, delay=150)
                        except Exception as e:
                            logger.warning("OTP input failed: %s", e)
                        time.sleep(4)
                        action_history.append(f"Step {step}: User entered OTP into ID {target_id}")

                    elif action == "scroll":
                        page.mouse.wheel(0, 600)
                        time.sleep(2)
                        action_history.append(f"Step {step}: scrolled")

                    elif action == "click":
                        target_id = decision.get("id")
                        page.locator(f'[custom-agent-id="{target_id}"]').first.click(timeout=5000)
                        time.sleep(4)
                        action_history.append(f"Step {step}: clicked ID {target_id}")

                    elif action == "type":
                        target_id = decision.get("id")
                        text_to_type = decision.get("text", "")
                        input_field = page.locator(f'[custom-agent-id="{target_id}"]').first
                        input_field.click() 
                        input_field.press_sequentially(text_to_type, delay=150)
                        page.keyboard.press("Enter")
                        time.sleep(4)
                        action_history.append(f"Step {step}: typed '{text_to_type}' into ID {target_id}")

                    elif action == "reload":
                        page.reload(timeout=30000)
                        time.sleep(5)
                        action_history.append(f"Step {step}: reloaded the page")

                except Exception as e:
                    error_msg = str(e)
                    logger.error("Action error in Step %d: %s", step, error_msg[:100])
                    last_error = error_msg[:100]

                time.sleep(4)
                step += 1

            browser.close()



# ==========================================
# WEBSOCKET ENDPOINT & CONNECTION LIFECYCLE
# ==========================================

active_sessions: Dict[WebSocket, AgentSession] = {}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    loop = asyncio.get_running_loop()
    session = AgentSession(websocket, loop)
    active_sessions[websocket] = session
    logger.info("New WebSocket client connected. Active sessions: %d", len(active_sessions))

    try:
        while True:
            raw_text = await websocket.receive_text()
            try:
                data = json.loads(raw_text)
                user_msg = data.get("text", "").strip()
                lang = data.get("lang", "en")
            except Exception:
                user_msg = raw_text.strip()
                lang = "en"

            if not user_msg:
                continue

            logger.info("Received WebSocket message: '%s' (stage: %s)", user_msg, session.stage)

            # If agent is currently waiting for input (e.g. product choice, phone, OTP)
            if not session.user_input_queue.empty() or (session.thread and session.thread.is_alive()):
                session.user_input_queue.put(user_msg)
            else:
                # Start new order workflow
                session.stage = "running"
                thread = threading.Thread(
                    target=session.run_stage_1_and_2,
                    args=(user_msg, lang),
                    daemon=True
                )
                session.thread = thread
                thread.start()

    except WebSocketDisconnect:
        session.is_active = False
        active_sessions.pop(websocket, None)
        logger.info("WebSocket disconnected.")
    except Exception as e:
        logger.error("WebSocket endpoint error: %s", e)
        session.is_active = False
        active_sessions.pop(websocket, None)

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting ElderEase Live Agent Server on http://localhost:8000 (ws://localhost:8000/ws)")
    uvicorn.run("live_agent_server:app", host="0.0.0.0", port=8000, reload=False)
