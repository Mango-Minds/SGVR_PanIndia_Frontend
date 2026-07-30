# How to Create an App in App Store Connect

This guide provides step-by-step instructions for creating a new app in App Store Connect with bundle identifier `com.inbharat.app`.

## Prerequisites

- Active Apple Developer Program membership ($99/year)
- Apple ID with access to App Store Connect: `sgvrtechios@gmail.com`
- Apple Team ID: `3W2M23K7G4`
- Bundle identifier ready: `com.inbharat.app`

## Step-by-Step Instructions

### Step 1: Access App Store Connect

1. Open your web browser and navigate to [App Store Connect](https://appstoreconnect.apple.com)
2. Sign in with your Apple ID (`sgvrtechios@gmail.com`)
3. Enter your password and complete two-factor authentication if prompted
4. You should see the App Store Connect dashboard

### Step 2: Navigate to My Apps

1. Click on **"My Apps"** in the top navigation bar
2. You'll see a list of your existing apps (if any)
3. If this is your first app, the list will be empty

### Step 3: Create New App

1. Click the blue **"+"** button in the top-left corner (or click **"Create App"** button if visible)
2. A modal/form will appear titled "New App"

### Step 4: Fill in App Information

Fill in the following required fields in the form:

#### Platform
- Select **"iOS"** (or "iOS, tvOS" if you plan to support Apple TV)

#### Name
- Enter: **"Indiyoura"**
- This is the display name shown in the App Store
- Maximum 30 characters
- Can be changed later, but it's better to set it correctly now

#### Primary Language
- Select your primary language (e.g., **English**)
- This determines the default language for your app listing
- You can add more languages later

#### Bundle ID
You have two options:

**Option A: Bundle ID Already Exists**
- If `com.inbharat.app` already exists in your Apple Developer account:
  - Select it from the dropdown menu

**Option B: Register New Bundle ID**
- If the bundle ID doesn't exist:
  - Click **"Register a new Bundle ID"** or **"Register"** link
  - You'll be redirected to register it first (see Step 5)

#### SKU (Stock Keeping Unit)
- Enter a unique identifier for your internal tracking
- Examples:
  - `inbharat-ios-001`
  - `inbharat-app-2025`
  - `com-inbharat-app-ios`
- **Important**: 
  - Must be unique across all your apps
  - Cannot be changed after creation
  - Used only for your internal tracking

#### User Access (Optional)
- **Full Access**: Full control over the app
- **App Manager**: Limited access (if you're setting up for a team)

### Step 5: Register Bundle ID (If Needed)

If you need to register the bundle ID first:

1. **Go to Apple Developer Portal**:
   - Navigate to [Apple Developer Portal](https://developer.apple.com/account/resources/identifiers/list)
   - Or click the link provided in App Store Connect

2. **Create New Identifier**:
   - Click the **"+"** button in the top-left corner
   - Select **"App IDs"** → Click **"Continue"**

3. **Select App Type**:
   - Select **"App"** → Click **"Continue"**

4. **Fill in Bundle ID Details**:
   - **Description**: Enter "Indiyoura iOS App"
   - **Bundle ID**: 
     - Select **"Explicit"**
     - Enter: `com.inbharat.app`

5. **Select Capabilities** (if needed):
   - Check the capabilities your app requires:
     - ✅ Push Notifications (if using)
     - ✅ In-App Purchase (if using)
     - ✅ Associated Domains (if using)
     - ✅ Sign in with Apple (if using)
     - ✅ Background Modes (if using)
   - For most apps, you can leave these unchecked and add them later

6. **Register**:
   - Click **"Continue"**
   - Review the information
   - Click **"Register"**
   - Wait for confirmation

7. **Return to App Store Connect**:
   - Go back to App Store Connect
   - Refresh the Bundle ID dropdown
   - Select `com.inbharat.app` from the list

### Step 6: Complete App Creation

1. **Review All Information**:
   - Double-check:
     - Name: "Indiyoura"
     - Bundle ID: `com.inbharat.app`
     - SKU: Your chosen SKU
     - Platform: iOS

2. **Create App**:
   - Click the **"Create"** button at the bottom right
   - Wait a few seconds for the app to be created

### Step 7: Note Your App Information

After successful creation, you'll be redirected to your app's page. Note the following:

#### App ID (ASC App ID)
- This is a **numeric ID** (e.g., `1234567890`)
- Found at the top of the app page or in the URL
- **IMPORTANT**: Save this number - you'll need it for `eas.json`

#### Other Information Visible:
- **App Name**: "Indiyoura"
- **Bundle ID**: `com.inbharat.app`
- **Status**: "Prepare for Submission" (initially)

### Step 8: Update EAS Configuration

After creating the app, update your `eas.json` file:

**File**: `SGVR_PanIndia_Frontend/eas.json`

Update the `ascAppId` in the submit configuration:

```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "sgvrtechios@gmail.com",
        "ascAppId": "YOUR_NEW_APP_ID_HERE",  // Replace with the numeric App ID from Step 7
        "appleTeamId": "3W2M23K7G4"
      }
    }
  }
}
```

### Step 9: Initial App Setup

After creation, your app will be in "Prepare for Submission" status. You can now:

1. **App Information**:
   - Add app description
   - Set category
   - Add keywords
   - Set support URL

2. **Pricing and Availability**:
   - Set price (Free or Paid)
   - Select countries/regions

3. **App Privacy**:
   - Complete privacy questionnaire
   - Add privacy policy URL (required)

4. **App Store Listing**:
   - Upload app icon (1024x1024px)
   - Upload screenshots
   - Add promotional text (170 characters max)
   - Add description (4,000 characters max)
   - Add keywords (100 characters max, comma-separated)
   - See `APP_STORE_LISTING_CONTENT.md` for templates and guidelines

5. **App Review Information**:
   - Add contact information
   - Provide demo account (if needed)
   - Add review notes

## Troubleshooting

### Issue: "Bundle ID already exists"
**Solution**: The bundle ID is already registered. Select it from the dropdown instead of creating a new one.

### Issue: "SKU already in use"
**Solution**: Choose a different SKU. It must be unique across all your apps.

### Issue: "You don't have permission"
**Solution**: 
- Ensure you're signed in with the correct Apple ID
- Verify your Apple Developer Program membership is active
- Check that your account has the necessary permissions

### Issue: Can't find Bundle ID in dropdown
**Solution**:
- Ensure the bundle ID is registered in Apple Developer Portal first
- Refresh the page
- Wait a few minutes if you just registered it

## Next Steps

After creating the app:

1. ✅ Update `eas.json` with the new ASC App ID
2. ✅ Complete app information in App Store Connect
3. ✅ Prepare screenshots and app assets
4. ✅ Build your app using EAS: `eas build --platform ios --profile production`
5. ✅ Submit for review: `eas submit --platform ios --profile production`

## Additional Resources

- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [Apple Developer Portal](https://developer.apple.com/account)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

## Quick Reference

- **App Store Connect**: https://appstoreconnect.apple.com
- **Apple Developer Portal**: https://developer.apple.com/account
- **Bundle ID**: `com.inbharat.app`
- **App Name**: "Indiyoura"
- **Apple ID**: sgvrtechios@gmail.com
- **Team ID**: 3W2M23K7G4
