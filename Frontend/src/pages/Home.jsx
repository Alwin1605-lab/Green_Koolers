import { Link } from 'react-router-dom'
import { 
  CheckIcon, 
  ClockIcon, 
  ShieldIcon, 
  StarIcon,
  ArrowRightIcon,
  UsersIcon,
  WrenchIcon,
  ChartIcon
} from '../components/ui/Icons.jsx'
import { COMPANY_INFO } from '../utils/constants.js'

const stats = [
  { value: '15+', label: 'Years Experience' },
  { value: '2,500+', label: 'Projects Completed' },
  { value: '98%', label: 'Client Satisfaction' },
  { value: '24/7', label: 'Support Available' }
]

const features = [
  {
    icon: ClockIcon,
    title: 'Fast Response',
    description: 'Emergency services available 24/7 with guaranteed response times for critical issues.'
  },
  {
    icon: ShieldIcon,
    title: 'Certified Technicians',
    description: 'Our team holds industry certifications and undergoes regular training on latest technologies.'
  },
  {
    icon: WrenchIcon,
    title: 'Quality Parts',
    description: 'We use only genuine OEM parts and high-quality components for all repairs and installations.'
  },
  {
    icon: ChartIcon,
    title: 'Transparent Pricing',
    description: 'Upfront quotes with no hidden fees. Know exactly what you\'re paying for every service.'
  }
]

const testimonials = [
  {
    quote: 'Their maintenance program has reduced our equipment downtime by 40%. Exceptional service!',
    author: 'Ahmed Al-Rashid',
    role: 'Facilities Manager, Al Futtaim Group'
  },
  {
    quote: 'Professional, reliable, and always on time. They\'ve been our go-to HVAC partner for 5 years.',
    author: 'Sarah Mitchell',
    role: 'Operations Director, Marina Hotels'
  }
]

const values = [
  {
    icon: ShieldIcon,
    title: 'Reliability',
    description: 'We stand behind our work with industry-leading warranties and guarantee on-time service delivery.'
  },
  {
    icon: UsersIcon,
    title: 'Customer Focus',
    description: 'Your satisfaction is our priority. We listen, understand, and deliver solutions that exceed expectations.'
  },
  {
    icon: WrenchIcon,
    title: 'Technical Excellence',
    description: 'Our team stays current with the latest technologies and holds certifications from major manufacturers.'
  },
  {
    icon: StarIcon,
    title: 'Integrity',
    description: 'Honest assessments, transparent pricing, and ethical business practices guide everything we do.'
  }
]

const milestones = [
  { year: '2010', title: 'Company Founded', description: 'Established with a focus on dependable cooling and refrigeration services.' },
  { year: '2012', title: 'Featured on Green Machines Television', description: 'Recognized publicly for quality service and technical reliability.' },
  { year: '2017', title: 'Best Seller Award Across Tamil Nadu', description: 'Awarded for outstanding performance in Mitsubishi and Haier product categories.' },
  { year: '2019', title: 'Air Conditioner Rising Star Award Across South India', description: 'Honored for rapid growth, service quality, and customer trust in the AC segment.' },
  { year: '2022', title: 'Authorized Spare Parts Distributor in Erode', description: 'Appointed as an authorized distributor, strengthening regional after-sales support.' }
]

const certifications = [
  'Blue Star',
  'Mitsubishi Electric',
  'Haier',
  'Helen Pro',
  'Hitachi',
  'First Service Centre in Erode - 1995',
  '30+ Years of Experience'
]

function Home() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-brand-900">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>
        
        <div className="container-custom relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center py-20 lg:py-28">
            {/* Left Content */}
            <div className="text-white animate-fade-in-up">
              <div className="inline-flex items-center gap-2 bg-brand-600/20 border border-brand-500/30 rounded-full px-4 py-1.5 text-sm font-medium text-brand-300 mb-6">
                <span className="w-2 h-2 bg-brand-400 rounded-full animate-pulse"></span>
                Trusted by 500+ Businesses
              </div>
              
              <h1 className="heading-xl text-white mb-6">
                {COMPANY_INFO.name} delivers HVAC & Refrigeration{' '}
                <span className="text-brand-400">Excellence</span>
              </h1>
              
              <p className="text-lg text-slate-300 mb-8 max-w-xl">
                From residential AC to industrial refrigeration, we deliver reliable climate control solutions that keep your spaces comfortable and your equipment running at peak performance.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-12">
                <Link to="/book" className="btn-primary btn-lg shadow-glow">
                  Book a Service
                  <ArrowRightIcon className="w-5 h-5" />
                </Link>
                <Link to="/services" className="btn bg-white/10 text-white hover:bg-white/20 border border-white/20 btn-lg">
                  Explore Services
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <div className="text-3xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-slate-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content - Value Cards */}
            <div className="hidden lg:grid grid-cols-2 gap-4 animate-fade-in animation-delay-200">
              {values.map((value, index) => (
                <div 
                  key={value.title}
                  className={`bg-white/10 backdrop-blur border border-white/10 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 ${
                    index % 2 === 1 ? 'mt-8' : ''
                  }`}
                >
                  <div className="w-12 h-12 bg-brand-500/20 rounded-xl flex items-center justify-center text-brand-400 mb-4">
                    <value.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">{value.title}</h3>
                  <p className="text-sm text-slate-400 line-clamp-2">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Story Section */}
      <section className="section">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block text-brand-600 font-semibold text-sm uppercase tracking-wider mb-3">
                Our Story
              </span>
              <h2 className="heading-lg mb-6">Built on Expertise, Driven by Service</h2>
              <p className="text-slate-600 mb-6">
                {COMPANY_INFO.name} was founded with a simple mission: to provide reliable, professional HVAC services that businesses and homeowners can count on. What started as a small team of passionate technicians has grown into a comprehensive service organization serving hundreds of clients.
              </p>
              <p className="text-slate-600 mb-6">
                Today, we employ over 50 certified technicians, operate a modern fleet of service vehicles, and maintain partnerships with leading equipment manufacturers. Our growth has been organic, built on referrals from satisfied customers and a reputation for excellence.
              </p>
              <p className="text-slate-600">
                We've invested heavily in training, technology, and tools to ensure our team can handle any challenge. From emergency repairs to complex industrial installations, we bring the same level of professionalism and care to every job.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="card p-6 text-center">
                <div className="text-4xl font-bold text-brand-600 mb-2">15+</div>
                <div className="text-slate-600">Years in Business</div>
              </div>
              <div className="card p-6 text-center">
                <div className="text-4xl font-bold text-brand-600 mb-2">50+</div>
                <div className="text-slate-600">Expert Technicians</div>
              </div>
              <div className="card p-6 text-center">
                <div className="text-4xl font-bold text-brand-600 mb-2">2,500+</div>
                <div className="text-slate-600">Projects Completed</div>
              </div>
              <div className="card p-6 text-center">
                <div className="text-4xl font-bold text-brand-600 mb-2">500+</div>
                <div className="text-slate-600">Active Clients</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section bg-slate-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <span className="inline-block text-brand-600 font-semibold text-sm uppercase tracking-wider mb-3">
              Our Values
            </span>
            <h2 className="heading-lg mb-4">What Guides Us</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Our core values shape every interaction, every service call, and every decision we make.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div key={value.title} className="card p-6 text-center">
                <div className="icon-box-lg bg-brand-100 text-brand-600 mx-auto mb-4">
                  <value.icon className="w-7 h-7" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{value.title}</h3>
                <p className="text-sm text-slate-500">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="section bg-white">
        <div className="container-custom max-w-4xl">
          <div className="text-center mb-12">
            <span className="inline-block text-brand-600 font-semibold text-sm uppercase tracking-wider mb-3">
              Our Journey
            </span>
            <h2 className="heading-lg mb-4">Milestones & Growth</h2>
          </div>

          <div className="relative">
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-brand-200 -translate-x-1/2"></div>

            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={milestone.year} className={`relative flex items-center gap-8 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}>
                  <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'} pl-20 md:pl-0`}>
                    <div className="card p-6 inline-block text-left">
                      <span className="text-brand-600 font-bold text-lg">{milestone.year}</span>
                      <h3 className="font-semibold text-slate-900 mt-1">{milestone.title}</h3>
                      <p className="text-sm text-slate-500 mt-1">{milestone.description}</p>
                    </div>
                  </div>

                  <div className="absolute left-8 md:left-1/2 w-4 h-4 bg-brand-500 rounded-full -translate-x-1/2 ring-4 ring-brand-100"></div>

                  <div className="hidden md:block flex-1"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Certification Section */}
      <section className="section bg-slate-900 text-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <span className="inline-block text-brand-400 font-semibold text-sm uppercase tracking-wider mb-3">
              Certification
            </span>
            <h2 className="heading-lg text-white mb-4">Industry Recognized</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Our certifications and partnerships demonstrate our commitment to maintaining the highest standards in the industry.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {certifications.map((cert) => (
              <div key={cert} className="bg-white/10 rounded-xl p-4 text-center">
                <CheckIcon className="w-8 h-8 text-brand-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-white">{cert}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section bg-slate-50">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block text-brand-600 font-semibold text-sm uppercase tracking-wider mb-3">
                Why Choose Us
              </span>
              <h2 className="heading-lg mb-6">Excellence in Every Service Call</h2>
              <p className="text-slate-500 mb-8">
                With over 15 years of experience, we've built a reputation for delivering exceptional HVAC and refrigeration services. Our commitment to quality, reliability, and customer satisfaction sets us apart.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-6">
                {features.map((feature) => (
                  <div key={feature.title} className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center text-brand-600">
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">{feature.title}</h3>
                      <p className="text-sm text-slate-500">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-brand-600 to-brand-700 rounded-3xl p-8 text-white">
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="bg-white/10 rounded-2xl p-6 text-center">
                    <div className="text-4xl font-bold mb-1">98%</div>
                    <div className="text-sm text-brand-200">First-Time Fix Rate</div>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-6 text-center">
                    <div className="text-4xl font-bold mb-1">4.9</div>
                    <div className="text-sm text-brand-200">Customer Rating</div>
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold mb-3">Ready to Get Started?</h3>
                <p className="text-brand-200 mb-6">
                  Schedule your service appointment today and experience the difference of working with industry professionals.
                </p>
                <Link to="/book" className="btn bg-white text-brand-600 hover:bg-brand-50 w-full justify-center">
                  Book Your Service
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-brand-200 rounded-full opacity-50 blur-2xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-brand-300 rounded-full opacity-30 blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <span className="inline-block text-brand-600 font-semibold text-sm uppercase tracking-wider mb-3">
              Testimonials
            </span>
            <h2 className="heading-lg mb-4">What Our Clients Say</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card p-8">
                <div className="flex gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <p className="text-slate-600 mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="avatar-md bg-brand-600">
                    {testimonial.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{testimonial.author}</div>
                    <div className="text-sm text-slate-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-gradient-to-br from-brand-600 to-brand-700 text-white">
        <div className="container-custom text-center">
          <h2 className="heading-lg text-white mb-4">Ready to Optimize Your Climate Control?</h2>
          <p className="text-brand-100 max-w-2xl mx-auto mb-8">
            Whether you need emergency repairs, routine maintenance, or a complete system installation, our team is ready to help.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/book" className="btn bg-white text-brand-600 hover:bg-brand-50 btn-lg">
              Schedule Service
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

export default Home
