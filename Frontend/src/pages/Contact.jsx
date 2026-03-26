import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  PhoneIcon, 
  MailIcon, 
  LocationIcon,
  ClockIcon,
  ArrowRightIcon
} from '../components/ui/Icons.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import Alert from '../components/ui/Alert.jsx'
import { COMPANY_INFO, API_URL } from '../utils/constants.js'

const contactMethods = [
  {
    icon: PhoneIcon,
    title: 'Phone',
    details: [COMPANY_INFO.phone],
    action: COMPANY_INFO.phone
      ? { label: 'Call now', href: `tel:${COMPANY_INFO.phone.replace(/\s/g, '')}` }
      : null
  },
  {
    icon: MailIcon,
    title: 'Email',
    details: [COMPANY_INFO.email],
    action: COMPANY_INFO.email
      ? { label: 'Send email', href: `mailto:${COMPANY_INFO.email}` }
      : null
  },
  {
    icon: LocationIcon,
    title: 'Location',
    details: [COMPANY_INFO.address],
    action: null
  },
  {
    icon: ClockIcon,
    title: 'Working Hours',
    details: [COMPANY_INFO.workingHours, COMPANY_INFO.emergencyHours].filter(Boolean),
    action: null
  }
]

function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const response = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to send message')
      }

      setSuccess(true)
      setForm({
        name: '',
        email: '',
        phone: '',
        company: '',
        subject: '',
        message: ''
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-20">
        <div className="container-custom">
          <div className="max-w-3xl">
            <span className="inline-block text-brand-400 font-semibold text-sm uppercase tracking-wider mb-3">
              Contact Us
            </span>
            <h1 className="heading-xl text-white mb-6">
              Let's Discuss Your Requirements
            </h1>
            <p className="text-lg text-slate-300">
              Whether you need emergency service, want to schedule maintenance, or have questions about our solutions, our team is here to help. Reach out and we'll respond promptly.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="section-sm bg-white -mt-8">
        <div className="container-custom">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method) => (
              <div key={method.title} className="card p-6">
                <div className="icon-box bg-brand-100 text-brand-600 mb-4">
                  <method.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{method.title}</h3>
                {method.details.map((detail, index) => (
                  <p key={index} className="text-sm text-slate-600">{detail}</p>
                ))}
                {method.action && (
                  <a 
                    href={method.action.href}
                    className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 mt-3"
                  >
                    {method.action.label}
                    <ArrowRightIcon className="w-4 h-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="section bg-slate-50">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Form */}
            <div>
              <h2 className="heading-lg mb-4">Send Us a Message</h2>
              <p className="text-slate-500 mb-8">
                Fill out the form below and we'll get back to you within one business day.
              </p>

              {success && (
                <Alert type="success" className="mb-6">
                  Thank you for your message! We'll get back to you shortly.
                </Alert>
              )}

              {error && (
                <Alert type="error" className="mb-6" onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <Input
                    label="Full Name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="John Smith"
                    required
                  />
                  <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="john@company.com"
                    required
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <Input
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+971 50 123 4567"
                  />
                  <Input
                    label="Company Name"
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    placeholder="Your Company"
                  />
                </div>

                <Input
                  label="Subject"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="How can we help?"
                  required
                />

                <div className="form-group">
                  <label className="label">Message</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={5}
                    className="input resize-none"
                    placeholder="Please describe your requirements or questions..."
                    required
                  />
                </div>

                <Button type="submit" loading={loading} className="w-full sm:w-auto">
                  Send Message
                  <ArrowRightIcon className="w-4 h-4" />
                </Button>
              </form>
            </div>

            {/* Info Panel */}
            <div>
              <div className="card-dark p-8 h-full">
                <h3 className="text-xl font-semibold text-white mb-6">Quick Help</h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-white mb-2">Emergency Service</h4>
                    <p className="text-slate-400 text-sm mb-3">
                      For urgent repairs or breakdowns, our emergency team is available 24/7.
                    </p>
                    {COMPANY_INFO.phone && (
                      <a 
                        href={`tel:${COMPANY_INFO.phone.replace(/\s/g, '')}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-primary-400 hover:text-primary-300 mt-2"
                      >
                        Call Emergency Line
                        <ArrowRightIcon className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Contact
