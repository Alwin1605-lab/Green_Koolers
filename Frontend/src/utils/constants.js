// API Base URL — uses VITE_API_URL env var in production, localhost in dev
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

// Service categories with full details
export const SERVICE_CATEGORIES = [
  {
    id: 'residential-ac',
    name: 'Residential AC',
    shortName: 'AC',
    description: 'Complete air conditioning solutions for homes and apartments. From installation to maintenance, we ensure your living space stays comfortable year-round.',
    benefits: [
      'Energy-efficient cooling solutions',
      'Regular maintenance programs',
      'Emergency repair services',
      '24/7 support availability'
    ],
    useCases: [
      'Home AC installation',
      'Split AC maintenance',
      'Window unit servicing',
      'Seasonal tune-ups'
    ],
    icon: 'ACIcon'
  },
  {
    id: 'industrial-ac',
    name: 'Industrial AC',
    shortName: 'Industrial',
    description: 'High-capacity cooling systems designed for warehouses, factories, and large commercial facilities requiring robust climate control.',
    benefits: [
      'High-capacity cooling systems',
      'Reduced downtime with preventive maintenance',
      'Energy optimization',
      'Compliance with industrial standards'
    ],
    useCases: [
      'Warehouse cooling',
      'Factory climate control',
      'Data center cooling',
      'Cold storage facilities'
    ],
    icon: 'IndustrialACIcon'
  },
  {
    id: 'hvac',
    name: 'HVAC Systems',
    shortName: 'HVAC',
    description: 'Complete heating, ventilation, and air conditioning system design, installation, and lifecycle management for commercial and industrial properties.',
    benefits: [
      'Integrated climate control',
      'Improved air quality',
      'Energy efficiency optimization',
      'Smart system integration'
    ],
    useCases: [
      'Commercial building HVAC',
      'Ventilation system upgrades',
      'Air quality improvement',
      'System retrofits'
    ],
    icon: 'HVACIcon'
  },
  {
    id: 'cassette-ac',
    name: 'Cassette AC',
    shortName: 'Cassette',
    description: 'Professional ceiling-mounted cassette air conditioning systems perfect for offices, retail spaces, and commercial environments.',
    benefits: [
      'Aesthetic ceiling integration',
      '360-degree airflow',
      'Quiet operation',
      'Zone control capability'
    ],
    useCases: [
      'Office spaces',
      'Retail environments',
      'Restaurants',
      'Conference rooms'
    ],
    icon: 'CassetteACIcon'
  },
  {
    id: 'refrigeration',
    name: 'Refrigeration',
    shortName: 'Fridge',
    description: 'Commercial refrigeration solutions including cold storage, display units, and cold chain management for food service and retail.',
    benefits: [
      'Temperature precision',
      'Energy-efficient operation',
      'Compliance with food safety',
      'Remote monitoring options'
    ],
    useCases: [
      'Restaurant refrigeration',
      'Supermarket display cases',
      'Cold storage warehouses',
      'Medical cold chain'
    ],
    icon: 'RefrigerationIcon'
  },
  {
    id: 'bakery-equipment',
    name: 'Bakery Equipment',
    shortName: 'Bakery',
    description: 'Specialized maintenance and installation services for bakery equipment including ovens, proofers, mixers, and refrigeration units.',
    benefits: [
      'Equipment reliability',
      'Consistent baking performance',
      'Extended equipment life',
      'Safety compliance'
    ],
    useCases: [
      'Commercial ovens',
      'Proofing cabinets',
      'Bakery refrigeration',
      'Display equipment'
    ],
    icon: 'BakeryIcon'
  },
  {
    id: 'projects',
    name: 'Projects',
    shortName: 'Projects',
    description: 'End-to-end project services for new installations, facility upgrades, and complete system overhauls with professional project management.',
    benefits: [
      'Turnkey solutions',
      'Project management included',
      'Timeline guarantees',
      'Quality assurance'
    ],
    useCases: [
      'New building installations',
      'Facility renovations',
      'System upgrades',
      'Multi-site deployments'
    ],
    icon: 'ProjectsIcon'
  }
]

// Service types
export const SERVICE_TYPES = [
  { value: 'Maintenance', label: 'Maintenance' },
  { value: 'Installation', label: 'Installation' },
  { value: 'Repair', label: 'Repair' },
  { value: 'Inspection', label: 'Inspection' },
  { value: 'Consultation', label: 'Consultation' }
]

// Service request statuses
export const REQUEST_STATUSES = [
  { value: 'Requested', label: 'Requested', color: 'slate' },
  { value: 'Assigned', label: 'Assigned', color: 'blue' },
  { value: 'In Progress', label: 'In Progress', color: 'amber' },
  { value: 'Completed', label: 'Completed', color: 'emerald' },
  { value: 'Cancelled', label: 'Cancelled', color: 'red' }
]

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
  TECHNICIAN: 'technician',
  CUSTOMER: 'customer'
}

// Role display names
export const ROLE_NAMES = {
  admin: 'Administrator',
  staff: 'Staff',
  technician: 'Technician',
  customer: 'Customer'
}

// Priority levels
export const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low', color: 'slate' },
  { value: 'medium', label: 'Medium', color: 'blue' },
  { value: 'high', label: 'High', color: 'amber' },
  { value: 'urgent', label: 'Urgent', color: 'red' }
]

// Maintenance plans
export const MAINTENANCE_PLANS = [
  {
    name: 'Essential',
    description: 'Basic coverage for small businesses',
    features: [
      'Quarterly inspections',
      'Standard response time',
      'Email support',
      'Basic reporting'
    ],
    recommended: false
  },
  {
    name: 'Priority',
    description: 'Enhanced coverage for growing businesses',
    features: [
      'Monthly inspections',
      'Priority dispatch',
      'Phone & email support',
      'Detailed reporting',
      'Parts discount'
    ],
    recommended: true
  },
  {
    name: 'Enterprise',
    description: 'Comprehensive coverage for large operations',
    features: [
      'Weekly inspections',
      'Dedicated technician team',
      '24/7 emergency support',
      'SLA guarantees',
      'Custom reporting',
      'Compliance audits'
    ],
    recommended: false
  }
]

// Company info
export const COMPANY_INFO = {
  name: 'Green Koolers',
  tagline: 'Professional HVAC & Refrigeration Solutions',
  email: 'greenkoolers@gmail.com',
  phone: '+91 97500 77088',
  address: 'No 585, Perundurai Road, opposite Hotel Padmam and near Old Ravi Theatre, Perundurai Road, Erode-63801',
  workingHours: '9 am to 9 pm Monday to Saturday',
  emergencyHours: '24/7 Emergency Service Available'
}
