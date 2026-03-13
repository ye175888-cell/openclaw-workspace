from PIL import Image, ImageDraw, ImageFont
import os

os.makedirs("full_frames", exist_ok=True)

W, H = 1080, 1920
BG = "#0f0f23"
ACCENT = "#1a1a3e"
TEXT = "#ffffff"
HIGHLIGHT = "#00d4ff"

def get_font(size):
    try:
        return ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", size)
    except:
        return ImageFont.load_default()

def create_hook_frame():
    """钩子画面 - 前5秒"""
    frames = []
    for i in range(150):  # 5秒 @ 30fps
        img = Image.new("RGB", (W, H), BG)
        draw = ImageDraw.Draw(img)
        
        # 大标题
        font = get_font(80)
        draw.text((540, 700), "手动做PPT要2小时？", fill=TEXT, font=font, anchor="mm")
        
        # 高亮文字
        font = get_font(100)
        draw.text((540, 900), "AI只要1分钟！", fill=HIGHLIGHT, font=font, anchor="mm")
        
        # 闪烁效果
        if i % 10 < 5:
            font = get_font(40)
            draw.text((540, 1200), "⚡ 效率神器 ⚡", fill=HIGHLIGHT, font=font, anchor="mm")
        
        frames.append(img)
    return frames

def create_pain_frame():
    """痛点画面 - 5-30秒"""
    frames = []
    pains = [
        ("找模板找半小时", "😫"),
        ("写内容写到头秃", "🤯"),
        ("调格式调到崩溃", "😤"),
        ("老板还说不够高级", "😭"),
    ]
    
    for pain, emoji in pains:
        for i in range(150):  # 每个痛点5秒
            img = Image.new("RGB", (W, H), BG)
            draw = ImageDraw.Draw(img)
            
            # 标题
            font = get_font(60)
            draw.text((540, 400), "你是不是也这样：", fill="#aaaaaa", font=font, anchor="mm")
            
            # 痛点内容
            font = get_font(80)
            draw.text((540, 800), pain, fill=TEXT, font=font, anchor="mm")
            
            # 表情
            font = get_font(120)
            draw.text((540, 1100), emoji, fill=HIGHLIGHT, font=font, anchor="mm")
            
            frames.append(img)
    return frames

def create_demo_frame():
    """演示画面 - 30-120秒"""
    frames = []
    steps = [
        ("打开 AI PPT 生成器", 0),
        ("输入主题：2026年AI发展趋势", 20),
        ("选择风格：商务简约", 40),
        ("AI 生成中...", 60),
        ("生成完成！", 100),
    ]
    
    for text, progress in steps:
        for i in range(180):  # 每个步骤6秒
            img = Image.new("RGB", (W, H), BG)
            draw = ImageDraw.Draw(img)
            
            # 标题栏
            draw.rectangle([0, 0, W, 100], fill=ACCENT)
            font = get_font(40)
            draw.text((540, 50), "🤖 AI PPT 生成器", fill=TEXT, font=font, anchor="mm")
            
            # 主内容区
            draw.rectangle([100, 200, W-100, 600], fill=ACCENT, outline=HIGHLIGHT, width=2)
            font = get_font(50)
            draw.text((540, 400), text, fill=TEXT, font=font, anchor="mm")
            
            # 进度条
            bar_y = 800
            draw.rectangle([100, bar_y, W-100, bar_y+40], fill=ACCENT, outline=TEXT, width=2)
            fill_width = int((W-200) * progress / 100)
            draw.rectangle([100, bar_y, 100+fill_width, bar_y+40], fill=HIGHLIGHT)
            
            # 进度百分比
            font = get_font(60)
            draw.text((540, 1000), f"{progress}%", fill=HIGHLIGHT, font=font, anchor="mm")
            
            # 加载动画
            if progress < 100:
                dots = "." * ((i // 10) % 4)
                font = get_font(40)
                draw.text((540, 1200), f"生成中{dots}", fill="#aaaaaa", font=font, anchor="mm")
            else:
                font = get_font(60)
                draw.text((540, 1200), "✅ 完成！", fill="#00ff00", font=font, anchor="mm")
            
            frames.append(img)
    return frames

def create_result_frame():
    """结果展示 - 120-165秒"""
    frames = []
    for i in range(135):  # 4.5秒
        img = Image.new("RGB", (W, H), BG)
        draw = ImageDraw.Draw(img)
        
        font = get_font(70)
        draw.text((540, 400), "🎉 生成完成！", fill=HIGHLIGHT, font=font, anchor="mm")
        
        font = get_font(50)
        draw.text((540, 700), "✓ 15页精美PPT", fill=TEXT, font=font, anchor="mm")
        draw.text((540, 850), "✓ 专业配色排版", fill=TEXT, font=font, anchor="mm")
        draw.text((540, 1000), "✓ 逻辑清晰完整", fill=TEXT, font=font, anchor="mm")
        draw.text((540, 1150), "✓ 可直接用于汇报", fill=TEXT, font=font, anchor="mm")
        
        frames.append(img)
    return frames

def create_compare_frame():
    """对比+CTA - 165-180秒"""
    frames = []
    for i in range(150):  # 5秒
        img = Image.new("RGB", (W, H), BG)
        draw = ImageDraw.Draw(img)
        
        font = get_font(60)
        draw.text((540, 300), "效率对比", fill="#aaaaaa", font=font, anchor="mm")
        
        # 左边 - 手动
        draw.rectangle([100, 500, 500, 900], fill="#ff4444", outline=TEXT, width=3)
        font = get_font(50)
        draw.text((300, 650), "手动做", fill=TEXT, font=font, anchor="mm")
        font = get_font(80)
        draw.text((300, 800), "2小时", fill=TEXT, font=font, anchor="mm")
        
        # 右边 - AI
        draw.rectangle([580, 500, 980, 900], fill="#00ff00", outline=TEXT, width=3)
        font = get_font(50)
        draw.text((780, 650), "AI做", fill=TEXT, font=font, anchor="mm")
        font = get_font(80)
        draw.text((780, 800), "1分钟", fill=TEXT, font=font, anchor="mm")
        
        # 中间 VS
        font = get_font(60)
        draw.text((540, 700), "VS", fill=HIGHLIGHT, font=font, anchor="mm")
        
        # 提升倍数
        font = get_font(70)
        draw.text((540, 1100), "效率提升 120倍！", fill=HIGHLIGHT, font=font, anchor="mm")
        
        frames.append(img)
    return frames

def create_cta_frame():
    """CTA - 最后5秒"""
    frames = []
    for i in range(150):  # 5秒
        img = Image.new("RGB", (W, H), BG)
        draw = ImageDraw.Draw(img)
        
        font = get_font(60)
        draw.text((540, 600), "想要这个工具？", fill=TEXT, font=font, anchor="mm")
        
        font = get_font(80)
        draw.text((540, 900), "评论区扣\"PPT\"", fill=HIGHLIGHT, font=font, anchor="mm")
        
        font = get_font(50)
        draw.text((540, 1200), "关注小爪，每天一个AI效率技巧", fill="#aaaaaa", font=font, anchor="mm")
        
        # 闪烁的关注提示
        if i % 10 < 5:
            font = get_font(40)
            draw.text((540, 1400), "👆 点击关注 👆", fill=HIGHLIGHT, font=font, anchor="mm")
        
        frames.append(img)
    return frames

# Generate all frames
print("Generating hook frames...")
hook_frames = create_hook_frame()

print("Generating pain frames...")
pain_frames = create_pain_frame()

print("Generating demo frames...")
demo_frames = create_demo_frame()

print("Generating result frames...")
result_frames = create_result_frame()

print("Generating compare frames...")
compare_frames = create_compare_frame()

print("Generating CTA frames...")
cta_frames = create_cta_frame()

# Combine all frames
all_frames = hook_frames + pain_frames + demo_frames + result_frames + compare_frames + cta_frames

print(f"Total frames: {len(all_frames)}")

# Save frames
for i, frame in enumerate(all_frames):
    frame.save(f"full_frames/frame_{i:05d}.png")

print("Done!")
