"""Turn the source line drawing into the texture the hero canvas samples.

Usage: python3 scripts/make-duck.py <source.png> public/duck.png

Output is a 256x256 RGB PNG:
  R  the outline, antialiased, with the eye removed
  G  a soft glow around the outline (this is what gets dithered)
  B  region id: 0 outside, 128 inside the body, 255 the eye
"""
import sys
from PIL import Image, ImageChops, ImageDraw, ImageFilter

SIZE = 256
EYE = (186, 121)  # a point inside the eye, in 256px space

src, out = sys.argv[1], sys.argv[2]
gray = Image.open(src).convert("L").resize((SIZE, SIZE), Image.LANCZOS)

regions = gray.point(lambda p: 255 if p > 100 else 0)
ImageDraw.floodfill(regions, (0, 0), 60)   # outside
ImageDraw.floodfill(regions, EYE, 200)     # eye
eye = regions.point(lambda p: 255 if p == 200 else 0)
inside = regions.point(lambda p: 128 if p == 0 else 0)

eye_soft = eye.filter(ImageFilter.MaxFilter(5))
line = ImageChops.subtract(gray, eye_soft)

near = gray.filter(ImageFilter.GaussianBlur(7))
far = gray.filter(ImageFilter.GaussianBlur(22))
glow = ImageChops.add(near.point(lambda p: int(p * 0.7)), far.point(lambda p: int(p * 1.1)))

region_id = ImageChops.lighter(inside, eye)
Image.merge("RGB", (line, glow, region_id)).save(out, optimize=True)
print("wrote", out)
