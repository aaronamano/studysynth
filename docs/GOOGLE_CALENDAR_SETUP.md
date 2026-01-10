# Google Calendar Integration Setup Guide

This guide explains how to set up the Google Calendar integration for StudySynth.

## Environment Variables

Add the following environment variables to your `.env` file:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/google-calendar/callback
```

## Google Cloud Console Setup

1. **Go to Google Cloud Console**: https://console.cloud.google.com/

2. **Create a new project** or select an existing one

3. **Enable Google Calendar API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

4. **Create OAuth 2.0 Credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Select "Web application" as the application type
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/google-calendar/callback`
     - `https://yourdomain.com/api/google-calendar/callback` (for production)

5. **Get Credentials**:
   - Copy the Client ID and Client Secret
   - Add them to your `.env` file

## Features

- **OAuth Authentication**: Users can authenticate with their Google Account
- **Event Sync**: Events can be synced between local calendar and Google Calendar
- **Two-way Sync**: 
  - Local events can be pushed to Google Calendar
  - Google Calendar events are displayed in the local calendar
- **Event Management**: Create, update, and delete events across both platforms
- **Visual Distinction**: Google Calendar events are shown in blue with a "G" indicator

## API Endpoints

### Authentication
- `GET /api/google-calendar/auth` - Get Google OAuth URL
- `GET /api/google-calendar/callback` - OAuth callback handler

### Status & Management
- `GET /api/google-calendar/status` - Check connection status
- `DELETE /api/google-calendar/status` - Disconnect Google Calendar

### Events
- `GET /api/google-calendar/events` - Get Google Calendar events
- `POST /api/google-calendar/events` - Create Google Calendar event
- `PUT /api/google-calendar/events` - Update Google Calendar event
- `DELETE /api/google-calendar/events` - Delete Google Calendar event

### Sync (Enhanced Local Endpoints)
- `GET /api/calendar/sync-events` - Get both local and Google events
- `POST /api/calendar/sync-events` - Create event with optional Google sync

## Usage

1. **Connect Google Calendar**:
   - Click "Connect" in the Google Calendar Integration card
   - Authenticate with Google in the popup window
   - Grant calendar permissions

2. **Sync Events**:
   - Check "Sync to Google Calendar" when creating new events
   - Events will appear in both local and Google Calendar
   - Google Calendar events will appear automatically in the local calendar

3. **Manage Connection**:
   - View connection status in the integration card
   - Disconnect anytime to stop syncing

## Security Considerations

- OAuth 2.0 flow ensures secure authentication
- Refresh tokens are stored securely in the database
- Access tokens have limited lifetime and are refreshed automatically
- User authentication is required for all calendar operations

## Google OAuth Verification Process

### Understanding the Error
When you see "studysynth has not completed the Google verification process", it means:
- Your app is in **testing mode** (not verified by Google)
- Only users you explicitly add as **test users** can access it
- This is normal during development

### Two Solutions:

#### Option 1: Keep App in Testing Mode (Recommended for Development)
1. **Go to Google Cloud Console → APIs & Services → OAuth consent screen**
2. **Add Test Users**:
   - Under "Test users", click "+ Add Users"
   - Add the Gmail addresses of users who need to test
   - Only these users can authenticate with your app

3. **Update Publishing Status**:
   - Ensure "Publishing status" is set to "Testing"
   - This allows unlimited test users

#### Option 2: Submit for Google Verification (For Production)
1. **Complete OAuth Consent Screen**:
   - Add app logo, privacy policy URL, terms of service URL
   - Provide detailed app description
   - Add authorized domains

2. **Submit for Verification**:
   - Go to "Publishing App" → "Verify App"
   - Google will review your app (takes 3-7 days)
   - Required for public access

### Quick Fix for Current Development:
Add test users in Google Console:
1. Navigate to: https://console.cloud.google.com/apis/credentials/consent
2. Select your OAuth consent screen
3. Scroll to "Test users" section
4. Click "+ Add Users" 
5. Add the Gmail addresses that need access
6. Save changes

### Important Notes:
- Testing mode supports up to 100 test users
- Users must be logged into the exact Gmail address added
- Production deployment requires full Google verification
- During development, testing mode is perfectly fine

## Troubleshooting

1. **"Invalid redirect URI" error**: Ensure the redirect URI in Google Console matches your environment variable exactly
2. **"Access denied"**: Add user as test user in OAuth consent screen
3. **"Token expired"**: The system handles token refresh automatically
4. **"Calendar not connected"**: User needs to authenticate through the OAuth flow
5. **"Permission denied"**: Ensure Google Calendar API is enabled and correct scopes are granted
6. **"App not verified"**: Add users as test users or submit for verification