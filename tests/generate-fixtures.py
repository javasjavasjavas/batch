from PIL import Image
from pathlib import Path
root = Path('tests/fixtures')
rgba = Image.new('RGBA', (16, 12), (0, 0, 0, 0))
for x in range(4, 12):
    for y in range(3, 9):
        rgba.putpixel((x, y), (255, 0, 0, 255))
rgba.save(root / 'transparent.png')
rgb = Image.new('RGB', (16, 12), (255, 255, 255))
for x in range(3):
    for y in range(12):
        rgb.putpixel((x, y), (255, 0, 0))
for orientation, name in [(6, 'orientation-6.jpg'), (2, 'orientation-2.jpg')]:
    exif = Image.Exif(); exif[274] = orientation
    rgb.save(root / name, exif=exif, quality=95)
frames = [Image.new('RGB', (8, 8), color) for color in ('red', 'blue')]
frames[0].save(root / 'animated.gif', save_all=True, append_images=frames[1:], duration=100, loop=0)
(root / 'invalid.jpg').write_bytes(b'not an image')
from PIL import Image
from pathlib import Path
root=Path('tests/fixtures')
frames=[Image.new('RGBA',(8,8),color) for color in ('red','blue')]
frames[0].save(root/'animated.webp',save_all=True,append_images=frames[1:],duration=100,loop=0)
frames[0].save(root/'animated.png',save_all=True,append_images=frames[1:],duration=100,loop=0)
