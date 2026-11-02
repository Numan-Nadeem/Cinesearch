import { useState } from 'react';
import { FaEnvelope, FaGithub, FaFacebook, FaLinkedin } from 'react-icons/fa';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import contactBg from '../assets/images/contact_bg2.jpg';
import { useDocumentMeta } from '../lib/seo.js';

const SOCIAL_CHANNELS = [
  {
    label: 'Email',
    handle: 'noman.mughal256@gmail.com',
    href: 'mailto:noman.mughal256@gmail.com',
    icon: FaEnvelope,
    external: false,
  },
  {
    label: 'GitHub',
    handle: 'github.com/Numan-Nadeem',
    href: 'https://github.com/Numan-Nadeem',
    icon: FaGithub,
    external: true,
  },
  {
    label: 'LinkedIn',
    handle: 'linkedin.com/in/numannadeem',
    href: 'https://www.linkedin.com/in/numannadeem/',
    icon: FaLinkedin,
    external: true,
  },
  {
    label: 'Facebook',
    handle: 'Numan Nadeem',
    href: 'https://www.facebook.com/share/1E6hq7DJD6/',
    icon: FaFacebook,
    external: true,
  },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('Catalogue Feedback');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [submittedData, setSubmittedData] = useState(null);

  useDocumentMeta({
    title: 'Contact — Numan Nadeem',
    description:
      'Get in touch with Numan Nadeem, creator of CineSearch, via Email, GitHub, LinkedIn, or Facebook, or send a direct inquiry.',
  });

  const validateForm = () => {
    const nextErrors = {};
    if (!name.trim() || name.trim().length < 2) {
      nextErrors.name = 'Please enter your name (at least 2 characters).';
    }
    if (!email.trim() || !EMAIL_REGEX.test(email.trim())) {
      nextErrors.email = 'Please enter a valid email address.';
    }
    if (!message.trim() || message.trim().length < 10) {
      nextErrors.message = 'Please enter a message of at least 10 characters.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmittedData({
      name: name.trim(),
      email: email.trim(),
      topic,
      message: message.trim(),
    });
  };

  return (
    <section
      aria-label="Contact Numan Nadeem"
      className="relative flex-1 flex items-center py-14 px-6 md:px-10 bg-cover bg-center overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(12,12,14,0.62), rgba(12,12,14,0.82)), url(${contactBg})`,
      }}
    >
      {/* Ambient backdrop light blooms behind glass panels */}
      <div
        aria-hidden="true"
        className="absolute top-12 left-[15%] w-96 h-96 rounded-full bg-[#d93829]/30 blur-3xl pointer-events-none z-0"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-12 right-[12%] w-96 h-96 rounded-full bg-amber-500/20 blur-3xl pointer-events-none z-0"
      />

      <div className="relative z-10 max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Left Column: Frosted Glass Creator Dossier & Direct Channels */}
        <div
          data-testid="contact-glass-dossier"
          className="glass-panel glass-panel-interactive glass-enter lg:col-span-5 p-6 sm:p-8 text-white"
        >
          <div className="glass-sweep" aria-hidden="true" />

          <div className="relative z-10 flex items-center gap-4 pb-6 border-b border-white/15">
            <img
              src="https://avatars.githubusercontent.com/Numan-Nadeem"
              alt="Numan Nadeem"
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-2xl object-cover border border-white/30 shrink-0 bg-zinc-800 shadow-lg"
            />
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#ff6b5e] glass-text-shadow">
                Creator &amp; Lead Engineer
              </p>
              <h1 className="font-display text-2xl font-bold text-white tracking-tight glass-text-shadow">
                Numan Nadeem
              </h1>
              <p className="text-xs text-zinc-200/90 mt-0.5">
                Full-Stack Developer · Open Source Maintainer
              </p>
            </div>
          </div>

          <p className="relative z-10 text-sm text-zinc-100/95 leading-relaxed my-5 glass-text-shadow">
            Have a question about CineSearch, found a missing film record, or want to collaborate on a project? Connect directly through any channel below.
          </p>

          <div className="relative z-10 space-y-2.5">
            {SOCIAL_CHANNELS.map(({ label, handle, href, icon: Icon, external }) => (
              <a
                key={label}
                href={href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                className="glass-control group flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white active:scale-[0.99]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className="text-lg text-[#ff6b5e] shrink-0" aria-hidden="true" />
                  <div className="truncate">
                    <span className="block font-semibold text-white">{label}</span>
                    <span className="block text-xs text-zinc-200/85 truncate">{handle}</span>
                  </div>
                </div>
                <ArrowUpRight
                  className="w-4 h-4 text-zinc-300 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0"
                  aria-hidden="true"
                />
              </a>
            ))}
          </div>
        </div>

        {/* Right Column: Frosted Glass Direct Inquiry Form */}
        <div
          data-testid="contact-glass-form"
          className="glass-panel glass-panel-interactive glass-enter lg:col-span-7 p-6 sm:p-8 text-white"
        >
          <div className="relative z-10">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#ff6b5e] mb-1.5 glass-text-shadow">
              Direct Dispatch
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-2 glass-text-shadow">
              Send a Message
            </h2>
            <p className="text-sm text-zinc-200/90 mb-6 glass-text-shadow">
              Submit catalogue feedback, bug reports, or partnership inquiries below.
            </p>

            {submittedData ? (
              <div
                role="status"
                aria-live="polite"
                data-testid="contact-success"
                className="rounded-xl border border-emerald-400/40 bg-emerald-500/15 backdrop-blur-md p-6 text-left space-y-4"
              >
                <div className="flex items-center gap-2.5 text-emerald-300 font-semibold text-base">
                  <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden="true" />
                  <span>Message prepared for {submittedData.name}</span>
                </div>
                <p className="text-sm text-zinc-100 leading-relaxed">
                  Thank you for reaching out regarding <strong>{submittedData.topic}</strong>. You can also open this dispatch directly in your default mail client or send another note below.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <a
                    href={`mailto:noman.mughal256@gmail.com?subject=${encodeURIComponent(
                      `[CineSearch] ${submittedData.topic} — from ${submittedData.name}`
                    )}&body=${encodeURIComponent(
                      `${submittedData.message}\n\n— ${submittedData.name} (${submittedData.email})`
                    )}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#d93829] hover:bg-[#b82d20] active:scale-[0.98] px-4 py-2 text-xs font-semibold text-white transition-all"
                  >
                    Open in Mail Client
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmittedData(null);
                      setName('');
                      setEmail('');
                      setMessage('');
                      setErrors({});
                    }}
                    className="glass-control rounded-lg px-4 py-2 text-xs font-medium text-white cursor-pointer"
                  >
                    Send another message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block text-xs font-medium text-zinc-200 mb-1.5 glass-text-shadow"
                    >
                      Your Name
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                      }}
                      placeholder="Ada Lovelace"
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? 'contact-name-error' : undefined}
                      className="w-full rounded-xl border border-white/25 bg-black/45 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#d93829]"
                    />
                    {errors.name && (
                      <p
                        id="contact-name-error"
                        role="alert"
                        className="mt-1.5 text-xs text-[#ff6b5e]"
                      >
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-xs font-medium text-zinc-200 mb-1.5 glass-text-shadow"
                    >
                      Email Address
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                      }}
                      placeholder="ada@example.com"
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? 'contact-email-error' : undefined}
                      className="w-full rounded-xl border border-white/25 bg-black/45 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#d93829]"
                    />
                    {errors.email && (
                      <p
                        id="contact-email-error"
                        role="alert"
                        className="mt-1.5 text-xs text-[#ff6b5e]"
                      >
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="contact-topic"
                    className="block text-xs font-medium text-zinc-200 mb-1.5 glass-text-shadow"
                  >
                    Subject
                  </label>
                  <select
                    id="contact-topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full rounded-xl border border-white/25 bg-black/45 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#d93829]"
                  >
                    <option value="Catalogue Feedback" className="bg-zinc-900">Catalogue Feedback</option>
                    <option value="Feature Request" className="bg-zinc-900">Feature Request</option>
                    <option value="Bug Report" className="bg-zinc-900">Bug Report</option>
                    <option value="General Inquiry" className="bg-zinc-900">General Inquiry</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-xs font-medium text-zinc-200 mb-1.5 glass-text-shadow"
                  >
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      if (errors.message) setErrors((prev) => ({ ...prev, message: '' }));
                    }}
                    placeholder="Share your feedback, film recommendation, or question..."
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? 'contact-message-error' : undefined}
                    className="w-full rounded-xl border border-white/25 bg-black/45 p-3.5 text-sm text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#d93829]"
                  />
                  {errors.message && (
                    <p
                      id="contact-message-error"
                      role="alert"
                      className="mt-1.5 text-xs text-[#ff6b5e]"
                    >
                      {errors.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto rounded-xl bg-[#d93829] hover:bg-[#b82d20] active:scale-[0.98] px-7 py-3 text-sm font-semibold text-white cursor-pointer transition-all duration-200 shadow-lg"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;