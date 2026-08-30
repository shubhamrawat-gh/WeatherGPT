import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, HelpCircle, Briefcase, ChevronDown, Check, Send } from 'lucide-react'
import SEO from '../components/SEO'

export default function ContactPage() {
  // Form State
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [organization, setOrganization] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // FAQ Accordion State
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName || !email || !message) return
    
    setIsSubmitting(true)
    // Simulate API request
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
      // Reset form
      setFullName('')
      setEmail('')
      setOrganization('')
      setSubject('')
      setMessage('')
    }, 1200)
  }

  const faqs = [
    {
      q: "How quickly is disaster data updated?",
      a: "RescueLens AI continuously monitors trusted public data sources and updates information in near real time."
    },
    {
      q: "Which disaster types are supported?",
      a: "Currently focused on wildfire and earthquake monitoring, with support for additional hazards planned."
    },
    {
      q: "Can organizations use RescueLens AI?",
      a: "Yes. The platform is designed for emergency teams, researchers, organizations, and decision-makers."
    }
  ]

  // dark-mode input styling conforming to h-44px and focus border signature green from DESIGN.md
  const inputClass = "w-full px-4 border border-[#1c2d38] rounded-md bg-[#001e2b] text-white placeholder:text-stone focus:outline-none focus:border-2 focus:border-[#00ed64] focus:ring-0 transition-all text-sm h-[44px]"

  return (
    <>
      <SEO 
        title="RescueLens AI | Contact Us" 
        description="Have questions about RescueLens AI? Get in touch with our team for general, support, or business inquiries, or browse our FAQ." 
      />

      <div className="w-full bg-[#001e2b] text-white selection:bg-[#00ed64]/35 selection:text-[#001e2b] pb-24">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1c2d38_1px,transparent_1px),linear-gradient(to_bottom,#1c2d38_1px,transparent_1px)] bg-[size:40px_40px] opacity-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 pt-16 md:pt-24">
          
          {/* Hero Section */}
          <div className="text-center max-w-3xl mx-auto mb-20">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-block bg-[#00ed64] text-[#001e2b] text-xs font-mono font-bold tracking-wider uppercase rounded-sm px-2.5 py-1 mb-6"
            >
              Get In Touch
            </motion.div>

            {/* typography.hero-display style */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-7xl font-medium tracking-tight md:tracking-[-1.5px] leading-tight md:leading-[1.10] text-white max-w-4xl mx-auto"
            >
              Contact Us
            </motion.h1>

            {/* typography.subtitle style */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-lg font-normal text-[#a8b3bc] leading-[1.50] max-w-3xl mx-auto"
            >
              Have questions about RescueLens AI? We'd love to hear from you.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-6xl mx-auto mb-28">
            
            {/* Form Column */}
            <div className="lg:col-span-7">
              {/* card-feature-dark styled form container */}
              <motion.div
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-[#0a202c]/55 border border-[#1c2d38] p-8 md:p-10 rounded-lg shadow-sm"
              >
                <h2 className="text-2xl font-bold text-white mb-6">Send a Message</h2>
                
                <AnimatePresence mode="wait">
                  {!isSubmitted ? (
                    <motion.form 
                      key="contact-form"
                      onSubmit={handleSubmit}
                      className="space-y-5"
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <label htmlFor="fullName" className="text-xs font-bold text-slate-300 tracking-wide text-left block">
                            Full Name <span className="text-red-400">*</span>
                          </label>
                          <input
                            id="fullName"
                            type="text"
                            required
                            placeholder="John Doe"
                            className={inputClass}
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="email" className="text-xs font-bold text-slate-300 tracking-wide text-left block">
                            Email Address <span className="text-red-400">*</span>
                          </label>
                          <input
                            id="email"
                            type="email"
                            required
                            placeholder="john@example.com"
                            className={inputClass}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <label htmlFor="organization" className="text-xs font-bold text-slate-300 tracking-wide text-left block">
                            Organization
                          </label>
                          <input
                            id="organization"
                            type="text"
                            placeholder="Agency or Company"
                            className={inputClass}
                            value={organization}
                            onChange={(e) => setOrganization(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="subject" className="text-xs font-bold text-slate-300 tracking-wide text-left block">
                            Subject
                          </label>
                          <input
                            id="subject"
                            type="text"
                            placeholder="How can we help?"
                            className={inputClass}
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="message" className="text-xs font-bold text-slate-300 tracking-wide text-left block">
                          Message <span className="text-red-400">*</span>
                        </label>
                        <textarea
                          id="message"
                          required
                          rows={5}
                          placeholder="Tell us about your organization's monitoring requirements..."
                          className={`${inputClass} resize-none h-auto py-3`}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                        />
                      </div>

                      <div className="pt-2 text-left">
                        {/* button-primary style */}
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full sm:w-auto px-[22px] py-[10px] rounded-full text-sm font-semibold bg-[#00ed64] hover:bg-[#00b545] text-[#001e2b] disabled:bg-[#1c2d38] disabled:text-[#a8b3bc] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#00ed64]/10"
                        >
                          {isSubmitting ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#001e2b]" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Sending...
                            </>
                          ) : (
                            <>
                              Send Message
                              <Send className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </div>
                    </motion.form>
                  ) : (
                    <motion.div 
                      key="success-message"
                      className="py-12 flex flex-col items-center justify-center text-center"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className="w-16 h-16 rounded-full bg-[#00ed64]/10 border border-[#00ed64]/20 flex items-center justify-center text-[#00ed64] mb-6">
                        <Check className="w-8 h-8" />
                      </div>
                      <h3 className="text-2xl font-bold text-white">Message Sent!</h3>
                      <p className="mt-2 text-[#a8b3bc] max-w-sm text-sm">
                        Thank you for reaching out. A RescueLens emergency intelligence specialist will review your request and get back to you shortly.
                      </p>
                      <button
                        onClick={() => setIsSubmitted(false)}
                        className="mt-8 px-6 py-2.5 rounded-full text-xs font-semibold border border-[#1c2d38] bg-transparent hover:bg-white/5 text-white transition-colors cursor-pointer"
                      >
                        Send another message
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Info and FAQ Column */}
            <div className="lg:col-span-5 flex flex-col gap-10">
              {/* Contact Information - why-card style in dark */}
              <motion.div
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-[#0a202c]/50 border border-[#1c2d38] p-8 rounded-lg flex flex-col gap-6 text-left"
              >
                <h3 className="text-xl font-bold text-white">Contact Information</h3>
                
                <div className="space-y-5">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#001e2b] border border-[#1c2d38] flex items-center justify-center text-[#00ed64] flex-shrink-0 shadow-sm">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">General inquiries</div>
                      <a href="mailto:contact@rescuelens.ai" className="text-sm font-semibold text-[#00ed64] hover:underline">
                        contact@rescuelens.ai
                      </a>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#001e2b] border border-[#1c2d38] flex items-center justify-center text-[#00ed64] flex-shrink-0 shadow-sm">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">Technical support</div>
                      <a href="mailto:support@rescuelens.ai" className="text-sm font-semibold text-[#00ed64] hover:underline">
                        support@rescuelens.ai
                      </a>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#001e2b] border border-[#1c2d38] flex items-center justify-center text-[#00ed64] flex-shrink-0 shadow-sm">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">Business & partnerships</div>
                      <a href="mailto:business@rescuelens.ai" className="text-sm font-semibold text-[#00ed64] hover:underline">
                        business@rescuelens.ai
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* FAQ Section */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="space-y-4 text-left"
              >
                <h3 className="text-xl font-bold text-white px-1">Frequently Asked Questions</h3>

                <div className="space-y-1">
                  {faqs.map((faq, idx) => {
                    const isExpanded = expandedFAQ === idx
                    return (
                      /* faq-accordion-item style in dark */
                      <div 
                        key={idx} 
                        className="border-b border-[#1c2d38] bg-transparent overflow-hidden py-4"
                      >
                        <button
                          onClick={() => setExpandedFAQ(isExpanded ? null : idx)}
                          className="w-full py-2 flex items-center justify-between gap-4 text-left font-semibold text-slate-200 hover:text-[#00ed64] transition-colors text-sm font-sans"
                        >
                          {faq.q}
                          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-[#00ed64]' : ''}`} />
                        </button>
                        
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: 'easeInOut' }}
                            >
                              <div className="pb-4 pt-2 text-xs md:text-sm text-[#a8b3bc] leading-[1.55] font-sans">
                                {faq.a}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
