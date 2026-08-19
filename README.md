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

### Two placeholders that MUST be replaced before launch

1. **`contact.whatsapp`** is `"96500000000"`. The 500 prefix is not issued to
   Kuwaiti mobiles, so WhatsApp reports it unreachable rather than opening a chat
   with a stranger. The button is live the moment a real number replaces it.
2. **`armoury.items`** is representative stock, not the real rack. Replace every
   row, and set `image` on a row to swap its drawn profile for a photograph.

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

## 3. Selling rounds

The commerce side. **Demo persistence — see the warning below.**

### Where things live

| Concern | File |
| --- | --- |
| Firearms, packages, prices, loyalty rate | `src/data/catalogue.ts` |
| Server persistence behind an interface | `src/server/store.ts` |
| Payment provider abstraction | `src/server/payments.ts` |
| Staff access check | `src/server/staff.ts` |
| Cart (ids only, sessionStorage) | `src/lib/cart.tsx` |

**Change a price in `catalogue.ts` and it changes everywhere** — shop, cart,
checkout, order and receipt. Nothing hard-codes money. Amounts are integers in
**fils** (1 KD = 1000), never floats.

### Rules the server enforces

These are the reasons the flow can be trusted, and they must survive any rewrite:

- **The browser never states a price.** It sends ids and quantities; `/api/orders`
  re-prices every line from the catalogue. A tampered cart cannot change the total.
- **The browser never decides a payment succeeded.** It asks
  `/api/payments/confirm`, and the server sets `paymentStatus`.
- **An order id is not enough to read an order.** Reads require the verification
  token as well, because the id is in the confirmation URL.
- **The QR carries only the token.** No name, phone, Civil ID or contents.
- **Civil ID never reaches a browser.** Customers get name and phone; staff get
  the last four digits.
- **Redemption is refused server-side** if unpaid or already redeemed. Hiding the
  button is not a control.
- **`/staff` is checked on every request.** The route being unlisted is not access
  control. The passcode is `STAFF_PASSCODE` (default `shootq8`).

### Verified end to end

Order → decline path → payment → QR → staff lookup → redeem → double-redeem
refused; plus inactive-firearm refusal, Civil ID validation, and no Civil ID in
any client payload.

### ⚠ Before real customers

1. **`MemoryOrderRepository` is process memory.** Orders vanish on restart and are
   not shared between serverless instances. Implement `OrderRepository` against
   Postgres/Supabase — no route handler changes.
2. **`DemoPaymentProvider` takes no money.** Implement `PaymentProvider` against a
   Kuwaiti gateway and select it by env var.
3. **Staff passcode is shared.** Replace with per-user staff accounts so
   redemptions attribute to a named person.
4. **Prices in `catalogue.ts` are placeholders.**

---

## 3. The opening sequence

`src/components/hero/` — the signature interaction.

The first frame is the range and one control: **SHOOT**. No heading, no
paragraph, no scroll label. `IntroGate` decides whether it runs; `CinematicIntro`
is the sequence itself, code-split so it is not in the bundle the page paints from.

### Why the hole is real

The overlay is `position: fixed` **over a page that is already mounted**. The hole
is a `mask-image` radial gradient on that overlay driven by `--holeR`. Punching it
open does not reveal a picture of the site — it reveals the actual first section
underneath. That is what makes the camera appear to pass through the paper into
the page, and why there is no cut, fade or dissolve anywhere in the handover.

### One timeline, not five clips

Phases are positions on a single GSAP timeline, so nothing can drift apart:

| t | Phase |
| --- | --- |
| 0.00–0.28 | Trigger — muzzle flash (~4 frames), light thrown onto the surfaces, camera recoil and recovery |
| 0.16–0.55 | The camera catches the round and settles alongside it |
| 0.20–2.35 | Range travel. Speed comes from the geometry passing, not from drawn speed lines |
| 2.00–2.95 | Target approach, easing down into the strike |
| 2.98–3.90 | Impact, the sheet buckles, the tear opens, the mask takes over and the camera goes through |

### Notes for editing it

- **Keep the UI out of `.stage`.** It has `transform-style: preserve-3d`, so any
  child joins the 3D space and the floor — which extends toward the camera —
  renders in front of it. That hid the SHOOT control completely.
- **Depth furniture culls itself in pure CSS**
  (`calc((depth - 300 - var(--camZ)) / 420)`), so nothing straddles the camera
  plane. No per-element JavaScript runs per frame.
- **The camera finishes past the target plane** (`CAM_END`). Under CSS perspective
  an object cannot exceed its own world size at z <= 0, so stopping at the target
  tops out near half the screen width.
- Every animated custom property is registered with `@property` in `globals.css`.
  Unregistered, GSAP cannot interpolate them and the hole never opens.

### Behaviour

- `prefers-reduced-motion`: trigger, strike, through. No chase.
- Skip control, and Escape. `sessionStorage` means it plays once per session —
  never permanently disabled.
- The control arms itself when fonts land, capped at 1.4s. No percentage loader.

---

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
| 01 | Hero | A real CSS-3D lane. Scroll drives the camera down it, and the bullseye opens into the next section |
| 02 | Intro | Editorial assembly — rule, then lines, then copy, over a parallaxing plate |
| 03 | Ranges | A square grid: photograph, name across the middle, one short move to settle |
| 04 | The Locker | A catalogue: shaded profile, name, chambering, range it belongs to |
| 05 | Good to know | A spec sheet of the questions people ask before coming |
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

### The handover out of the hero

The portal shows the same photograph, crop and scale that the Intro section
opens at. That is the one place an image appears twice on the site, and it is
deliberate: it is what makes passing through the bullseye continuous rather
than the hero simply stopping. If you change the Intro plate, change the portal
with it — a mismatch in `position` or starting `scale` shows as a jump.

### Text reveals run both ways

Every reveal uses the shared `REVEAL` config in `src/lib/motion.ts`
(`toggleActions: "play reverse play reverse"`), so copy animates in as it enters
the frame and back out as it leaves, in either scroll direction. Two consequences
worth knowing:

- **No `clearProps` on a reversible tween.** Clearing the transform on complete
  wipes the from-state and the reverse leg has nothing to go back to.
- **Do not put a `ScrollLabel` inside a pinned or sticky section.** It carries its
  own trigger, which never leaves the frame while the section is pinned, so it
  ends up fighting the section timeline. The hero draws its own label instead.

Durations are deliberately short — around 0.4-0.6s with small staggers. Long
easing tails read as sluggish once there are dozens of reveals on one page.

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
