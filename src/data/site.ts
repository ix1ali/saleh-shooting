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
  whatsapp: null as string | null,

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
    kicker: t("Long lanes, bench rest", "ميادين طويلة، رماية من منضدة"),
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
    kicker: t("Standing, wide pattern", "وقوفاً، انتشار واسع"),
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
    kicker: t("Indoor hall, recurve bows", "صالة داخلية، أقواس منحنية"),
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
/* HOW A SESSION WORKS  (replaces the old abstract "standards" block)          */
/*   Practical sequence a first-time visitor walks through. Safety is covered  */
/*   as part of the process rather than as a lecture.                          */
/* -------------------------------------------------------------------------- */

export const session = {
  label: t("Your first visit", "زيارتك الأولى"),
  heading: t("HOW A SESSION WORKS", "كيف تسير الجلسة"),
  body: t(
    "If you have never shot before, this is the whole thing, start to finish.",
    "إن لم تُجرّب الرماية من قبل، فهذه هي التجربة كاملة من البداية إلى النهاية."
  ),
  note: t(
    "Still not sure? Send a message with how many of you there are and when you want to come, and they will tell you what is free.",
    "ما زلت متردداً؟ أرسل رسالة تذكر فيها عددكم والوقت الذي تريدون الحضور فيه، وسيخبرونك بالمتاح."
  ),
  steps: [
    {
      n: "01",
      title: t("Turn up", "الحضور"),
      body: t(
        "Message ahead on Instagram so they know you are coming, then find the complex behind Al Murooj.",
        "راسلهم مسبقاً على إنستغرام ليعلموا بقدومك، ثم توجّه إلى المجمع خلف مروج."
      ),
    },
    {
      n: "02",
      title: t("Pick a range", "اختر الميدان"),
      body: t(
        "Pistol, rifle, shotgun or archery. You can do more than one in a visit.",
        "مسدس أو بندقية أو شوزن أو قوس وسهم. ويمكنك تجربة أكثر من واحدة في الزيارة."
      ),
    },
    {
      n: "03",
      title: t("Get kitted", "تجهيز المعدات"),
      body: t(
        "Ear and eye protection before you go anywhere near the line. Both are provided.",
        "حماية للسمع والعين قبل الاقتراب من الخط. وكلاهما متوفر."
      ),
    },
    {
      n: "04",
      title: t("Get briefed", "الإحاطة"),
      body: t(
        "Staff take you through handling, stance and the range commands, and stay with you on the line.",
        "يشرح لك الطاقم التعامل والوقفة وأوامر الميدان، ويبقون معك على الخط."
      ),
    },
    {
      n: "05",
      title: t("Shoot", "الرماية"),
      body: t(
        "Your lane, your target, your pace. Muzzles stay pointed downrange the whole time.",
        "ميدانك وهدفك وإيقاعك. تبقى الفوهات موجهة نحو الميدان طوال الوقت."
      ),
    },
    {
      n: "06",
      title: t("Take the target home", "خذ هدفك معك"),
      body: t(
        "Your target comes off the frame at the end. Most people keep the first one.",
        "يُنزع هدفك من الإطار في النهاية. ومعظم الناس يحتفظون بأول هدف لهم."
      ),
    },
  ],
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
  /* Pre-filled prompt shown next to the message button. */
  hint: t("Not sure what to ask?", "لا تعرف ماذا تسأل؟"),
  hintExample: t(
    "Hi — first time, two of us, this weekend. What do you recommend?",
    "مرحباً — أول مرة، شخصان، نهاية هذا الأسبوع. بماذا تنصحون؟"
  ),
};

/* -------------------------------------------------------------------------- */
/* EXPERIENCE SELECTOR                                                         */
/* -------------------------------------------------------------------------- */

export const selector = {
  label: t("Not sure where to start?", "لست متأكداً من أين تبدأ؟"),
  heading: t("THREE QUESTIONS", "ثلاثة أسئلة"),
  sub: t(
    "Answer three and you get a range, the reason for it, and a message you can send as is.",
    "أجب عن ثلاثة أسئلة وستحصل على ميدان مقترح، وسبب اختياره، ورسالة جاهزة للإرسال."
  ),
  restart: t("Start again", "ابدأ من جديد"),
  resultKicker: t("Start with", "ابدأ بـ"),
  resultCta: t("Send this message", "أرسل هذه الرسالة"),
  resultWhy: t("Why this one", "لماذا هذه"),
  copied: t("Copied", "تم النسخ"),
  copyCta: t("Copy message", "انسخ الرسالة"),
  questions: [
    {
      id: "first",
      prompt: t("Have you shot before?", "هل سبق أن رميت من قبل؟"),
      options: [
        { id: "no", label: t("Never", "أبداً") },
        { id: "some", label: t("A few times", "بضع مرات") },
        { id: "yes", label: t("Regularly", "بانتظام") },
      ],
    },
    {
      id: "party",
      prompt: t("Who is coming?", "من سيأتي معك؟"),
      options: [
        { id: "solo", label: t("Just me", "أنا فقط") },
        { id: "friends", label: t("Friends", "أصدقاء") },
        { id: "family", label: t("Family", "العائلة") },
        { id: "group", label: t("A group", "مجموعة") },
      ],
    },
    {
      id: "vibe",
      prompt: t("What sounds better?", "أيهما يبدو أفضل؟"),
      options: [
        { id: "loud", label: t("Loud and fun", "صاخبة وممتعة") },
        { id: "precise", label: t("Quiet and precise", "هادئة ودقيقة") },
        { id: "noguns", label: t("No firearms", "بدون أسلحة نارية") },
      ],
    },
  ],
};

/* Recommendation copy per range. */
export const recommendations: Record<
  string,
  { title: I18n; why: I18n; message: I18n }
> = {
  pistol: {
    title: t("Pistol", "المسدس"),
    why: t(
      "Shortest learning curve and the fastest feedback, so a first session actually feels like progress.",
      "أقصر منحنى تعلّم وأسرع ملاحظة للنتيجة، فتشعر بتقدّم حقيقي من الجلسة الأولى."
    ),
    message: t(
      "Hi — first time shooting, interested in the pistol lanes. What do I need to know?",
      "مرحباً — أول مرة أرمي، ومهتم بميادين المسدس. ما الذي أحتاج معرفته؟"
    ),
  },
  rifle: {
    title: t("Rifle", "البندقية"),
    why: t(
      "Shot from a supported bench, so it rewards patience over strength and suits anyone who wants to concentrate.",
      "تُرمى من منضدة مسنودة، فتكافئ الصبر لا القوة، وتناسب من يريد التركيز."
    ),
    message: t(
      "Hi — interested in the rifle lanes. What is available and what does a session involve?",
      "مرحباً — مهتم بميادين البندقية. ما المتوفر وماذا تتضمن الجلسة؟"
    ),
  },
  shotgun: {
    title: t("Shotgun", "الشوزن"),
    why: t(
      "The most social of the three and the easiest to enjoy in a group, because nobody is trying to be precise.",
      "الأكثر اجتماعية بين الثلاثة والأسهل للاستمتاع بها ضمن مجموعة، لأن لا أحد يحاول أن يكون دقيقاً."
    ),
    message: t(
      "Hi — a few of us want to try the shotgun. Can you take a group and when is quietest?",
      "مرحباً — نود نحن مجموعة تجربة الشوزن. هل يمكنكم استقبال مجموعة ومتى يكون المكان أهدأ؟"
    ),
  },
  archery: {
    title: t("Archery", "القوس والسهم"),
    why: t(
      "Its own hall, no noise and no recoil — the one that works when not everyone wants to be around firearms.",
      "صالة خاصة، بلا ضجيج ولا ارتداد — الخيار المناسب حين لا يرغب الجميع بالتواجد قرب الأسلحة النارية."
    ),
    message: t(
      "Hi — interested in archery rather than firearms. What is available?",
      "مرحباً — مهتم بالقوس والسهم بدلاً من الأسلحة النارية. ما المتوفر لديكم؟"
    ),
  },
};

/* -------------------------------------------------------------------------- */
/* NAVIGATION                                                                  */
/* -------------------------------------------------------------------------- */

export const navItems = [
  { id: "hero", index: "01", label: t("Top", "الأعلى") },
  { id: "intro", index: "02", label: t("The Complex", "المجمع") },
  { id: "experiences", index: "03", label: t("Ranges", "الميادين") },
  { id: "selector", index: "04", label: t("Find Yours", "اختر تجربتك") },
  { id: "session", index: "05", label: t("First Visit", "الزيارة الأولى") },
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
  directions: t("Directions", "الاتجاهات"),
  message: t("Message on Instagram", "راسلنا على إنستغرام"),
  messageShort: t("Message", "راسلنا"),
  call: t("Call", "اتصل"),
  whatsapp: t("WhatsApp", "واتساب"),
  visit: t("Visit", "الزيارة"),
  instagram: t("Instagram", "إنستغرام"),
  langToggle: t("العربية", "EN"),
  kuwaitTime: t("Kuwait time", "بتوقيت الكويت"),
  seeMore: t("See more", "المزيد"),
};
