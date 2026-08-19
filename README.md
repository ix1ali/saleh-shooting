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

Source files live in `public/updated images/` (PNG, ~1086x1448). They are processed
into `public/media/` as AVIF + WebP by:

```bash
node _media.mjs
```

Re-run that after adding or replacing a source file. Edit the `PLAN` array in
`_media.mjs` to change crops or output sizes.

Every photograph appears **exactly once** on the site. If you add a section, give it
a new source rather than reusing one.

| Output | Source | Used by |
| --- | --- | --- |
| `range` | range.png | Intro |
| `pistol` | pistol.png | Ranges 01 |
| `rifle` | rifle.png | Ranges 02 |
| `shotgun` | shotgun.png | Ranges 03 |
| `archery` | archery.png | Ranges 04 |
| `booths` | range2.png | Contact backdrop |

The hero uses no photograph at all — it is drawn in CSS 3D.

The earlier low-resolution Instagram grabs have been deleted.

`Photo` applies a light unify pass (`saturate(.88) contrast(1.06)`) plus edge-only
tonal ramps, so the middle of each frame — where the subject is — stays clean.

**Consent:** several photographs show identifiable faces. Confirm you are cleared to
publish each one before launch.

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
| 01 | Hero | A real CSS-3D lane. Scroll drives the camera down it, three rounds go downrange and leave a group in the paper, then the bullseye becomes the doorway |
| 02 | Intro | Editorial assembly — rule, then lines, then copy, over a parallaxing plate |
| 03 | Ranges | Pinned panels stack; the incoming lane rises over the outgoing one |
| 04 | Selector | Staged questions; the result expands out of a ring and hands over a draft message |
| 05 | First visit | A round travels a rail, lighting each step of the session as it passes |
| 06 | Visit | Mechanical — digits roll, rules grow, address reveals line by line |
| 07 | Contact | Panel rises over a photographic backdrop; tracking closes; the mark lands last |

### The hero lane

Genuine CSS 3D. Floor, ceiling and walls are planes in space; `--camN` is one
`translateZ` driven by scroll. The blue LED strips are gradients painted onto the wall
planes, so they recede in real perspective — that is what carries the depth. The target
grows purely through perspective; its scale is never animated.

Three details that will bite if you edit it:

- **Depth furniture culls itself in pure CSS**
  (`calc((depth - 300 - var(--camN)) / 420 * var(--sceneOn))`), so nothing straddles the
  camera plane and blows up across the frame. No per-element JS runs per frame.
- **The long planes are pushed back** by `LANE.shift`. Centred on zero they end up
  entirely behind the camera by the end of the run-in, leaving the target in black.
- **The camera finishes 200 units past the target plane** (`CAM_END = 3400`). Under CSS
  perspective an object scales by `p / (p - z)`; stopping at the target plane tops out
  near half the screen width. The rig is anchored at `top: 42%`, on the perspective
  origin, so the bullseye stays locked to the portal centre at every scale.

### Two more things worth knowing

**Scrubbed timelines publish from the timeline, not the trigger.** A ScrollTrigger's
`onUpdate` fires on scroll while the scrub tween advances the playhead on later ticks.
Writing scene state from the trigger therefore publishes the previous frame and — once
scrolling stops — never fires again, freezing the scene at a stale value. Every scrubbed
section here writes from `timeline.onUpdate`.

**Fixed chrome is centred with auto margins, never `translateX(-50%)`.** The bar, action
bar, menu overlay and language curtain are all animated by GSAP, and any transform it
writes replaces the centring one — which threw the bar off-screen the moment the layout
flipped to RTL.

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
- Switching runs behind a curtain (`LanguageCurtain`): it wipes in, the locale changes,
  ScrollTrigger remeasures, and it lifts. Swapping in place made the page jump, because
  the two scripts have completely different metrics.

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

Taken from the facility itself. The interior is near-black lit by blue LED strips
running from a royal `#1C4EB0` to a cyan `#279ACF`, so:

- `--accent: #2E90F5` — the working blue, readable on near-black
- `--accent-bright: #6FBEFF` — highlights and glows
- `--accent-deep: #12428F` — fills
- Surfaces (`--void`, `--ink`, `--charcoal`) all carry a navy cast
- `--bone: #F2F6FB` is a cool white; the neutrals (`--mist`, `--mist-dim`) are cool greys

Change `--accent` in `src/styles/globals.css` and every accented element follows.

## 6. Viewport

Designed for 375 / 390 / 393 / 414 / 430 px wide. Verified free of horizontal overflow
and text clipping at 375, 390 and 430 in both LTR and RTL.

On screens wider than 560px the site presents as a deliberate centred phone column
(`--shell-w: 430px`) rather than a stretched desktop layout. Fixed UI is pinned to that
column, not to the browser viewport.
