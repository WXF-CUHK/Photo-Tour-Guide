import { AnalysisResult } from "../types";

export interface SampleLandmark {
  id: string;
  name: string;
  category: string;
  location: string;
  latitude: number;
  longitude: number;
  year: string;
  confidence: "High" | "Medium" | "Low";
  funFact: string;
  imgUrl: string; // fallback preview SVG or dataurl
  imageBase64: string; // for compatibility with diary history
  analysis: AnalysisResult;
}

export const SAMPLE_LANDMARKS: SampleLandmark[] = [
  {
    id: "sample-eiffel",
    name: "Eiffel Tower",
    category: "Monumental Elevation",
    location: "Paris, France",
    latitude: 48.8584,
    longitude: 2.2945,
    year: "1889",
    confidence: "High",
    funFact: "The tower shrinks by about 6 inches during deep winter and sways up to 3 inches in high gale winds.",
    imgUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%238C7851'><rect width='100' height='100' fill='%23F5F2ED'/><path d='M45 90 L50 20 L55 90 Z' opacity='0.7'/><circle cx='50' cy='20' r='2'/><line x1='10' y1='90' x2='90' y2='90' stroke='%238C7851' stroke-width='2'/></svg>",
    imageBase64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPj/HwADBwF/L/R6owAAAABJRU5ErkJggg==", // 1px red fallback
    analysis: {
      metadata: {
        name: "Eiffel Tower",
        location: "Paris, France",
        latitude: 48.8584,
        longitude: 2.2945,
        year: "1889",
        category: "Monumental Elevation",
        confidence: "High",
        funFact: "The tower shrinks by about 6 inches during deep winter and sways up to 3 inches in high gale winds."
      },
      markdown: `
The **Eiffel Tower** stands as the ultimate icon of France, conceived by Gustave Eiffel for the 1889 Exposition Universelle to celebrate the centennial of the French Revolution.

### Chronology & Architectural Legend
Upon its completion, the tower provoked intense skepticism and visceral distaste among the Parisian intellectual elite. Luminaries like Guy de Maupassant claimed they ate lunch inside the tower simply because it was the only spot in Paris where they didn't have to look at it. Originally permitted for a mere 20-year span, the structure was saved from demolition when its potential as a giant radiotelegraph transmitter was proven.

Structurally, it stands 330 meters tall, built of iron puddle lattice that weighs roughly 10,100 tonnes. The geometric curvature of the base is calculated precisely to counteract wind load, turning engineering into poetry.

### Curated Nearby Dining
*   **Chez Francis** (Place de l'Alma) — Classic Parisian brasserie offering an exceptional direct angle of the illuminated tower. Opt for the fresh oysters.
*   **Le Jules Verne** (Eiffel Tower, Second floor) — A spectacular Michelin-starred culinary elevate. Booking three months in advance is highly recommended.
*   **Café de l'Homme** (Trocadéro) — A historic terrace that plates stunning seasonal French cuisine with an unobstructed elevation view.

### Hidden Detours & Details
*   **Gustave's Secret Apartment** — Tucked away on the third platform is Gustave Eiffel's private apartment, completely styled with velvet wallpaper, grand pianos, and historic scientific instrument drawers.
*   **The Southern Pillar Bunker** — Underneath the south pillar lies a labyrinth of military tunnels that hosted the earliest radio intelligence interception rooms during the Great War.
`,
      sources: [
        { title: "La Tour Eiffel - Historical Archives", url: "https://www.toureiffel.paris/en/heritage" },
        { title: "Gustave Eiffel's Private Quarters", url: "https://www.toureiffel.paris/en/news/history/gustave-eiffels-secret-apartment" }
      ]
    }
  },
  {
    id: "sample-colosseum",
    name: "The Colosseum",
    category: "Flavian Ruins & Arena",
    location: "Rome, Italy",
    latitude: 41.8902,
    longitude: 12.4922,
    year: "80 AD",
    confidence: "High",
    funFact: "Thousands of exotic wild beasts were brought from North Africa and the Middle East to battle in theatrical imperial games.",
    imgUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%238C7851'><rect width='100' height='100' fill='%23F5F2ED'/><path d='M20 70 A 30 20 0 0 1 80 70 L 80 80 L 20 80 Z' opacity='0.7'/><line x1='10' y1='80' x2='90' y2='80' stroke='%238C7851' stroke-width='2'/></svg>",
    imageBase64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    analysis: {
      metadata: {
        name: "The Colosseum",
        location: "Rome, Italy",
        latitude: 41.8902,
        longitude: 12.4922,
        year: "80 AD",
        category: "Flavian Ruins & Arena",
        confidence: "High",
        funFact: "Thousands of exotic wild beasts were brought from North Africa and the Middle East to battle in theatrical imperial games."
      },
      markdown: `
The **Flavian Amphitheatre**, universally recognized as the **Colosseum**, stands in the ancient swampy valley between the Esquiline, Palatine, and Caelian hills of historical Rome.

### Chronology & Architectural Legend
Commissioned by Emperor Vespasian around 70-72 AD and completed under Titus in 80 AD, this monumental ellipse is the largest ancient amphitheater ever constructed. It was built using travertine blocks bound together without mortar by iron clamps, capable of holding up to 65,000 specators.

The arena is renowned for its subterranean labyrinth—the **Hypogeum**. This system of tunnels and wooden cages housed gladiators, lions, leopards, and complicated pulley elevators that popped leopards directly onto the sand arena floor to surprise viewers.

### Curated Nearby Dining
*   **Divin Ostilia** (Via Ostilia 4) — A cozy, rustic wine bar featuring authentic carbonara and hand-rolled pasta plates just steps from the eastern arches.
*   **Aroma Restaurant** (Palazzo Manfredi) — Exceptional Michelin-starred rooftop terrace offering a sublime panorama of the Flavian ruins.
*   **Trattoria Luzzi** (Via San Giovanni in Laterano) — Vibrant local favorite with bustling waiters, fresh Roman clay-oven pizzas, and carafes of house red wine.

### Hidden Detours & Details
*   **Christian Martyrs Memorial** — The wooden cross on the north side commemorates the early Christians who supposedly suffered execution within the limestone corridors.
*   **Botanical Wonders** — Between the 17th and 19th centuries, the microclimate of the Colosseum ruins sprouted more than 400 unique species of rare plants, cataloged by naturalists as a flora sanctuary.
`,
      sources: [
        { title: "Parco Archeologico del Colosseo", url: "https://parcocolosseo.it/en/" },
        { title: "The Hypogeum Reconstruction Records", url: "https://www.colosseum-rome-tickets.com/colosseum-underground/" }
      ]
    }
  },
  {
    id: "sample-kinkaku",
    name: "Kinkaku-ji Temple",
    category: "Zen Muromachi Icon",
    location: "Kyoto, Japan",
    latitude: 35.0394,
    longitude: 135.7292,
    year: "1397",
    confidence: "High",
    funFact: "The top two floors are entirely covered in pure gold leaf, creating a majestic shimmering reflections on Kyoko-chi pond.",
    imgUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%238C7851'><rect width='100' height='100' fill='%23F5F2ED'/><path d='M30 80 L30 50 L70 50 L70 80 Z M25 50 L50 25 L75 50 Z' opacity='0.7'/><line x1='10' y1='80' x2='90' y2='80' stroke='%238C7851' stroke-width='2'/></svg>",
    imageBase64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    analysis: {
      metadata: {
        name: "Kinkaku-ji Temple",
        location: "Kyoto, Japan",
        latitude: 35.0394,
        longitude: 135.7292,
        year: "1397",
        category: "Zen Muromachi Icon",
        confidence: "High",
        funFact: "The top two floors are entirely covered in pure gold leaf, creating a majestic shimmering reflections on Kyoko-chi pond."
      },
      markdown: `
**Kinkaku-ji**, or the **Rokuon-ji Golden Pavilion**, is the ultimate masterpiece of Muromachi Zen garden architecture, mirroring its golden eaves in the Mirror Pond.

### Chronology & Architectural Legend
Originally built as a retirement villa for Shogun Ashikaga Yoshimitsu in 1397, it was converted into a Rinzai Sect Zen temple following his death. Each of the three floors represents a distinct architectural approach: Shinden-zukuri (palace style) on the bottom, Buke-zukuri (samurai style) in the middle, and Zen-shu-butsuden (Zen temple style) wrapped in shimmering gold on top.

The structure was tragically burned to ashes in 1950 by a young, distraught novice monk—a historical event beautifully immortalized in author Yukio Mishima's famous tragic novel *The Temple of the Golden Pavilion*. The pavilion was rebuilt to precise specifications in 1955.

### Curated Nearby Dining
*   **Kinkakuji Itadaki** (Across the street) — A delightful Western-style Japanese eatery serving crispy tonkatsu cutlets and rich, house-made demi-glace.
*   **Koyoan** (5-minute walk) — Cozy wooden tavern crafting handmade, chilled buckwheat soba noodles served with crispy wild vegetable tempura.
*   **Ryu-an Tea House** (Within Temple grounds) — Historical outdoor tatami stall offering earthy ceremonial matcha whisked with hand-pressed sweet bean cakes.

### Hidden Detours & Details
*   **The Stone Pagoda of White Snake** — High on the rear hillside is the Anmintaku Pond, holding a mysterious stone pagoda dedicated to the legendary White Snake, representing water and fertility.
*   **Sekka-tei Tea House** — Positioned at the exit trail, this rustic timber structure represents early Edo period wabi-sabi aesthetics, built with crooked natural tree trunks instead of straight pillars.
`,
      sources: [
        { title: "Rokuon-ji Official Temple Guide", url: "https://www.shokoku-ji.jp/en/kinkakuji/" },
        { title: "The Aesthetics of Muromachi Zen Architecture", url: "https://www.kyoto-culture.jp/heritage" }
      ]
    }
  }
];
