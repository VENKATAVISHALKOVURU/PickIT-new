import { Link, useRoute } from "wouter";
import { ArrowLeft, ShieldCheck, FileText, RefreshCw, Cookie } from "lucide-react";
import { motion } from "framer-motion";
import brandLogo from "@assets/WhatsApp_Image_2026-04-17_at_12.01.44_PM_1776407538276.jpeg";

type PolicyKey = "privacy" | "terms" | "refund" | "cookies";

type Section = { heading: string; body?: string; bullets?: string[] };

type PolicyDoc = {
  title: string;
  intro: string;
  icon: typeof ShieldCheck;
  accent: string;
  sections: Section[];
};

const POLICIES: Record<PolicyKey, PolicyDoc> = {
  privacy: {
    title: "Privacy Policy",
    icon: ShieldCheck,
    accent: "from-blue-500 to-emerald-500",
    intro:
      "This Privacy Policy outlines how PickIT (\u201cthe Platform\u201d) collects, uses, and safeguards user information.",
    sections: [
      {
        heading: "1.1 Information Collected",
        body: "The Platform may collect the following data:",
        bullets: [
          "Personal details (Name, Email Address, Phone Number)",
          "Documents uploaded for printing purposes",
          "Transactional and activity-related data",
        ],
      },
      {
        heading: "1.2 Purpose of Collection",
        body: "The collected information is used strictly for:",
        bullets: [
          "Processing and managing print requests",
          "Connecting users with registered print shops",
          "Enhancing platform performance and user experience",
        ],
      },
      {
        heading: "1.3 Data Usage & Confidentiality",
        bullets: [
          "PickIT does not sell, rent, or trade user data to third parties",
          "Uploaded files are used solely for printing-related operations",
          "Files may be automatically deleted within 24\u201348 hours after processing, unless required for operational purposes",
        ],
      },
      {
        heading: "1.4 Data Security",
        body: "Reasonable security measures are implemented to protect user data. However, users acknowledge that no digital system guarantees absolute security.",
      },
      {
        heading: "1.5 User Rights",
        body: "Users may:",
        bullets: [
          "Request deletion of personal data",
          "Raise privacy-related concerns through official contact channels",
        ],
      },
    ],
  },
  terms: {
    title: "Terms & Conditions",
    icon: FileText,
    accent: "from-[#1a1f4d] to-blue-500",
    intro: "By accessing or using PickIT, users agree to the following terms:",
    sections: [
      {
        heading: "2.1 Nature of Platform",
        body: "PickIT acts as an intermediary platform connecting students and print service providers. The Platform does not own, operate, or control printing facilities.",
      },
      {
        heading: "2.2 User Obligations",
        body: "Users agree to:",
        bullets: [
          "Provide accurate and valid information",
          "Upload only lawful and appropriate content",
          "Comply with applicable laws and platform guidelines",
        ],
      },
      {
        heading: "2.3 Shop Owner Obligations",
        body: "Registered shop owners must:",
        bullets: [
          "Fulfill orders accurately and in a timely manner",
          "Maintain transparent and fair pricing",
          "Ensure proper handling of user documents",
        ],
      },
      {
        heading: "2.4 Limitation of Liability",
        body: "PickIT shall not be held liable for:",
        bullets: [
          "Print quality discrepancies",
          "Delays or failures by shop owners",
          "Errors in user-submitted files",
        ],
      },
      {
        heading: "2.5 Account Usage",
        bullets: [
          "Each user is permitted to maintain only one account",
          "Any misuse, fraudulent activity, or policy violation may result in suspension or termination",
        ],
      },
    ],
  },
  refund: {
    title: "Refund Policy",
    icon: RefreshCw,
    accent: "from-emerald-500 to-blue-500",
    intro: "PickIT Refund Policy outlines the conditions under which refunds are processed.",
    sections: [
      {
        heading: "3.1 Eligibility for Refund",
        body: "Refunds may be initiated under the following circumstances:",
        bullets: [
          "The print request is rejected by the shop",
          "The order is not fulfilled",
          "Significant service failure attributable to the platform or shop",
        ],
      },
      {
        heading: "3.2 Non-Eligibility",
        body: "Refunds shall not be applicable in cases where:",
        bullets: [
          "Incorrect or unsuitable files are uploaded by the user",
          "The user cancels after printing has commenced",
        ],
      },
      {
        heading: "3.3 Refund Process",
        bullets: [
          "Refunds may be initiated automatically or upon request",
          "Processing time: 3 to 7 working days, depending on the payment method",
        ],
      },
    ],
  },
  cookies: {
    title: "Cookie Policy",
    icon: Cookie,
    accent: "from-amber-500 to-emerald-500",
    intro: "PickIT Cookie Policy describes how and why we use cookies on our platform.",
    sections: [
      {
        heading: "4.1 Usage of Cookies",
        body: "PickIT uses cookies for:",
        bullets: [
          "Maintaining user sessions (login persistence)",
          "Enhancing performance and usability",
          "Basic analytics for system improvement",
        ],
      },
      {
        heading: "4.2 Data Ethics",
        bullets: [
          "Cookies are not used for selling user data",
          "No cross-platform or third-party tracking is performed",
        ],
      },
      {
        heading: "4.3 User Control",
        body: "Users may disable cookies via browser settings; however, certain functionalities of the platform may be affected.",
      },
    ],
  },
};

export default function Policy() {
  const [, params] = useRoute("/legal/:key");
  const key = (params?.key as PolicyKey) || "privacy";
  const doc = POLICIES[key] ?? POLICIES.privacy;
  const Icon = doc.icon;

  return (
    <div className="min-h-screen bg-[#fafbff] text-slate-900">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/70">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" aria-label="PickIT home" className="inline-flex items-center">
            <img src={brandLogo} alt="PickIT" className="h-12 w-auto object-contain" />
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            {(Object.keys(POLICIES) as PolicyKey[]).map((k) => (
              <Link
                key={k}
                href={`/legal/${k}`}
                className={`px-3 py-1.5 rounded-full transition-colors ${
                  k === key
                    ? "bg-[#1a1f4d] text-white"
                    : "text-slate-600 hover:text-[#1a1f4d] hover:bg-slate-100"
                }`}
              >
                {POLICIES[k].title.replace(" Policy", "").replace(" & Conditions", "")}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-6 py-14 max-w-3xl">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#1a1f4d] mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${doc.accent} text-white shadow-lg mb-5`}>
            <Icon className="w-7 h-7" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#1a1f4d]">
            {doc.title}
          </h1>
          <p className="mt-3 text-xs uppercase tracking-[0.25em] text-slate-400">
            Last updated · April 2026
          </p>
          <p className="mt-6 text-slate-600 text-lg leading-relaxed">{doc.intro}</p>
        </motion.div>

        <div className="mt-12 space-y-10">
          {doc.sections.map((s, i) => (
            <motion.section
              key={s.heading}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              className="border-l-2 border-emerald-200 pl-6"
            >
              <h2 className="text-xl font-semibold text-[#1a1f4d] mb-3">{s.heading}</h2>
              {s.body && <p className="text-slate-600 leading-relaxed">{s.body}</p>}
              {s.bullets && (
                <ul className="mt-3 space-y-2">
                  {s.bullets.map((b) => (
                    <li key={b} className="flex gap-3 text-slate-600 leading-relaxed">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </motion.section>
          ))}
        </div>

        <div className="mt-16 p-6 rounded-2xl bg-white border border-slate-200/80 text-center">
          <p className="text-sm text-slate-500">
            Questions about this policy? Reach out at{" "}
            <a href="mailto:hello@pickit.app" className="text-blue-600 font-medium hover:underline">
              hello@pickit.app
            </a>
          </p>
        </div>
      </main>

      <footer className="bg-[#0f1438] text-slate-400 text-center py-6 text-xs">
        © {new Date().getFullYear()} PickIT Technologies. All rights reserved.
      </footer>
    </div>
  );
}
