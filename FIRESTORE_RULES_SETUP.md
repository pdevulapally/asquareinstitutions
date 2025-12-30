# Firestore Rules Setup Guide

## Quick Setup (Development/Testing)

Use the rules from `firestore.rules.txt` for development. These rules allow anyone to create contact submissions without authentication.

### Steps:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** > **Rules**
4. Copy the contents from `firestore.rules.txt`
5. Paste into the rules editor
6. Click **Publish**

## Production Setup

For production, use the rules from `firestore.rules.production.txt` which includes:
- Data validation
- Admin-only read/update/delete access
- Better security practices

### Setting Up Admin Users (Required for Production Rules)

To allow admins to read and write submissions, you need to set up admin users with custom claims:

**Option 1: Using Firebase Console (Manual)**
1. Go to **Authentication** > **Users** in Firebase Console
2. Find your admin user (or create one)
3. Note the User UID

**Option 2: Using Firebase Admin SDK (Recommended)**

Create a script to set admin custom claims:

```javascript
// admin-setup.js
const admin = require('firebase-admin');
const serviceAccount = require('./path-to-service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Set admin claim for a user
admin.auth().setCustomUserClaims('USER_UID_HERE', { admin: true })
  .then(() => {
    console.log('Admin claim set successfully');
  });
```

**Option 3: Using Firebase CLI**

```bash
firebase auth:export users.json
# Edit users.json to add admin claim, then:
firebase auth:import users.json
```

**Important**: After setting custom claims, users need to sign out and sign back in for the claims to take effect.

## Current Rules Explanation

### Development Rules (`firestore.rules.txt`)
- ✅ **Allow create**: Anyone can submit contact forms
- ❌ **Allow read**: No one can read (prevents unauthorized access)
- ❌ **Allow update/delete**: No one can modify (prevents data tampering)

### Production Rules (`firestore.rules.production.txt`)
- ✅ **Allow create**: Anyone can create/write messages (with data validation) - **No login required**
- ✅ **Allow read**: Only authenticated (logged-in) admin users can read submissions - **Login required**
- ✅ **Allow update/delete**: Only authenticated (logged-in) admin users can write/update/delete submissions - **Login required**

## Testing Your Rules

After updating rules:

1. Try submitting the contact form on your website
2. Check Firestore Database to see if the document was created
3. If you get permission errors, verify:
   - Rules are published (not just saved)
   - You're using the correct collection name (`contacts`)
   - Field names match what your form sends

## Common Issues

### "Missing or insufficient permissions"
- Make sure rules are **published** (not just saved)
- Check that the collection name matches (`contacts`)
- Verify the rule syntax is correct

### "Permission denied"
- Ensure `allow create: if true;` is present for the contacts collection
- Check that you're not trying to read/update/delete without proper permissions

## Need Help?

If you're still having issues:
1. Check the Firebase Console for error details
2. Verify your collection name is exactly `contacts`
3. Make sure you're testing with the published rules (not draft)

