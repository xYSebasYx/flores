import math
from PIL import Image, ImageDraw

def create_kuromi_head_texture():
    # Sphere UV texture: 1024 wide x 512 high
    w, h = 1024, 512
    img = Image.new('RGBA', (w, h), (26, 22, 34, 255)) # Black hood
    draw = ImageDraw.Draw(img)
    
    # Front center is cx = 512, cy = 256
    cx = 512
    cy = 270 # slightly lower for chibi face
    
    # 1. White face area (rounded heart / wide oval)
    face_w = 175
    face_h = 135
    draw.ellipse([cx - face_w, cy - face_h, cx + face_w, cy + face_h + 10], fill=(255, 255, 255, 255))
    
    # Black hood V-peak coming down at top of face
    v_top = cy - face_h - 5
    v_bottom = cy - 45
    v_w = 42
    draw.polygon([
        (cx - v_w, v_top),
        (cx + v_w, v_top),
        (cx, v_bottom)
    ], fill=(26, 22, 34, 255))
    
    # 2. Eyes
    # Right Eye (Anime open eye at cx - 65)
    eye_x = cx - 65
    eye_y = cy - 5
    eye_rw, eye_rh = 26, 38
    draw.ellipse([eye_x - eye_rw, eye_y - eye_rh, eye_x + eye_rw, eye_y + eye_rh], fill=(20, 15, 25, 255))
    # Catchlight shine
    draw.ellipse([eye_x - 10, eye_y - 18, eye_x - 2, eye_y - 6], fill=(255, 255, 255, 255))
    draw.ellipse([eye_x + 4, eye_y + 10, eye_x + 10, eye_y + 18], fill=(255, 255, 255, 220))
    # Eyelashes
    draw.line([(eye_x - eye_rw - 4, eye_y - 18), (eye_x - eye_rw - 14, eye_y - 28)], fill=(20, 15, 25, 255), width=4)
    draw.line([(eye_x - eye_rw + 2, eye_y - 28), (eye_x - eye_rw - 6, eye_y - 40)], fill=(20, 15, 25, 255), width=4)

    # Left Eye (Winking arc at cx + 65)
    wink_x = cx + 65
    wink_y = cy - 5
    draw.arc([wink_x - 28, wink_y - 22, wink_x + 28, wink_y + 22], start=190, end=350, fill=(20, 15, 25, 255), width=6)
    # Eyelashes on wink
    draw.line([(wink_x + 22, wink_y - 6), (wink_x + 36, wink_y - 16)], fill=(20, 15, 25, 255), width=4)
    draw.line([(wink_x + 14, wink_y - 14), (wink_x + 24, wink_y - 26)], fill=(20, 15, 25, 255), width=4)

    # 3. Pink button nose
    nose_y = cy + 18
    draw.ellipse([cx - 9, nose_y - 6, cx + 9, nose_y + 6], fill=(255, 116, 177, 255))

    # 4. Cheeky cat smile
    mouth_y = cy + 40
    draw.arc([cx - 16, mouth_y - 14, cx + 16, mouth_y + 14], start=15, end=165, fill=(20, 15, 25, 255), width=5)

    # 5. Blushing cheeks
    blush_y = cy + 22
    for side in [-1, 1]:
        bx = cx + side * 115
        draw.ellipse([bx - 22, blush_y - 12, bx + 22, blush_y + 12], fill=(255, 160, 200, 160))

    # 6. Pink skull on forehead
    skull_y = cy - 135
    # Skull cranium
    draw.ellipse([cx - 36, skull_y - 32, cx + 36, skull_y + 24], fill=(255, 116, 177, 255))
    # Skull teeth/jaw
    draw.rectangle([cx - 20, skull_y + 18, cx + 20, skull_y + 34], fill=(255, 116, 177, 255))
    # Teeth separation
    draw.line([(cx - 7, skull_y + 24), (cx - 7, skull_y + 34)], fill=(26, 22, 34, 255), width=3)
    draw.line([(cx + 7, skull_y + 24), (cx + 7, skull_y + 34)], fill=(26, 22, 34, 255), width=3)
    # Skull eyes
    # Right eye circle
    draw.ellipse([cx - 22, skull_y - 8, cx - 8, skull_y + 6], fill=(26, 22, 34, 255))
    # Left eye winking line
    draw.line([(cx + 8, skull_y - 1), (cx + 22, skull_y - 1)], fill=(26, 22, 34, 255), width=4)

    img.save('kuromi_head_uv.png')
    print("Saved kuromi_head_uv.png")

if __name__ == '__main__':
    create_kuromi_head_texture()
