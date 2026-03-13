from PIL import Image, ImageDraw, ImageFont
import os

# Create frames directory
os.makedirs("frames", exist_ok=True)

# Frame dimensions (9:16 for TikTok)
W, H = 1080, 1920

# Colors
BG = "#1a1a2e"
ACCENT = "#16213e"
TEXT = "#ffffff"
HIGHLIGHT = "#e94560"

def create_frame(text, subtext="", progress=None, step=0):
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)
    
    # Try to load font, fallback to default
    try:
        font_large = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 80)
        font_medium = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 50)
        font_small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 40)
    except:
        font_large = ImageFont.load_default()
        font_medium = ImageFont.load_default()
        font_small = ImageFont.load_default()
    
    # Draw header bar
    draw.rectangle([0, 0, W, 120], fill=ACCENT)
    draw.text((540, 60), "AI PPT 生成器", fill=TEXT, font=font_medium, anchor="mm")
    
    # Main content area
    if text:
        # Wrap text if too long
        words = text
        draw.text((540, 600), words, fill=TEXT, font=font_large, anchor="mm")
    
    if subtext:
        draw.text((540, 800), subtext, fill="#aaaaaa", font=font_small, anchor="mm")
    
    # Progress bar
    if progress is not None:
        bar_width = 800
        bar_height = 40
        bar_x = (W - bar_width) // 2
        bar_y = 1400
        
        # Background bar
        draw.rectangle([bar_x, bar_y, bar_x + bar_width, bar_y + bar_height], 
                      fill=ACCENT, outline=TEXT, width=2)
        
        # Progress fill
        fill_width = int(bar_width * progress / 100)
        draw.rectangle([bar_x, bar_y, bar_x + fill_width, bar_y + bar_height], 
                      fill=HIGHLIGHT)
        
        # Progress text
        draw.text((540, 1500), f"{progress}%", fill=TEXT, font=font_medium, anchor="mm")
    
    # Step indicator
    if step > 0:
        draw.text((540, 1700), f"步骤 {step}/5", fill="#aaaaaa", font=font_small, anchor="mm")
    
    return img

# Generate 60 frames (2 seconds each at 30fps = 60 frames)
frames = [
    ("AI PPT 生成器", "输入主题，一键生成专业PPT", 0, 0),
    ("输入主题...", "2026年AI发展趋势", 20, 1),
    ("选择风格...", "商务简约", 40, 2),
    ("AI生成中...", "智能排版+内容优化", 60, 3),
    ("生成完成！", "15页精美PPT", 100, 4),
    ("导出成功", "可直接用于汇报", 100, 5),
]

frame_count = 0
for text, subtext, progress, step in frames:
    img = create_frame(text, subtext, progress, step)
    for i in range(30):  # 1 second at 30fps
        img.save(f"frames/frame_{frame_count:04d}.png")
        frame_count += 1

print(f"Generated {frame_count} frames")
