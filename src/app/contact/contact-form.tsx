"use client";

import * as React from "react";

const SUPPORT_EMAIL = "support@ghostapi.io";

export function ContactMailForm() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const lines = [
      name.trim() && `Name: ${name.trim()}`,
      email.trim() && `Email: ${email.trim()}`,
      "",
      message.trim(),
    ].filter(Boolean);
    const body = lines.join("\n");
    const sub = subject.trim() || "GhostAPI — Contact form";
    const href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(sub)}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
  }

  const inputClass =
    "mt-1.5 w-full rounded-lg border border-slate-200/95 bg-white px-3 py-2.5 text-sm text-[#050040] shadow-sm outline-none transition placeholder:text-slate-500 focus:border-[#050040]/35 focus:ring-2 focus:ring-[#050040]/15";

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-xl border border-slate-200/95 bg-slate-50/50 p-5 shadow-inner md:p-6"
    >
      <div>
        <label htmlFor="contact-name" className="text-xs font-bold uppercase tracking-wide text-slate-600">
          Name
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(ev) => setName(ev.target.value)}
          className={inputClass}
          placeholder="Your name"
        />
      </div>
      <div>
        <label htmlFor="contact-email" className="text-xs font-bold uppercase tracking-wide text-slate-600">
          Email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(ev) => setEmail(ev.target.value)}
          className={inputClass}
          placeholder="you@company.com"
        />
      </div>
      <div>
        <label htmlFor="contact-subject" className="text-xs font-bold uppercase tracking-wide text-slate-600">
          Subject
        </label>
        <input
          id="contact-subject"
          name="subject"
          type="text"
          value={subject}
          onChange={(ev) => setSubject(ev.target.value)}
          className={inputClass}
          placeholder="Billing, integration, feature idea…"
        />
      </div>
      <div>
        <label htmlFor="contact-message" className="text-xs font-bold uppercase tracking-wide text-slate-600">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          value={message}
          onChange={(ev) => setMessage(ev.target.value)}
          className={`${inputClass} resize-y min-h-[120px]`}
          placeholder="Tell us how we can help."
        />
      </div>
      <button
        type="submit"
        className="mt-1 inline-flex w-full items-center justify-center rounded-full bg-[#050040] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#050040]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#050040]/40 focus-visible:ring-offset-2 sm:w-auto sm:self-start"
      >
        Open in email app
      </button>
      <p className="text-[11px] leading-relaxed text-slate-600">
        Opens your default mail client with this message addressed to {SUPPORT_EMAIL}. No message is stored
        on our servers from this form.
      </p>
    </form>
  );
}
