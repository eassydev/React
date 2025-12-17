/**
 * Verify that all B2B Analytics functions are properly exported
 * Run this script to check if the exports exist in api.tsx
 */

const fs = require('fs');
const path = require('path');

const apiFilePath = path.join(__dirname, 'src', 'lib', 'api.tsx');

console.log('🔍 Verifying B2B Analytics exports in api.tsx...\n');

// Read the file
const fileContent = fs.readFileSync(apiFilePath, 'utf8');

// Functions to check
const functionsToCheck = [
  'getB2BAnalyticsDashboard',
  'getB2BCustomerAnalytics',
  'getB2BCustomerTrends',
  'updateB2BOrderRemarks'
];

// Interfaces to check
const interfacesToCheck = [
  'B2BDashboardData',
  'B2BCustomerAnalyticsData',
  'B2BCustomerTrendsData'
];

let allFound = true;

console.log('📦 Checking Functions:\n');
functionsToCheck.forEach(funcName => {
  const regex = new RegExp(`export\\s+const\\s+${funcName}\\s*=`, 'g');
  const found = regex.test(fileContent);
  
  if (found) {
    console.log(`✅ ${funcName} - FOUND`);
  } else {
    console.log(`❌ ${funcName} - NOT FOUND`);
    allFound = false;
  }
});

console.log('\n📋 Checking Interfaces:\n');
interfacesToCheck.forEach(interfaceName => {
  const regex = new RegExp(`export\\s+interface\\s+${interfaceName}`, 'g');
  const found = regex.test(fileContent);
  
  if (found) {
    console.log(`✅ ${interfaceName} - FOUND`);
  } else {
    console.log(`❌ ${interfaceName} - NOT FOUND`);
    allFound = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allFound) {
  console.log('✅ ALL EXPORTS VERIFIED SUCCESSFULLY!');
  console.log('\nThe functions are properly exported in api.tsx.');
  console.log('If you\'re still getting errors, it\'s a Vercel cache issue.');
  console.log('\nNext steps:');
  console.log('1. Commit and push changes: git add . && git commit -m "Update analytics" && git push');
  console.log('2. Go to Vercel Dashboard → Settings → Clear Build Cache');
  console.log('3. Redeploy without using existing cache');
  console.log('4. Clear browser cache (Ctrl+Shift+R)');
  process.exit(0);
} else {
  console.log('❌ SOME EXPORTS ARE MISSING!');
  console.log('\nPlease check the api.tsx file and ensure all functions are exported.');
  process.exit(1);
}

