export interface DesignItem {
  id: string;
  title: string;
  category: string;
  image: string;
  isPremium: boolean;
  prompt: string;
}

export interface CinematicImage {
  id: string;
  title: string;
  image: string;
  prompt: string;
  colors: string[];
  lighting: string;
}

export const cinematicImages: CinematicImage[] = [
  {
    id: "ci1",
    title: "Neon Cyber-Alley",
    image: "https://images.unsplash.com/photo-1605806616949-1e8284889ea4?q=80&w=2000&auto=format&fit=crop",
    prompt: "A cinematic shot of a futuristic cyberpunk alleyway in Neo-Tokyo, rain-slicked streets reflecting bright neon signs. Volumetric fog rolling through the ground. Shot on ARRI Alexa 65, 35mm lens.",
    colors: ["#FF0055", "#00E5FF", "#120B29"],
    lighting: "Neon tube practicals, stark rim lighting, volumetric fog diffusion."
  },
  {
    id: "ci2",
    title: "Ethereal Monolith",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop",
    prompt: "A massive, floating obsidian monolith over an alien desert landscape. Glowing runes etching across its surface. Shot on 70mm film, atmospheric haze.",
    colors: ["#F25C05", "#592E25", "#0D0D0D"],
    lighting: "Golden hour directional sunlight, harsh cast shadows, bioluminescent rune glow."
  },
  {
    id: "ci3",
    title: "Boreal Echoes",
    image: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2000&auto=format&fit=crop",
    prompt: "A lone figure standing on a glass-like frozen lake, looking up at swirling aurora borealis that looks like a digital glitched sky. Hyper-realistic, 8k resolution, cinematic color grading.",
    colors: ["#00FF9D", "#0A192F", "#6B21A8"],
    lighting: "Overhead bioluminescent aurora light, cold lunar ambient reflection on ice."
  },
  {
    id: "ci4",
    title: "Synthwave Horizon",
    image: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2000&auto=format&fit=crop",
    prompt: "A retro-futuristic synthwave landscape featuring a glowing wireframe grid terrain leading to a massive setting digital sun. Warm nostalgic 80s aesthetic.",
    colors: ["#FF3366", "#20002C", "#FFD700"],
    lighting: "High-contrast synthetic sunset, glowing rim light from grid structures."
  }
];

export const designs: DesignItem[] = [
  {
    id: "d1",
    title: "Aura // Finance OS",
    category: "Dashboard",
    image: "https://images.unsplash.com/photo-1614036634955-ae5e90fecbfa?q=80&w=2000&auto=format&fit=crop",
    isPremium: true,
    prompt: "A dark, premium finance dashboard. Monochromatic black and dark charcoal colors. Glowing neon accents. Clean typography, minimal spacing, glassmorphism cards. High-end, technical, precision.",
  },
  {
    id: "d2",
    title: "Vanguard Architecture",
    category: "Portfolio",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000&auto=format&fit=crop",
    isPremium: false,
    prompt: "Minimalist architecture firm portfolio. Brutalist typography, heavy contrast, strictly black and white. Large, edge-to-edge photography. Swiss design influence.",
  },
  {
    id: "d3",
    title: "Lumine // Skincare",
    category: "E-Commerce",
    image: "https://images.unsplash.com/photo-1615397323674-f25baf7d6b38?q=80&w=2000&auto=format&fit=crop",
    isPremium: true,
    prompt: "Luxury skincare e-commerce product page. Warm off-white background, delicate serif typography (Cormorant). Organic pill-shaped images, soft lighting, elegant spacing.",
  },
  {
    id: "d4",
    title: "Synapse AI",
    category: "Landing Page",
    image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2000&auto=format&fit=crop",
    isPremium: true,
    prompt: "Deep tech AI startup landing page. Pitch black background, subtle grid lines, bright electric blue spot glows. Monospace accents. Futuristic but restrained and corporate.",
  },
  {
    id: "d5",
    title: "Kova // Interior",
    category: "Agency",
    image: "https://images.unsplash.com/photo-1600607687920-4e2a09c15468?q=80&w=2000&auto=format&fit=crop",
    isPremium: false,
    prompt: "High-end interior design agency site. Split pane layout, massive elegant serif headlines. Muted taupe and beige colors. Slow, deliberate animations.",
  },
  {
    id: "d6",
    title: "Pulse Tracker",
    category: "App UI",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2000&auto=format&fit=crop",
    isPremium: true,
    prompt: "Dark mode music or habit tracking app. Neumorphic touches mixed with glassmorphism. Deep purple and magenta gradients softly illuminating standard dark gray components.",
  },
  {
    id: "d7",
    title: "Odyssey // Travel UX",
    category: "Mobile App",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2000&auto=format&fit=crop",
    isPremium: true,
    prompt: "Luxury travel planning mobile app interface. Frosted glass overlays, deep earth tones, elegant serif headers, and full bleed photography. Interactive map features.",
  },
  {
    id: "d8",
    title: "Chronos // Watch Store",
    category: "E-Commerce",
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=2000&auto=format&fit=crop",
    isPremium: false,
    prompt: "High-end watch e-commerce product landing page. Pitch black background, gold and silver metallic accents, high-contrast lighting emphasizing product reflections.",
  },
  {
    id: "d9",
    title: "Zenith // AI OS",
    category: "Dashboard",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2000&auto=format&fit=crop",
    isPremium: true,
    prompt: "Next-generation AI operating system dashboard. Glowing interactive data visualizations, dense technical text, pure #000 background with dark gray pane borders.",
  },
  {
    id: "d10",
    title: "Sojourn // Retreats",
    category: "Landing Page",
    image: "https://images.unsplash.com/photo-1499696010180-025ef6e1a8f9?q=80&w=2000&auto=format&fit=crop",
    isPremium: false,
    prompt: "Minimalist wellness retreat landing page. Very light cream background, sage green accents, perfectly centered editorial text. Soft and airy.",
  },
  {
    id: "d11",
    title: "Horizon // Real Estate",
    category: "Platform",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000&auto=format&fit=crop",
    isPremium: true,
    prompt: "Premium residential real estate platform. Split layout with large immersive property image on the left, beautifully formatted property details on the right.",
  },
  {
    id: "d12",
    title: "Nexus // Developer Tool",
    category: "App UI",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2000&auto=format&fit=crop",
    isPremium: false,
    prompt: "Dark mode developer productivity tool interface. Monospace typography heavily utilized, syntax highlighting colors as subtle structural accents. High density.",
  }
];

export const courses = [
  // --- 7 Free Courses ---
  {
    id: "c1",
    title: "YouTube Automation Mastery",
    description: "Systematize content creation with AI workflows and seamless delegation.",
    modules: 12,
    isFree: true
  },
  {
    id: "c4",
    title: "Intro to AI Assisted Coding",
    description: "Leveraging LLMs for swift boilerplate generation and intelligent debugging.",
    modules: 5,
    isFree: true
  },
  {
    id: "c5",
    title: "Color Theory for AI Generation",
    description: "Prompt exact color palettes, cinematic grading, and tonal atmospheres.",
    modules: 4,
    isFree: true
  },
  {
    id: "c6",
    title: "Structuring React Apps with AI",
    description: "Using AI agents to cleanly bootstrap scalable frontend full-stack architectures.",
    modules: 7,
    isFree: true
  },
  {
    id: "c7",
    title: "Prompting Product Photography",
    description: "Generate breathtaking flat-lays, studio lighting setups, and flawless product mockups.",
    modules: 6,
    isFree: true
  },
  {
    id: "c8",
    title: "AI for Copywriting & Microcopy",
    description: "Tone adjustment, concise storytelling, and converting UX writing using LLMs.",
    modules: 3,
    isFree: true
  },
  {
    id: "c9",
    title: "Rapid Prototyping Workflows",
    description: "The accelerated path from raw idea to Figma wireframe to functional React code.",
    modules: 8,
    isFree: true
  },
  // --- 7 Premium Courses ---
  {
    id: "c2",
    title: "Prompting for High-End Web UI",
    description: "Learn to extract usable, polished, zero-slop UI designs from language models.",
    modules: 8,
    isFree: false
  },
  {
    id: "c3",
    title: "Cinematic Image Generation",
    description: "Lighting, aperture, and texture prompts for photorealistic midjourney & DALL-E outputs.",
    modules: 10,
    isFree: false
  },
  {
    id: "c11",
    title: "Advanced AI UI/UX Workflows",
    description: "Master the exact pipeline from text prompt to production-ready enterprise React code.",
    modules: 14,
    isFree: false
  },
  {
    id: "c12",
    title: "Building Custom LLM Agents",
    description: "Master system prompt engineering, Retrieval-Augmented Generation (RAG), and memory logic.",
    modules: 16,
    isFree: false
  },
  {
    id: "c13",
    title: "Mastering Midjourney V6",
    description: "Style references, rigorous character consistency, and advanced weight parameters.",
    modules: 12,
    isFree: false
  },
  {
    id: "c14",
    title: "AI Physics Animation Generation",
    description: "Creating complex GPU-accelerated SVG/Canvas physics code efficiently with AI.",
    modules: 10,
    isFree: false
  },
  {
    id: "c15",
    title: "Enterprise AI Component Systems",
    description: "Generating rigorous, accessible, and themeable UI libraries automatically.",
    modules: 8,
    isFree: false
  }
];
