# ShootingQ8 — Shooting Complex

A mobile-first, scroll-choreographed site for the Shooting Complex (@shootingq8), Kuwait.
Next.js 16 · React 19 · TypeScript · GSAP 3.13 (ScrollTrigger + SplitText) · Lenis.

```bash
npm run dev     # http://localhost:4321
npm run build
npm start
```

---

## 1. Where the content lives

**Everything the site displays comes from [`src/data/site.ts`](src/data/site.ts).**
Nothing is hard-coded in a component. Each entry is tagged:

| Tag | Meaning |
| --- | --- |
| `[VERIFIED]` | Taken from the official Instagram profile / highlights |
| `[PLACEHOLDER]` | Written for this build — **replace with official copy** |
| `[UNCONFIRMED]` | Plausible but unverified — **not rendered** until you enable it |

### What is verified

- Brand name **Shooting Complex** and handle **@shootingq8**
- Hours: **Sun–Thu 10:00–22:00**, **Fri–Sat 15:00–22:30**
- Location: Kuwait, behind Al Murooj and the Hunting and Equestrian Club
- Google Maps listing: *Mayadeen Public Shooting Range / Shooting Q8*
- Enquiries are handled by Instagram DM

### What you should replace

- All section copy (intro, standards, archery, contact) — currently written for structure
- `contact.phone` and `contact.whatsapp` are `null`. **No public phone number is listed
  on the Instagram profile**, so the Call and WhatsApp buttons are not rendered at all
  rather than shipped as dead links. Set either value (digits only, full international
  format, e.g. `"96512345678"`) and the button appears everywhere at once.
- `safety.points` are general, non-specific principles. They make **no claim of
  certification or accreditation**. Replace with the facility's own published rules.

### What is deliberately switched off

- `unconfirmedOfferings` — youth sessions, school/group visits, beginner induction and
  the 50m range are **not** published on the official profile. Confirm them with the
  facility, then set `enabled: true`.
- `pricing` — rates are discussed publicly by third parties but are not published by the
  facility, so they are not displayed. Add them only once confirmed.

---

## 2. Imagery

The site uses **real photographs from @shootingq8**, pulled from the account's public
grid and processed into `public/media/` as AVIF + WebP. Originals are kept in
`public/media/raw/`.

| File | Shows | Used by |
| --- | --- | --- |
| `range` | Two shooters at the scoring board on the line | Hero portal, Intro background, Facility 01 |
| `pistol` | Shooter on a handgun lane | Disciplines 01, Standards underlay |
| `rifle` | Scoped rifle from a bench rest | Disciplines 02 |
| `shotgun` | Shotgun shooter (cropped off the promo text) | Disciplines 03 |
| `archery` | Recurve bow in the indoor archery hall | Disciplines 04 |
| `youth` | A young shooter with his target | Facility 02 |
| `event` | Flags at an event in the hall | Facility 03 |
| `murouj` | The Al Murooj entrance at night | Facility 04 |

### Two things to check before this goes live

1. **Consent for identifiable people.** Several photographs show faces, including a
   child (`youth`). The facility posted these itself, but a website is a different
   use from an Instagram grid. Confirm you are happy to publish each one, and swap
   any you are not.
2. **Resolution.** Instagram only serves these at 640px; requests for 1080/1440
   derivatives were refused. They are upscaled 2.5x to 900x1200, which is soft under
   close inspection. **Supplying the originals is the single biggest quality win
   available** — drop them in `public/media/raw/` and re-run the processing step.

To swap an image, change the `image` field on the matching entry in `src/data/site.ts`
to another base name and update its caption to match what the photograph shows.
Setting `image: null` falls back to the procedural artwork in `DisciplineArt`.

Incoming photography is pulled onto the palette by `Photo` — a light unify pass
(`saturate(.88) contrast(1.06)`) plus edge-only tonal ramps, so the middle of the
frame where the subject sits stays clean.

**Video** is not wired up: Instagram serves reel thumbnails, not the video files.

## 3. Motion architecture

Reusable primitives live in `src/components/motion/`. Sections compose them; no section
re-implements a reveal.

| Primitive | What it does |
| --- | --- |
| `MaskHeading` | Display lines rise out of clipping masks, staggered |
| `SplitWords` | Word stagger with a one-shot blur-to-sharp; `lock` variant snaps to a grid |
| `RevealCopy` | Body copy split to lines via SplitText and lifted under masks |
| `TrackingIn` | Letter-spacing closes; measures its column first so it can never overflow |
| `ScrollLabel` | Hairline draws, then the label follows it in |
| `RollingNumber` | Digits roll like a range scoreboard |
| `AnimatedCounter` | Locale-formatted count-up |
| `MaskReveal` | Images uncovered by an edge, wipe, iris or bars — never a fade |
| `TargetRings` | The brand motif, used as portal, mask, loader, pin and progress |

`src/lib/motion.ts` holds the shared easing/duration/scrub tokens, the scoped
`useGsap()` wrapper (every ScrollTrigger is reverted on unmount), and the
reduced-motion helpers.

### One motion idea per section

| # | Section | Idea |
| --- | --- | --- |
| 01 | Hero | Real CSS-3D lane; scroll drives a camera down it into the bullseye |
| 02 | Intro | Editorial assembly — rule, then lines, then copy; ground and ring on three speeds |
| 03 | Disciplines | Pinned panels stack; the incoming lane rises over the outgoing one |
| 04 | Selector | Staged questions; the result expands out of a ring |
| 05 | Facility | Film strip — windows unspool, pictures drift, captions overtake their frames |
| 05b | Archery | The only horizontal section: an arrow travelling a line uncovers the heading |
| 06 | Standards | A technical drawing that draws itself; words lock onto the grid |
| 07 | Visit | Mechanical — digits roll, rules grow, address reveals line by line |
| 08 | Contact | Panel rises over the previous section; tracking closes; the mark lands last |

### The hero, specifically

The lane is genuine CSS 3D, not a parallax fake. Floor, ceiling and walls are planes in
space; `--camN` is a single `translateZ` driven by scroll. The target grows purely
through perspective — its scale is never animated.

Two details that matter if you edit it:

- Depth furniture fades out via a pure-CSS expression
  (`calc((depth - 300 - var(--camN)) / 420 * var(--sceneOn))`) so nothing ever
  straddles the camera plane and blows up across the frame. No per-element JS runs
  per frame.
- The camera finishes at `CAM_END = 3400`, which is **200 units past** the target
  plane. Under CSS perspective an object scales by `p / (p - z)`; stopping at the
  target plane would top out at roughly half the screen width. The target rig is
  anchored at `top: 46%` to sit exactly on the perspective origin, so the bullseye
  stays locked to the portal centre at every scale.

---

## 4. Bilingual (EN / AR)

The language toggle is in the top bar. `src/lib/locale.tsx` swaps `lang`/`dir` on
`<html>` and refreshes ScrollTrigger, since text metrics change completely between
scripts.

- All layout uses **CSS logical properties**, so RTL mirrors without a second stylesheet.
- Text is split **by line and word only, never by character** — Arabic is a connected
  script and per-character splitting tears its ligatures apart. `TrackingIn` falls back
  to a mask reveal in Arabic for the same reason.
- Clock times and index numbers are forced `direction: ltr` so they never mirror.

---

## 5. Accessibility and performance

- `prefers-reduced-motion` is honoured in **every** section with an explicit branch:
  scrubbing and parallax are dropped, layout is unchanged, short fades replace the
  choreography.
- Pinch-zoom is never disabled (`maximumScale: 5`).
- Animation is restricted to `transform`, `opacity` and `clip-path`. The only `filter`
  use is a one-shot entrance blur that is cleared on completion — nothing filters
  continuously during scroll.
- Scroll-driven custom properties are registered with `@property` as typed numbers.
- Lenis smoothing runs on pointer devices only. **Touch keeps native momentum
  scrolling** — hijacking it costs the direct finger connection the site depends on.

---

## 6. Colour

The accent is derived from the brand's own artwork, not invented. Sampling the official
Instagram graphics gives a deep navy `#0D2D60` and a teal `#0A627E`. Neither is legible
as an accent on a near-black page, so the working accent `--accent: #3D9BD4` is a lifted
member of the same family, with the true navy kept for surfaces and fills. Near-blacks
carry a slight navy cast so the whole page sits in that family.

Change `--accent` in `src/styles/globals.css` and every accented element follows.

## 6. Viewport

Designed for 375 / 390 / 393 / 414 / 430 px wide. Verified free of horizontal overflow
and text clipping at 375, 390 and 430 in both LTR and RTL.

On screens wider than 560px the site presents as a deliberate centred phone column
(`--shell-w: 430px`) rather than a stretched desktop layout. Fixed UI is pinned to that
column, not to the browser viewport.
