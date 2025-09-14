# Firestore Seeding Scripts

This directory contains scripts to populate your Firestore database with sample data for development and testing.

## Prerequisites

1. **Firebase Admin SDK Service Account Key**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project (`fraudshield-sebi`)
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Download the JSON file and save it as `service-account-key.json` in the project root

2. **Install Dependencies**
   ```bash
   npm install
   ```

## Usage

### Seed Database with Sample Data
```bash
npm run seed
```

This will:
- Clear existing data from `advisors` and `flags` collections
- Insert 5 sample advisors with different statuses
- Insert 8 sample flags with various verdicts and statuses
- Create additional collections (`reports`, `audit_logs`)

### Clear Database Only
```bash
npm run seed:clear
```

This will only clear the existing data without inserting new records.

## Sample Data Included

### Advisors (5 records)
- **Dr. Rajesh Kumar** - Active Investment Advisor
- **Priya Sharma** - Active Portfolio Manager  
- **Amit Patel** - Active Research Analyst
- **Sunita Reddy** - Suspended Investment Advisor
- **Vikram Singh** - Active Investment Advisor

### Flags (8 records)
- **High Risk Tips** - Fraudulent investment schemes
- **Advisor Verifications** - SEBI registry checks
- **Safe Investment Advice** - Legitimate recommendations
- **Various Statuses** - pending, fraud, false_alarm, more_info

## Data Structure

### Advisors Collection
```javascript
{
  name: string,
  sebiRegistrationNumber: string,
  registrationDate: string,
  status: 'ACTIVE' | 'SUSPENDED' | 'CANCELLED',
  category: string,
  address: string,
  phone: string,
  email: string,
  qualifications: string[],
  experience: string,
  specializations: string[]
}
```

### Flags Collection
```javascript
{
  inputText: string,
  inputType: 'advisor' | 'tip' | 'link',
  verdict: 'HIGH RISK' | 'WATCH' | 'LIKELY SAFE',
  confidence: number,
  reasons: string[],
  evidence: string[],
  status: 'pending' | 'fraud' | 'false_alarm' | 'more_info',
  reported: boolean,
  anonymous: boolean,
  audit?: Array<{action, actor, ts}>
}
```

## Troubleshooting

### Service Account Key Issues
- Ensure the JSON file is named exactly `service-account-key.json`
- Place it in the project root directory
- Verify the project ID matches your Firebase project

### Permission Issues
- Ensure the service account has Firestore read/write permissions
- Check that your Firebase project has Firestore enabled

### Connection Issues
- Verify your internet connection
- Check that your Firebase project is active
- Ensure Firestore is enabled in your Firebase project

## Customization

To modify the sample data:
1. Edit the `advisors` and `flags` arrays in `seedFirestore.js`
2. Run `npm run seed` to apply changes
3. The script will clear existing data and insert the new data

## Security Note

⚠️ **Never commit `service-account-key.json` to version control!**

Add it to your `.gitignore`:
```
service-account-key.json
```
