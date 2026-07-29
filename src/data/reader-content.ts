export interface ReaderChapter {
  id: string;
  title: string;
  content: string[];
}

export const readerContent: Record<string, ReaderChapter[]> = {
  "the-quiet-atlas": [
    {
      id: "chapter-1",
      title: "Chapter 1 — The Map of Returning",
      content: [
        "The city had changed in ways that were easy to overlook and difficult to forget. New glass towers rose where old courtyards once held the afternoon light. The river still moved with the same patient rhythm, but the bridges were brighter now, carrying names that sounded more like promises than histories.",
        "When she returned, it was not to reclaim anything. It was to listen to the quiet places that had survived the years. The narrow lanes, the worn staircases, the small shops whose signs had been painted over and repainted, each one carrying the stubborn marks of memory.",
        "In the archives, she found envelopes tied with thread, notes folded with care, and pages that smelled faintly of cedar and rain. Each object seemed to carry an unspoken question: how much of a life can be preserved before it becomes a story told by someone else?"
      ],
    },
    {
      id: "chapter-2",
      title: "Chapter 2 — The Shape of Belonging",
      content: [
        "Belonging was never a single place. It was a collection of ordinary gestures: the sound of a kettle before dawn, the weight of a hand on a shoulder, the pause before a door opened and invited one inside. The city seemed to understand this better than the people who lived there.",
        "Within the first week, she began to notice that memory did not arrive as a complete picture. It arrived in fragments—an old recipe, the edge of a staircase, a sentence remembered out of order. And slowly, the fragments gathered shape.",
        "What she had initially feared as loss began to feel, instead, like a kind of inheritance. Not a possession, but a practice. A way of carrying forward without pretending that everything had remained unchanged."
      ],
    }
  ],
  "the-last-orchard": [
    {
      id: "chapter-1",
      title: "Chapter 1 — The Garden at Dusk",
      content: [
        "The orchard had been left to the weather and time. Its branches leaned with the patience of old witnesses. Yet beneath the neglect, the land still offered a kind of instruction. It showed that care could be quiet and persistent, lasting long after the hands that first gave it had become memory.",
        "In the evenings, the air was full of the smell of pears and damp earth. The silence between the trees felt less empty than deliberate, as though the place had chosen to hold its breath for those who would return."
      ],
    }
  ],
  "north-of-summer": [
    {
      id: "chapter-1",
      title: "Chapter 1 — Stations and Light",
      content: [
        "Every journey is a negotiation between the known and the unknown. The station offered its familiar rhythm — announcements, footsteps, coffee steam — while beyond the windows the coastline shimmered with a kind of silence that seemed almost architectural.",
        "The traveler learned quickly that landscapes do not only reveal themselves at a distance. They reveal themselves in the pauses between arrival and departure, in the waiting rooms and the small conversations that happen near the edge of the day."
      ],
    }
  ],
};
