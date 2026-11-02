import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  EnvelopeSimple,
  GithubLogo,
  LinkedinLogo,
  FacebookLogo,
  ArrowUpRight,
  ArrowLeft,
  CheckCircle,
  PaperPlaneTilt,
} from '@phosphor-icons/react';
import contactBg from '../assets/images/contact_bg2.jpg';
import { useDocumentMeta } from '../lib/seo.js';
import { MEDIA_PROVENANCE } from '../design/mediaProvenance.js';

const SOCIAL_CHANNELS = [
  {
    label: 'Email',
    handle: 'noman.mughal256@gmail.com',
    href: 'mailto:noman.mughal256@gmail.com',
    icon: EnvelopeSimple,
    external: false,
  },
  {
    label: 'GitHub',
    handle: 'github.com/Numan-Nadeem',
    href: 'https://github.com/Numan-Nadeem',
    icon: GithubLogo,
    external: true,
  },
  {
    label: 'LinkedIn',
    handle: 'linkedin.com/in/numannadeem',
    href: 'https://www.linkedin.com/in/numannadeem/',
    icon: LinkedinLogo,
    external: true,
  },
  {
    label: 'Facebook',
    handle: 'Numan Nadeem',
    href: 'https://www.facebook.com/share/1E6hq7DJD6/',
    icon: FacebookLogo,
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
  const [avatarSrc, setAvatarSrc] = useState(MEDIA_PROVENANCE.creatorAvatar.url);

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
      className="flex-1 py-14 md:py-24 px-5 sm:px-8 max-w-[1360px] w-full mx-auto animate-editorial-in"
    >
      <div className="mb-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#494540] dark:text-[#b5b0a8] hover:text-[#c83a2b] dark:hover:text-[#d94636] transition-colors"
        >
          <ArrowLeft size={14} weight="bold" aria-hidden="true" />
          <span>Return to Repertory Index</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Left Column: Editorial Creator Dossier & Direct Channels */}
        <div
          data-testid="contact-glass-dossier"
          className="lg:col-span-5 bg-[#ebe6dc] dark:bg-[#151519] p-6 sm:p-8 text-[#161514] dark:text-[#f2efe9]"
        >
          <div className="flex items-center gap-4 pb-6">
            <img
              src={avatarSrc}
              alt="Numan Nadeem"
              onError={() => setAvatarSrc(MEDIA_PROVENANCE.creatorAvatar.fallbackPhoto)}
              referrerPolicy="no-referrer"
              className="w-16 h-16 object-cover shrink-0 bg-[#1d1d23]"
            />
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#161514] dark:text-white tracking-tight">
                Numan Nadeem
              </h1>
              <p className="text-xs font-semibold text-[#c83a2b] dark:text-[#d94636] mt-1">
                Creator &amp; Lead Engineer · MIT License
              </p>
            </div>
          </div>

          <figure className="mb-5 overflow-hidden bg-[#1b1b21]">
            <img
              src={contactBg}
              alt="35mm optical projection assembly plate"
              loading="lazy"
              decoding="async"
              className="w-full aspect-[16/9] object-cover grayscale contrast-125"
            />
          </figure>

          <p className="text-base text-[#494540] dark:text-[#b5b0a8] leading-relaxed mb-6">
            Have a question about CineSearch, found a missing film record, or want to collaborate on a project? Connect directly through any verified channel below.
          </p>

          <div className="flex flex-col gap-2">
            {SOCIAL_CHANNELS.map(({ label, handle, href, icon: ChannelIcon, external }) => (
              <a
                key={label}
                href={href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                className="group flex items-center justify-between gap-3 p-3.5 bg-[#e2dcd0] dark:bg-[#1d1d23] hover:bg-[#d5cec0] dark:hover:bg-[#26262e] text-sm font-medium text-[#161514] dark:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c83a2b]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <ChannelIcon
                    size={20}
                    weight="duotone"
                    className="text-[#c83a2b] dark:text-[#d94636] shrink-0"
                    aria-hidden="true"
                  />
                  <div className="truncate">
                    <span className="block font-semibold text-[#161514] dark:text-white group-hover:text-[#c83a2b] dark:group-hover:text-[#d94636] transition-colors">
                      {label}
                    </span>
                    <span className="block text-xs text-[#494540] dark:text-[#b5b0a8] truncate">
                      {handle}
                    </span>
                  </div>
                </div>
                <ArrowUpRight
                  size={15}
                  weight="bold"
                  className="text-[#6b655e] group-hover:text-[#c83a2b] dark:group-hover:text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0"
                  aria-hidden="true"
                />
              </a>
            ))}
          </div>
        </div>

        {/* Right Column: Direct Dispatch Inquiry Form */}
        <div
          data-testid="contact-glass-form"
          data-ui="dispatch-form"
          className="lg:col-span-7 bg-[#ebe6dc] dark:bg-[#151519] p-6 sm:p-8 text-[#161514] dark:text-[#f2efe9]"
        >
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#161514] dark:text-white mb-2">
            Send a dispatch
          </h2>
          <p className="text-base text-[#494540] dark:text-[#b5b0a8] mb-6">
            Submit catalogue feedback, bug reports, or collaboration inquiries below.
          </p>

          {submittedData ? (
            <div
              role="status"
              aria-live="polite"
              data-testid="contact-success"
              className="bg-[#e2dcd0] dark:bg-[#1d1d23] p-6 text-left space-y-4"
            >
              <div className="flex items-center gap-2.5 text-[#161514] dark:text-[#deb052] font-semibold text-base">
                <CheckCircle
                  size={22}
                  weight="duotone"
                  className="text-[#b87d24] dark:text-[#deb052] shrink-0"
                  aria-hidden="true"
                />
                <span>Message prepared for {submittedData.name}</span>
              </div>
              <p className="text-base text-[#494540] dark:text-[#b5b0a8] leading-relaxed">
                Thank you for reaching out regarding <strong>{submittedData.topic}</strong>. You can open this dispatch directly in your default mail client or send another note below.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a
                  href={`mailto:noman.mughal256@gmail.com?subject=${encodeURIComponent(
                    `[CineSearch] ${submittedData.topic} — from ${submittedData.name}`
                  )}&body=${encodeURIComponent(
                    `${submittedData.message}\n\n— ${submittedData.name} (${submittedData.email})`
                  )}`}
                  className="inline-flex items-center gap-2 bg-[#c83a2b] hover:bg-[#a92e21] active:scale-[0.98] px-5 py-2.5 text-xs font-semibold text-white transition-all"
                >
                  <span>Open in Mail Client</span>
                  <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
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
                  className="bg-[#f5f2eb] dark:bg-[#0c0c0e] px-5 py-2.5 text-xs font-semibold text-[#161514] dark:text-white hover:bg-[#dad3c5] dark:hover:bg-[#26262e] cursor-pointer"
                >
                  Send another message
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-xs font-semibold text-[#494540] dark:text-[#b5b0a8] mb-1.5"
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
                    placeholder="Elena Rostova"
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? 'contact-name-error' : undefined}
                    className="w-full bg-[#f5f2eb] dark:bg-[#0c0c0e] px-3.5 py-2.5 text-sm text-[#161514] dark:text-white placeholder:text-[#6b655e] focus:outline-none focus:ring-2 focus:ring-[#c83a2b]"
                  />
                  {errors.name && (
                    <p
                      id="contact-name-error"
                      role="alert"
                      className="mt-1.5 text-xs font-semibold text-[#c83a2b] dark:text-[#d94636]"
                    >
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-xs font-semibold text-[#494540] dark:text-[#b5b0a8] mb-1.5"
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
                    placeholder="elena.rostova@cinematheque.org"
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'contact-email-error' : undefined}
                    className="w-full bg-[#f5f2eb] dark:bg-[#0c0c0e] px-3.5 py-2.5 text-sm text-[#161514] dark:text-white placeholder:text-[#6b655e] focus:outline-none focus:ring-2 focus:ring-[#c83a2b]"
                  />
                  {errors.email && (
                    <p
                      id="contact-email-error"
                      role="alert"
                      className="mt-1.5 text-xs font-semibold text-[#c83a2b] dark:text-[#d94636]"
                    >
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-topic"
                  className="block text-xs font-semibold text-[#494540] dark:text-[#b5b0a8] mb-1.5"
                >
                  Subject
                </label>
                <select
                  id="contact-topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-[#f5f2eb] dark:bg-[#0c0c0e] px-3.5 py-2.5 text-sm text-[#161514] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#c83a2b]"
                >
                  <option value="Catalogue Feedback">Catalogue Feedback</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="Bug Report">Bug Report</option>
                  <option value="General Inquiry">General Inquiry</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-xs font-semibold text-[#494540] dark:text-[#b5b0a8] mb-1.5"
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
                  className="w-full bg-[#f5f2eb] dark:bg-[#0c0c0e] p-3.5 text-sm text-[#161514] dark:text-white placeholder:text-[#6b655e] focus:outline-none focus:ring-2 focus:ring-[#c83a2b]"
                />
                {errors.message && (
                  <p
                    id="contact-message-error"
                    role="alert"
                    className="mt-1.5 text-xs font-semibold text-[#c83a2b] dark:text-[#d94636]"
                  >
                    {errors.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#c83a2b] hover:bg-[#a92e21] active:scale-[0.98] px-7 py-3 text-xs font-semibold text-white cursor-pointer transition-all duration-150"
              >
                <span>Send Message</span>
                <PaperPlaneTilt size={15} weight="duotone" aria-hidden="true" />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default Contact;