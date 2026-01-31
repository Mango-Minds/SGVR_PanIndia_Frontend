# Share Functionality Documentation

## Overview
The In Bharat app now uses URL-based sharing instead of sending notifications to friends. This approach is more scalable and allows users to share content across different platforms.

## Features

### 1. URL Generation
- **Base URL**: `https://me-maratha.com/share`
- **Unique URLs**: Each share generates a unique URL with timestamp and random ID
- **Content Types**: Supports posts, events, profiles, and general content

### 2. Share Options
- **Share via App**: Uses React Native's Share API to open native share sheet
- **Copy Link**: Copies the generated URL to clipboard
- **Share with Friends**: Select friends and share URL (placeholder for future implementation)

### 3. Content Types Supported

#### Posts
```
https://me-maratha.com/share/post/{postId}?ref={randomId}&t={timestamp}&userId={userId}&preview={contentPreview}
```

#### Events
```
https://me-maratha.com/share/event/{eventId}?ref={randomId}&t={timestamp}&name={eventName}&location={location}&organizer={organizer}
```

#### Profiles
```
https://me-maratha.com/share/profile/{userId}?ref={randomId}&t={timestamp}&username={username}&name={fullName}
```

## Usage

### Using ShareModal Component

```javascript
import ShareModal from '../components/modals/ShareModal';

// In your component
<ShareModal 
  slideUpRef={shareRef} 
  friends={friendsList}
  shareData={{
    type: 'post', // 'post', 'event', 'profile', or 'content'
    postId: 'unique-post-id',
    userId: 'user-id',
    content: 'Post content preview',
    title: 'Share Title',
    message: 'Custom share message'
  }}
/>
```

### Using Utility Functions

```javascript
import { generateShareUrl, generateEventShareUrl, generatePostShareUrl } from '../utils/shareUtils';

// Generate custom share URL
const url = generateShareUrl('post', 'post-id', { userId: 'user-id' });

// Generate event share URL
const eventUrl = generateEventShareUrl({
  eventName: 'Event Name',
  eventId: 'event-id',
  location: 'Event Location',
  organizer: 'Organizer Name'
});

// Generate post share URL
const postUrl = generatePostShareUrl({
  postId: 'post-id',
  userId: 'user-id',
  content: 'Post content'
});
```

## Implementation Examples

### 1. Events Navigator
The events navigator now includes a share button in the header that generates event-specific URLs.

### 2. Social Posts
Social posts can be shared using the ShareModal with post-specific data.

### 3. User Profiles
User profiles can be shared with profile-specific URLs.

## Dependencies

- `expo-clipboard`: For copying URLs to clipboard
- `react-native`: For native share functionality
- `react-native-raw-bottom-sheet`: For modal presentation

## Installation

```bash
npm install expo-clipboard@~5.0.1
```

## Future Enhancements

1. **Deep Linking**: Implement deep linking to handle shared URLs when app is opened
2. **Analytics**: Track share analytics and engagement
3. **Custom Domains**: Support for custom share domains
4. **Rich Previews**: Add Open Graph meta tags for rich link previews
5. **Friend Sharing**: Implement actual friend-to-friend sharing via chat or notifications

## Error Handling

The share functionality includes comprehensive error handling:
- Try-catch blocks around all share operations
- User-friendly error messages
- Fallback options when sharing fails
- Console logging for debugging

## Testing

To test the share functionality:
1. Open any screen with share functionality
2. Tap the share button
3. Choose "Share via App" or "Copy Link"
4. Verify the generated URL format
5. Test sharing on different platforms (WhatsApp, Messages, etc.)
