from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        page.goto("https://www.zeptonow.com/")
        print("Opened Zepto. Waiting for page to load...")
        time.sleep(3)
        
        # We need to search for an item first to see the add buttons.
        try:
            search_bar = page.locator('input[placeholder*="Search" i], [aria-label*="search" i]').first
            if search_bar.is_visible():
                search_bar.click()
                time.sleep(1)
                search_bar.fill("onion")
                page.keyboard.press("Enter")
                time.sleep(4)
        except Exception as e:
            print("Search failed:", e)
        
        print("Page HTML dump length:", len(page.content()))
        
        # Now try to find Add buttons
        add_btns = page.locator('button:has-text("Add"), [aria-label*="add" i], [data-testid*="add" i]')
        print(f"Found {add_btns.count()} Add buttons")
        
        if add_btns.count() > 0:
            for i in range(min(3, add_btns.count())):
                btn = add_btns.nth(i)
                if btn.is_visible():
                    box = btn.bounding_box()
                    print(f"Add button {i} at", box, "Text:", btn.inner_text())
                    
            btn = add_btns.first
            print("Clicking first Add button...")
            try:
                # Force click to bypass overlay
                btn.click(force=True)
                time.sleep(2)
                
                # Check what elements are near the bounding box now
                print("Checking elements around the clicked area...")
                elements_js = """
                (box) => {
                    const cx = box.x + box.width / 2;
                    const cy = box.y + box.height / 2;
                    let el = document.elementFromPoint(cx, cy);
                    if (!el) return "No element at center";
                    
                    let result = [];
                    for (let i = 0; i < 5; i++) {
                        if (!el) break;
                        result.push({
                            tag: el.tagName,
                            class: el.className,
                            text: (el.innerText || "").substring(0, 20),
                            children: el.children.length
                        });
                        el = el.parentElement;
                    }
                    return result;
                }
                """
                res = page.evaluate(elements_js, box)
                import json
                print("DOM hierarchy around button center:", json.dumps(res, indent=2))
                
            except Exception as e:
                print("Click failed", e)
            
        browser.close()

if __name__ == "__main__":
    run()
