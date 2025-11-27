# LogoIP Jewellery Marketplace - Mobile App Development Workflow

**Tech Stack**: React Native (iOS/Android) | Express.js Backend | PostgreSQL/MongoDB

---

## 📋 Project Overview

**LogoIP** is a premium jewellery marketplace that connects buyers with verified jewellery shops, vendors, designers, and gemologists. Core features include:
- Multi-role access (Shops, Vendors, Workers, Designers, Gemologists)
- Subscription-based premium access to 100+ verified shops
- Product discovery with filtration
- Shop details, ratings, reviews, and QR code sharing
- Limited deals and promotional banners
- Wishlist functionality
- Real-time inventory and contact integration

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│          React Native Frontend (iOS + Android)           │
│  - Navigation Stack: Tab-based + Modal flows             │
│  - State Management: Redux/Zustand                       │
│  - UI Library: React Native Paper / Native Base          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓ (REST API / GraphQL)
┌─────────────────────────────────────────────────────────┐
│          Express.js Backend (Node.js)                    │
│  - Authentication: JWT + OAuth2                         │
│  - Payment Gateway: Stripe/Razorpay Integration         │
│  - Database: PostgreSQL (relational) + Redis (cache)    │
│  - File Storage: AWS S3 for images                       │
│  - QR Code Generation: QR library                        │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        ↓            ↓            ↓
    PostgreSQL    Redis        AWS S3
    (Main DB)    (Cache)    (Media Store)
```

---

## 📱 Screen Architecture & Components

### **Navigation Structure**

```
App Root (Tab Navigation)
├── Home Screen (Dashboard)
│   ├── Limited Deals Banner (Carousel)
│   ├── Role-based Quick Access (5x Grid)
│   └── Bottom Tab Navigation
│
├── Search/Browse Screen
│   ├── Search Bar
│   ├── Category Filters (Rings, Bracelets, Chains)
│   ├── Product Grid (2-column)
│   ├── Product Card (Image, Price, Rating, Wishlist)
│   └── Product Detail Modal
│
├── Shops/Directory Screen
│   ├── Filter Dropdowns (Location, Brand, Shop, Price)
│   ├── Shop Card List
│   │   ├── Store Image
│   │   ├── Shop Name & Owner
│   │   ├── Verified Badge
│   │   ├── Rating & Reviews Count
│   │   ├── Address & Hours
│   │   └── More Info Button
│   └── "View More" Pagination
│
├── Shop Detail Screen (Modal)
│   ├── Hero Image with Verified Badge
│   ├── Shop Info Card
│   ├── Tab Navigation (All, Videos, Images, Portfolio)
│   ├── Gallery Grid Display
│   ├── QR Code Share Modal
│   └── Shop Details Accordion
│
├── Product Detail Screen
│   ├── Product Image Carousel
│   ├── Verified Badge
│   ├── Title, Shop, Ratings
│   ├── Description
│   ├── Specifications (Customizable Sections)
│   ├── Trust Indicators (Certified, Free Shipping, Easy Return)
│   ├── Contact Information
│   └── Action Buttons (Call, Share)
│
├── Premium Access Screen (Paywall)
│   ├── Icon & Title
│   ├── Value Proposition Text
│   ├── Plan Cards (Monthly $99, Quarterly $299, Yearly $1999)
│   │   ├── Collapsible Features List
│   │   ├── Checkmark Icons
│   │   └── Plan Selector
│   ├── CTA Button (Subscribe to Monthly Plan)
│   ├── Trust Text (Cancel, Secure Payment, Money Back)
│   └── Why Subscription Section
│
└── Account/Profile Screen
    ├── User Avatar & Name
    ├── Settings
    ├── Saved Items
    └── Subscription Status

Profile Tab Links to:
- Role Profiles (Vendor, Worker, Designer, Gemologist)
- Edit Profile
- Wishlist
- Orders
- Settings
```

---

## 🎨 UI Component Library

### **Core Components**

| Component | Usage | Props |
|-----------|-------|-------|
| **PremiumPlan Card** | Display subscription tiers | `title`, `price`, `features`, `isExpanded`, `onToggle` |
| **ProductCard** | Grid item with image/price/rating | `image`, `title`, `price`, `rating`, `onWishlist`, `onPress` |
| **ShopCard** | Verified shop list item | `image`, `name`, `owner`, `rating`, `address`, `hours`, `isVerified` |
| **HeaderBar** | Top nav with logo/icons | `title`, `onBack`, `showNotification`, `showShare`, `onMenu` |
| **BottomTabBar** | Navigation footer (5 tabs) | `active`, `onTabChange` |
| **FilterDropdown** | Category/location/price filter | `label`, `options`, `onSelect`, `selectedValue` |
| **RatingDisplay** | Star rating + count | `stars`, `reviewCount` |
| **VerifiedBadge** | Gold checkmark badge | `size` (small/medium) |
| **SpecificationRow** | Key-value property display | `label`, `value` |
| **TrustBadge** | Certified/Shipping/Return indicator | `type` (certified/shipping/return), `icon` |
| **QRModal** | QR code display & share | `qrValue`, `shopName`, `onDownload`, `onShare` |
| **CarouselBanner** | Horizontal scrolling deals | `items`, `onItemPress` |
| **TabSegment** | Horizontal tab selector | `tabs`, `active`, `onTabChange` |
| **Modal** | Full-screen overlay | `visible`, `onClose`, `children` |

### **Typography & Spacing**

```javascript
// Design Tokens
const typography = {
  heading1: { fontSize: 30, fontWeight: '600', lineHeight: 36 },
  heading2: { fontSize: 24, fontWeight: '600', lineHeight: 28 },
  heading3: { fontSize: 20, fontWeight: '600', lineHeight: 24 },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 20 },
  bodySmall: { fontSize: 14, fontWeight: '400', lineHeight: 18 },
  caption: { fontSize: 12, fontWeight: '400', lineHeight: 16 }
};

const spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32
};

const colors = {
  primary: '#D4A574',      // Gold
  secondary: '#2B6B7F',    // Teal
  accent: '#7B3FF2',       // Purple
  success: '#22C55E',      // Green
  error: '#EF4444',        // Red
  warning: '#F59E0B',      // Amber
  text: '#1F2937',         // Dark gray
  textSecondary: '#6B7280',// Light gray
  bg: '#FFFFFF',
  bgSecondary: '#F3F4F6'
};
```

---

## 🗄️ Backend API Architecture

### **Database Schema**

#### **Users Table**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url TEXT,
  role ENUM('customer', 'shop_owner', 'vendor', 'worker', 'designer', 'gemologist'),
  subscription_status ENUM('free', 'monthly', 'quarterly', 'yearly'),
  subscription_end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_subscription_status ON users(subscription_status);
```

#### **Shops Table**
```sql
CREATE TABLE shops (
  id UUID PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  address VARCHAR(500),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone VARCHAR(20),
  opening_time TIME,
  closing_time TIME,
  average_rating DECIMAL(3, 2) DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shops_owner_id ON shops(owner_id);
CREATE INDEX idx_shops_is_verified ON shops(is_verified);
CREATE INDEX idx_shops_location ON shops(latitude, longitude);
```

#### **Products Table**
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  shop_id UUID NOT NULL REFERENCES shops(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  image_urls JSONB,  -- Array of image URLs
  specifications JSONB,  -- Key-value pairs (Metal, Stones, Making, etc)
  in_stock BOOLEAN DEFAULT TRUE,
  stock_quantity INTEGER,
  average_rating DECIMAL(3, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_shop_id ON products(shop_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_in_stock ON products(in_stock);
```

#### **Reviews Table**
```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id),
  user_id UUID NOT NULL REFERENCES users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
```

#### **Wishlist Table**
```sql
CREATE TABLE wishlists (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  product_id UUID NOT NULL REFERENCES products(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, product_id)
);

CREATE INDEX idx_wishlists_user_id ON wishlists(user_id);
```

#### **Subscriptions Table**
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  plan_type ENUM('monthly', 'quarterly', 'yearly'),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status ENUM('active', 'cancelled', 'expired') DEFAULT 'active',
  start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_date TIMESTAMP NOT NULL,
  payment_method VARCHAR(50),
  transaction_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

---

### **API Endpoints**

#### **Authentication**
```
POST   /api/auth/register              - Register new user
POST   /api/auth/login                 - Login with email/password
POST   /api/auth/logout                - Logout (invalidate token)
POST   /api/auth/refresh-token         - Refresh JWT token
POST   /api/auth/verify-email          - Verify email address
POST   /api/auth/forgot-password       - Request password reset
POST   /api/auth/reset-password        - Reset password with token
```

#### **Users**
```
GET    /api/users/profile              - Get current user profile
PUT    /api/users/profile              - Update user profile
GET    /api/users/:id                  - Get public user profile
POST   /api/users/avatar               - Upload avatar
DELETE /api/users/account              - Delete account
```

#### **Shops**
```
GET    /api/shops                      - List all verified shops (paginated)
GET    /api/shops/:id                  - Get shop details with images/videos
GET    /api/shops/search               - Search shops by name/location
GET    /api/shops/filter               - Filter by location, brand, rating
POST   /api/shops                      - Create new shop (owner only)
PUT    /api/shops/:id                  - Update shop info
POST   /api/shops/:id/images           - Upload shop images/gallery
GET    /api/shops/:id/qr-code          - Generate QR code for shop
```

#### **Products**
```
GET    /api/products                   - List all products (paginated)
GET    /api/products/:id               - Get product details
GET    /api/products/search            - Search products by name
GET    /api/products/category/:cat     - Filter by category
POST   /api/products                   - Create product (shop owner)
PUT    /api/products/:id               - Update product
DELETE /api/products/:id               - Delete product
POST   /api/products/:id/images        - Upload product images
GET    /api/products/:id/reviews       - Get product reviews
POST   /api/products/:id/reviews       - Post review
```

#### **Wishlist**
```
GET    /api/wishlists                  - Get user's wishlist
POST   /api/wishlists/:productId       - Add to wishlist
DELETE /api/wishlists/:productId       - Remove from wishlist
POST   /api/wishlists/batch            - Batch add/remove
```

#### **Subscriptions**
```
GET    /api/subscriptions/plans        - Get available subscription plans
POST   /api/subscriptions/subscribe    - Create subscription (with payment)
GET    /api/subscriptions/current      - Get active subscription
POST   /api/subscriptions/cancel       - Cancel subscription
GET    /api/subscriptions/history      - Get subscription history
```

#### **Payments**
```
POST   /api/payments/initiate          - Initiate payment (Razorpay/Stripe)
POST   /api/payments/verify            - Verify payment webhook
GET    /api/payments/:transactionId    - Get payment details
```

---

## 🔌 Express.js Backend Setup

### **Project Structure**
```
backend/
├── config/
│   ├── database.js          # PostgreSQL connection
│   ├── redis.js             # Redis cache setup
│   ├── jwt.js               # JWT configuration
│   └── env.js               # Environment variables
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   ├── shopController.js
│   ├── productController.js
│   ├── reviewController.js
│   ├── wishlistController.js
│   ├── subscriptionController.js
│   └── paymentController.js
├── routes/
│   ├── auth.js
│   ├── users.js
│   ├── shops.js
│   ├── products.js
│   ├── reviews.js
│   ├── wishlists.js
│   ├── subscriptions.js
│   └── payments.js
├── middleware/
│   ├── authMiddleware.js    # JWT verification
│   ├── errorHandler.js      # Global error handling
│   ├── validation.js        # Input validation
│   ├── upload.js            # File upload (multer)
│   └── rateLimit.js         # Rate limiting
├── services/
│   ├── authService.js       # Business logic
│   ├── shopService.js
│   ├── productService.js
│   ├── subscriptionService.js
│   ├── paymentService.js    # Razorpay/Stripe
│   ├── qrService.js         # QR code generation
│   └── emailService.js      # Email notifications
├── utils/
│   ├── logger.js            # Logging
│   ├── helpers.js           # Common utilities
│   ├── validators.js        # Validation schemas
│   └── constants.js         # App constants
├── models/
│   ├── User.js
│   ├── Shop.js
│   ├── Product.js
│   ├── Review.js
│   ├── Wishlist.js
│   └── Subscription.js
└── app.js                   # Express app setup
└── server.js                # Server entry point
```

### **Sample Express Setup (app.js)**
```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/shops', require('./routes/shops'));
app.use('/api/products', require('./routes/products'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/wishlists', require('./routes/wishlists'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/payments', require('./routes/payments'));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;
```

---

## 📱 React Native Implementation

### **Project Setup**
```bash
# Create project
npx react-native init LogoIPApp --template react-native-template-typescript

# Install dependencies
npm install @react-navigation/native @react-navigation/bottom-tabs
npm install @react-navigation/stack
npm install react-native-screens react-native-safe-area-context
npm install @react-native-async-storage/async-storage
npm install axios react-redux redux redux-thunk
npm install react-native-image-picker react-native-fs
npm install qrcode.react
npm install react-native-svg
npm install @react-native-community/geolocation
npm install react-native-maps
npm install react-native-stripe-sdk react-native-razorpay
npm install react-native-fast-image
npm install react-native-swiper
npm install react-native-picker-select
npm install moment react-native-localize
```

### **Directory Structure**
```
src/
├── navigation/
│   ├── RootNavigator.tsx       # Main navigation setup
│   ├── BottomTabNavigator.tsx  # Bottom tab navigation
│   └── types.ts                # Navigation type definitions
├── screens/
│   ├── HomeScreen.tsx
│   ├── BrowseScreen.tsx
│   ├── ShopsScreen.tsx
│   ├── ShopDetailScreen.tsx
│   ├── ProductDetailScreen.tsx
│   ├── PremiumAccessScreen.tsx
│   ├── SearchScreen.tsx
│   └── ProfileScreen.tsx
├── components/
│   ├── PremiumPlanCard.tsx
│   ├── ProductCard.tsx
│   ├── ShopCard.tsx
│   ├── HeaderBar.tsx
│   ├── FilterDropdown.tsx
│   ├── RatingDisplay.tsx
│   ├── VerifiedBadge.tsx
│   ├── QRModal.tsx
│   ├── CarouselBanner.tsx
│   └── LoadingSpinner.tsx
├── redux/
│   ├── store.ts
│   ├── slices/
│   │   ├── authSlice.ts
│   │   ├── productsSlice.ts
│   │   ├── shopsSlice.ts
│   │   ├── wishlistSlice.ts
│   │   └── subscriptionSlice.ts
│   └── middleware/
│       └── api.ts
├── services/
│   ├── api.ts                  # Axios setup
│   ├── auth.ts                 # Auth service
│   ├── products.ts
│   ├── shops.ts
│   ├── payment.ts              # Payment integration
│   └── storage.ts              # AsyncStorage
├── hooks/
│   ├── useAuth.ts
│   ├── useProducts.ts
│   ├── useShops.ts
│   ├── usePagination.ts
│   └── useNavigation.ts
├── utils/
│   ├── validators.ts
│   ├── formatters.ts
│   ├── constants.ts
│   └── themes.ts               # Color & typography
├── types/
│   ├── index.ts                # Global types
│   ├── api.ts                  # API response types
│   └── models.ts               # Domain models
└── assets/
    ├── images/
    ├── icons/
    └── fonts/
```

### **Sample Navigation Setup**
```typescript
// navigation/RootNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNavigator from './BottomTabNavigator';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import ShopDetailScreen from '../screens/ShopDetailScreen';
import PremiumAccessScreen from '../screens/PremiumAccessScreen';
import AuthStack from './AuthStack';
import { useAppDispatch, useAppSelector } from '../redux/store';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { isAuthenticated } = useAppSelector(state => state.auth);

  if (!isAuthenticated) {
    return <AuthStack />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
      >
        <Stack.Group>
          <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
        </Stack.Group>
        <Stack.Group screenOptions={{ presentation: 'modal' }}>
          <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
          <Stack.Screen name="ShopDetail" component={ShopDetailScreen} />
          <Stack.Screen name="PremiumAccess" component={PremiumAccessScreen} />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### **Sample Component: ProductCard**
```typescript
// components/ProductCard.tsx
import React from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Heart } from 'react-native-feather';
import RatingDisplay from './RatingDisplay';

interface ProductCardProps {
  id: string;
  image: string;
  title: string;
  shop: string;
  price: number;
  rating: number;
  reviewCount: number;
  isWishlisted: boolean;
  onPress: () => void;
  onWishlist: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id, image, title, shop, price, rating, reviewCount,
  isWishlisted, onPress, onWishlist
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: image }} style={styles.image} />
        <TouchableOpacity 
          style={styles.wishlistBtn}
          onPress={onWishlist}
        >
          <Heart 
            size={20} 
            color={isWishlisted ? '#D4A574' : '#999'}
            fill={isWishlisted ? '#D4A574' : 'transparent'}
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        <Text style={styles.shop}>{shop}</Text>
        
        <View style={styles.footer}>
          <Text style={styles.price}>${price.toLocaleString()}</Text>
          <RatingDisplay rating={rating} count={reviewCount} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { flex: 1, margin: 8, backgroundColor: '#fff', borderRadius: 8 },
  imageContainer: { position: 'relative', width: '100%', height: 180 },
  image: { width: '100%', height: '100%', borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  wishlistBtn: { position: 'absolute', top: 8, right: 8, padding: 8, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 20 },
  content: { padding: 12 },
  title: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  shop: { fontSize: 12, color: '#6B7280', marginVertical: 4 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  price: { fontSize: 16, fontWeight: '700', color: '#D4A574' }
});

export default ProductCard;
```

---

## 🔐 Authentication Flow

```
┌──────────────────┐
│   User Signup    │
└────────┬─────────┘
         │
         ↓
┌──────────────────────────────────────┐
│ POST /api/auth/register              │
│ Body: {email, password, role}        │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│ Hash password + Create user          │
│ Send verification email              │
│ Return: {userId, message}            │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│ User Clicks Email Link               │
│ POST /api/auth/verify-email          │
│ Update: is_verified = true           │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│   User Login                         │
│ POST /api/auth/login                 │
│ Body: {email, password}              │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│ Verify password hash                 │
│ Generate JWT + Refresh Token         │
│ Store in Redis (expiry tracking)     │
│ Return: {accessToken, refreshToken}  │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│ Client Stores Tokens (AsyncStorage)  │
│ Add to Auth Header: Bearer {token}   │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│ Middleware Verifies JWT on Each API  │
│ If expired → Use refreshToken        │
│ If both invalid → Redirect to Login  │
└──────────────────────────────────────┘
```

---

## 💳 Subscription & Payment Flow

```
┌─────────────────────────────┐
│ User Selects Plan           │
│ (Monthly/Quarterly/Yearly)  │
└────────┬────────────────────┘
         │
         ↓
┌─────────────────────────────────────────────┐
│ POST /api/payments/initiate                 │
│ Body: {planType, userId, amount}            │
│ Returns: {orderId, paymentKey}              │
└────────┬────────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────────────┐
│ Open Razorpay/Stripe Checkout Modal         │
│ User Enters Card Details                    │
│ Payment Gateway Processes                   │
└────────┬────────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────────────┐
│ Payment Gateway Sends Webhook               │
│ POST /api/payments/verify                   │
│ Verify Signature + Amount                   │
└────────┬────────────────────────────────────┘
         │
         ✓ Success                  ✗ Failed
         │                          │
         ↓                          ↓
┌──────────────────┐      ┌──────────────────┐
│ Create Subscription  │      │ Payment Failed  │
│ - Update user role   │      │ Log error       │
│ - Set end_date       │      │ Notify user     │
│ - Cache in Redis     │      │ Retry option    │
│ - Send confirmation  │      └──────────────────┘
│   email              │
│ - Return success     │
└──────────────────┘
```

---

## 🎯 Feature Implementation Priority

### **Phase 1: MVP (Weeks 1-4)**
- ✅ User authentication (login/signup)
- ✅ Basic product browse & search
- ✅ Shop directory with filters
- ✅ Shop detail page with images
- ✅ Premium access screen (UI only)

### **Phase 2: Core Features (Weeks 5-8)**
- ✅ Product detail page
- ✅ Rating & reviews system
- ✅ Wishlist functionality
- ✅ Real payment integration
- ✅ Subscription management

### **Phase 3: Advanced (Weeks 9-12)**
- ✅ QR code generation & sharing
- ✅ Shop owner dashboard
- ✅ Product inventory management
- ✅ Order history & tracking
- ✅ Push notifications
- ✅ Analytics dashboard

### **Phase 4: Polish & Launch (Week 13+)**
- ✅ Performance optimization
- ✅ Accessibility compliance (WCAG)
- ✅ Security audit
- ✅ App Store & Play Store submission
- ✅ Beta testing & QA

---

## 🚀 Deployment & DevOps

### **Backend (Express.js)**
```bash
# Production deployment options:
# 1. AWS EC2 + PM2 + Nginx
# 2. AWS App Runner (serverless)
# 3. Docker + AWS ECS
# 4. Heroku (for MVP)

# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]

# Build: docker build -t logoip-backend .
# Run: docker run -p 5000:5000 logoip-backend
```

### **Mobile (React Native)**
```bash
# iOS
cd ios && pod install && cd ..
eas build --platform ios --profile production

# Android
cd android && ./gradlew assembleRelease
# Output: app/release/app-release.apk

# Publish to App Stores:
# iOS: Xcode → Product → Archive → Distribute App
# Android: Upload .aab to Google Play Console
```

### **Database & Infrastructure**
```
- PostgreSQL: AWS RDS (Multi-AZ)
- Redis: AWS ElastiCache (cluster)
- S3: AWS S3 (image storage)
- CDN: CloudFront (image delivery)
- SSL: AWS Certificate Manager
- Monitoring: CloudWatch + DataDog
- Backups: Automated daily RDS snapshots
```

---

## 📊 Testing Strategy

### **Backend Testing**
```javascript
// Jest + Supertest
describe('Auth API', () => {
  test('POST /api/auth/register creates user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com', password: 'Test123!' });
    
    expect(response.status).toBe(201);
    expect(response.body.userId).toBeDefined();
  });
});
```

### **Mobile Testing**
```typescript
// Jest + React Native Testing Library
import { render, screen, fireEvent } from '@testing-library/react-native';

test('ProductCard renders with image and price', () => {
  const { getByText } = render(
    <ProductCard
      title="Diamond Ring"
      price={3000}
      // ... other props
    />
  );
  expect(getByText('$3,000')).toBeTruthy();
});
```

---

## 🔒 Security Checklist

- [ ] **Password**: Bcrypt hashing (10+ rounds)
- [ ] **JWT**: Short-lived (15 min), Refresh tokens (7 days)
- [ ] **HTTPS**: SSL/TLS everywhere
- [ ] **CORS**: Whitelist specific origins
- [ ] **SQL Injection**: Parameterized queries (Prepared statements)
- [ ] **XSS Prevention**: Input sanitization + Content Security Policy
- [ ] **Rate Limiting**: 100 requests/15 min per IP
- [ ] **Data Encryption**: Sensitive fields encrypted at rest (AES-256)
- [ ] **API Keys**: Environment variables (.env, never committed)
- [ ] **Payment PCI**: Use payment gateway SDKs (never store raw card data)
- [ ] **GDPR**: Data export/deletion endpoints
- [ ] **Audit Logs**: Track sensitive operations

---

## 📝 API Response Format

```javascript
// Success (200)
{
  success: true,
  data: { /* actual data */ },
  message: "Operation successful"
}

// Error (4xx/5xx)
{
  success: false,
  error: {
    code: "VALIDATION_ERROR",
    message: "Invalid email format",
    details: [
      { field: "email", message: "Must be valid email" }
    ]
  }
}

// Pagination (200)
{
  success: true,
  data: [ /* items */ ],
  pagination: {
    page: 1,
    limit: 20,
    total: 250,
    pages: 13,
    hasMore: true
  }
}
```

---

## 🎯 Key Metrics & KPIs

- **User Acquisition**: DAU, MAU, conversion rate
- **Engagement**: Average session length, feature usage
- **Monetization**: Subscription conversion rate, LTV, churn rate
- **Performance**: API response time (<200ms), App startup time (<3s)
- **Quality**: Crash rate (<0.5%), error rate (<1%)

---

## 📞 Support & Documentation

- **API Docs**: Swagger/OpenAPI (`/api-docs`)
- **Mobile Docs**: Storybook for component library
- **Deployment**: Runbooks in GitHub Wiki
- **On-call**: PagerDuty integration for critical alerts

---

**Generated**: November 27, 2025 | **Version**: 1.0