import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Clock, Mail, MapPin, MessageSquare, Phone, ChevronDown } from 'lucide-react';
import { BUSINESS_INFO, SERVICE_CATEGORIES } from '../data/products';
import { validateContactForm } from '../lib/store';
import { ContactForm } from '../types/store';

export const ContactPage: React.FC = () => {
  const [form, setForm] = useState<ContactForm>({
    name: '',
    email: '',
    phone: '',
    topic: 'Custom Printing',
    message: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactForm, string>>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateContactForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="max-w-2xl mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0D3BFF] dark:text-blue-400">
          Get in Touch
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-zinc-950 dark:text-white mt-1">
          Custom Orders &amp; Customer Care
        </h1>
        <p className="text-base text-zinc-600 dark:text-zinc-300 mt-2">
          Visit our shop in Tangos North, Navotas City or message us for custom t-shirts, DTF printing, tarpaulins, invitations, souvenirs, rush IDs, and party needs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Studio Details */}
        <aside className="lg:col-span-5 bg-white dark:bg-[#121520] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <h2 className="font-display text-xl font-bold text-zinc-950 dark:text-white">
            {BUSINESS_INFO.name}
          </h2>

          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-[#0D3BFF] dark:text-blue-400 mt-1 shrink-0" />
              <div>
                <p className="font-semibold text-zinc-950 dark:text-white">
                  Store &amp; Print Studio
                </p>
                <p className="text-zinc-700 dark:text-zinc-200 font-medium">
                  {BUSINESS_INFO.landmark}
                </p>
                <p className="text-zinc-600 dark:text-zinc-300">
                  {BUSINESS_INFO.address}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-[#0D3BFF] dark:text-blue-400 mt-1 shrink-0" />
              <div>
                <p className="font-semibold text-zinc-950 dark:text-white">Email</p>
                <a
                  href={`mailto:${BUSINESS_INFO.email}`}
                  className="text-zinc-600 dark:text-zinc-300 hover:text-[#0D3BFF] dark:hover:text-blue-400 break-all transition-colors"
                >
                  {BUSINESS_INFO.email}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-[#0D3BFF] dark:text-blue-400 mt-1 shrink-0" />
              <div>
                <p className="font-semibold text-zinc-950 dark:text-white">
                  Viber / Mobile
                </p>
                <a
                  href="tel:+639942827053"
                  className="text-zinc-600 dark:text-zinc-300 hover:text-[#0D3BFF] dark:hover:text-blue-400 font-mono tabular-nums transition-colors"
                >
                  {BUSINESS_INFO.phone}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MessageSquare className="w-4 h-4 text-[#0D3BFF] dark:text-blue-400 mt-1 shrink-0" />
              <div>
                <p className="font-semibold text-zinc-950 dark:text-white">
                  Facebook Page
                </p>
                <p className="text-zinc-600 dark:text-zinc-300">
                  {BUSINESS_INFO.facebook}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-[#0D3BFF] dark:text-blue-400 mt-1 shrink-0" />
              <div>
                <p className="font-semibold text-zinc-950 dark:text-white">
                  Studio Hours
                </p>
                <p className="text-zinc-600 dark:text-zinc-300">
                  {BUSINESS_INFO.hours}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Also Available In-Store
            </p>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
              {SERVICE_CATEGORIES.flatMap((cat) => cat.items).join(' · ')}
            </p>
          </div>
        </aside>

        {/* Inquiry Form */}
        <div className="lg:col-span-7 bg-white dark:bg-[#121520] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8">
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8 text-center space-y-4"
            >
              <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <h2 className="font-display text-2xl font-bold text-zinc-950 dark:text-white">
                Inquiry Received
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-300 max-w-md mx-auto">
                Thanks, {form.name}. Our Checklitz team has logged your{' '}
                <span className="font-semibold">{form.topic}</span> message and will reply to{' '}
                <span className="font-semibold">{form.email}</span> within one business day.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setForm({
                    name: '',
                    email: '',
                    phone: '',
                    topic: 'Custom Printing',
                    message: '',
                  });
                }}
                className="min-h-[42px] px-5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:border-zinc-950 dark:hover:border-white transition-colors"
              >
                Send Another Message
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <h2 className="font-display text-xl font-bold text-zinc-950 dark:text-white mb-2">
                Send an Inquiry
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5"
                  >
                    Your Name *
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Maria Santos"
                    className="w-full min-h-[42px] px-3.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-950 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-[#0D3BFF]"
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5"
                  >
                    Email Address *
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="maria@example.ph"
                    className="w-full min-h-[42px] px-3.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-950 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-[#0D3BFF]"
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="contact-phone"
                    className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5"
                  >
                    Mobile Number (Optional)
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="0917 123 4567"
                    className="w-full min-h-[42px] px-3.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-950 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-[#0D3BFF]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-topic"
                    className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5"
                  >
                    Inquiry Topic
                  </label>
                  <div className="relative">
                  <select
                    id="contact-topic"
                    value={form.topic}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        topic: e.target.value as ContactForm['topic'],
                      })
                    }
                    className="w-full min-h-[42px] appearance-none cursor-pointer pl-3 pr-10 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-950 dark:text-white focus:outline-none focus:border-[#0D3BFF]"
                  >
                    <option value="Custom Printing">Custom Printing</option>
                    <option value="Bulk Party Order">Bulk Party Order</option>
                    <option value="Order Support">Order Support</option>
                    <option value="General Inquiry">General Inquiry</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5"
                >
                  Message *
                </label>
                <textarea
                  id="contact-message"
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us about your shirt order, sizes, or custom print idea..."
                  className="w-full p-3.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-950 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-[#0D3BFF]"
                />
                {errors.message && (
                  <p className="text-xs text-red-500 mt-1">{errors.message}</p>
                )}
              </div>

              <button
                type="submit"
                className="min-h-[46px] px-6 py-3 rounded-xl bg-zinc-950 dark:bg-[#0D3BFF] text-white text-sm font-semibold hover:bg-[#0D3BFF] dark:hover:bg-blue-500 transition-colors"
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
