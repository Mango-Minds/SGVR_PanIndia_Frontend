# App Store Content Rating Questionnaire Guide

This guide helps you answer the App Store Connect content rating questions for "Indiyoura" app based on the app's actual features.

## In-App Controls

### Parental Controls
**Answer: No**

**Explanation**: The app does not include built-in settings or tools that allow parents/guardians to monitor, manage, or restrict a child's access to in-app content or features. Users manage their own accounts, but there are no specific parental control features.

**What this means**: This is fine for most apps. Parental controls are typically only needed for apps specifically designed for children or family use.

---

### Age Assurance
**Answer: No**

**Explanation**: The app does not have a mechanism to confirm an individual's age meets age requirements for accessing specific content or services. While users create accounts, there's no age verification system in place.

**What this means**: This is acceptable for general audience apps. Age assurance is typically required for apps with age-restricted content (18+, gambling, etc.).

---

## Capabilities

### Unrestricted Web Access
**Answer: No**

**Explanation**: The app does NOT allow users to navigate to any webpage within the app or freely browse the web. While the app may open specific URLs using `Linking.openURL()` for things like:
- External links shared in posts
- Business websites
- Support URLs

These are controlled links opened in the device's default browser, not an unrestricted web browser within the app itself.

**What this means**: This is good for content rating - unrestricted web access can increase the age rating.

---

### User-Generated Content
**Answer: Yes**

**Explanation**: The app includes broad distribution of content created by users as a core component of the app's intended user experience. Features include:

- **Social Media Posts**: Users can create posts with text, images, videos, and backgrounds
- **Comments**: Users can comment on posts
- **User Profiles**: Users create and customize their profiles
- **Reposts**: Users can repost content with their own thoughts
- **Hashtags and Tags**: Users can tag other users and use hashtags
- **Location Sharing**: Users can add location information to posts
- **Matrimony Profiles**: Users create detailed matrimony profiles
- **Business Listings**: Users (business owners) create shop/vendor listings

**What this means**: 
- You'll need content moderation policies
- You should have reporting mechanisms (which the app has - I saw report functionality)
- This may affect the age rating slightly, but is common for social apps

---

### Messaging and Chat
**Answer: Yes**

**Explanation**: Users can directly communicate with one another through features within the app. The app includes:

- **Direct Messaging**: One-on-one chat between users
- **Group Chat**: Group messaging functionality
- **Real-time Messaging**: Socket.io-based real-time chat
- **Media Sharing**: Users can send images and videos in messages
- **Chat Rooms**: Persistent chat rooms for conversations

**What this means**:
- You'll need to ensure safe communication features
- Consider implementing blocking/reporting for inappropriate messages
- This is common for social apps and shouldn't significantly impact rating

---

### Advertising
**Answer: Yes**

**Explanation**: The app includes paid promotion of products or services within the app. Evidence found:

- **Banner Ads**: Promotional banners displayed in various screens (e.g., matrimony screen)
- **Ad API Endpoint**: `/ad/ads-for-user` endpoint that serves ads
- **Promotional Content**: Business listings and featured shops can be considered promotional
- **Subscription Promotions**: Premium subscription offers and promotional codes

**What this means**:
- You'll need to disclose this in your privacy policy
- Ensure ads comply with App Store guidelines
- Consider age-appropriate ad content
- This is very common and shouldn't significantly impact rating

---

## Summary of Answers

| Question | Answer | Notes |
|----------|--------|-------|
| **Parental Controls** | **No** | No built-in parental control features |
| **Age Assurance** | **No** | No age verification mechanism |
| **Unrestricted Web Access** | **No** | No in-app web browser |
| **User-Generated Content** | **Yes** | Core feature - posts, comments, profiles |
| **Messaging and Chat** | **Yes** | Direct messaging and group chat |
| **Advertising** | **Yes** | Banner ads and promotional content |

---

## Expected Age Rating Impact

Based on these answers:

- **User-Generated Content**: May require 12+ or 17+ rating depending on moderation
- **Messaging**: May require 12+ or 17+ rating
- **Advertising**: Usually doesn't increase rating significantly
- **No Unrestricted Web Access**: Good - keeps rating lower
- **No Age Assurance**: Fine for general audience apps

**Expected Rating**: Likely **12+** or **17+** depending on:
- How strict your content moderation is
- Whether you allow mature content in user posts
- Whether messaging is moderated

---

## Recommendations

### Before Submission:

1. **Content Moderation**:
   - Ensure you have reporting mechanisms (you do - I saw report functionality)
   - Consider implementing content filters for inappropriate language
   - Have clear community guidelines

2. **Privacy Policy**:
   - Disclose user-generated content collection
   - Disclose messaging/chat data collection
   - Disclose advertising practices
   - Explain how user content is moderated

3. **Safety Features**:
   - Ensure blocking/reporting works properly
   - Consider adding safety tips for users
   - Make reporting easily accessible

4. **Age Rating Justification**:
   - Be prepared to explain your content moderation approach
   - If targeting 12+, ensure no mature content is accessible
   - If targeting 17+, you can allow more mature discussions

---

## Additional Questions You May Encounter

After answering these, Apple may ask follow-up questions about:

- **Content Moderation**: How do you moderate user-generated content?
- **Reporting**: How do users report inappropriate content?
- **Blocking**: Can users block other users?
- **Privacy**: How is messaging data handled?
- **Advertising**: What types of ads are shown?

**Be prepared to answer**:
- ✅ Yes, users can report content (you have report functionality)
- ✅ Yes, users can block other users (I saw blockedUsers in chat schema)
- ✅ Content moderation through reporting and review
- ✅ Ads are for businesses/services relevant to the community

---

## Content Frequency Questions

### Mature Themes

#### Profanity or Crude Humor
**Recommended Answer: Infrequent**

**Explanation**: 
- The app allows user-generated content (posts, comments, messages) without automated profanity filters
- Users can post text content freely
- There is a reporting mechanism for inappropriate content
- The app is focused on cultural, community, and business content (temples, matrimony, shops)
- While profanity could occur in user posts, it's not the intended purpose of the app
- Content moderation relies on user reporting rather than automated filtering

**Considerations**:
- If you have strict moderation and remove profanity quickly → **Infrequent**
- If you have no moderation and profanity appears regularly → **Frequent**
- If you filter profanity automatically → **None**

**Recommendation**: Answer **Infrequent** if you:
- Have content moderation in place
- Remove reported inappropriate content
- Have community guidelines prohibiting profanity
- Monitor and moderate user content

---

#### Horror/Fear Themes
**Recommended Answer: None**

**Explanation**:
- The app focuses on cultural, community, business, and lifestyle content
- Features include: temples, matrimony, social networking, business listings, jobs, properties
- No horror, scary, or fear-inducing content is part of the app's design or features
- User-generated content is primarily about community, culture, shopping, and connections
- No horror-themed content, games, or stories

**Recommendation**: Answer **None** - The app has no horror or fear themes.

---

#### Alcohol, Tobacco, or Drug Use or References
**Recommended Answer: None** (or **Infrequent** if users occasionally mention these)

**Explanation**:
- The app is focused on cultural, community, and business content
- No alcohol, tobacco, or drug-related features or content in the app design
- One reference found: "wine" icon name in matrimony profile (just an icon, not content about alcohol)
- User-generated content could potentially mention these, but it's not part of the app's intended purpose
- Categories include: temples, matrimony, shops, jobs, properties, social posts - none related to substances

**Considerations**:
- If users never post about alcohol/tobacco/drugs → **None**
- If users occasionally mention these in posts/comments → **Infrequent**
- If the app has features promoting or selling these → **Frequent**

**Recommendation**: 
- Answer **None** if you moderate content and remove such references
- Answer **Infrequent** if you allow occasional mentions but don't promote them

---

## Summary of Content Frequency Answers

| Content Type | Recommended Answer | Reasoning |
|--------------|-------------------|-----------|
| **Profanity or Crude Humor** | **Infrequent** | User-generated content without automated filtering, but app focuses on cultural/community content |
| **Horror/Fear Themes** | **None** | No horror content in app design or features |
| **Alcohol, Tobacco, or Drug Use** | **None** or **Infrequent** | Not part of app's intended content, but users might occasionally mention |

---

## Notes

- These answers are based on the current codebase analysis
- If you've added features since, update accordingly
- Be honest in your answers - Apple reviews apps and can reject if answers don't match functionality
- You can always update these answers later if features change
- **Important**: Consider your actual content moderation practices when answering

---

## Quick Reference Checklist

Before submitting, ensure:

- [ ] Content moderation policy is documented
- [ ] Reporting mechanism is functional
- [ ] Blocking mechanism is functional
- [ ] Privacy policy mentions user-generated content
- [ ] Privacy policy mentions messaging/chat
- [ ] Privacy policy mentions advertising
- [ ] Community guidelines are clear
- [ ] Age rating matches your content policies
