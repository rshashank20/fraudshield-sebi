// Firestore data models and types

export interface Advisor {
  id: string
  name: string
  sebiRegistrationNumber: string
  registrationDate: string
  status: 'ACTIVE' | 'SUSPENDED' | 'CANCELLED'
  category: string
  address: string
  phone: string
  email: string
  lastUpdated: string
}

export interface Flag {
  id: string
  inputText: string
  inputType: 'advisor' | 'tip' | 'link'
  verdict: 'HIGH RISK' | 'WATCH' | 'LIKELY SAFE'
  confidence: number
  reasons: string[]
  evidence: string[]
  timestamp: any // Firestore Timestamp
  reported: boolean
  reportedAt?: any // Firestore Timestamp
  anonymous?: boolean
  userId?: string
}

export interface DashboardKPIs {
  totalFlags: number
  highRiskFlags: number
  watchFlags: number
  safeFlags: number
  avgConfidence: number
  totalReports: number
  avgResponseTime: number
}

// Mock data for development
export const mockAdvisors: Advisor[] = [
  {
    id: '1',
    name: 'John Smith',
    sebiRegistrationNumber: 'SEBI/INV/001',
    registrationDate: '2020-01-15',
    status: 'ACTIVE',
    category: 'Investment Advisor',
    address: 'Mumbai, Maharashtra',
    phone: '+91-9876543210',
    email: 'john.smith@example.com',
    lastUpdated: '2024-01-01'
  },
  {
    id: '2',
    name: 'Jane Doe',
    sebiRegistrationNumber: 'SEBI/INV/002',
    registrationDate: '2019-06-20',
    status: 'ACTIVE',
    category: 'Portfolio Manager',
    address: 'Delhi, NCR',
    phone: '+91-9876543211',
    email: 'jane.doe@example.com',
    lastUpdated: '2024-01-01'
  },
  {
    id: '3',
    name: 'Robert Johnson',
    sebiRegistrationNumber: 'SEBI/INV/003',
    registrationDate: '2021-03-10',
    status: 'ACTIVE',
    category: 'Research Analyst',
    address: 'Bangalore, Karnataka',
    phone: '+91-9876543212',
    email: 'robert.johnson@example.com',
    lastUpdated: '2024-01-01'
  },
  {
    id: '4',
    name: 'Sarah Wilson',
    sebiRegistrationNumber: 'SEBI/INV/004',
    registrationDate: '2018-11-05',
    status: 'SUSPENDED',
    category: 'Investment Advisor',
    address: 'Chennai, Tamil Nadu',
    phone: '+91-9876543213',
    email: 'sarah.wilson@example.com',
    lastUpdated: '2024-01-01'
  }
]

// Collection names
export const COLLECTIONS = {
  ADVISORS: 'advisors',
  FLAGS: 'flags',
  REPORTS: 'reports',
  USERS: 'users'
} as const
