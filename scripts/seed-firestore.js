// Script to seed Firestore with mock data
// Run with: node scripts/seed-firestore.js

const admin = require('firebase-admin');

// Initialize Firebase Admin (you'll need to set up service account key)
// For now, this is a template - you'll need to add your service account key
const serviceAccount = require('../path-to-your-service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const mockAdvisors = [
  {
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
];

async function seedFirestore() {
  try {
    console.log('Starting Firestore seeding...');
    
    // Clear existing advisors
    const advisorsSnapshot = await db.collection('advisors').get();
    const batch = db.batch();
    
    advisorsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log('Cleared existing advisors');
    
    // Add mock advisors
    for (const advisor of mockAdvisors) {
      await db.collection('advisors').add(advisor);
      console.log(`Added advisor: ${advisor.name}`);
    }
    
    console.log('Firestore seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding Firestore:', error);
    process.exit(1);
  }
}

seedFirestore();
