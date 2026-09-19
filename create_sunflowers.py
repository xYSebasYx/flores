import math
from PIL import Image, ImageDraw

def create_sunflower_texture(filename='sunflower.png', has_face=False):
    size = 512
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    cx, cy = size / 2, size / 2
    
    # Draw two layers of sunflower petals
    petal_layers = [
        {'count': 28, 'radius_inner': 100, 'length': 140, 'width': 32, 'color': (245, 170, 15, 255), 'tip_color': (255, 215, 40, 255)},
        {'count': 26, 'radius_inner': 105, 'length': 145, 'width': 30, 'color': (255, 200, 20, 255), 'tip_color': (255, 235, 70, 255)},
        {'count': 24, 'radius_inner': 100, 'length': 120, 'width': 26, 'color': (255, 220, 30, 255), 'tip_color': (255, 245, 100, 255)}
    ]
    
    for layer in petal_layers:
        count = layer['count']
        angle_step = 2 * math.pi / count
        offset = angle_step / 2 if layer == petal_layers[1] else 0
        
        for i in range(count):
            angle = i * angle_step + offset
            cos_a = math.cos(angle)
            sin_a = math.sin(angle)
            
            # Base of petal
            b_r = layer['radius_inner']
            bx = cx + b_r * cos_a
            by = cy + b_r * sin_a
            
            # Tip of petal
            t_r = b_r + layer['length']
            tx = cx + t_r * cos_a
            ty = cy + t_r * sin_a
            
            # Perpendicular vector for petal width
            px = -sin_a * (layer['width'] / 2)
            py = cos_a * (layer['width'] / 2)
            
            # Mid point for bulging petal
            mid_r = b_r + layer['length'] * 0.55
            mx1 = cx + mid_r * cos_a + px
            my1 = cy + mid_r * sin_a + py
            mx2 = cx + mid_r * cos_a - px
            my2 = cy + mid_r * sin_a - py
            
            # Draw petal polygon
            draw.polygon([
                (bx, by),
                (mx1, my1),
                (tx, ty),
                (mx2, my2)
            ], fill=layer['color'], outline=(220, 150, 10, 220))
            
            # Inner highlight streak
            draw.line([(bx, by), (tx * 0.85 + bx * 0.15, ty * 0.85 + by * 0.15)], fill=layer['tip_color'], width=2)
            
    # Draw center disk (dark brown with phyllotaxis seed pattern)
    center_r = 105
    draw.ellipse([cx - center_r, cy - center_r, cx + center_r, cy + center_r], fill=(55, 25, 10, 255), outline=(90, 45, 15, 255), width=3)
    
    # Golden angle spiral dots
    phi = (1 + 5**0.5) / 2
    golden_angle = 2 * math.pi * (1 - 1/phi)
    
    num_seeds = 350
    for n in range(num_seeds):
        r = (center_r - 8) * math.sqrt(n / num_seeds)
        theta = n * golden_angle
        sx = cx + r * math.cos(theta)
        sy = cy + r * math.sin(theta)
        
        # Color gradient for seeds
        if r < 35:
            dot_color = (40, 18, 8, 255)
            s_size = 2.5
        elif r < 75:
            dot_color = (130, 80, 20, 255)
            s_size = 3.0
        else:
            dot_color = (190, 130, 30, 255)
            s_size = 3.5
            
        draw.ellipse([sx - s_size, sy - s_size, sx + s_size, sy + s_size], fill=dot_color)

    # If has face (like the cute sunflowers in the video)
    if has_face:
        # Two big adorable shiny black eyes
        eye_offset_x = 35
        eye_y = cy - 8
        eye_r = 18
        
        for side in [-1, 1]:
            ex = cx + side * eye_offset_x
            draw.ellipse([ex - eye_r, eye_y - eye_r, ex + eye_r, eye_y + eye_r], fill=(15, 10, 8, 255))
            # Catchlights / shine in eye
            draw.ellipse([ex - 7, eye_y - 10, ex - 1, eye_y - 4], fill=(255, 255, 255, 255))
            draw.ellipse([ex + 2, eye_y + 1, ex + 6, eye_y + 5], fill=(255, 255, 255, 220))
            
        # Cute blushing cheeks
        for side in [-1, 1]:
            ch_x = cx + side * (eye_offset_x + 16)
            draw.ellipse([ch_x - 10, eye_y + 14, ch_x + 10, eye_y + 24], fill=(240, 120, 100, 180))
            
        # Happy smile
        smile_bbox = [cx - 16, cy + 8, cx + 16, cy + 28]
        draw.arc(smile_bbox, start=10, end=170, fill=(20, 10, 5, 255), width=3)

    img.save(filename)
    print(f"Saved {filename}")

if __name__ == '__main__':
    create_sunflower_texture('sunflower.png', False)
    create_sunflower_texture('sunflower_face.png', True)
