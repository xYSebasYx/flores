from PIL import Image

def process():
    orig = Image.open('imagenparausar.jpeg')
    w, h = orig.size
    
    # 1. Clean border artifact (strip 2px outer border)
    # Background color
    bg_r, bg_g, bg_b = 224, 226, 241
    
    # Create RGBA
    img = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    orig_px = orig.load()
    img_px = img.load()
    
    for y in range(h):
        for x in range(w):
            # Ignore outer 3px border
            if x < 3 or x >= w - 3 or y < 3 or y >= h - 3:
                continue
            # Ignore copyright line at bottom
            if y > 1130:
                continue
                
            r, g, b = orig_px[x, y]
            dist = ((r - bg_r)**2 + (g - bg_g)**2 + (b - bg_b)**2)**0.5
            
            if dist < 12:
                img_px[x, y] = (0, 0, 0, 0)
            elif dist < 26:
                alpha = int(((dist - 12) / 14) * 255)
                img_px[x, y] = (r, g, b, alpha)
            else:
                img_px[x, y] = (r, g, b, 255)
                
    # 2. Extract Character only (Kuromi)
    # Exclude anything below y=956, and if y > 920 & x > 490 (flower artifact of logo)
    char_img = Image.new('RGBA', (w, 956), (0, 0, 0, 0))
    char_px = char_img.load()
    for y in range(240, 956):
        for x in range(w):
            if y > 920 and x > 490:
                continue
            char_px[x, y] = img_px[x, y]
            
    char_bbox = char_img.getbbox()
    char_cropped = char_img.crop(char_bbox)
    char_cropped.save('kuromi_char.png')
    
    # 3. Extract Logo only
    logo_img = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    logo_px = logo_img.load()
    for y in range(940, 1130):
        for x in range(w):
            logo_px[x, y] = img_px[x, y]
    logo_bbox = logo_img.getbbox()
    logo_cropped = logo_img.crop(logo_bbox)
    logo_cropped.save('kuromi_logo.png')
    
    # 4. Full (character + logo without borders)
    full_bbox = img.getbbox()
    full_cropped = img.crop(full_bbox)
    full_cropped.save('kuromi_full.png')
    
    print(f"Char: {char_cropped.size}, Logo: {logo_cropped.size}, Full: {full_cropped.size}")

if __name__ == '__main__':
    process()
