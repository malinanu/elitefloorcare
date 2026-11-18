/**
 * Launch content: everything the static redesign showed, loaded into Payload so the client can edit it.
 * Runs automatically on first boot against an empty database (payload.config.ts → onInit), or via `pnpm seed`.
 * Idempotent per item: services are upserted by slug, media by filename.
 */
import fs from "node:fs";
import path from "node:path";
import type { Payload } from "payload";
import type { Project, Service } from "../payload-types";
import servicesJson from "./seed-data/services.json" with { type: "json" };

type Lexical = NonNullable<Service["involves"]["body"]>;
const decode = (s: string) =>
  s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ");

/** Minimal HTML → Lexical for the seed copy, which only uses text, <strong> and <a href>. */
function htmlToLexical(paragraphs: string[]): Lexical {
  const textNode = (text: string, bold: boolean) => ({ type: "text", text: decode(text), format: bold ? 1 : 0, detail: 0, mode: "normal", style: "", version: 1 });
  const para = (html: string) => {
    const children: Record<string, unknown>[] = [];
    const re = /<strong>([\s\S]*?)<\/strong>|<a href="([^"]*)">([\s\S]*?)<\/a>|([^<]+)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(html))) {
      if (m[1] !== undefined) children.push(textNode(m[1], true));
      else if (m[2] !== undefined)
        children.push({
          type: "link",
          fields: { linkType: "custom", url: m[2], newTab: false },
          children: [textNode(m[3], false)],
          direction: "ltr",
          format: "",
          indent: 0,
          version: 3,
        });
      else if (m[4]) children.push(textNode(m[4], false));
    }
    return { type: "paragraph", children, direction: "ltr", format: "", indent: 0, textFormat: 0, version: 1 };
  };
  return { root: { type: "root", children: paragraphs.map(para), direction: "ltr", format: "", indent: 0, version: 1 } } as Lexical;
}

const P = (f: string) => `/assets/photos/${f}.jpg`;
const I = (f: string) => `/images/${f}_20260910165522.jpg`;

/** Upload a file from /public once and reuse its id everywhere it appears. */
function mediaLoader(payload: Payload) {
  const cache = new Map<string, number>();
  return async (publicPath: string, alt: string) => {
    const key = publicPath.replace(/\.jpeg$/, ".jpg");
    const hit = cache.get(key);
    if (hit) return hit;
    const filename = path.basename(key);
    const existing = await payload.find({ collection: "media", where: { filename: { equals: filename } }, limit: 1, depth: 0 });
    let id: number | undefined = existing.docs[0]?.id;
    if (!id) {
      const filePath = path.join(process.cwd(), "public", key);
      if (!fs.existsSync(filePath)) throw new Error(`seed image missing: ${filePath}`);
      const doc = await payload.create({ collection: "media", data: { alt }, filePath, depth: 0 });
      id = doc.id;
    }
    cache.set(key, id);
    return id;
  };
}

type SeedService = (typeof servicesJson)[keyof typeof servicesJson];

const serviceMeta: Record<string, { order: number; navLabel: string; footerLabel: string; icon: string; summary: string; tagline: string }> = {
  "preventative-maintenance": {
    order: 1, navLabel: "Preventative Maintenance", footerLabel: "Preventative maintenance", icon: "shield",
    summary: "A programmed annual cycle that keeps the coating ahead of the wear.", tagline: "Stay ahead of the wear",
  },
  recoating: {
    order: 2, navLabel: "Recoating", footerLabel: "Sports floor recoating", icon: "roller",
    summary: "Screen, clean and re-coat in sports-grade finish. Ready to play the next day.", tagline: "Playing on it next morning",
  },
  "deep-cleaning": {
    order: 3, navLabel: "Deep Cleaning", footerLabel: "Deep cleaning", icon: "sparkle",
    summary: "Lifts embedded grime and rubber marking that mopping leaves behind.", tagline: "Lift what mopping leaves",
  },
  "court-line-marking": {
    order: 4, navLabel: "Line Marking", footerLabel: "Court line marking", icon: "court",
    summary: "Set out to code for basketball, netball, badminton, volleyball and futsal.", tagline: "Set out to code",
  },
  "floor-inspections": {
    order: 5, navLabel: "Inspections", footerLabel: "Floor inspections", icon: "search",
    summary: "A written condition report with photos and a costed recommendation. Free.", tagline: "Free written report",
  },
};

export async function seed(payload: Payload) {
  const log = (m: string) => payload.logger.info(`[seed] ${m}`);
  const media = mediaLoader(payload);
  log("loading launch content…");

  // ── services ────────────────────────────────────────────────────────────
  for (const [slug, s] of Object.entries(servicesJson) as [string, SeedService][]) {
    const meta = serviceMeta[slug];
    const depth = "depth" in s ? (s.depth as { figLabel: string; staticImage: string; staticAlt: string; eyebrow: string; title: string; body: string; legend: string[] }) : null;
    const data = {
      title: s.hero.title,
      slug,
      order: meta.order,
      navLabel: meta.navLabel,
      footerLabel: meta.footerLabel,
      icon: meta.icon as Service["icon"],
      heroImage: await media(s.hero.image, s.hero.alt),
      lead: decode(s.hero.lead),
      crumb: s.hero.crumb,
      summary: meta.summary,
      crossSellTagline: meta.tagline,
      involves: {
        eyebrow: s.involves.eyebrow,
        title: s.involves.title,
        body: htmlToLexical(s.involves.paragraphs),
        cardTitle: s.involves.card.title,
        items: s.involves.card.items.map((text) => ({ text })),
        note: s.involves.card.note ? htmlToLexical([s.involves.card.note]) : null,
      },
      depth: depth
        ? {
            enabled: true,
            figLabel: depth.figLabel,
            eyebrow: depth.eyebrow,
            title: depth.title,
            body: decode(depth.body),
            fallbackImage: await media(depth.staticImage, depth.staticAlt),
            legend: depth.legend.map((text) => ({ text })),
          }
        : { enabled: false },
      steps: {
        eyebrow: s.steps.eyebrow,
        title: s.steps.title,
        items: s.steps.items.map((it) => ({ title: it.title, text: decode(it.text), accent: it.accent })),
      },
      audienceTitle: s.audience.title,
      beforeAfter: {
        eyebrow: s.beforeAfter.eyebrow,
        title: s.beforeAfter.title,
        buttonLabel: s.beforeAfter.button,
        pairs: await Promise.all(
          s.beforeAfter.pairs.map(async (p) => ({
            before: await media(p.before.src, p.before.alt),
            after: await media(p.after.src, p.after.alt),
            beforeLabel: p.labels[0],
            afterLabel: p.labels[1],
            caption: p.caption ?? undefined,
          })),
        ),
      },
      crossSellEyebrow: s.crossSell.eyebrow,
      ctaTitle: s.cta.title,
      ctaText: s.cta.text,
      metaTitle: s.metaTitle.replace(/\s+—\s+Elite Sports Floor Care$/, ""),
      metaDescription: s.metaDescription,
    };
    const found = await payload.find({ collection: "services", where: { slug: { equals: slug } }, limit: 1, depth: 0 });
    if (found.docs[0]) await payload.update({ collection: "services", id: found.docs[0].id, data, depth: 0 });
    else await payload.create({ collection: "services", data, depth: 0 });
  }
  log("services ✓");

  // ── gallery projects ────────────────────────────────────────────────────
  const projects: [string, string, string, string, string, string, string][] = [
    ["Kilbryde Grammar, Ringwood", "Schools", "Full recoat + line reset", "indoor_basketball_court_interior", "Before: dull school hall court", "basketball_court_in_sports_facility", "After: glossy recoated school court"],
    ["Northvale Indoor Sports, Craigieburn", "Stadiums", "4 courts recoated", "elevated_view_of_indoor_stadium", "Before: worn stadium show court", "indoor_sports_facility_view", "After: recoated stadium court under lights"],
    ["Ferngully Leisure Centre, Knoxfield", "Recreation Centres", "Deep clean", "leisure_centre_timber_floor_view", "Before: grey rubber-marked rec centre floor", "leisure_centre_gym_floor_cleaning", "After: clean, clear-gloss rec centre floor"],
    ["Barrandale Memorial Hall, Colac", "Community Halls", "Line marking re-set", "crew_member_taping_court_line-2", "Before: faded overlapping hall lines", "indoor_sports_facility_timber_floor", "After: crisp three-sport line scheme"],
    ["Iron Arch Strength, Braybrook", "Gyms", "Recoat + slip correction", "worn_timber_sports_floor_surface", "Before: patchy gym timber platform area", "gym_timber_platform_area", "After: even matte finish gym floor"],
    ["St Aldwyn's College, Bendigo", "Schools", "Deep clean + recoat", "indoor_sports_facility_timber_floor-2", "Before: chalky school gymnasium boards", "college_gymnasium_indoor_sports_", "After: recoated school gymnasium"],
    ["Westgate Netball Centre, Altona", "Stadiums", "6 courts recoated", "elevated_view_of_indoor_stadium", "Before: netball court with worn keys", "netball_centre_indoor_sports_fac", "After: freshly recoated netball courts"],
    ["Yarrabank Shire Hall, Seymour", "Community Halls", "Full sand + recoat", "worn_timber_sports_floor_surface", "Before: century-old hall floor, bare patches", "worn_timber_sports_floor_interior", "After: restored hall floor with fresh finish"],
  ];
  if ((await payload.count({ collection: "projects" })).totalDocs === 0) {
    for (const [i, [title, sector, work, b, bAlt, a, aAlt]] of projects.entries()) {
      await payload.create({
        collection: "projects",
        data: { title, sector: sector as Project["sector"], work, before: await media(P(b), bAlt), after: await media(P(a), aAlt), order: i + 1, published: true },
        depth: 0,
      });
    }
  }
  log("gallery ✓");

  // ── testimonials & plans ────────────────────────────────────────────────
  if ((await payload.count({ collection: "testimonials" })).totalDocs === 0) {
    const quotes = [
      ["They coated our main court over a long weekend and we were playing on Tuesday. No disruption to the timetable at all.", "Dana Whitcombe, Business Manager", "Kilbryde Grammar, Ringwood"],
      ["The inspection report was the first time anyone gave us a costed plan for the floor instead of a vague quote.", "Peter Nagle, Facilities Coordinator", "Shire of Barrandale, Colac"],
      ["Four courts, two nights, and the surface plays better than it has in a decade. Booked them for the next cycle on the spot.", "Sam Reddy, Venue Operations", "Northvale Indoor Sports, Craigieburn"],
    ];
    for (const [i, [quote, person, organisation]] of quotes.entries())
      await payload.create({ collection: "testimonials", data: { quote, person, organisation, order: i + 1, published: true }, depth: 0 });
  }
  if ((await payload.count({ collection: "plans" })).totalDocs === 0) {
    const plans = [
      { name: "Bronze", colour: "steel", description: "A one-year agreement — an easy first step onto a proper cycle.", price: "$4,200", term: "1-year",
        items: ["Annual condition inspection", "One deep clean per year", "Written report with photos", "Priority booking window"] },
      { name: "Silver", colour: "blue", description: "Three years — what most busy school and club courts settle on.", price: "$13,800", term: "3-year",
        items: ["Everything in Bronze", "One full recoat within term", "Line marking touch-ups", "Fixed pricing for the term", "School-holiday scheduling"] },
      { name: "Gold", colour: "amber", description: "Five years — the whole job looked after, and the best value per year.", price: "$25,500", term: "5-year", featured: true,
        items: ["Everything in Silver", "Two full recoats within term", "Full line-marking reset once", "Emergency call-out response", "Annual asset-condition summary for your board"] },
    ] as const;
    for (const [i, p] of plans.entries())
      await payload.create({
        collection: "plans",
        data: { ...p, items: p.items.map((text) => ({ text })), featured: "featured" in p, ribbon: "Best value", order: i + 1, published: true },
        depth: 0,
      });
  }
  log("testimonials & plans ✓");

  // ── globals ─────────────────────────────────────────────────────────────
  await payload.updateGlobal({
    slug: "site-settings",
    data: {
      name: "Elite Sports Floor Care",
      legalName: "Elite Sports Floor Care Pty Ltd",
      phone: "1300 353 667",
      email: "hello@elitesportsfloorcare.com.au",
      street: "Unit 7, 42 Kirkham Road",
      locality: "Dandenong South",
      region: "VIC",
      postcode: "3175",
      abn: "41 682 903 517",
      tagline: "Specialist timber sports floor tradespeople, looking after Victoria's sports floors since 1998.",
      footerNote: "Fully insured · $20m public liability · Timber sports floors only",
      sectors: ["Schools", "Stadiums", "Gyms", "Recreation Centres", "Community Halls"].map((label) => ({ label })),
    },
  });

  await payload.updateGlobal({
    slug: "home",
    data: {
      heroEyebrow: "Victoria's Sports Floor Maintenance Specialists",
      heroTitle: "Protect the floor",
      heroHighlight: "Victoria plays on",
      heroLead:
        "We look after the timber floors Victoria plays on. A simple, scheduled recoat keeps your court safe, sharp and out of the way of a costly full sand — and we work around your timetable, not ours.",
      heroImage: await media(I("Empty_indoor_basketball_court"), "Glossy freshly-coated timber basketball court"),
      floats: [
        { title: "Next-morning play", text: "Most floors ready the next day", icon: "clock" },
        { title: "Victoria-wide service", text: "Metro and regional, same price per court", icon: "pin" },
      ],
      stats: [
        { value: "40+", label: "Victorian schools" },
        { value: "18", label: "Councils looked after" },
        { value: "Next morning", label: "Back in play" },
        { value: "$20m", label: "Public liability · fully insured" },
      ],
      whyEyebrow: "Why choose us",
      whyTitle: "Your sports floor is one of your biggest assets",
      whyLead: "Timber sports floors are all we do. A simple maintenance cycle keeps the coating intact, the surface safe underfoot and your courts ready to play.",
      whyImage: await media(P("technician_coating_indoor_sports"), "Technician applying a fresh coat to a timber sports court"),
      whyNote: "The maths: a scheduled recoat costs a fraction of a full re-sand — and a floor can only be sanded a handful of times in its life.",
      benefits: [
        { title: "Extend floor life", icon: "plus", text: "Recoating renews the wear layer so the timber underneath is never sacrificed." },
        { title: "Maintain appearance", icon: "star", text: "Even gloss, crisp line marking and a surface your facility is proud to show." },
        { title: "Reduce costly sanding", icon: "trend", text: "Stay on a recoat cycle and you defer full sand-and-refinish for years." },
        { title: "Minimise downtime", icon: "clock", text: "Scheduled around holidays and off-peak hours. Most floors are ready the next day." },
        { title: "Keep courts game-ready", icon: "court", text: "Correct slip resistance and ball response, season after season." },
      ],
      servicesEyebrow: "Our services",
      servicesTitle: "Everything a timber court needs",
      servicesIntro: "One specialist team, one point of contact — from annual inspection through to line marking.",
      plansEyebrow: "Maintenance plans",
      plansTitle: "Predictable annual cost. No surprises.",
      plansLead: "Choose a term and we lock the schedule, the scope and the price. Longer terms protect the floor best — and cost least per year.",
      plansFine:
        "Figures shown are indicative for a single full-size court, ex GST. We'll quote your floor properly after the inspection — size, condition and access all change the job. Multi-court venues get a bundled rate.",
      galleryEyebrow: "Before & after",
      galleryTitle: "The same floor, one visit apart",
      galleryButton: "See the full gallery",
      pairs: [
        {
          before: await media(I("Indoor_basketball_court_interior"), "Before: worn, dull school hall court"),
          after: await media(I("Basketball_court_in_sports_facility"), "After: same court, freshly recoated and gloss"),
          caption: "Regional high school — full recoat and line-marking reset, back in use next morning.",
        },
        {
          before: await media(I("Elevated_view_of_indoor_stadium"), "Before: stadium court with rubber marking and wear lanes"),
          after: await media(I("Indoor_sports_facility_view"), "After: stadium court deep cleaned and recoated"),
          caption: "Multi-court indoor stadium — deep clean and recoat staged across two nights.",
        },
      ],
      testimonialsEyebrow: "What clients say",
      contactEyebrow: "Free inspection",
      contactTitle: "Book a free floor inspection",
      contactLead: "We'll assess the coating, the line marking and the timber, then send a written report with a costed recommendation. No obligation.",
      contactTicks: [
        "Most floors ready for use the next day",
        "Far lower cost than a full sand and refinish",
        "Protects the timber underneath, permanently",
        "Predictable annual cost you can budget",
      ].map((text) => ({ text })),
    },
  });

  await payload.updateGlobal({
    slug: "about",
    data: {
      heroTitle: "Very good at",
      heroHighlight: "one thing",
      heroLead: "A floor-sanding crew who stopped doing everything, and got very good at one thing: timber sports floors.",
      heroImage: await media(P("empty_sports_court_at_sunrise"), "Finished timber sports court at sunrise"),
      stats: [
        { value: "1998", label: "Sports-floor-only since" },
        { value: "1,400+", label: "Courts coated" },
        { value: "11", label: "People on the tools" },
        { value: "$20m", label: "Public liability cover" },
      ],
      storyImage: await media(P("owner_and_crew_holding_applicator"), "Two of the crew on site with a coating applicator"),
      badgeTitle: "Dandenong South",
      badgeText: "One workshop, crews across Victoria",
      storyEyebrow: "Our story",
      storyTitle: "From every kind of floor to Victoria's courts",
      storyLead:
        "Elite Sports Floor Care started out sanding every kind of floor — houses, shops, church halls, whatever came up. By the late nineties we'd noticed something: the sports floors were the jobs everyone else was getting wrong.",
      sawLabel: "What we kept seeing",
      saw: [
        "Courts coated in domestic finishes that went slippery under sweat.",
        "Lines painted on top instead of sealed under.",
        "Schools told they needed a full sand when the floor needed one screen and two coats.",
      ].map((text) => ({ text })),
      storyText:
        "So in 1998 we stopped taking domestic work altogether and Elite Sports Floor Care became a sports-floor-only business. Nearly three decades on, it's still Victorian, still hands-on, and still the same answer to the same question.",
      quoteTitle: "What does this floor actually need?",
      quoteText: "The owner still quotes every job personally. That's deliberate — the person who tells you what your floor needs is the person accountable for the crew that does it.",
      whyEyebrow: "Why we're different",
      whyTitle: "Four things facility managers tell us matter",
      cards: [
        { title: "Timber sports floors only", icon: "court", text: "No decks, no houses, no vinyl. Every product we carry and every technique we use is chosen for one surface, which is why we can tell a recoat from a re-sand at a glance." },
        { title: "We work when you don't", icon: "clock", text: "Nights, weekends, term breaks, shutdown weeks. Most single-court jobs hand back ready to play the next morning, so nothing comes off your booking sheet." },
        { title: "Priced for a budget cycle", icon: "calendar", text: "Fixed-term plans with the schedule and the scope locked, so the floor is a predictable line item rather than an emergency capital request." },
        { title: "Victorian, and local about it", icon: "pin", text: "One workshop in Dandenong South, crews that travel the state, and the same people on the quote and the invoice." },
      ],
      accrEyebrow: "Accreditations & standards",
      accrTitle: "Paperwork your procurement team will ask for",
      accrText: "Current certificates are supplied with every quote — and we're happy to be added to your contractor management system before we set foot on site.",
      accreditations: [
        { kind: "Insurance", title: "$20m public liability", text: "Certificate of currency on request" },
        { kind: "Compliance", title: "Working with Children", text: "Every crew member, checked and current" },
        { kind: "Safety", title: "SWMS & site inductions", text: "Job-specific, issued before we start" },
        { kind: "Product", title: "Manufacturer accredited", text: "Applicator warranty on sports finishes" },
      ],
      crewEyebrow: "On the tools",
      crewTitle: "The crew, mid-job",
      crew: [
        { image: await media(P("crew_member_taping_court_line"), "Crew masking court lines"), caption: "Masking court lines" },
        { image: await media(P("worker_applying_coating_on_court"), "Coating being rolled at night"), caption: "Coating rolled at night" },
        { image: await media(P("floor_screening_machine_operatin"), "Screening machine and dust extraction"), caption: "Screening and dust extraction" },
        { image: await media(P("empty_sports_court_at_sunrise"), "Finished court handed back at sunrise"), caption: "Handed back at sunrise" },
      ],
      cta: { title: "Ready to protect your floor?", text: "Free inspection, written report, costed recommendation. The owner does the quote personally." },
      metaDescription: "Victorian timber sports floor specialists — our story, why facility managers choose us, and our accreditations.",
    },
  });

  await payload.updateGlobal({
    slug: "gallery-page",
    data: {
      title: "Before & After Gallery",
      lead: "School halls, stadium show courts, council rec centres and hundred-year-old community halls — every one of these is the same floor, photographed either side of one visit.",
      cta: { title: "See what we can do for your floor", text: "Free inspection, written report, costed recommendation. Anywhere in Victoria." },
      metaDescription:
        "Browse the full before-and-after portfolio of timber sports floor recoats, deep cleans and line marking re-sets across Victorian schools, stadiums, gyms and halls.",
    },
  });

  await payload.updateGlobal({
    slug: "service-areas-page",
    data: {
      title: "Where We Work",
      lead: "All of Victoria. One workshop in Dandenong South, crews that travel, and no surcharge for being outside the metro ring.",
      coverageEyebrow: "Coverage",
      coverageTitle: "If it's in Victoria, we'll come to it",
      coverageText:
        "Metro, regional or rural — same crews, same products, same price per court. Regional work is scheduled in blocks so the travel isn't on your invoice, which is why booking a few weeks ahead usually gets you a better slot than an emergency call.",
      coverageTicks: [
        "Every Victorian council area covered",
        "No travel loading on regional quotes",
        "Multi-site portfolios scheduled as one program",
        "Southern NSW and Riverina by arrangement",
      ].map((text) => ({ text })),
      timesEyebrow: "What to expect",
      timesTitle: "Response times",
      times: [
        { kind: "Enquiry", value: "1 business day", text: "Someone who's actually been on a court rings you back — not a call centre." },
        { kind: "Inspection booked", value: "Within 2 weeks", text: "Sooner in metro, and we'll always try to fit around your booking sheet." },
        { kind: "Written report", value: "3 business days", text: "Photos, findings, costed recommendation and a five-year forward plan." },
        { kind: "Plan clients", value: "48 hours", text: "Gold plan holders get an on-site response to urgent floor damage within two days." },
      ],
      cta: { title: "Not sure if we cover your area? Ask us.", text: "Tell us where the floor is and we'll tell you straight away — including if you'd be better off with someone closer." },
      metaDescription: "Elite Sports Floor Care services timber sports floors across all of Victoria — metro, regional and rural — with no travel surcharge.",
    },
  });
  log("pages & settings ✓ — launch content loaded");
}
