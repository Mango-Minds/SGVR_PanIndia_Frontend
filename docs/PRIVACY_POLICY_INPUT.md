# Privacy Policy – Information for Professional Drafting

This document summarizes what the PanIndia (SGVR) app collects, where users pay, and related technical context. Use it as input for a lawyer or privacy professional to draft the privacy policy.

---

## 1. Places Where Users Pay

| Area | What users pay for | How it works today | Notes |
|------|--------------------|--------------------|--------|
| **Matrimony subscription** | Premium plans (e.g. Premium ₹999, Basic ₹499; unlimited profiles, advanced search, priority support) | User selects plan in app → optional coupon → backend creates subscription. **No card/bank payment in app**; backend sets `paymentStatus: 'completed'`. | [matrimonySubscription.js](../../SGVR_PanIndia_Backend/router/subscription/matrimonySubscription.js), [PremiumSubscriptionModal.jsx](src/components/modals/PremiumSubscriptionModal.jsx) |
| **Real Estate subscription** | Subscription to create and manage property listings (B2C) | Same flow: choose plan → optional coupon (e.g. 100% off) → subscribe. **No payment gateway**; subscription is created as completed. | [realEstateSubscription.js](../../SGVR_PanIndia_Backend/router/subscription/realEstateSubscription.js), [RealEstateSubscriptionModal.jsx](src/components/modals/RealEstateSubscriptionModal.jsx) |
| **Jewellery subscription** | Premium access (e.g. verified shops, contact details, support). Plans in UI: Monthly ₹99, Quarterly ₹299, Yearly ₹1999 | Frontend calls `/api/subscriptions/plans` and `/api/subscriptions/subscribe`. **No payment gateway** in current backend. | [jewellery.services.js](src/services/jewellery.services.js), [PremiumAccessScreen.jsx](src/features/jewellery/PremiumAccessScreen.jsx) |
| **Temple event booking** | Booking a slot for a temple event | User books a slot; booking is stored with status `pending`. **No payment flow** in code. | [eventBooking.js](../../SGVR_PanIndia_Backend/router/temple/eventBooking.js), [eventBooking.js](../../SGVR_PanIndia_Backend/Models/temple/eventBooking.js) |

**Planned (not implemented):** Architecture doc [LogoIP-Dev-Workflow.md](../LogoIP-Dev-Workflow.md) describes future payment flow: Razorpay/Stripe, `POST /api/payments/initiate` (orderId, paymentKey), checkout modal, then `POST /api/payments/verify` webhook. No such routes exist in the backend today.

**Important for policy:** Today, **no card/bank or UPI details** are collected in-app. Subscription "payment" is plan + optional coupon; if real money is taken offline or will be added via gateway later, the policy should say so and cover future payment data (e.g. last 4 digits, transaction id, billing details if collected).

---

## 2. Data Collected From Users

### 2.1 Account and profile (registration / profile)

- **Source:** [user.js](../../SGVR_PanIndia_Backend/Models/users/user.js), [user.js](../../SGVR_PanIndia_Backend/router/user/user.js) (register/update).
- **Collected:** First name, last name, email (required), phone, date of birth, gender, state, city, pincode, address, profile image, password (hashed). User type (e.g. basicUser, templeAdmin, pandit, matrimonyMan/Woman, planner, decorator, caterer, venue, vendor, shop, worker, jewelryDesigner, gemologist). OTP and verification status; refresh token; blocked users; onboarding flags (matrimony, temple, jewelry).

### 2.2 Matrimony profile

- **Source:** [matrimonyUser.js](../../SGVR_PanIndia_Backend/Models/matrimony/matrimonyUser.js).
- **Collected:** Name, gender, age, photos, "about me", annual income (with visibility flag), caste/subcaste, gothra, dosh, family type/status/values, work location, hometown, highest education, employed in, occupation, hobbies, languages (with proficiency), height, blood group, marital status, date of birth. Social links: Instagram, WhatsApp, LinkedIn (with visibility). Connections to other matrimony profiles.

### 2.3 Subscriptions and payments (current)

- **Source:** [userSubscription.js](../../SGVR_PanIndia_Backend/Models/subscription/userSubscription.js).
- **Collected:** User id, plan name, price, original price, discount, coupon code, start/end dates, active flag, **payment status** (pending/completed/failed/refunded), **payment id** (field exists; not set by gateway currently), feature flags.

### 2.4 B2C listings (e.g. Real Estate, Furniture, Vehicles, Food)

- **Source:** [listing.js](../../SGVR_PanIndia_Backend/Models/b2c/listing.js).
- **Collected:** Listing name, description, price, original price, images/videos/documents, seller name, **phone**, **email**, category/subcategory, address, map link. Category-specific: e.g. property type, bedrooms, bathrooms, area, furnished, floor (Real Estate); mileage, year, fuel, transmission (Vehicles); expiry, weight (Food). Reports on listings: reporter user id, reason, date.

### 2.5 Report an issue / feedback

- **Source:** [reportissue.screen.js](src/features/reportissue.screen.js), [auth.service.js](src/services/auth.service.js) (`reportIssue`), [report.js](../../SGVR_PanIndia_Backend/Models/report/report.js), [user.js](../../SGVR_PanIndia_Backend/router/user/user.js) (`POST /report`).
- **Collected:** User id (from auth), **description** (free text), **problem type** (Bug, Feedback, Feature Request, Other). Frontend also supports child-safety report categories; the category is included in the description and problemType is sent as "Other". The frontend calls `POST /api/user/report` with `description` and `problemType`; the backend stores these and returns success or error.

### 2.6 Temple event booking

- **Source:** [eventBooking.js](../../SGVR_PanIndia_Backend/Models/temple/eventBooking.js), [eventBooking.js](../../SGVR_PanIndia_Backend/router/temple/eventBooking.js).
- **Collected:** User id, event id, slot id, booking status (pending/accepted/rejected).

### 2.7 Social / content and reports

- Posts, comments, reactions, follow graph, moments, jobs, notifications (see social models and [postSchema.js](../../SGVR_PanIndia_Backend/Models/social/postSchema.js)).
- **Post reports:** Reporter user id, reason. **Listing reports:** Reporter user id, reason.

### 2.8 Contact Us

- **Source:** [contactus.screen.js](src/features/contactus.screen.js).
- No in-app form that submits to backend; contact is via **email** (e.g. child safety: [constants.js](src/infrastructure/constants.js) `CHILD_SAFETY_EMAIL`). No structured data stored from "Contact Us" in backend.

---

## 3. Storage and Third-Party Services

- **Database:** User and subscription data stored in MongoDB (see models above).
- **File storage:** AWS S3 used for user uploads (e.g. profile images) in [user.js](../../SGVR_PanIndia_Backend/router/user/user.js) (S3Client, multer-s3). Local multer used for generic `/api/upload` (e.g. [ShopEventCreate.jsx](src/features/jewellery/ShopEventCreate.jsx)).
- **SMS/OTP:** Twilio (account SID, auth token in env) in [user.js](../../SGVR_PanIndia_Backend/router/user/user.js).
- **Translation:** Translation API used (e.g. [translate.js](../../SGVR_PanIndia_Backend/router/translate/translate.js)); may send user-generated or app content for translation.
- **Existing policy text** ([privacypolicy.screen.js](src/features/privacypolicy.screen.js)) already mentions: Google Analytics, Google Webmaster, browser cookies, web beacons, and third-party social media (name/email if you use integrated social features). Confirm which of these are actually in use in the live app/build.

---

## 4. Child Safety

- Dedicated child safety contact and standards: [constants.js](src/infrastructure/constants.js) (`CHILD_SAFETY_EMAIL`, `CHILD_SAFETY_STANDARDS_URL`). Report screen allows reporting child-safety concerns; description (and category) are submitted like other reports. Policy should cover how child-safety reports are handled and any special retention/sharing.

---

## 5. Other Information to Share With the Drafter

- **Jurisdiction / domain:** Production API: `https://in-bharat.com`; app may target Pan-India users.
- **Existing policy:** In-app privacy policy at [privacypolicy.screen.js](src/features/privacypolicy.screen.js) already describes contact info, demographic info, IP/browser, tracking, and use of data (marketing, security, etc.). New policy should align with **actual** data flows above (e.g. no "tickets you buy" if no ticket purchase; clarify subscriptions and future payments).
- **Reports:** The frontend calls `POST /api/user/report` with `description` and `problemType` (Bug, Feedback, Feature Request, Other); the backend stores reports and returns success or error. Child-safety reports use problemType "Other" with the category in the description.
- **Payment disclosure:** If subscriptions are currently free (coupon-only) or paid outside the app, say so. When Razorpay/Stripe (or similar) is added, policy must cover payment data (what is collected, who processes it, retention, PCI/security).

---

## 6. Summary Checklist for the Professional

- **Payment:** Matrimony, Real Estate, and Jewellery **subscriptions**; Temple **event booking** (no payment in app today). No in-app payment gateway yet; planned Razorpay/Stripe.
- **Data collected:** Account (name, email, phone, DOB, gender, location, address, image), matrimony profile (detailed profile + optional income/socials), subscription/plan/coupon/payment status, B2C listing data (including seller phone/email), report/feedback text and type, temple booking, social content and post/listing reports.
- **Third parties:** MongoDB, AWS S3, Twilio, translation API; possibly Google Analytics/cookies (confirm).
- **Special:** Child safety reporting path and contact; India-facing service.

This document is intended to be handed to a lawyer or privacy professional to produce the final privacy policy text and any required consent flows.
