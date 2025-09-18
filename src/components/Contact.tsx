import React, { useEffect, useRef, useState } from 'react';
import { HiMail, HiPhone, HiLocationMarker, HiPaperAirplane } from 'react-icons/hi';
import { FaGithub, FaLinkedin} from 'react-icons/fa';
import { FaSquareXTwitter } from "react-icons/fa6";

const Contact = () => {
  const siteKey = (import.meta as any).env?.VITE_HCAPTCHA_SITEKEY as string | undefined;
  const captchaContainerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<any>(null);
  const [captchaToken, setCaptchaToken] = useState<string>('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    company: '' // honeypot
  });
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Initialize hCaptcha when script is available
  useEffect(() => {
    const tryRender = () => {
      const w = (window as any);
      if (!siteKey || !captchaContainerRef.current || !w.hcaptcha) return;
      if (widgetIdRef.current !== null) return;
      widgetIdRef.current = w.hcaptcha.render(captchaContainerRef.current, {
        sitekey: siteKey,
        callback: (token: string) => setCaptchaToken(token),
      });
    };
    tryRender();
    const id = setInterval(tryRender, 500);
    return () => clearInterval(id);
  }, [siteKey]);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (siteKey && !captchaToken) {
        showToast('error', 'Please complete the CAPTCHA');
        return;
      }
      const resp = await fetch('/api/submit-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          company: formData.company,
          captchaToken,
        }),
      });
      const contentType = resp.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json');
      const raw = isJson ? await resp.text() : await resp.text();
      const payload = isJson && raw ? (() => { try { return JSON.parse(raw); } catch { return null; } })() : null;
      if (!resp.ok) {
        const fallbackError = payload?.error || raw || 'Failed to submit';
        throw new Error(fallbackError);
      }
      showToast('success', 'Thank you for your message!');
      setFormData({ name: '', email: '', subject: '', message: '', company: '' });
      setCaptchaToken('');
      try {
        const w = (window as any);
        if (widgetIdRef.current !== null && w?.hcaptcha?.reset) {
          w.hcaptcha.reset(widgetIdRef.current);
        }
      } catch {}
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to submit');
    }
  };

  return (
    <section id="contact" className="py-20 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Get In Touch</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mb-6 rounded-full"></div>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto font-medium">
            Ready to streamline your infrastructure and ship faster? Let’s bring your next big idea to life - together.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Initialize Contact</h3>
            
            <div className="space-y-6 mb-8">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 p-3 rounded-full shadow-lg">
                  <HiMail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Email</p>
                  <p className="text-slate-600 dark:text-slate-300">paulkim841@gmail.com</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 p-3 rounded-full shadow-lg">
                  <HiPhone className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Phone</p>
                  <p className="text-slate-600 dark:text-slate-300">+254722206607</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 p-3 rounded-full shadow-lg">
                  <HiLocationMarker className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Location</p>
                  <p className="text-slate-600 dark:text-slate-300">Nairobi, Kenya</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Follow Me😉</h4>
              <div className="flex space-x-4">
                <a
                  href="https://github.com/paulmaina"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white dark:bg-slate-800 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:-translate-y-1"
                >
                  <FaGithub className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                </a>
                <a
                  href="https://www.linkedin.com/in/paul-kimani-b1b996162gt5"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white dark:bg-slate-800 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:-translate-y-1"
                >
                  <FaLinkedin className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                </a>
                <a
                  href="https://x.com/Paul__kimani"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white dark:bg-slate-800 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:-translate-y-1"
                >
                  <FaSquareXTwitter className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-100 dark:border-slate-700">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Send a Message</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-slate-400 dark:hover:border-slate-500"
                    placeholder="Your name"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-slate-400 dark:hover:border-slate-500"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
              {/* hCaptcha widget */}
              {siteKey && (
                <div>
                  <div ref={captchaContainerRef} className="h-captcha" data-sitekey={siteKey}></div>
                </div>
              )}
              
              <div>
                <label htmlFor="subject" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-slate-400 dark:hover:border-slate-500"
                  placeholder="What's this about?"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none hover:border-slate-400 dark:hover:border-slate-500"
                  placeholder="Tell me about your project..."
                />
              </div>
              {/* Honeypot field - keep hidden from users */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="company" className="block text-sm mb-2">Company</label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  autoComplete="off"
                  tabIndex={-1}
                  className="w-full px-4 py-3 border rounded-lg"
                  placeholder="Leave this field empty"
                />
              </div>
              
              <button
                type="submit"
                className="group w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white py-4 px-6 rounded-full font-semibold hover:shadow-2xl hover:shadow-blue-500/25 transform hover:-translate-y-2 transition-all duration-300 flex items-center justify-center space-x-2 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-purple-700 to-blue-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10 flex items-center space-x-2">
                <HiPaperAirplane className="h-5 w-5" />
                <span>Send Message</span>
                </span>
              </button>
            </form>
          </div>
          {/* Toast */}
          {toast && (
            <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-white ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
              {toast.message}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Contact;