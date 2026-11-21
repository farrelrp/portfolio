// Single source for both the site and the CV view. Edit here, both update.

export const profile = {
  name: "Farrel Reksa Prawira",
  short: "reksa",
  role: "AI and product",
  tagline: "Forward Deployed Engineer Apprentice at Shopee. Co-founder of Tofly.",
  about:
    "I build AI products and take them to market. I'm a final-year Information Systems student at Universitas Indonesia, co-founder of Tofly, and Forward Deployed Engineer Apprentice at Shopee. Previously, I spent seven months on cloud and GPU products at Indosat and two years leading software projects at RISTEK.",
  first: "Farrel",
  middle: "Reksa",
  last: "Prawira",
  location: "South Jakarta, Indonesia",
  email: "farrelreksa@gmail.com",
  links: [
    { label: "email", href: "mailto:farrelreksa@gmail.com" },
    { label: "linkedin", href: "https://www.linkedin.com/in/farrel-reksa/" },
    { label: "github", href: "https://github.com/farrelrp" },
  ],
};

/** Logos under the hero buttons. Each one jumps to the row with that id. */
export const marks = [
  { name: "Tofly", logo: "tofly.png", target: "tofly" },
  { name: "Indosat Ooredoo Hutchison", logo: "indosat.png", target: "indosat" },
  { name: "RISTEK Fasilkom UI", logo: "ristek.png", target: "ristek" },
  { name: "Fasilkom UI", logo: "fasilkom-ui.png", target: "fasilkom-ui" },
  { name: "GEMASTIK", logo: "gemastik.png", target: "gemastik" },
];

export type Badge = {
  kind: "award" | "funding" | "program";
  label: string;
  /** Id of the row to jump to. */
  target?: string;
};

export type Entry = {
  title: string;
  role?: string;
  date: string;
  href?: string;
  summary: string;
  /** Longer bullet points. Only the CV view shows these. */
  points?: string[];
  /** Anchor id, so a logo elsewhere on the page can jump to this row. */
  id?: string;
  /** File in public/logos. Shown grey, in colour on hover. */
  logo?: string;
  /**
   * Small chips under the summary. An award with a `target` jumps to that
   * award row. Funding and programs are plain labels.
   */
  badges?: Badge[];
  /** Hide from the site list, keep in the CV. */
  cvOnly?: boolean;
};

export const work: Entry[] = [
  {
    id: "shopee",
    title: "Shopee",
    role: "Forward Deployed Engineer Apprentice",
    date: "Jan – Jul 2027",
    summary: "Shopee Apprentice Program.",
  },
  {
    id: "tofly",
    logo: "tofly.png",
    title: "Tofly",
    role: "Co-Founder",
    date: "Jun 2026 – now",
    href: "https://tofly.id",
    summary:
      "AI-assisted English test prep for Indonesian students. Leading product, partnerships and growth.",
    badges: [
      { kind: "award", label: "1st · KMI Expo 2026", target: "kmi-expo" },
      { kind: "funding", label: "Funded by Kemdiktisaintek (P2MW)" },
      { kind: "program", label: "NVIDIA Inception" },
      { kind: "program", label: "Google for Startups" },
      { kind: "program", label: "Claude for Startups" },
    ],
    points: [
      "Co-founded tofly.id, an AI-assisted TOEFL, IELTS and TOEIC platform serving 1,000+ Indonesian learners.",
      "Won 1st Place nationally at KMI Expo 2026 (Bisnis Digital Berkembang) and secured P2MW grant funding from Kemdiktisaintek.",
      "Accepted into NVIDIA Inception, Google for Startups and Claude for Startups.",
      "Lead product roadmap, institutional partnerships and user growth.",
    ],
  },
  {
    id: "indosat",
    logo: "indosat.png",
    title: "Indosat Ooredoo Hutchison",
    role: "AI Infrastructure Product Intern",
    date: "Apr – Oct 2026",
    summary:
      "Built a VMware-to-Cloudeka migration prototype and worked with Lintasarta on pricing, specs and launch plans for Cloudeka 2.0's GPU and sovereign cloud products.",
    points: [
      "Selected as 1 of 40 INSPIRE Apprentices from 17,000+ applicants nationwide; partnered with Lintasarta on Cloudeka 2.0.",
      "Built a VMware migration prototype inspired by AWS Transform, automating vSphere inventory discovery, VM dependency mapping and migration wave planning onto Cloudeka.",
      "Led market research, competitive benchmarking, pricing, business cases and PRDs/BRDs/TDDs for GPU as a Service, GPU VDI and sovereign cloud.",
    ],
  },
  {
    id: "ristek",
    logo: "ristek.png",
    title: "RISTEK Fasilkom UI",
    role: "Project Manager",
    date: "Mar 2024 – Mar 2026",
    summary:
      "Head of product for ristek.link (4,000+ users, 15,000+ links) and PM for client software builds totaling over 70M IDR.",
    points: [
      "Led ristek.link as Head of Product, scaling it to 4,000+ users and 15,000+ shortened links in one year.",
      "Delivered client and internal software projects totaling 70M+ IDR on schedule and on budget, including an internal-medicine mobile app for a national hospital.",
      "Wrote PRDs, WBS and roadmaps across engineering, design and operations in Asana, Jira and Mixpanel.",
    ],
  },
  {
    id: "share",
    title: "ShARE Universitas Indonesia",
    role: "AI Project Specialist",
    date: "Feb – Jul 2025",
    summary:
      "Led a feature team scoping AI integrations and a product roadmap for an Indonesian edtech client.",
    points: [
      "Scoped AI integration opportunities with an edtech client, balancing technical feasibility against their product roadmap.",
      "Delivered prioritized feature roadmaps directly to client stakeholders.",
    ],
  },
  {
    id: "fasilkom-ui",
    logo: "fasilkom-ui.png",
    title: "Fasilkom UI",
    role: "Teaching Assistant",
    date: "Jan – Jun 2025",
    summary: "Introduction to Computer Architecture.",
  },
  {
    id: "aiesec",
    logo: "aiesec.png",
    title: "AIESEC in UI",
    role: "Project Development",
    date: "Feb 2024 – Feb 2025",
    summary:
      "Coordinated LeadTalk (8 industry speakers, 500+ attendees) and LeadVisit trips to three multinational offices.",
    points: [
      "Coordinated LeadTalk, managing 8 industry speakers and event logistics for 500+ attendees.",
      "Organized LeadVisit corporate visits to 3 multinational companies.",
    ],
  },
];

export const projects: Entry[] = [
  {
    title: "tofly.id",
    role: "Co-Founder",
    date: "2026",
    href: "https://tofly.id",
    badges: [{ kind: "award", label: "1st · KMI Expo 2026", target: "kmi-expo" }],
    summary: "AI-assisted TOEFL, IELTS and TOEIC practice priced for Indonesian students.",
  },
  {
    title: "Docusense",
    role: "Hackathon Build",
    badges: [{ kind: "award", label: "2nd · Microsoft AI for Accessibility", target: "microsoft-hackathon" }],
    date: "2026",
    summary:
      "Microsoft Edge extension that parses PDF layouts and describes figures so visually impaired students can read academic papers.",
  },
  {
    title: "PINK-MVAN",
    role: "Co-Author",
    badges: [{ kind: "award", label: "1st · GEMASTIK XVIII", target: "gemastik" }],
    date: "2025",
    summary:
      "Multi-view mammography model for breast cancer detection. Distilled and quantized to 0.059 MB, 8× faster on CPU at 75.7% recall.",
  },
  {
    title: "ristek.link",
    role: "Head of Product",
    date: "2025",
    href: "https://ristek.link",
    summary: "Link shortener with custom domains and QR generation. 4,000+ users and 15,000+ links.",
  },
  {
    title: "Antibiotic recommendation app",
    role: "Project Manager",
    date: "2024",
    summary:
      "Mobile app for a national hospital's internal medicine department. Shipped in 3 months; used by 200+ staff.",
  },
  {
    title: "Microsleep detection",
    role: "Group Project",
    date: "2024",
    href: "http://bit.ly/DrowsinessProject",
    summary: "Real-time driver drowsiness detector running YOLO on a Raspberry Pi.",
  },
  {
    title: "Summer Event website",
    role: "Project Manager",
    date: "2024",
    href: "https://event.ristek.cs.ui.ac.id",
    summary: "Registration, forms and automated emails for RISTEK's annual event.",
  },
  {
    title: "StudyTurtle",
    role: "Personal Project",
    date: "2024",
    href: "https://github.com/farrelrp/StudyTurtle/",
    summary: "PDF-to-flashcards study tool built with Next.js, Firebase, Pinecone and an open-source LLM.",
  },
];

export const awards: Entry[] = [
  {
    id: "kmi-expo",
    logo: "tofly.png",
    title: "KMI Expo 2026, Bisnis Digital Berkembang",
    role: "1st Place, National",
    date: "Oct 2026",
    summary: "Won with Tofly at the national final of Kemdiktisaintek's P2MW student venture program.",
  },
  {
    id: "microsoft-hackathon",
    title: "Microsoft ASEAN AI for Accessibility Hackathon",
    role: "2nd Place, National",
    date: "Jun 2026",
    summary: "Won with Docusense.",
  },
  {
    id: "gemastik",
    logo: "gemastik.png",
    title: "GEMASTIK XVIII, ICT Scientific Paper",
    role: "1st Place, National",
    date: "Oct 2025",
    summary: "Won with PINK-MVAN.",
  },
  {
    id: "kominfo-tsa",
    title: "Kominfo TSA Data Science Competition",
    role: "1st Place, National",
    date: "Nov 2024",
    href: "http://ristek.link/SlidesTSA",
    summary:
      "1st of 250+ teams. Repeat-purchase prediction using out-of-fold hill climbing and customer segmentation.",
  },
  {
    title: "Sebelas Maret Statistics Data Science Competition",
    role: "1st Place, National",
    date: "Nov 2024",
    summary: "Rainfall and power-outage forecasting using lagged correlation.",
  },
  {
    title: "Telkom University Data Slayer 2.0",
    role: "1st Place and Best Presentation",
    date: "Jun 2024",
    summary: "Video fall detection using computer vision and sequence reconstruction. 100% test accuracy.",
  },
  {
    title: "Pertamina Foundation Scholarship",
    role: "Awardee",
    date: "2024 – 2025",
    summary:
      "1 of 16 awardees at UI from 19,000+ applicants. Built a community biodigester in Meruyung with 100M IDR in funding.",
  },
];

export const education = {
  school: "Universitas Indonesia",
  degree: "Bachelor of Information Systems",
  date: "2023 – 2027 (expected)",
  notes: [
    "GPA 3.78 / 4.00",
    "Pertamina Foundation Scholarship awardee, 2024 – 2025",
    "Teaching assistant, Introduction to Computer Architecture, 2024/2025",
  ],
};

export const skills = [
  { label: "Product", items: "PRDs, roadmaps, market research, pricing, Asana, Jira, Mixpanel, Figma" },
  { label: "Data and AI", items: "Python, SQL, scikit-learn, TensorFlow, Ultralytics YOLO, Tableau" },
  { label: "Web", items: "Next.js, React, Django, PostgreSQL" },
  { label: "Languages", items: "Indonesian (native), English (TOEFL ITP 640)" },
];
