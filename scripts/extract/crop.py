"""Usage: python3 -I crop.py <pdf> <page(1-based)> <x0> <y0> <x1> <y1> <out.png>
Coordinates are fractions of the page (0..1), origin top-left. Renders at ~200 dpi."""
import sys, pypdfium2 as pdfium
pdf, page, x0, y0, x1, y1, out = sys.argv[1], int(sys.argv[2]), *map(float, sys.argv[3:7]), sys.argv[7]
doc = pdfium.PdfDocument(pdf)
img = doc[page-1].render(scale=200/72).to_pil()
W, H = img.size
img = img.crop((int(x0*W), int(y0*H), int(x1*W), int(y1*H)))
# trim white margins
from PIL import ImageOps, Image
bg = Image.new(img.mode, img.size, (255,255,255))
from PIL import ImageChops
diff = ImageChops.difference(img.convert('RGB'), bg.convert('RGB'))
bbox = diff.getbbox()
if bbox:
    pad = 8
    img = img.crop((max(0,bbox[0]-pad), max(0,bbox[1]-pad), min(img.size[0],bbox[2]+pad), min(img.size[1],bbox[3]+pad)))
img.save(out, optimize=True)
print(out, img.size)
