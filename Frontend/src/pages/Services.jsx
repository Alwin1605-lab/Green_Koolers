import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  ServiceIcon, 
  CheckIcon, 
  ArrowRightIcon 
} from '../components/ui/Icons.jsx'
import { SERVICE_CATEGORIES, MAINTENANCE_PLANS } from '../utils/constants.js'

function Services() {
  const [selectedCategory, setSelectedCategory] = useState(null)

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-20">
        <div className="container-custom">
          <div className="max-w-3xl">
            <span className="inline-block text-brand-400 font-semibold text-sm uppercase tracking-wider mb-3">
              Our Services
            </span>
            <h1 className="heading-xl text-white mb-6">
              Complete HVAC & Refrigeration Solutions
            </h1>
            <p className="text-lg text-slate-300 mb-8">
              From residential comfort to industrial-scale climate control, we provide comprehensive services tailored to your specific needs. Our certified technicians deliver excellence in every project.
            </p>
            <Link to="/book" className="btn-primary btn-lg">
              Book a Service
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {SERVICE_CATEGORIES.map((service) => (
              <div 
                key={service.id}
                className="card-hover overflow-hidden group"
                onClick={() => setSelectedCategory(selectedCategory === service.id ? null : service.id)}
              >
                {/* Card Header */}
                <div className="p-6 pb-0">
                  <div className="flex items-start gap-4">
                    <div className="icon-box-lg bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors duration-300 flex-shrink-0">
                      <ServiceIcon category={service.name} className="w-7 h-7" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-slate-900 mb-2 group-hover:text-brand-600 transition-colors">
                        {service.name}
                      </h3>
                      <p className="text-slate-500 text-sm">
                        {service.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Benefits */}
                <div className="p-6">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                    Key Benefits
                  </h4>
                  <ul className="space-y-2">
                    {service.benefits.slice(0, 3).map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                        <CheckIcon className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Use Cases - Expandable */}
                <div className={`overflow-hidden transition-all duration-300 ${
                  selectedCategory === service.id ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="px-6 pb-6 pt-0 border-t border-slate-100">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 mt-4">
                      Common Use Cases
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {service.useCases.map((useCase, index) => (
                        <span 
                          key={index} 
                          className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium"
                        >
                          {useCase}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-6 pt-0 mt-auto">
                  <div className="flex items-center justify-between">
                    <button 
                      className="text-sm font-medium text-brand-600 hover:text-brand-700"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedCategory(selectedCategory === service.id ? null : service.id)
                      }}
                    >
                      {selectedCategory === service.id ? 'Show less' : 'Learn more'}
                    </button>
                    <Link 
                      to="/book" 
                      className="btn-primary btn-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Maintenance Plans Section */}
      <section className="section bg-slate-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <span className="inline-block text-brand-600 font-semibold text-sm uppercase tracking-wider mb-3">
              Maintenance Plans
            </span>
            <h2 className="heading-lg mb-4">Choose Your Coverage Level</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Protect your investment with our preventive maintenance programs. Regular servicing extends equipment life, improves efficiency, and prevents costly breakdowns.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {MAINTENANCE_PLANS.map((plan) => (
              <div 
                key={plan.name}
                className={`card relative overflow-hidden ${
                  plan.recommended ? 'ring-2 ring-brand-500 shadow-glow' : ''
                }`}
              >
                {plan.recommended && (
                  <div className="absolute top-0 right-0 bg-brand-500 text-white text-xs font-semibold px-4 py-1 rounded-bl-lg">
                    Recommended
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{plan.name}</h3>
                  <p className="text-sm text-slate-500 mb-6">{plan.description}</p>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                        <CheckIcon className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link 
                    to="/contact" 
                    className={`btn w-full justify-center ${
                      plan.recommended ? 'btn-primary' : 'btn-outline'
                    }`}
                  >
                    Get Quote
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Process Section */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <span className="inline-block text-brand-600 font-semibold text-sm uppercase tracking-wider mb-3">
              How It Works
            </span>
            <h2 className="heading-lg mb-4">Simple 4-Step Process</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              From initial contact to completed service, we make the process seamless and transparent.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: 1, title: 'Book Online', description: 'Schedule your service through our online booking system or give us a call.' },
              { step: 2, title: 'Confirmation', description: 'Receive confirmation with technician details and appointment time.' },
              { step: 3, title: 'Service Visit', description: 'Our certified technician arrives on time and completes the service.' },
              { step: 4, title: 'Follow Up', description: 'Get a detailed service report and ongoing support as needed.' }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center text-brand-600 font-bold text-2xl mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section bg-slate-50">
        <div className="container-custom max-w-4xl">
          <div className="text-center mb-12">
            <span className="inline-block text-brand-600 font-semibold text-sm uppercase tracking-wider mb-3">
              FAQ
            </span>
            <h2 className="heading-lg mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {[
              {
                question: 'What areas do you service?',
                answer: 'We provide services across Dubai and the greater UAE region. For locations outside our standard service area, please contact us for availability.'
              },
              {
                question: 'How quickly can you respond to emergency calls?',
                answer: 'For emergency services, we aim to dispatch a technician within 2-4 hours. Our 24/7 emergency line ensures you\'re never left without support when critical issues arise.'
              },
              {
                question: 'Do you provide warranties on repairs?',
                answer: 'Yes, all our repairs come with a 90-day warranty on parts and labor. For new installations, warranty periods vary based on equipment and can extend up to 5 years.'
              },
              {
                question: 'Can you service all brands of equipment?',
                answer: 'Our technicians are trained and certified to work on all major HVAC and refrigeration brands including Carrier, Daikin, Trane, LG, Samsung, and more.'
              },
              {
                question: 'What payment methods do you accept?',
                answer: 'We accept cash, credit/debit cards, bank transfers, and offer flexible payment plans for larger projects. Corporate accounts with net-30 terms are also available.'
              }
            ].map((faq, index) => (
              <details key={index} className="card group">
                <summary className="p-6 cursor-pointer list-none flex items-center justify-between">
                  <span className="font-semibold text-slate-900 pr-4">{faq.question}</span>
                  <span className="flex-shrink-0 ml-4 w-6 h-6 rounded-full bg-slate-100 group-open:bg-brand-100 flex items-center justify-center text-slate-500 group-open:text-brand-600 transition-colors">
                    <svg className="w-4 h-4 transform group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 pt-0 text-slate-600">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-gradient-to-br from-brand-600 to-brand-700 text-white">
        <div className="container-custom text-center">
          <h2 className="heading-lg text-white mb-4">Need a Custom Solution?</h2>
          <p className="text-brand-100 max-w-2xl mx-auto mb-8">
            Every facility is unique. Contact us for a personalized consultation and quote tailored to your specific requirements.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/book" className="btn bg-white text-brand-600 hover:bg-brand-50 btn-lg">
              Book Consultation
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
            <Link to="/contact" className="btn bg-white/10 text-white hover:bg-white/20 border border-white/20 btn-lg">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Services
