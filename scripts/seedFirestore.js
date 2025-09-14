const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
// You'll need to download your service account key from Firebase Console
// and place it in the project root as 'service-account-key.json'
const serviceAccount = require('../service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'fraudshield-sebi'
});

const db = admin.firestore();

// Sample advisors data
const advisors = [
  {
    name: 'Dr. Rajesh Kumar',
    sebiRegistrationNumber: 'SEBI/INV/001',
    registrationDate: '2020-01-15',
    status: 'ACTIVE',
    category: 'Investment Advisor',
    address: 'Mumbai, Maharashtra',
    phone: '+91-9876543210',
    email: 'rajesh.kumar@example.com',
    lastUpdated: '2024-01-01',
    qualifications: ['CFA', 'MBA Finance'],
    experience: '8 years',
    specializations: ['Equity Research', 'Portfolio Management']
  },
  {
    name: 'Priya Sharma',
    sebiRegistrationNumber: 'SEBI/INV/002',
    registrationDate: '2019-06-20',
    status: 'ACTIVE',
    category: 'Portfolio Manager',
    address: 'Delhi, NCR',
    phone: '+91-9876543211',
    email: 'priya.sharma@example.com',
    lastUpdated: '2024-01-01',
    qualifications: ['CA', 'CFA'],
    experience: '10 years',
    specializations: ['Mutual Funds', 'Fixed Income']
  },
  {
    name: 'Amit Patel',
    sebiRegistrationNumber: 'SEBI/INV/003',
    registrationDate: '2021-03-10',
    status: 'ACTIVE',
    category: 'Research Analyst',
    address: 'Bangalore, Karnataka',
    phone: '+91-9876543212',
    email: 'amit.patel@example.com',
    lastUpdated: '2024-01-01',
    qualifications: ['MBA', 'FRM'],
    experience: '6 years',
    specializations: ['Technical Analysis', 'Derivatives']
  },
  {
    name: 'Sunita Reddy',
    sebiRegistrationNumber: 'SEBI/INV/004',
    registrationDate: '2018-11-05',
    status: 'SUSPENDED',
    category: 'Investment Advisor',
    address: 'Chennai, Tamil Nadu',
    phone: '+91-9876543213',
    email: 'sunita.reddy@example.com',
    lastUpdated: '2024-01-01',
    qualifications: ['CA', 'MBA'],
    experience: '12 years',
    specializations: ['Wealth Management', 'Tax Planning'],
    suspensionReason: 'Disciplinary action for mis-selling'
  },
  {
    name: 'Vikram Singh',
    sebiRegistrationNumber: 'SEBI/INV/005',
    registrationDate: '2022-02-14',
    status: 'ACTIVE',
    category: 'Investment Advisor',
    address: 'Pune, Maharashtra',
    phone: '+91-9876543214',
    email: 'vikram.singh@example.com',
    lastUpdated: '2024-01-01',
    qualifications: ['CFA', 'CA'],
    experience: '5 years',
    specializations: ['Equity Advisory', 'SIP Planning']
  }
];

// Sample flags data
const flags = [
  {
    inputText: 'Invest ₹10,000 today and double your money in 7 days - guaranteed returns!',
    inputType: 'tip',
    verdict: 'HIGH RISK',
    confidence: 95,
    reasons: [
      'Promises guaranteed returns - major red flag for investment fraud',
      'Uses pressure tactics to create urgency',
      'Promises specific high returns - major red flag for investment fraud'
    ],
    evidence: [
      'https://www.sebi.gov.in/',
      'https://www.investor.gov/',
      'https://www.rbi.org.in/'
    ],
    status: 'pending',
    reported: false,
    anonymous: true,
    timestamp: admin.firestore.Timestamp.fromDate(new Date('2024-01-15T10:30:00Z'))
  },
  {
    inputText: 'Dr. Rajesh Kumar',
    inputType: 'advisor',
    verdict: 'LIKELY SAFE',
    confidence: 85,
    reasons: [
      'Advisor found in SEBI registry',
      'No disciplinary actions found',
      'Proper qualifications and experience'
    ],
    evidence: [
      'https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doRecognisedFpi=yes&intmId=13',
      'https://www.sebi.gov.in/'
    ],
    status: 'pending',
    reported: false,
    anonymous: false,
    timestamp: admin.firestore.Timestamp.fromDate(new Date('2024-01-15T11:15:00Z'))
  },
  {
    inputText: 'BUY XYZ STOCK NOW - insider information says it will go up 200% in next month!',
    inputType: 'tip',
    verdict: 'HIGH RISK',
    confidence: 90,
    reasons: [
      'Claims to have insider information - illegal and fraudulent',
      'Uses pressure tactics with "NOW" urgency',
      'Promises unrealistic returns (200%)'
    ],
    evidence: [
      'https://www.sebi.gov.in/',
      'https://www.investor.gov/'
    ],
    status: 'fraud',
    reported: true,
    anonymous: true,
    audit: [
      {
        action: 'fraud',
        actor: 'regulator_demo',
        ts: admin.firestore.Timestamp.fromDate(new Date('2024-01-15T14:20:00Z'))
      }
    ],
    timestamp: admin.firestore.Timestamp.fromDate(new Date('2024-01-15T12:45:00Z'))
  },
  {
    inputText: 'Sunita Reddy',
    inputType: 'advisor',
    verdict: 'WATCH',
    confidence: 70,
    reasons: [
      'Advisor found in SEBI registry but currently suspended',
      'Previous disciplinary actions on record',
      'Verify current status before engaging'
    ],
    evidence: [
      'https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doRecognisedFpi=yes&intmId=13',
      'https://www.sebi.gov.in/'
    ],
    status: 'more_info',
    reported: true,
    anonymous: false,
    audit: [
      {
        action: 'more_info',
        actor: 'regulator_demo',
        ts: admin.firestore.Timestamp.fromDate(new Date('2024-01-15T16:30:00Z'))
      }
    ],
    timestamp: admin.firestore.Timestamp.fromDate(new Date('2024-01-15T13:20:00Z'))
  },
  {
    inputText: 'Consider investing in diversified mutual funds for long-term wealth creation',
    inputType: 'tip',
    verdict: 'LIKELY SAFE',
    confidence: 80,
    reasons: [
      'General investment advice without specific promises',
      'No pressure tactics or urgency',
      'Appropriate risk disclosure implied'
    ],
    evidence: [
      'https://www.sebi.gov.in/',
      'https://www.investor.gov/'
    ],
    status: 'false_alarm',
    reported: true,
    anonymous: true,
    audit: [
      {
        action: 'false_alarm',
        actor: 'regulator_demo',
        ts: admin.firestore.Timestamp.fromDate(new Date('2024-01-15T17:45:00Z'))
      }
    ],
    timestamp: admin.firestore.Timestamp.fromDate(new Date('2024-01-15T15:10:00Z'))
  },
  {
    inputText: 'Amit Patel',
    inputType: 'advisor',
    verdict: 'LIKELY SAFE',
    confidence: 88,
    reasons: [
      'Advisor found in SEBI registry',
      'Active status with good qualifications',
      'No disciplinary actions found'
    ],
    evidence: [
      'https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doRecognisedFpi=yes&intmId=13',
      'https://www.sebi.gov.in/'
    ],
    status: 'pending',
    reported: false,
    anonymous: false,
    timestamp: admin.firestore.Timestamp.fromDate(new Date('2024-01-15T18:00:00Z'))
  },
  {
    inputText: 'URGENT: Limited time offer - invest ₹50,000 and get ₹1,00,000 back in 30 days!',
    inputType: 'tip',
    verdict: 'HIGH RISK',
    confidence: 98,
    reasons: [
      'Classic Ponzi scheme indicators',
      'Uses urgency and pressure tactics',
      'Promises guaranteed 100% returns in 30 days'
    ],
    evidence: [
      'https://www.sebi.gov.in/',
      'https://www.investor.gov/',
      'https://www.rbi.org.in/'
    ],
    status: 'pending',
    reported: false,
    anonymous: true,
    timestamp: admin.firestore.Timestamp.fromDate(new Date('2024-01-15T19:30:00Z'))
  },
  {
    inputText: 'Priya Sharma',
    inputType: 'advisor',
    verdict: 'LIKELY SAFE',
    confidence: 92,
    reasons: [
      'Advisor found in SEBI registry',
      'Active status with excellent qualifications',
      'No disciplinary actions found'
    ],
    evidence: [
      'https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doRecognisedFpi=yes&intmId=13',
      'https://www.sebi.gov.in/'
    ],
    status: 'pending',
    reported: false,
    anonymous: false,
    timestamp: admin.firestore.Timestamp.fromDate(new Date('2024-01-15T20:15:00Z'))
  }
];

// Function to clear existing data
async function clearCollections() {
  console.log('🗑️  Clearing existing collections...');
  
  try {
    // Clear advisors collection
    const advisorsSnapshot = await db.collection('advisors').get();
    const advisorBatch = db.batch();
    advisorsSnapshot.docs.forEach((doc) => {
      advisorBatch.delete(doc.ref);
    });
    await advisorBatch.commit();
    console.log('✅ Cleared advisors collection');

    // Clear flags collection
    const flagsSnapshot = await db.collection('flags').get();
    const flagBatch = db.batch();
    flagsSnapshot.docs.forEach((doc) => {
      flagBatch.delete(doc.ref);
    });
    await flagBatch.commit();
    console.log('✅ Cleared flags collection');
  } catch (error) {
    console.error('❌ Error clearing collections:', error);
    throw error;
  }
}

// Function to seed advisors
async function seedAdvisors() {
  console.log('👥 Seeding advisors...');
  
  try {
    const batch = db.batch();
    
    advisors.forEach((advisor) => {
      const docRef = db.collection('advisors').doc();
      batch.set(docRef, {
        ...advisor,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });
    
    await batch.commit();
    console.log(`✅ Seeded ${advisors.length} advisors`);
  } catch (error) {
    console.error('❌ Error seeding advisors:', error);
    throw error;
  }
}

// Function to seed flags
async function seedFlags() {
  console.log('🚩 Seeding flags...');
  
  try {
    const batch = db.batch();
    
    flags.forEach((flag) => {
      const docRef = db.collection('flags').doc();
      batch.set(docRef, {
        ...flag,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });
    
    await batch.commit();
    console.log(`✅ Seeded ${flags.length} flags`);
  } catch (error) {
    console.error('❌ Error seeding flags:', error);
    throw error;
  }
}

// Function to create additional collections for future use
async function createAdditionalCollections() {
  console.log('📊 Creating additional collections...');
  
  try {
    // Create reports collection with sample data
    const reportsData = [
      {
        flagId: flags[2].inputText, // Reference to the fraud flag
        reportType: 'fraud_confirmed',
        description: 'Confirmed fraudulent investment scheme',
        severity: 'high',
        status: 'investigating',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    const reportsBatch = db.batch();
    reportsData.forEach((report) => {
      const docRef = db.collection('reports').doc();
      reportsBatch.set(docRef, report);
    });
    await reportsBatch.commit();
    console.log('✅ Created reports collection');

    // Create audit_logs collection
    const auditLogsData = [
      {
        action: 'system_startup',
        actor: 'system',
        details: 'FraudShield SEBI system initialized',
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    const auditBatch = db.batch();
    auditLogsData.forEach((log) => {
      const docRef = db.collection('audit_logs').doc();
      auditBatch.set(docRef, log);
    });
    await auditBatch.commit();
    console.log('✅ Created audit_logs collection');

  } catch (error) {
    console.error('❌ Error creating additional collections:', error);
    throw error;
  }
}

// Main seeding function
async function seedFirestore() {
  console.log('🌱 Starting Firestore seeding process...');
  console.log('Project ID:', admin.app().options.projectId);
  
  try {
    // Clear existing data
    await clearCollections();
    
    // Seed data
    await seedAdvisors();
    await seedFlags();
    await createAdditionalCollections();
    
    console.log('\n🎉 Firestore seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • ${advisors.length} advisors seeded`);
    console.log(`   • ${flags.length} flags seeded`);
    console.log(`   • Additional collections created`);
    console.log('\n🚀 Your FraudShield SEBI database is ready!');
    
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    // Close the admin app
    await admin.app().delete();
  }
}

// Run the seeding process
if (require.main === module) {
  seedFirestore();
}

module.exports = { seedFirestore, advisors, flags };
