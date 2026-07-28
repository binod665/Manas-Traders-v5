import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../translations';
import { submitContactMessageToSupabase } from '../lib/supabase';
import {
  X,
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle,
  MessageSquare,
  Facebook,
  ExternalLink,
  Store,
  Sparkles,
  ShieldCheck,
  Check,
} from 'lucide-react';

export const ContactModal: React.FC = () => {
  const { activeModal, setActiveModal, language, addToast } = useApp();

  const [fullName, setFullName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [subject, setSubject] = useState('General Inquiry');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (activeModal !== 'contact') return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !emailOrPhone || !message) {
      addToast('Missing Information', 'Please fill in all required fields.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitContactMessageToSupabase({
        fullName,
        emailOrPhone,
        subject,
        message,
      });

      if (result.success) {
        setIsSuccess(true);
        addToast('Message Sent!', 'Thank you! We will get back to you shortly.', 'success');
        setFullName('');
        setEmailOrPhone('');
        setMessage('');
        setTimeout(() => setIsSuccess(false), 5000);
      }
    } catch (err) {
      addToast('Error', 'Failed to submit contact form. Please call us directly.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate if store is currently open (Sun-Fri 7AM-8PM, Sat 8AM-6PM)
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sun, 6 = Sat
  const currentHour = now.getHours();
  const isSaturday = currentDay === 6;
  const isOpenNow = isSaturday
    ? currentHour >= 8 && currentHour < 18
    : currentHour >= 7 && currentHour < 20;

  // JSON-LD Local Business Schema for SEO
  const jsonLdSchema = {
    '@context': 'https://schema.org',
    '@type': 'GroceryStore',
    name: 'Manas Traders',
    image: 'https://manastraders.com.np/logo.png',
    '@id': 'https://manastraders.com.np',
    url: 'https://manastraders.com.np',
    telephone: ['+977-9848500665', '+977-9824600477'],
    priceRange: 'Rs.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Tikapur Bazar-1',
      addressLocality: 'Tikapur',
      addressRegion: 'Kailali',
      postalCode: '10908',
      addressCountry: 'NP',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 28.5022,
      longitude: 81.1278,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '07:00',
        closes: '20:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday'],
        opens: '08:00',
        closes: '18:00',
      },
    ],
    sameAs: [
      'https://facebook.com/manastraders',
      'https://wa.me/9779848500665',
    ],
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-fade-in">
      {/* Inject SEO JSON-LD Microdata */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
      />

      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-gray-100 dark:border-gray-800 transition-colors my-auto">
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white p-5 sm:p-6 relative shrink-0">
          <button
            onClick={() => setActiveModal(null)}
            className="absolute top-4 right-4 p-2 text-emerald-200 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
            title={getTranslation(language, 'close')}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Store className="w-3 h-3" />
                  <span>Official Contact Page</span>
                </span>
                {isOpenNow ? (
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Open Now</span>
                  </span>
                ) : (
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    <span>Closed Now</span>
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-serif">
                Manas Traders - Tikapur Kailali
              </h2>
              <p className="text-xs sm:text-sm text-emerald-200/90 font-medium max-w-xl">
                {language === 'ne'
                  ? 'टीकापुर, कैलालीको प्रमुख ताजा खाद्यान्न तथा किराना भण्डार। सोधपुछ वा अर्डरका लागि हामीलाई सम्पर्क गर्नुहोस्।'
                  : 'Premier Fresh Grocery Store & Wholesale Trader in Tikapur, Kailali, Nepal. Get in touch for express home delivery or wholesale orders.'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-8 text-gray-800 dark:text-gray-100">
          {/* Quick Action Contact Buttons Banner */}
          <section className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/50 dark:from-emerald-950/40 dark:via-gray-900 dark:to-teal-950/40 rounded-2xl p-4 sm:p-5 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs">
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-emerald-900 dark:text-emerald-300 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Instant Chat & Direct Communication</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* WhatsApp Button */}
              <a
                href="https://wa.me/9779848500665?text=Hello%20Manas%20Traders%20Tikapur%2C%20I%20have%20a%20grocery%20inquiry"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-xs transition-all hover:scale-[1.02] active:scale-95 group cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-emerald-100 group-hover:animate-bounce" />
                <span>WhatsApp Chat</span>
              </a>

              {/* Facebook Button */}
              <a
                href="https://facebook.com/manastraders"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-xs transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                <Facebook className="w-4 h-4" />
                <span>Facebook Page</span>
              </a>

              {/* Messenger Button */}
              <a
                href="https://m.me/9848500665"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-xs transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Messenger Chat</span>
              </a>
            </div>
          </section>

          {/* Grid Layout: Contact Info & Form */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Contact Details & Store Hours */}
            <div className="lg:col-span-5 space-y-5">
              {/* Info Card */}
              <div className="bg-gray-50 dark:bg-gray-800/70 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-700 space-y-4">
                <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-wide flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Store Information</span>
                </h3>

                <div className="space-y-3.5 text-xs">
                  {/* Address */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 font-bold">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-extrabold text-gray-900 dark:text-gray-100 block">
                        Address
                      </span>
                      <address className="not-italic text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
                        Manas Traders <br />
                        Tikapur Bazar-1, Kailali, Nepal
                      </address>
                    </div>
                  </div>

                  {/* Phone Numbers */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 font-bold">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-extrabold text-gray-900 dark:text-gray-100 block">
                        Phone & Mobile
                      </span>
                      <div className="flex flex-col gap-1 mt-0.5">
                        <a
                          href="tel:+9779848500665"
                          className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline"
                        >
                          +977 9848500665 (Primary)
                        </a>
                        <a
                          href="tel:+9779824600477"
                          className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline"
                        >
                          +977 9824600477 (Secondary)
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 font-bold">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-extrabold text-gray-900 dark:text-gray-100 block">
                        Email Support
                      </span>
                      <a
                        href="mailto:info@manastraders.com.np"
                        className="text-emerald-700 dark:text-emerald-400 font-medium hover:underline"
                      >
                        info@manastraders.com.np
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Store Hours Card */}
              <div className="bg-gray-50 dark:bg-gray-800/70 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-700 space-y-3">
                <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-wide flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Store Hours</span>
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1.5 border-b border-gray-200/60 dark:border-gray-700">
                    <span className="font-bold text-gray-700 dark:text-gray-300">
                      Sunday – Friday
                    </span>
                    <span className="font-extrabold text-emerald-800 dark:text-emerald-300">
                      7:00 AM – 8:00 PM
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-gray-200/60 dark:border-gray-700">
                    <span className="font-bold text-gray-700 dark:text-gray-300">
                      Saturday
                    </span>
                    <span className="font-extrabold text-amber-700 dark:text-amber-400">
                      8:00 AM – 6:00 PM
                    </span>
                  </div>

                  <div className="pt-2 flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Same-day home delivery across all wards of Tikapur Municipality.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Supabase Contact Form */}
            <div className="lg:col-span-7 bg-white dark:bg-gray-800/90 p-5 sm:p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs space-y-4">
              <div>
                <h3 className="text-base font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Send Direct Inquiry (Supabase Form)</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Your message will be sent directly to our store manager in Tikapur.
                </p>
              </div>

              {isSuccess && (
                <div className="bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2.5 animate-fade-in">
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Your message has been submitted successfully to Manas Traders database!</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3 text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Binod Bhandari"
                      className="w-full px-3.5 py-2.5 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Email or Phone Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                      placeholder="e.g. 9848500665 / name@gmail.com"
                      className="w-full px-3.5 py-2.5 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Inquiry Topic
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer font-medium"
                  >
                    <option value="General Inquiry">General Grocery Inquiry</option>
                    <option value="Wholesale Order">Wholesale / Bulk Order Request</option>
                    <option value="Product Availability">Check Item Availability</option>
                    <option value="Delivery Status">Home Delivery Query in Tikapur</option>
                    <option value="Feedback">Feedback / Suggestions</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Your Message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your query or requested grocery items here..."
                    className="w-full px-3.5 py-2.5 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-extrabold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <span>Submitting Message...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Inquiry to Database</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Section: Google Map Embed */}
          <section className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Google Map - Tikapur, Kailali, Nepal</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Find our physical store location in Tikapur Bazar-1.
                </p>
              </div>

              <a
                href="https://www.google.com/maps/search/?api=1&query=Tikapur+Kailali+Nepal+Manas+Traders"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 w-fit"
              >
                <span>Get Directions on Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Interactive Map Iframe Container */}
            <div className="w-full h-72 sm:h-80 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-inner relative bg-gray-100 dark:bg-gray-800">
              <iframe
                title="Manas Traders Google Map Location Tikapur Kailali Nepal"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14055.08051280962!2d81.11874222019974!3d28.502213797689133!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39a1fe1826bb5cfb%3A0xa19c118e69e4bfb6!2sTikapur%2C%20Nepal!5e0!3m2!1sen!2snp!4v1700000000000!5m2!1sen!2snp"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full grayscale-[0.1] contrast-[1.05]"
              ></iframe>

              {/* Map Badge Overlay */}
              <div className="absolute bottom-3 left-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 flex items-center gap-2 max-w-xs">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-serif font-bold flex items-center justify-center shrink-0 text-xs">
                  M
                </div>
                <div>
                  <span className="font-black text-xs text-gray-900 dark:text-gray-100 block">
                    Manas Traders Store
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 block">
                    Tikapur Bazar-1, Kailali
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 dark:bg-gray-800/80 px-6 py-3.5 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between shrink-0 text-xs text-gray-500 dark:text-gray-400">
          <span className="font-medium">
            © 2026 Manas Traders • Tikapur Kailali Nepal
          </span>
          <button
            onClick={() => setActiveModal(null)}
            className="px-4 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold rounded-xl transition-colors cursor-pointer"
          >
            {getTranslation(language, 'close')}
          </button>
        </div>
      </div>
    </div>
  );
};
