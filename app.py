"""
LIBASS — Streamlit Deployment Wrapper
Serves the complete 3D boutique website inside Streamlit
"""
import streamlit as st
import base64
import os

# ── Page Config ──
st.set_page_config(
    page_title="LIBASS — Crafting Your Elegance",
    page_icon="🧵",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# ── Hide Streamlit chrome for full-screen experience ──
st.markdown("""
<style>
    #MainMenu {visibility: hidden;}
    header {visibility: hidden;}
    footer {visibility: hidden;}
    .stApp > header {display: none;}
    .block-container {
        padding: 0 !important;
        max-width: 100% !important;
    }
    iframe {
        border: none !important;
    }
    .stAppDeployButton {display: none;}
    div[data-testid="stToolbar"] {display: none;}
    div[data-testid="stDecoration"] {display: none;}
    div[data-testid="stStatusWidget"] {display: none;}
</style>
""", unsafe_allow_html=True)

# ── Helper: Read file content ──
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def read_file(path):
    with open(os.path.join(BASE_DIR, path), "r", encoding="utf-8") as f:
        return f.read()

def image_to_base64(path):
    full_path = os.path.join(BASE_DIR, path)
    if not os.path.exists(full_path):
        return ""
    with open(full_path, "rb") as f:
        data = base64.b64encode(f.read()).decode("utf-8")
    ext = path.rsplit(".", 1)[-1].lower()
    mime = {"jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png", "webp": "image/webp"}.get(ext, "image/jpeg")
    return f"data:{mime};base64,{data}"

# ── Load Assets ──
css_content = read_file("css/style.css")
three_scene_js = read_file("js/three-scene.js")
main_js = read_file("js/main.js")
tryon_js = read_file("js/virtual-tryon.js")
booking_js = read_file("js/booking.js")
gallery_js = read_file("js/gallery.js")

# ── Convert images to base64 ──
images = {
    "assets/images/hero.jpg": image_to_base64("assets/images/hero.jpg"),
    "assets/images/bridal.jpg": image_to_base64("assets/images/bridal.jpg"),
    "assets/images/designer.jpg": image_to_base64("assets/images/designer.jpg"),
    "assets/images/evening-gown.jpg": image_to_base64("assets/images/evening-gown.jpg"),
    "assets/images/formal-suit.jpg": image_to_base64("assets/images/formal-suit.jpg"),
    "assets/images/anarkali.jpg": image_to_base64("assets/images/anarkali.jpg"),
}

# ── Read HTML and inline everything ──
html_content = read_file("index.html")

# Replace image paths with base64 data URIs
for path, b64 in images.items():
    html_content = html_content.replace(path, b64)

# Remove external CSS link and inline it
html_content = html_content.replace(
    '<link rel="stylesheet" href="css/style.css">',
    f"<style>{css_content}</style>"
)

# Remove external JS script tags and inline them
html_content = html_content.replace(
    '<script src="js/three-scene.js"></script>',
    f"<script>{three_scene_js}</script>"
)
html_content = html_content.replace(
    '<script src="js/main.js"></script>',
    f"<script>{main_js}</script>"
)
html_content = html_content.replace(
    '<script src="js/virtual-tryon.js"></script>',
    f"<script>{tryon_js}</script>"
)
html_content = html_content.replace(
    '<script src="js/booking.js"></script>',
    f"<script>{booking_js}</script>"
)
html_content = html_content.replace(
    '<script src="js/gallery.js"></script>',
    f"<script>{gallery_js}</script>"
)

# ── Render ──
st.components.v1.html(html_content, height=6000, scrolling=True)
