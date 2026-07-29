# PATHOK — MASTER PRD

## PROJECT
**Project Name:** Pathok
Pathok is a modern web application for reading books online.
The application should feel like **Kindle + Medium + Apple Books**.

**Primary focus:**
- Beautiful reading experience
- Extremely clean UI
- Minimal design
- Fast performance
- Mobile First
- Responsive
- Accessible
- Modern typography
- Smooth animation

UI inspiration comes from provided screenshots — never copy them exactly, use them as inspiration.
The design should look premium. Think Apple. Think Kindle. Think Notion. Think Medium.
Avoid clutter.

---

## TECHNOLOGY
- **Framework:** Next.js 15 App Router
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **UI:** shadcn/ui
- **Icons:** Lucide React
- **Animation:** Framer Motion
- **State:** React Context
- **Theme:** next-themes
- **Reader:** Custom Text Reader (no PDF viewer)

---

## DESIGN SYSTEM
- **Theme Primary:** Blue
- **Background (light):** Warm Off White
- **Background (dark):** Near Black
- **Corners:** Large Radius
- **Cards:** Soft Shadow
- **Spacing:** Generous
- **Typography — Headings:** Bold
- **Typography — Body:** Comfortable reading width
- **Line Height:** Large
- **Animations:** Soft, 150–250ms duration
- **Hover:** Subtle

---

## GENERAL RULES
- Use App Router
- Use TypeScript
- Use reusable components — never duplicate code
- Every component should be reusable
- Use server components where possible; client components only when needed
- Proper folder structure
- No inline CSS
- No hardcoded colors — use Tailwind variables
- Comment important code
- No placeholder hacks
- Everything production ready

---

## RESPONSIVE
Must work perfectly on:
- Desktop
- Tablet
- Mobile

---

## LANGUAGE
Supports:
- English
- বাংলা (Bangla)

All text must be translatable. Do not hardcode text inside components — use a translation dictionary.

---

## DARK MODE
- Light
- Dark
- System
- Remember user preference

---

## USER TYPES
- **Guest:** Can browse
- **User:** Can read books
- **Admin:** Can upload books

---

## READER
Books are NOT displayed as PDFs. Pipeline:

```
PDF/DOCX
   ↓
Extract Text
   ↓
Store
   ↓
Render as beautiful typography (like Kindle)
```

---

## CODE QUALITY
- Strict TypeScript
- Reusable
- Maintainable
- Scalable
- No unnecessary libraries
- No fake APIs
- No backend — use dummy JSON data

---

## IMPORTANT
- Build ONLY the requested module.
- Never build future modules.
- Never modify previous modules unless instructed.
- Return complete production-ready code.
