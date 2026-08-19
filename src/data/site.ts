/* =============================================================================
   SHOOTINGQ8 — CENTRAL CONTENT SOURCE
   -----------------------------------------------------------------------------
   Everything the site displays lives here. Edit this file to update the site.

   VERIFICATION LEGEND
     [VERIFIED]    — from the official Instagram @shootingq8 (bio/highlights) or
                     visible in the facility photography supplied for this build
     [PLACEHOLDER] — written for structure. REPLACE with official wording.
     [NEEDED]      — a fact the site would be better for, that nobody has
                     confirmed yet. Nothing marked [NEEDED] is rendered.

   Copy rule: say what a visitor needs in order to decide to come. No mood
   writing, no claims that cannot be backed up.
   ========================================================================== */

export type Locale = "en" | "ar";
export type I18n = Record<Locale, string>;

const t = (en: string, ar: string): I18n => ({ en, ar });

/* -------------------------------------------------------------------------- */
/* BRAND                                                                       */
/* -------------------------------------------------------------------------- */

export const brand = {
  /* [VERIFIED] Instagram profile name + handle */
  name: t("Shooting Complex", "مجمع الرماية"),
  wordmark: t("SHOOTINGQ8", "رماية"),
  handle: "@shootingq8",
  city: t("Kuwait", "الكويت"),
};

/* -------------------------------------------------------------------------- */
/* CONTACT & LINKS                                                             */
/* -------------------------------------------------------------------------- */

export const contact = {
  /* [VERIFIED] */
  instagram: "https://www.instagram.com/shootingq8/",
  facebook: "https://www.facebook.com/shootingq8/",

  /* [NEEDED] No public phone number is listed on the Instagram profile.
     Add it in full international format, digits only, e.g. "96512345678".
     While these stay null, the Call and WhatsApp buttons are not rendered
     anywhere — no dead links are shipped. */
  phone: null as string | null,
  /* REPLACE BEFORE LAUNCH. This is a deliberate placeholder: the 500 prefix is
     not issued to Kuwaiti mobiles, so WhatsApp reports it unreachable rather
     than opening a chat with a stranger. The button is live the moment a real
     number replaces it. */
  whatsapp: "96500000000" as string | null,

  /* [VERIFIED] The account directs all enquiries to Instagram DM */
  primaryChannel: "instagram" as "instagram" | "whatsapp" | "phone",

  /* [VERIFIED] Publicly published Google Maps listing name */
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Mayadeen+Public+Shooting+Range+Shooting+Q8+Kuwait",
};

/* -------------------------------------------------------------------------- */
/* LOCATION                                                                    */
/* -------------------------------------------------------------------------- */

export const location = {
  /* [VERIFIED] Instagram bio */
  line1: t("Kuwait", "الكويت"),
  line2: t("Behind Al Murooj & the", "خلف مروج ونادي"),
  line3: t("Hunting and Equestrian Club", "الصيد والفروسية"),
  mapsLabel: t("Mayadeen Public Shooting Range", "ميادين الرماية العامة"),
};

/* -------------------------------------------------------------------------- */
/* OPENING HOURS  [VERIFIED] Instagram bio + hours highlight                    */
/* -------------------------------------------------------------------------- */

export type HourBlock = {
  id: string;
  label: I18n;
  short: I18n;
  days: number[]; // 0 = Sunday … 6 = Saturday
  open: string; // "HH:MM", facility local time
  close: string;
};

export const hours: HourBlock[] = [
  {
    id: "weekdays",
    label: t("Sunday — Thursday", "الأحد — الخميس"),
    short: t("SUN–THU", "الأحد–الخميس"),
    days: [0, 1, 2, 3, 4],
    open: "10:00",
    close: "22:00",
  },
  {
    id: "weekend",
    label: t("Friday — Saturday", "الجمعة — السبت"),
    short: t("FRI–SAT", "الجمعة–السبت"),
    days: [5, 6],
    open: "15:00",
    close: "22:30",
  },
];

export const timezone = "Asia/Kuwait";

/* -------------------------------------------------------------------------- */
/* HERO                                                                        */
/* -------------------------------------------------------------------------- */

export const hero = {
  /* [VERIFIED] All four ranges are visible in the facility photography. */
  support: t(
    "Indoor lanes for pistol, rifle and shotgun, plus an indoor archery hall. Open seven days a week in Kuwait.",
    "ميادين داخلية للمسدس والبندقية والشوزن، بالإضافة إلى صالة قوس وسهم داخلية. مفتوح سبعة أيام في الأسبوع في الكويت."
  ),
  factRanges: t("4 ranges", "٤ ميادين"),
  factGear: t("Gear on site", "المعدات متوفرة"),
  imageAlt: t(
    "A shooter on an indoor pistol lane at the Shooting Complex",
    "رامٍ في ميدان مسدس داخلي في مجمع الرماية"
  ),
};

/* -------------------------------------------------------------------------- */
/* INTRO                                                                       */
/* -------------------------------------------------------------------------- */

export const intro = {
  label: t("The Complex", "المجمع"),
  /* Kept short on purpose: at the mega display size a nine-character word
     overflows the column at 375px and gets clipped by its line mask. */
  headingLines: [t("FOUR", "أربع"), t("WAYS TO", "طرق"), t("SHOOT", "للرماية")],
  /* Concrete: what the place is, and what a first-timer needs to know. */
  body: t(
    "Four ranges under one roof, indoor lanes, and staff on the line with you. No experience needed for your first visit — equipment and protection are provided, and someone walks you through it before you shoot.",
    "أربعة ميادين تحت سقف واحد، وميادين داخلية، وطاقم يقف معك على الخط. لا حاجة لخبرة سابقة في زيارتك الأولى — المعدات ووسائل الحماية متوفرة، ويشرح لك أحد الطاقم كل شيء قبل الرماية."
  ),
  statLabel: t("Following on Instagram", "متابع على إنستغرام"),
  statValue: 52400,
};

/* -------------------------------------------------------------------------- */
/* RANGES                                                                      */
/*   [VERIFIED] All four are visible in the supplied facility photography.     */
/*   Descriptions say what the visitor actually does.                          */
/* -------------------------------------------------------------------------- */

export type ExperienceVisual = "pistol" | "rifle" | "shotgun" | "archery";

export type Experience = {
  id: string;
  index: string;
  enabled: boolean;
  title: I18n;
  kicker: I18n;
  body: I18n;
  /* Short practical facts shown as chips on the panel. */
  facts: I18n[];
  visual: ExperienceVisual;
  image: string | null;
};

export const experiencesSection = {
  label: t("Ranges", "الميادين"),
  heading: t("WHAT YOU CAN SHOOT", "ماذا يمكنك أن ترمي"),
  note: t(
    "All four run under supervision, with equipment and protection provided. Tap any of them to ask about it.",
    "جميعها تُدار تحت الإشراف، مع توفير المعدات ووسائل الحماية. اضغط على أي منها للسؤال عنه."
  ),
};

export const experiences: Experience[] = [
  {
    id: "pistol",
    index: "01",
    enabled: true,
    visual: "pistol",
    image: "pistol",
    title: t("Pistol", "المسدس"),
    kicker: t("Indoor lanes", "ميادين داخلية"),
    body: t(
      "The usual place to start. Short distance, so you see where every shot landed straight away, and enough repetition in one session to feel yourself improve.",
      "المكان المعتاد للبداية. مسافة قصيرة، فترى أين استقرت كل طلقة فوراً، وتكرار كافٍ في جلسة واحدة لتشعر بتحسّنك."
    ),
    facts: [t("Best for first visits", "الأفضل للزيارة الأولى"), t("Indoor", "داخلي")],
  },
  {
    id: "rifle",
    index: "02",
    enabled: true,
    visual: "rifle",
    image: "rifle",
    title: t("Rifle", "البندقية"),
    kicker: t("Bench rest", "من منضدة"),
    body: t(
      "Shot from a bench with the rifle supported, so the distance does the work rather than your arms. Slower, quieter, and the most satisfying to see a tight group from.",
      "تُرمى من منضدة مع إسناد البندقية، فتقوم المسافة بالعمل بدلاً من ذراعيك. أبطأ وأهدأ، والأكثر إمتاعاً عند رؤية تجميع دقيق."
    ),
    facts: [t("Scoped", "مزودة بمنظار"), t("Seated", "من وضع الجلوس")],
  },
  {
    id: "shotgun",
    index: "03",
    enabled: true,
    visual: "shotgun",
    image: "shotgun",
    title: t("Shotgun", "الشوزن"),
    kicker: t("Standing", "وقوفاً"),
    body: t(
      "The loudest and the most physical of the three. Fired standing, with a spread wide enough that timing matters more than precision. The one groups tend to remember.",
      "الأعلى صوتاً والأكثر بدنية بين الثلاثة. تُرمى وقوفاً، بانتشار واسع يجعل التوقيت أهم من الدقة. وهي التي تتذكرها المجموعات عادةً."
    ),
    facts: [t("Standing", "وقوفاً"), t("Loudest", "الأعلى صوتاً")],
  },
  {
    id: "archery",
    index: "04",
    enabled: true,
    visual: "archery",
    image: "archery",
    title: t("Archery", "القوس والسهم"),
    kicker: t("Indoor hall", "صالة داخلية"),
    body: t(
      "No noise and no recoil, in its own hall with its own targets. The one to pick if you want the focus without the bang, or if you are bringing people who would rather not be around firearms.",
      "لا ضجيج ولا ارتداد، في صالة خاصة بأهدافها الخاصة. اخترها إن أردت التركيز دون دوي الطلقات، أو إن كنت ستُحضر من يفضّل الابتعاد عن الأسلحة النارية."
    ),
    facts: [t("No firearms", "بدون أسلحة نارية"), t("Quietest", "الأهدأ")],
  },
];

/* [NEEDED] Not published anywhere, so not rendered. Confirm and enable. */
export const unconfirmedOfferings = {
  enabled: false,
  items: [
    { id: "youth", label: t("Minimum age", "الحد الأدنى للعمر") },
    { id: "school", label: t("School visits", "زيارات المدارس") },
    { id: "membership", label: t("Membership", "العضوية") },
    { id: "range50", label: t("50m range", "ميدان ٥٠ متر") },
  ],
};

/* [NEEDED] Third parties quote prices publicly but the facility does not
   publish them, so nothing is shown. Fill these in and set enabled: true and
   a price row appears on every range panel. */
export const pricing = {
  enabled: false,
  note: t("Prices are confirmed when you book.", "تُؤكَّد الأسعار عند الحجز."),
  items: [] as { id: string; label: I18n; value: I18n }[],
};

/* -------------------------------------------------------------------------- */
/* GOOD TO KNOW                                                                */
/*   A spec sheet, not a story. What a first-time visitor asks before coming.  */
/* -------------------------------------------------------------------------- */

export const info = {
  label: t("Good to know", "معلومات مفيدة"),
  heading: t("BEFORE YOU COME", "قبل أن تأتي"),
  rows: [
    {
      k: t("Experience", "الخبرة"),
      v: t("None needed. Staff brief you before you shoot.", "لا حاجة لأي خبرة. يشرح لك الطاقم قبل الرماية."),
    },
    {
      k: t("Equipment", "المعدات"),
      v: t("Provided on site for every range.", "متوفرة في الموقع لجميع الميادين."),
    },
    {
      k: t("Protection", "الحماية"),
      v: t("Eye and ear protection included.", "حماية للعين والسمع مشمولة."),
    },
    {
      k: t("Supervision", "الإشراف"),
      v: t("Staff stay with you on the line.", "يبقى الطاقم معك على الخط."),
    },
    {
      k: t("Booking", "الحجز"),
      v: t("Message ahead so a lane is free.", "راسلنا مسبقاً لضمان توفر ميدان."),
    },
    {
      k: t("Getting there", "الوصول"),
      v: t("Behind Al Murooj and the Hunting and Equestrian Club.", "خلف مروج ونادي الصيد والفروسية."),
    },
  ],
  /* [NEEDED] The two questions the site still cannot answer. */
  pending: [
    { k: t("Prices", "الأسعار"), v: t("Ask when you book.", "اسأل عند الحجز.") },
    { k: t("Minimum age", "الحد الأدنى للعمر"), v: t("Ask when you book.", "اسأل عند الحجز.") },
  ],
};

/* -------------------------------------------------------------------------- */
/* THE LOCKER                                                                  */
/*   [PLACEHOLDER] Representative stock so the section can be designed and     */
/*   reviewed. REPLACE every row with what is actually in the rack. Add a      */
/*   photograph per item by setting `image` and dropping the file in           */
/*   /public/media.                                                            */
/* -------------------------------------------------------------------------- */

export type ArmType = "pistol" | "revolver" | "rifle" | "shotgun" | "bow";

export type ArmItem = {
  id: string;
  name: string;
  /* Chambering, or draw weight for a bow. */
  spec: string;
  type: ArmType;
  range: I18n;
  image?: string | null;
};

export const armoury = {
  label: t("The locker", "الخزنة"),
  heading: t("WHAT IS IN THE RACK", "ما يوجد في الرف"),
  body: t(
    "A sample of what is available. Stock changes, so ask for what you want when you book.",
    "نموذج مما هو متوفر. المخزون يتغير، لذا اسأل عمّا تريده عند الحجز."
  ),
  disclaimer: t(
    "Representative list. Availability is confirmed at the counter.",
    "قائمة استرشادية. يتم تأكيد التوفر عند الاستقبال."
  ),
  items: [
    { id: "g17", name: "Glock 17", spec: "9x19mm", type: "pistol" as ArmType, range: t("Pistol", "المسدس") },
    { id: "cz75", name: "CZ 75 SP-01", spec: "9x19mm", type: "pistol" as ArmType, range: t("Pistol", "المسدس") },
    { id: "sw686", name: "S&W 686", spec: ".357 Magnum", type: "revolver" as ArmType, range: t("Pistol", "المسدس") },
    { id: "ar15", name: "AR-15", spec: "5.56x45mm", type: "rifle" as ArmType, range: t("Rifle", "البندقية") },
    { id: "cz457", name: "CZ 457", spec: ".22 LR", type: "rifle" as ArmType, range: t("Rifle", "البندقية") },
    { id: "b686", name: "Beretta 686", spec: "12 gauge", type: "shotgun" as ArmType, range: t("Shotgun", "الشوزن") },
    { id: "r870", name: "Remington 870", spec: "12 gauge", type: "shotgun" as ArmType, range: t("Shotgun", "الشوزن") },
    { id: "recurve", name: "Recurve bow", spec: "20-30 lb", type: "bow" as ArmType, range: t("Archery", "القوس والسهم") },
  ] as ArmItem[],
};


/* -------------------------------------------------------------------------- */
/* CONTACT                                                                     */
/* -------------------------------------------------------------------------- */

export const contactSection = {
  label: t("Visit", "الزيارة"),
  headingLines: [t("COME AND", "تعال"), t("SHOOT", "وارمِ")],
  body: t(
    "Messages are answered on Instagram. Tell them which range, how many of you, and roughly when.",
    "نرد على الرسائل عبر إنستغرام. أخبرهم بالميدان الذي تريده، وعدد الأشخاص، والوقت التقريبي."
  ),
  closing: t("See you on the line.", "نراك على الخط."),
};

/* -------------------------------------------------------------------------- */
/* NAVIGATION                                                                  */
/* -------------------------------------------------------------------------- */

export const navItems = [
  { id: "hero", index: "01", label: t("Top", "الأعلى") },
  { id: "intro", index: "02", label: t("The Complex", "المجمع") },
  { id: "experiences", index: "03", label: t("Ranges", "الميادين") },
  { id: "armoury", index: "04", label: t("The Locker", "الخزنة") },
  { id: "info", index: "05", label: t("Good to Know", "معلومات مفيدة") },
  { id: "visit", index: "06", label: t("Hours", "المواعيد") },
  { id: "contact", index: "07", label: t("Contact", "التواصل") },
];

/* -------------------------------------------------------------------------- */
/* MICRO-COPY                                                                  */
/* -------------------------------------------------------------------------- */

export const ui = {
  scrollToEnter: t("Scroll", "مرّر"),
  loading: t("Loading", "جارٍ التحميل"),
  menu: t("Menu", "القائمة"),
  close: t("Close", "إغلاق"),
  openNow: t("Open now", "مفتوح الآن"),
  closedNow: t("Closed now", "مغلق الآن"),
  opensAt: t("Opens", "يفتح"),
  closesAt: t("Closes", "يغلق"),
  today: t("Today", "اليوم"),
  directions: t("Location", "الموقع"),
  message: t("Message on Instagram", "راسلنا على إنستغرام"),
  messageShort: t("Message", "راسلنا"),
  call: t("Call", "اتصل"),
  whatsapp: t("WhatsApp", "واتساب"),
  visit: t("Visit", "الزيارة"),
  instagram: t("Instagram", "إنستغرام"),
  langToggle: t("العربية", "EN"),
  kuwaitTime: t("Kuwait time", "بتوقيت الكويت"),
  seeMore: t("See more", "المزيد"),
  liveOpen: t("Open", "مفتوح"),
  liveClosed: t("Closed", "مغلق"),
};
