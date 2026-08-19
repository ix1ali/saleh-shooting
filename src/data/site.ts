/* =============================================================================
   SHOOTINGQ8 — CENTRAL CONTENT SOURCE
   -----------------------------------------------------------------------------
   Everything the site displays lives here. Edit this file to update the site.

   VERIFICATION LEGEND
     [VERIFIED]    — taken from the official Instagram @shootingq8 (bio/highlights)
     [PLACEHOLDER] — written for structure. REPLACE with official copy.
     [UNCONFIRMED] — plausible but NOT confirmed. Not rendered until confirmed.

   Nothing marked [UNCONFIRMED] is rendered. Flip `enabled: true` once confirmed.
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
  /* [VERIFIED] Instagram bio */
  city: t("Kuwait", "الكويت"),
};

/* -------------------------------------------------------------------------- */
/* CONTACT & LINKS                                                             */
/* -------------------------------------------------------------------------- */

export const contact = {
  /* [VERIFIED] */
  instagram: "https://www.instagram.com/shootingq8/",
  facebook: "https://www.facebook.com/shootingq8/",

  /* [PLACEHOLDER] No public phone number is listed on the Instagram profile.
     Add the real number in full international format, digits only,
     e.g. "96512345678". Leave null to hide the Call / WhatsApp buttons. */
  phone: null as string | null,
  whatsapp: null as string | null,

  /* [VERIFIED] The account directs enquiries to Instagram DM */
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
  /* [VERIFIED] Publicly published Google Maps listing name */
  mapsLabel: t("Mayadeen Public Shooting Range", "ميادين الرماية العامة"),
};

/* -------------------------------------------------------------------------- */
/* OPENING HOURS  [VERIFIED] Instagram bio + hours highlight                    */
/*   Sun–Thu  10:00 – 22:00                                                    */
/*   Fri–Sat  15:00 – 22:30                                                    */
/* -------------------------------------------------------------------------- */

export type HourBlock = {
  id: string;
  label: I18n;
  short: I18n;
  /* JS day indices: 0 = Sunday … 6 = Saturday */
  days: number[];
  open: string; // "HH:MM" 24h, facility local time
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

/* Facility timezone. Open/closed state is computed in Asia/Kuwait time,
   never from the visitor's own clock. */
export const timezone = "Asia/Kuwait";

/* -------------------------------------------------------------------------- */
/* EXPERIENCES                                                                 */
/*   Disciplines corroborated by the facility's public presence. Descriptive   */
/*   copy is [PLACEHOLDER] — replace with official wording.                    */
/* -------------------------------------------------------------------------- */

export type ExperienceVisual = "pistol" | "rifle" | "shotgun" | "archery";

export type Experience = {
  id: string;
  index: string;
  enabled: boolean;
  title: I18n;
  kicker: I18n;
  body: I18n;
  /* Drives the procedural art direction for this panel. */
  visual: ExperienceVisual;
  /* Optional real photograph: drop a file in /public/media and set the path.
     When null, the brand-graded procedural composition is used. */
  image: string | null;
};

export const experiencesSection = {
  label: t("Disciplines", "الرياضات"),
};

export const experiences: Experience[] = [
  {
    id: "pistol",
    index: "01",
    enabled: true,
    visual: "pistol",
    image: "pistol",
    title: t("Pistol", "المسدس"),
    kicker: t("Handgun lanes", "ميادين المسدس"),
    body: t(
      "Close-distance lanes built around control. Stance, grip, sight alignment — the fundamentals that make every shot after the first one better.",
      "ميادين قريبة المدى قائمة على التحكم. الوقفة، القبضة، محاذاة النظر — الأساسيات التي تجعل كل طلقة أفضل من التي قبلها."
    ),
  },
  {
    id: "rifle",
    index: "02",
    enabled: true,
    visual: "rifle",
    image: "rifle",
    title: t("Rifle", "البندقية"),
    kicker: t("Long lanes", "الميادين الطويلة"),
    body: t(
      "Distance rewards patience. Longer lanes, steadier positions, and the quiet discipline of reading your own group before you fire again.",
      "المسافة تكافئ الصبر. ميادين أطول، أوضاع أكثر ثباتاً، وانضباط هادئ في قراءة تجميعك قبل أن ترمي مجدداً."
    ),
  },
  {
    id: "shotgun",
    index: "03",
    enabled: true,
    visual: "shotgun",
    image: "shotgun",
    title: t("Shotgun", "الشوزن"),
    kicker: t("Spread & timing", "الانتشار والتوقيت"),
    body: t(
      "A different rhythm entirely. Wider patterns, faster decisions, and a swing that has to finish what it starts.",
      "إيقاع مختلف تماماً. انتشار أوسع، قرارات أسرع، وحركة يجب أن تُكمل ما بدأته."
    ),
  },
  {
    id: "archery",
    index: "04",
    enabled: true,
    visual: "archery",
    image: "archery",
    title: t("Archery", "القوس والسهم"),
    kicker: t("Draw & release", "السحب والإطلاق"),
    body: t(
      "The oldest discipline on the complex. No noise, no recoil — only breath, tension, and a release you have to earn.",
      "أقدم الرياضات في المجمع. لا ضجيج ولا ارتداد — فقط النَفَس، والشدّ، وإطلاق تستحقه."
    ),
  },
];

/* [UNCONFIRMED] Youth sessions, school visits and a 50m range are visible in
   the account’s own posts but are not stated anywhere in writing, so the
   wording below is still unverified. Confirm with the facility, then set
   enabled: true. */
export const unconfirmedOfferings = {
  enabled: false,
  items: [
    { id: "youth", label: t("Youth sessions", "جلسات الناشئة") },
    { id: "school", label: t("School & group visits", "زيارات المدارس والمجموعات") },
    { id: "beginners", label: t("Beginner induction", "تأهيل المبتدئين") },
    { id: "range50", label: t("50m range", "ميدان ٥٠ متر") },
  ],
};

/* Pricing is discussed publicly by third parties but is NOT published on the
   official account, so it is deliberately not displayed. Add it here only if
   the facility confirms current rates. */
export const pricing = {
  enabled: false,
  items: [] as { label: I18n; value: I18n }[],
};

/* -------------------------------------------------------------------------- */
/* SECTION COPY  [PLACEHOLDER] editorial copy written for this build            */
/* -------------------------------------------------------------------------- */

export const hero = {
  /* [PLACEHOLDER] Supporting line under the wordmark. Keep it short — it sits
     over the lane and must not compete with the display type. */
  support: t(
    "An indoor and outdoor shooting complex in Kuwait. Rifle, pistol, shotgun and archery, under supervision.",
    "مجمع رماية داخلي وخارجي في الكويت. بندقية ومسدس وشوزن وقوس وسهم، تحت الإشراف."
  ),
};

export const intro = {
  label: t("The Complex", "المجمع"),
  headingLines: [t("PRECISION", "الدقة"), t("STARTS", "تبدأ"), t("HERE", "هنا")],
  body: t(
    "A shooting complex in Kuwait built for one thing: the moment your breathing slows, the noise drops away, and the only thing left is the line between you and the target.",
    "مجمع رماية في الكويت بُني لغاية واحدة: تلك اللحظة التي يهدأ فيها نَفَسُك، ويخفت الضجيج، ولا يبقى سوى الخط الممتد بينك وبين الهدف."
  ),
  statLabel: t("Following on Instagram", "متابع على إنستغرام"),
  statValue: 52400,
};

export const safety = {
  label: t("Standards", "المعايير"),
  headingWords: [
    t("CONTROL", "التحكم"),
    t("IS PART", "جزء"),
    t("OF THE", "من"),
    t("EXPERIENCE", "التجربة"),
  ],
  body: t(
    "Every discipline on the complex runs inside a supervised, rule-led environment. Range procedure is not an afterthought here — it is the reason the experience feels calm enough to enjoy.",
    "كل رياضة في المجمع تُمارس ضمن بيئة خاضعة للإشراف ومحكومة بالقواعد. إجراءات الميدان ليست أمراً ثانوياً — بل هي سبب شعورك بالهدوء الكافي للاستمتاع بالتجربة."
  ),
  /* [PLACEHOLDER] General, non-specific principles. Replace with the facility's
     own published rules. No claim of certification or accreditation is made. */
  points: [
    {
      n: "01",
      title: t("Supervised lanes", "ميادين تحت الإشراف"),
      body: t(
        "Sessions run under the direction of range staff from the moment you step onto the line.",
        "تُدار الجلسات بتوجيه من طاقم الميدان منذ لحظة وقوفك على الخط."
      ),
    },
    {
      n: "02",
      title: t("Brief before you shoot", "إحاطة قبل الرماية"),
      body: t(
        "First-time visitors are walked through handling, stance and range commands before live fire.",
        "يُشرح للزائر لأول مرة التعامل والوقفة وأوامر الميدان قبل الرماية الحية."
      ),
    },
    {
      n: "03",
      title: t("Protective equipment", "معدات الحماية"),
      body: t(
        "Eye and ear protection are part of standard range procedure, not an optional extra.",
        "حماية العين والسمع جزء من إجراءات الميدان القياسية، وليست خياراً إضافياً."
      ),
    },
    {
      n: "04",
      title: t("One line, one direction", "خط واحد، اتجاه واحد"),
      body: t(
        "Muzzles stay downrange. The simplest rule on the complex, and the one that is never bent.",
        "تبقى الفوهات باتجاه الميدان. أبسط قاعدة في المجمع، وهي التي لا تُخالف أبداً."
      ),
    },
  ],
};

export type FacilityVisual = "lane" | "downrange" | "bench" | "score";

export const facility = {
  label: t("The Facility", "المرفق"),
  heading: t("INSIDE", "من الداخل"),
  frames: [
    /* Captions describe what is actually in each photograph. If you swap an
       image, change its caption with it. */
    {
      id: "f1",
      caption: t("Reading the group", "قراءة التجميع"),
      meta: t("On the line", "على الخط"),
      visual: "lane" as FacilityVisual,
      image: "range" as string | null,
    },
    {
      id: "f2",
      caption: t("First target", "أول هدف"),
      meta: t("New shooters", "الرماة الجدد"),
      visual: "downrange" as FacilityVisual,
      image: "youth" as string | null,
    },
    {
      id: "f3",
      caption: t("Open days", "الأيام المفتوحة"),
      meta: t("Events at the complex", "فعاليات المجمع"),
      visual: "bench" as FacilityVisual,
      image: "event" as string | null,
    },
    {
      id: "f4",
      caption: t("Finding us", "كيف تصل إلينا"),
      meta: t("Behind Al Murooj", "خلف مروج"),
      visual: "score" as FacilityVisual,
      image: "murouj" as string | null,
    },
  ],
};

export const archery = {
  label: t("Discipline 04", "الرياضة ٠٤"),
  heading: t("A QUIETER LINE", "خطٌّ أهدأ"),
  body: t(
    "No report, no recoil. Archery on the complex asks for something different — a slower breath, and a release you cannot rush.",
    "لا صوت ولا ارتداد. القوس والسهم في المجمع يطلب شيئاً مختلفاً — نَفَساً أبطأ، وإطلاقاً لا يمكن استعجاله."
  ),
};

export const contactSection = {
  label: t("Visit", "الزيارة"),
  headingLines: [
    t("YOUR NEXT", "جلستك"),
    t("SESSION", "القادمة"),
    t("STARTS HERE", "تبدأ هنا"),
  ],
  body: t(
    "Messages are answered on Instagram. Tell us what you want to shoot and who you are bringing.",
    "نرد على الرسائل عبر إنستغرام. أخبرنا بما ترغب برميه ومن سيرافقك."
  ),
  closing: t("See you on the line.", "نراك على الخط."),
};

/* -------------------------------------------------------------------------- */
/* EXPERIENCE SELECTOR                                                         */
/* -------------------------------------------------------------------------- */

export const selector = {
  label: t("Find your experience", "اختر تجربتك"),
  heading: t("THREE QUESTIONS", "ثلاثة أسئلة"),
  restart: t("Start again", "ابدأ من جديد"),
  resultKicker: t("We would start you on", "نقترح أن تبدأ بـ"),
  resultCta: t("Ask about this", "اسأل عن هذه"),
  questions: [
    {
      id: "first",
      prompt: t("Is this your first visit?", "هل هذه زيارتك الأولى؟"),
      options: [
        { id: "yes", label: t("Yes", "نعم") },
        { id: "no", label: t("No", "لا") },
      ],
    },
    {
      id: "interest",
      prompt: t("What sounds most interesting?", "ما الذي يثير اهتمامك أكثر؟"),
      options: [
        { id: "pistol", label: t("Pistol", "المسدس") },
        { id: "rifle", label: t("Rifle", "البندقية") },
        { id: "archery", label: t("Archery", "القوس والسهم") },
        { id: "surprise", label: t("Surprise me", "فاجئني") },
      ],
    },
    {
      id: "party",
      prompt: t("Who are you coming with?", "مع من ستأتي؟"),
      options: [
        { id: "solo", label: t("Solo", "بمفردي") },
        { id: "friends", label: t("Friends", "أصدقاء") },
        { id: "family", label: t("Family", "العائلة") },
        { id: "group", label: t("A group", "مجموعة") },
      ],
    },
  ],
};

/* Recommendation copy per discipline. [PLACEHOLDER] wording. */
export const recommendations: Record<string, { title: I18n; body: I18n }> = {
  pistol: {
    title: t("Pistol", "المسدس"),
    body: t(
      "The most direct way into the sport. Short distance, immediate feedback, and enough repetition to feel yourself improve within a single session.",
      "أقصر طريق للدخول إلى الرياضة. مسافة قصيرة، وملاحظة فورية، وتكرار كافٍ لتشعر بتحسّنك خلال جلسة واحدة."
    ),
  },
  rifle: {
    title: t("Rifle", "البندقية"),
    body: t(
      "For the patient. Longer lanes reward a steady position and a slow trigger far more than they reward speed.",
      "للصبورين. الميادين الأطول تكافئ الوضع الثابت والزناد البطيء أكثر بكثير مما تكافئ السرعة."
    ),
  },
  shotgun: {
    title: t("Shotgun", "الشوزن"),
    body: t(
      "The loudest, quickest and most social of the disciplines — the one groups tend to remaccent.",
      "الأعلى صوتاً والأسرع والأكثر اجتماعية بين الرياضات — وهي التي تتذكرها المجموعات عادةً."
    ),
  },
  archery: {
    title: t("Archery", "القوس والسهم"),
    body: t(
      "Quiet, physical and surprisingly demanding. The best choice when you want the focus without the noise.",
      "هادئة وبدنية ومتطلبة بشكل مفاجئ. الخيار الأفضل حين تريد التركيز دون الضجيج."
    ),
  },
};

/* -------------------------------------------------------------------------- */
/* NAVIGATION                                                                  */
/* -------------------------------------------------------------------------- */

export const navItems = [
  { id: "hero", index: "01", label: t("Enter", "الدخول") },
  { id: "intro", index: "02", label: t("The Complex", "المجمع") },
  { id: "experiences", index: "03", label: t("Disciplines", "الرياضات") },
  { id: "selector", index: "04", label: t("Find Yours", "اختر تجربتك") },
  { id: "facility", index: "05", label: t("Facility", "المرفق") },
  { id: "safety", index: "06", label: t("Standards", "المعايير") },
  { id: "visit", index: "07", label: t("Hours", "المواعيد") },
  { id: "contact", index: "08", label: t("Contact", "التواصل") },
];

/* -------------------------------------------------------------------------- */
/* MICRO-COPY                                                                  */
/* -------------------------------------------------------------------------- */

export const ui = {
  scrollToEnter: t("Scroll to enter", "مرّر للدخول"),
  loading: t("Preparing the line", "تجهيز الخط"),
  menu: t("Menu", "القائمة"),
  close: t("Close", "إغلاق"),
  openNow: t("Open now", "مفتوح الآن"),
  closedNow: t("Closed", "مغلق"),
  opensAt: t("Opens", "يفتح"),
  closesAt: t("Closes", "يغلق"),
  today: t("Today", "اليوم"),
  directions: t("Directions", "الاتجاهات"),
  message: t("Message", "راسلنا"),
  call: t("Call", "اتصل"),
  whatsapp: t("WhatsApp", "واتساب"),
  visit: t("Visit", "زورنا"),
  instagram: t("Instagram", "إنستغرام"),
  langToggle: t("العربية", "EN"),
  kuwaitTime: t("Kuwait time", "بتوقيت الكويت"),
};
