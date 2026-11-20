// Single source for both the site and the CV view. Edit here, both update.

export const profile = {
  name: "Farrel Reksa Prawira",
  short: "reksa",
  role: "AI and product",
  tagline: "Co-founder of Tofly. Final-year Information Systems student at Universitas Indonesia.",
  about:
    "I manage products and train models. Right now that means Tofly, a TOEFL prep platform for Indonesian learners. Before that I spent seven months on cloud and GPU products at Indosat, and two years running projects at RISTEK.",
  location: "South Jakarta, Indonesia",
  email: "farrelreksa@gmail.com",
  links: [
    { label: "email", href: "mailto:farrelreksa@gmail.com" },
    { label: "linkedin", href: "https://www.linkedin.com/in/farrel-reksa/" },
    { label: "github", href: "https://github.com/farrelrp" },
  ],
};

export type Entry = {
  title: string;
  role?: string;
  date: string;
  href?: string;
  summary: string;
  /** Longer bullet points. Only the CV view shows these. */
  points?: string[];
  /** Hide from the site list, keep in the CV. */
  cvOnly?: boolean;
};

export const work: Entry[] = [
  {
    title: "Tofly",
    role: "Co-founder",
    date: "Jun 2026 – now",
    href: "https://tofly.id",
    summary:
      "English test prep for Indonesian learners. I work on product, partnerships and growth.",
    points: [
      "Co-founded tofly.id, a TOEFL, IELTS and TOEIC practice platform priced for Indonesian students.",
      "Received bootstrap funding from the Ministry of Higher Education, Science, and Technology.",
      "Own product strategy, business development, partnerships and growth.",
    ],
  },
  {
    title: "Indosat Ooredoo Hutchison",
    role: "Cloud product intern",
    date: "Apr – Oct 2026",
    summary:
      "Product planning for Cloudeka 2.0 with Lintasarta. GPU as a Service, GPU VDI, VMware migration and sovereign cloud.",
    points: [
      "Selected as 1 of 40 INSPIRE apprentices from over 17,000 applicants.",
      "Worked with Lintasarta on product strategy for Cloudeka 2.0, covering cloud infrastructure, AI, GPU and enterprise virtualization.",
      "Did market research, competitive analysis, packaging, pricing and business cases for GPU as a Service, GPU VDI, VMware migration and sovereign cloud.",
      "Wrote PRDs, BRDs and TDDs that turned business needs into requirements for engineering.",
    ],
  },
  {
    title: "RISTEK Fasilkom UI",
    role: "Project manager",
    date: "Mar 2024 – Mar 2026",
    summary:
      "Head of product for ristek.link. Managed client and internal projects worth over 70M IDR.",
    points: [
      "Head of product for ristek.link, a link shortener with 4,000+ users and 15,000+ links created in the past year.",
      "Managed projects totaling over 70M IDR and delivered each on budget and on time.",
      "Wrote PRDs, WBS and roadmaps, and ran delivery in Asana, Jira and Mixpanel across engineering, design and operations.",
    ],
  },
  {
    title: "ShARE Universitas Indonesia",
    role: "AI project specialist",
    date: "Feb – Jul 2025",
    summary:
      "Consulting for an edtech client. Led the feature team that mapped where AI fits in their product.",
    points: [
      "Led a feature team that mapped AI integration against an edtech client's long-term product plan.",
      "Turned the findings into feature roadmaps and presented them to the client's stakeholders.",
    ],
  },
  {
    title: "Fasilkom UI",
    role: "Teaching assistant",
    date: "Jan – Jun 2025",
    summary: "Introduction to Computer Architecture.",
  },
  {
    title: "AIESEC in UI",
    role: "Project development",
    date: "Feb 2024 – Feb 2025",
    summary:
      "Ran LeadTalk, a talk show with 8 speakers and 500+ attendees, and company visits to 3 global firms.",
    points: [
      "Coordinated LeadTalk, a talk show with 8 industry speakers and 500+ attendees.",
      "Organized LeadVisit to 3 global companies.",
    ],
  },
];

export const projects: Entry[] = [
  {
    title: "tofly.id",
    role: "Co-founder",
    date: "2026",
    href: "https://tofly.id",
    summary: "AI-assisted TOEFL, IELTS and TOEIC practice at a price Indonesian students can pay.",
  },
  {
    title: "Docusense",
    role: "Hackathon build",
    date: "2026",
    summary:
      "Edge extension that helps visually impaired students read PDFs. It parses the layout and describes the figures.",
  },
  {
    title: "PINK-MVAN",
    role: "Co-author",
    date: "2025",
    summary:
      "Multi-view mammography model for breast cancer risk. Distilled and quantized to 0.059 MB, 8× faster on CPU, 75.7% recall.",
  },
  {
    title: "ristek.link",
    role: "Head of product",
    date: "2025",
    href: "https://ristek.link",
    summary: "Link shortener with custom domains and a QR creator. 4,000+ users.",
  },
  {
    title: "Antibiotic recommendation app",
    role: "Project manager",
    date: "2024",
    summary:
      "Mobile app for the internal medicine department of a national hospital. Shipped in 3 months, used by 200+ staff.",
  },
  {
    title: "Microsleep detection",
    role: "Group project",
    date: "2024",
    href: "http://bit.ly/DrowsinessProject",
    summary: "YOLO on a Raspberry Pi that spots a driver nodding off and sounds an alert.",
  },
  {
    title: "Summer Event website",
    role: "Project manager",
    date: "2024",
    href: "https://event.ristek.cs.ui.ac.id",
    summary: "Registration, forms and mailing for RISTEK's annual event.",
  },
  {
    title: "StudyTurtle",
    role: "Personal project",
    date: "2024",
    href: "https://github.com/farrelrp/StudyTurtle/",
    summary: "Upload a PDF, get flashcards. Next.js, Firebase, Pinecone and an open-source LLM.",
  },
];

export const awards: Entry[] = [
  {
    title: "Microsoft ASEAN AI for Accessibility Hackathon",
    role: "2nd place, national",
    date: "Jun 2026",
    summary: "For Docusense.",
  },
  {
    title: "GEMASTIK XVIII, ICT Scientific Paper",
    role: "1st place, national",
    date: "Oct 2025",
    summary: "For PINK-MVAN.",
  },
  {
    title: "Kominfo TSA Data Science Competition",
    role: "1st place, national",
    date: "Nov 2024",
    href: "http://ristek.link/SlidesTSA",
    summary:
      "First of 250+ teams. Repeat-purchase prediction with out-of-fold hill climbing, plus customer segmentation.",
  },
  {
    title: "Sebelas Maret Statistics Data Science Competition",
    role: "1st place, national",
    date: "Nov 2024",
    summary: "Rainfall and power outage forecasting using lagged correlation.",
  },
  {
    title: "Telkom University Data Slayer 2.0",
    role: "1st place and best presentation",
    date: "Jun 2024",
    summary: "Fall detection on video. 100% accuracy on the test set.",
  },
  {
    title: "Pertamina Foundation Sobat Bumi Scholarship",
    role: "Awardee",
    date: "2024 – 2025",
    summary:
      "1 of 16 awardees at UI from 19,000+ applicants. Built a biodigester for the Meruyung community with IDR 100M in funding.",
  },
];

export const education = {
  school: "Universitas Indonesia",
  degree: "Bachelor of Information Systems",
  date: "2023 – 2027 (expected)",
  notes: [
    "GPA 3.78 / 4.00",
    "Pertamina Foundation Sobat Bumi Scholarship awardee, 2024 – 2025",
    "Teaching assistant, Introduction to Computer Architecture, 2024/2025",
  ],
};

export const skills = [
  { label: "Product", items: "PRDs, roadmaps, market research, pricing, Asana, Jira, Mixpanel, Figma" },
  { label: "Data and AI", items: "Python, SQL, scikit-learn, TensorFlow, Ultralytics YOLO, Tableau" },
  { label: "Web", items: "Next.js, React, Django, PostgreSQL" },
  { label: "Languages", items: "Indonesian (native), English (TOEFL ITP 640)" },
];
