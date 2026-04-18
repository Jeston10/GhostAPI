import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNav } from "@/components/layout/site-nav";
import { Clock, Mail, MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ContactMailForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact — API Ghost",
  description: "Reach the API Ghost team for product questions, integrations, and feedback.",
};

const SUPPORT_EMAIL = "support@ghostapi.io";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-[#050040]">
      <section className="border-b border-slate-200/90 bg-white text-sm shadow-sm">
        <SiteNav currentPage="contact" variant="hero" />
      </section>

      <main className="relative mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-64 max-w-3xl rounded-full bg-[radial-gradient(ellipse_at_top,oklch(0.55_0.12_270/0.12),transparent_65%)] blur-2xl"
          aria-hidden
        />

        <div className="relative overflow-hidden rounded-2xl border border-slate-200/95 bg-white shadow-sm ring-1 ring-black/[0.04]">
          <div className="border-b border-slate-200/90 bg-gradient-to-br from-slate-50/90 via-white to-indigo-50/30 px-5 py-8 md:px-10 md:py-10">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-blue-600">Contact</p>
            <h1 className="mt-2 max-w-2xl text-3xl font-extrabold tracking-tight text-[#050040] md:text-4xl">
              Let&apos;s build faster APIs together
            </h1>
            <p className="mt-4 max-w-2xl text-[15px] font-medium leading-relaxed text-slate-700 md:text-base">
              Questions about GhostAPI, the API Hub, or your workflow? Send us a note—we read every message
              and typically reply within a couple of business days.
            </p>
          </div>

          <div className="grid gap-10 p-5 md:gap-12 md:p-10 lg:grid-cols-12">
            <div className="flex flex-col gap-8 lg:col-span-5">
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="group flex gap-4 rounded-xl border border-slate-200/95 bg-slate-50/80 p-4 transition hover:border-slate-300 hover:bg-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#050040]/20"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#050040] text-white shadow-sm">
                  <Mail className="size-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-600">Email</p>
                  <p className="mt-0.5 truncate text-sm font-semibold text-[#050040] group-hover:underline">
                    {SUPPORT_EMAIL}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    Best for account questions, integrations, and security reports.
                  </p>
                </div>
              </a>

              <div className="flex gap-4 rounded-xl border border-slate-200/95 bg-white p-4 shadow-sm">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#050040]/[0.08] text-[#050040]">
                  <Clock className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-600">Response time</p>
                  <p className="mt-0.5 text-sm font-semibold text-[#050040]">Usually within 1–2 business days</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    We&apos;re a small team; urgent production incidents should include &quot;urgent&quot; in the subject
                    line.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 rounded-xl border border-slate-200/95 bg-white p-4 shadow-sm">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#050040]/[0.08] text-[#050040]">
                  <MessageCircle className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-600">Prefer the app?</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    Try the live{" "}
                    <Link href="/#playground" className="font-semibold text-[#050040] underline-offset-2 hover:underline">
                      playground
                    </Link>{" "}
                    on the homepage, or browse the{" "}
                    <Link href="/api-hub" className="font-semibold text-[#050040] underline-offset-2 hover:underline">
                      API Hub
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <h2 className="text-lg font-bold text-[#050040]">Write to us</h2>
              <p className="mt-1 text-sm text-slate-700">
                Compose your message here—we&apos;ll pass it to your mail app. Your email address is required so we
                can reply.
              </p>
              <div className="mt-6">
                <ContactMailForm />
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
