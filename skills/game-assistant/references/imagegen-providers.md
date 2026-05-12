# Image Generation Providers — Reference

This file is read by MODE 4 (IMAGEGEN). It contains API details, prompt guidance, and code examples for every supported image generation provider. Always read the relevant section before generating or instructing the user.

---

## PROVIDER DECISION MATRIX

| Provider | Best for | Access method | Image quality | Speed |
|---|---|---|---|---|
| **Google Gemini Imagen 3** | Photorealistic, detailed scenes | Google AI Studio API / Vertex AI | ⭐⭐⭐⭐⭐ | Medium |
| **Microsoft Copilot / DALL-E 3** | Artistic styles, composition control | Azure OpenAI API / Copilot chat | ⭐⭐⭐⭐ | Fast |
| **OpenAI DALL-E 3** (direct) | Prompt accuracy, text-in-image | OpenAI API | ⭐⭐⭐⭐ | Fast |
| **Stability AI (SDXL / SD3)** | Custom styles, local fine-tunes | Stability AI API / local | ⭐⭐⭐⭐ | Fast/Local |
| **Midjourney** | Artistic quality, aesthetics | Discord bot / API (v7+) | ⭐⭐⭐⭐⭐ | Medium |
| **Anthropic (via artifacts)** | Integrated artifact flow | Anthropic artifacts API | ⭐⭐⭐ (diagrams/SVG) | Fast |
| **Fallback: image_search** | Real photos, existing art | Built-in tool | N/A (real photos) | Instant |
| **Fallback: visualize** | Diagrams, SVG illustrations | Built-in tool | Vector quality | Instant |

---

## 1. GOOGLE GEMINI IMAGEN

### Models available (as of mid-2025)
- `imagen-3.0-generate-001` — flagship, best photorealism
- `imagen-3.0-fast-generate-001` — faster, slightly lower quality
- `imagegeneration@006` (Vertex AI) — stable production model

### API call (Google AI Studio / Gemini API)

```python
import google.generativeai as genai
from PIL import Image
import io, base64

genai.configure(api_key="YOUR_GEMINI_API_KEY")

model = genai.ImageGenerationModel("imagen-3.0-generate-001")

result = model.generate_images(
    prompt="YOUR PROMPT HERE",
    number_of_images=1,
    aspect_ratio="1:1",          # "1:1", "16:9", "9:16", "4:3", "3:4"
    safety_filter_level="block_some",
    person_generation="allow_adult",
)

image = result.images[0]
image.save("output.png")
```

### API call (Vertex AI / production)

```python
from vertexai.vision_models import ImageGenerationModel

model = ImageGenerationModel.from_pretrained("imagen-3.0-generate-001")

images = model.generate_images(
    prompt="YOUR PROMPT HERE",
    number_of_images=1,
    aspect_ratio="1:1",
    add_watermark=False,
)
images[0].save(location="output.png", include_generation_parameters=False)
```

### REST API (direct HTTP)

```bash
curl -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict" \
  -H "x-goog-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "instances": [{"prompt": "YOUR PROMPT HERE"}],
    "parameters": {
      "sampleCount": 1,
      "aspectRatio": "1:1",
      "safetySetting": "block_some"
    }
  }'
```

### Imagen prompt tips
- Describe subject → style → mood → lighting in that order
- Works best with specific art styles: `"studio ghibli watercolor"`, `"vintage board game box art"`, `"gouache illustration"`
- Add `"highly detailed, 4K"` for maximum detail
- Avoid: overly complex multi-scene descriptions; use one clear focal point

### Imagen aspect ratios for game content
| Use case | Ratio |
|---|---|
| Guide cover | 16:9 |
| Card art | 3:4 or 9:16 |
| Component photo replacement | 1:1 |
| Wide board illustration | 16:9 |
| Portrait character art | 9:16 |

---

## 2. MICROSOFT COPILOT / DALL-E 3 (Azure OpenAI)

### Models available
- `dall-e-3` — current flagship (1024×1024, 1792×1024, 1024×1792)
- `dall-e-2` — legacy, smaller outputs, lower quality

### API call (Azure OpenAI)

```python
from openai import AzureOpenAI

client = AzureOpenAI(
    azure_endpoint="https://YOUR_RESOURCE.openai.azure.com/",
    api_key="YOUR_AZURE_KEY",
    api_version="2024-02-01"
)

result = client.images.generate(
    model="dall-e-3",              # your deployment name
    prompt="YOUR PROMPT HERE",
    size="1024x1024",              # "1024x1024", "1792x1024", "1024x1792"
    quality="hd",                  # "standard" or "hd"
    style="vivid",                 # "vivid" (saturated, dramatic) or "natural"
    n=1,
)

image_url = result.data[0].url
revised_prompt = result.data[0].revised_prompt  # DALL-E rewrites your prompt — log this
print(f"URL: {image_url}")
print(f"Revised prompt: {revised_prompt}")
```

### API call (OpenAI direct, same model)

```python
from openai import OpenAI

client = OpenAI(api_key="YOUR_OPENAI_KEY")

result = client.images.generate(
    model="dall-e-3",
    prompt="YOUR PROMPT HERE",
    size="1024x1024",
    quality="hd",
    style="vivid",
    n=1,
)

print(result.data[0].url)
```

### Via Microsoft Copilot (no-code)
1. Open [copilot.microsoft.com](https://copilot.microsoft.com) or the Copilot sidebar in Edge/Windows
2. Type or paste your image prompt directly in the chat
3. Copilot uses DALL-E 3 internally — results are equivalent to the API
4. Right-click → Save image, or use the download button

### DALL-E 3 prompt tips
- DALL-E 3 rewrites prompts automatically — be explicit to avoid over-correction
- Wrap literal instructions in quotes: `"A board game box labeled 'Catan' with wheat and ore"` → use `a board game box` without exact brand names
- Add `"I NEED to keep [X] exactly as described"` to resist rewriting
- `style: "natural"` for realistic, `"vivid"` for dramatic/artistic
- `quality: "hd"` costs 2× tokens but produces significantly more detail — worth it for guide covers

### DALL-E size → use case
| Size | Use case |
|---|---|
| 1024×1024 | Square card art, component icons |
| 1792×1024 | Guide cover, landscape illustrations |
| 1024×1792 | Portrait card art, character illustrations |

---

## 3. STABILITY AI (Stable Diffusion XL / SD3)

### Models available
- `stable-diffusion-3-5-large` — SD3.5, best quality
- `stable-diffusion-3-5-large-turbo` — SD3.5 fast
- `stable-image-ultra` — highest quality, slower
- `stable-image-core` — fast, good quality

### API call (Stability AI REST)

```python
import requests, base64

response = requests.post(
    "https://api.stability.ai/v2beta/stable-image/generate/core",
    headers={
        "Authorization": "Bearer YOUR_STABILITY_KEY",
        "Accept": "image/*"
    },
    files={"none": ""},
    data={
        "prompt": "YOUR PROMPT HERE",
        "negative_prompt": "blurry, text, watermark, distorted",
        "aspect_ratio": "1:1",    # "1:1","16:9","21:9","2:3","3:2","4:5","5:4","9:16","9:21"
        "style_preset": "fantasy-art",  # see style presets below
        "output_format": "png",
        "seed": 0,                # 0 = random
    },
)

with open("output.png", "wb") as f:
    f.write(response.content)
```

### Style presets (useful for game art)
| Preset | Best for |
|---|---|
| `fantasy-art` | RPGs, medieval games |
| `comic-book` | Cartoon/illustrated games |
| `digital-art` | Modern/sci-fi games |
| `isometric` | Strategy game board views |
| `low-poly` | Abstract/modern games |
| `pixel-art` | Retro/indie games |
| `watercolor` | Cozy/nature games |
| `enhance` | Photo-realistic components |

### Negative prompt for game art (always include)
```
blurry, text, watermark, low quality, distorted anatomy, extra limbs, 
duplicate objects, oversaturated, overexposed, noisy, grainy
```

---

## 4. MIDJOURNEY

### Access methods
- **Discord bot**: `/imagine prompt: YOUR PROMPT --ar 16:9 --style raw --v 7`
- **API (v7+, beta)**: available to paid subscribers via midjourney.com

### Prompt structure for Midjourney
```
/imagine prompt: [subject description], [style], [mood], [technical params] --ar [ratio] --v 7 --style raw --q 2
```

Example:
```
/imagine prompt: medieval trading post with wooden resource tokens, vintage board game box art style, warm amber lighting, highly detailed --ar 1:1 --v 7 --style raw --q 2
```

### Key parameters
| Param | Values | Effect |
|---|---|---|
| `--ar` | `1:1`, `16:9`, `3:4`, `9:16` | Aspect ratio |
| `--v` | `7` (latest) | Model version |
| `--style` | `raw`, `cute`, `expressive`, `scenic` | Style variant |
| `--q` | `0.25`, `0.5`, `1`, `2` | Quality (cost × quality) |
| `--no` | `text, watermark` | Negative prompt |
| `--seed` | any number | Reproducible results |

---

## 5. ANTHROPIC API (Artifacts / Inline generation)

The Anthropic Claude API does not natively generate raster images. Instead, use it for:

### What Anthropic CAN do for IMAGEGEN
1. **SVG illustrations** — generate rich SVG art via `visualize:show_widget` (turn flowcharts, card layouts, board diagrams, thematic cover art in vector format)
2. **Prompt generation** — use Claude to write optimized prompts for the above providers, then hand off to the user
3. **Image analysis** — accept uploaded game component images and describe/translate them (MODE 3)
4. **HTML mockups** — create interactive card/board mockups as HTML artifacts

### Artifact-based image prompt generator (use in Claude artifacts)

```javascript
// In a Claude artifact: generate optimized prompts for any provider
const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    messages: [{
      role: "user",
      content: `Generate 3 image prompts for: [game name], [art style], [use case].
                Format as JSON array with fields: provider (dalle3/imagen/midjourney/sdxl), prompt, negative_prompt, params`
    }]
  })
});
const data = await response.json();
const prompts = JSON.parse(data.content[0].text);
```

---

## 6. UNIVERSAL PROMPT TEMPLATE FOR GAME ART

Copy and adapt this template for any provider:

```
[PRIMARY SUBJECT]: [what/who is in the image, specific details]
[SETTING]: [location, time period, environment]
[STYLE]: [art style — e.g. "vintage board game illustration", "oil painting", "flat vector"]
[MOOD/LIGHTING]: [atmosphere — e.g. "warm golden hour", "dramatic shadows", "soft diffused light"]
[COLOR PALETTE]: [specific colors — e.g. "deep greens and warm wood tones"]
[COMPOSITION]: [camera angle, framing — e.g. "bird's eye view", "close-up", "wide establishing shot"]
[TECHNICAL]: [aspect ratio, quality — e.g. "16:9 landscape, highly detailed, 4K"]
[NEGATIVE]: no text, no watermarks, no blurry elements, no extra hands
```

### Genre-specific prompt snippets

**Eurogame / Worker Placement:**
> `...vintage German board game box art style, warm browns and greens, wooden meeples and resource tokens, overhead isometric view, cozy and strategic atmosphere...`

**Fantasy / RPG:**
> `...oil painting illustration in the style of classic fantasy book covers, dramatic lighting, rich jewel tones, epic scale with a sense of adventure...`

**Sci-Fi / Space:**
> `...digital concept art, cool blues and purples with neon accents, sleek spacecraft or alien world, cinematic lighting, sense of vast scale...`

**Horror / Mystery:**
> `...dark gothic illustration, desaturated palette with single warm light source, aged paper texture overlay, eerie atmosphere, detailed ink-like linework...`

**Nature / Cozy:**
> `...soft watercolor illustration, gentle pastel tones, seasons and natural elements, warm and inviting, Studio Ghibli-inspired softness...`

**Abstract / Modern:**
> `...clean flat vector illustration, bold primary colors with geometric shapes, minimalist composition, modern graphic design aesthetic...`

---

## PROVIDER SELECTION CHEAT SHEET

```
User has Google AI Studio / Vertex AI account?  → GEMINI IMAGEN 3
User has Azure subscription / OpenAI account?   → DALL-E 3
User wants maximum artistic quality?            → MIDJOURNEY
User wants local/self-hosted generation?        → STABILITY AI (SDXL)
User has no API access?                         → image_search + visualize:show_widget
Need a diagram/flowchart (not photo)?           → visualize:show_widget (always)
Need real game photos?                          → image_search (always)
```

---

## COST REFERENCE (approximate, mid-2025)

| Provider | Cost per image |
|---|---|
| Gemini Imagen 3 | ~$0.03–0.04 |
| DALL-E 3 standard | ~$0.04 |
| DALL-E 3 HD | ~$0.08 |
| Stability AI Core | ~$0.03 |
| Stability AI Ultra | ~$0.08 |
| Midjourney Basic plan | ~$0.02 (included in sub) |
| image_search | Free (built-in) |
| visualize:show_widget | Free (built-in) |
