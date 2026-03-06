# Firebase Collections Integration Guide

## ✅ Complete Firebase Setup for Railway Rover

This guide verifies that all 6 required Firebase Firestore collections are correctly integrated with your application code.

---

## 📋 Collections Checklist

### Collection 1: **trains**
- **Path**: `/trains`
- **Used by**: 
  - `trainService.ts` - getAllTrains, searchTrains, addTrain, updateTrain, deleteTrain
  - `Admin.tsx` - Train management panel
  - `Dashboard.tsx` - Getting train info

**Sample Document:**
```json
{
  "id": "train-doc-id",
  "trainNumber": "12001",
  "trainName": "Rajdhani Express",
  "source": "NYC",
  "destination": "BOS",
  "departureTime": "08:00",
  "arrivalTime": "12:00",
  "fare": 5000,
  "totalSeats": 200,
  "seatsAvailable": 150,
  "createdAt": "timestamp"
}
```

**Required Indexes:**
- ✅ `source` (for searchTrains query)

**Verification Steps:**
1. Go to Firebase Console → Firestore → Collections
2. Check if `trains` collection exists
3. Create sample train document
4. Verify it appears in Admin panel

---

### Collection 2: **trainSchedules**
- **Path**: `/trainSchedules`
- **Used by**: 
  - `trainService.ts` - Schedule CRUD, getSchedulesForDate
  - `bookingService.ts` - Check availability before booking
  - `Admin.tsx` - Schedule management
  - `SearchResults.tsx` - Filter by availability

**Sample Document:**
```json
{
  "id": "schedule-doc-id",
  "trainId": "train-doc-id",
  "trainNumber": "12001",
  "date": "2025-03-15",
  "seatsAvailable": 150,
  "totalSeats": 200,
  "isActive": true,
  "createdAt": "timestamp"
}
```

**Required Indexes:**
- ✅ Composite: `trainId` + `date` (recommended)
- ✅ `trainId` (for getTrainSchedules)
- ✅ `date` (for getSchedulesForDate)

**Verification Steps:**
1. Check if `trainSchedules` collection exists
2. Verify document has exact field names
3. Add train → should auto-generate 30-day schedules
4. Check dates are in format: YYYY-MM-DD

---

### Collection 3: **bookings**
- **Path**: `/bookings`
- **Used by**: 
  - `bookingService.ts` - Create, retrieve, cancel bookings
  - `Admin.tsx` - View all bookings
  - `Dashboard.tsx` - User's bookings
  - `PNRStatus.tsx` - Search by PNR

**Sample Document:**
```json
{
  "id": "booking-doc-id",
  "userId": "firebase-auth-uid",
  "trainId": "train-doc-id",
  "trainNumber": "12001",
  "trainName": "Rajdhani Express",
  "passengerName": "John Doe",
  "age": 30,
  "gender": "Male",
  "coach": "S1",
  "seatNumber": 42,
  "travelDate": "2025-03-15",
  "PNR": "1234567890",
  "bookingStatus": "confirmed",
  "createdAt": "timestamp"
}
```

**Required Indexes:**
- ✅ `userId` (for getUserBookings)
- ✅ `PNR` (for getBookingByPNR)

**Verification Steps:**
1. Check if `bookings` collection exists
2. Make a test booking from SearchResults
3. Verify booking appears in Dashboard
4. Verify PNR search works

---

### Collection 4: **payments**
- **Path**: `/payments`
- **Used by**: 
  - `bookingService.ts` - Auto-created during booking (createBooking)

**Sample Document:**
```json
{
  "id": "payment-doc-id",
  "bookingId": "booking-doc-id",
  "userId": "firebase-auth-uid",
  "amount": 5000,
  "paymentMethod": "card",
  "paymentStatus": "success",
  "transactionId": "TXN1234567890",
  "paymentDate": "2025-03-06",
  "createdAt": "timestamp"
}
```

**Verification Steps:**
1. Check if `payments` collection exists (can be empty initially)
2. Complete a test booking
3. Verify payment record is created automatically
4. Check bookingId matches

---

### Collection 5: **stations**
- **Path**: `/stations`
- **Used by**: 
  - `stationService.ts` - getAllStations, addStation, updateStation, deleteStation
  - `SearchForm.tsx` - Populate dropdown selects
  - `Stations.tsx` - Admin station management

**Sample Document:**
```json
{
  "id": "station-doc-id",
  "stationCode": "NYC",
  "stationName": "New York Central Station",
  "city": "New York",
  "state": "NY",
  "country": "USA",
  "createdAt": "timestamp"
}
```

**Verification Steps:**
1. Check if `stations` collection exists
2. Add at least 5 sample stations
3. Check if they appear in SearchForm dropdowns
4. Verify station codes match train source/destination

---

### Collection 6: **users**
- **Path**: `/users`
- **Used by**: 
  - `auth.ts` - registerUser (setDoc), getUserRole (getDoc)
  - `AuthContext.tsx` - Getting user role

**Sample Document:**
```json
{
  "id": "firebase-auth-uid",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "role": "user",
  "createdAt": "timestamp"
}
```

**⚠️ Important Notes:**
- Document ID MUST be Firebase Auth UID (not auto-generated)
- Created automatically when user registers
- `role` field: "user" or "admin" (admin can access /admin and /stations pages)

**Verification Steps:**
1. Check if `users` collection exists
2. Register a new user
3. Verify user document created with auth UID
4. Check role defaults to "user"

---

## 🔧 Setup Instructions

### Step 1: Create all Collections
In Firebase Console → Firestore Database:

```
✅ trains
✅ trainSchedules
✅ bookings
✅ payments
✅ stations
✅ users
```

### Step 2: Add Sample Data

**Sample Stations** (Add these to get started):
```
stationCode: "NYC", stationName: "New York Central", city: "New York"
stationCode: "BOS", stationName: "Boston South Station", city: "Boston"
stationCode: "DC", stationName: "Union Station", city: "Washington DC"
stationCode: "PHL", stationName: "Philadelphia Station", city: "Philadelphia"
stationCode: "ATL", stationName: "Atlanta Central", city: "Atlanta"
```

### Step 3: Set Up Firestore Rules (Optional but Recommended)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own document
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Anyone can read trains and stations
    match /trains/{document=**} {
      allow read: if true;
      allow write: if request.auth.token.isAdmin == true;
    }
    
    match /stations/{document=**} {
      allow read: if true;
      allow write: if request.auth.token.isAdmin == true;
    }
    
    match /trainSchedules/{document=**} {
      allow read: if true;
      allow write: if request.auth.token.isAdmin == true;
    }
    
    // Users can only read their own bookings
    match /bookings/{document=**} {
      allow read: if request.auth.uid == resource.data.userId || request.auth.token.isAdmin == true;
      allow write: if request.auth.uid == resource.data.userId || request.auth.token.isAdmin == true;
    }
    
    // Users can read/write payments related to their bookings
    match /payments/{document=**} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
  }
}
```

---

## ✅ Integration Verification Checklist

- [ ] All 6 collections created in Firestore
- [ ] Sample stations added (at least 5)
- [ ] Sample train added with trainNumber and source/destination
- [ ] Can see trains in Admin panel
- [ ] Can generate 30-day schedules from Admin
- [ ] Can search trains in Home → SearchForm
- [ ] Can select train and complete booking flow
- [ ] Booking appears in Dashboard
- [ ] Payment record created automatically
- [ ] PNR search works
- [ ] Can cancel booking
- [ ] User registration creates document in users collection
- [ ] Admin user has role="admin" and can access /admin page

---

## 📊 Data Relationships

```
users
  └── bookings (linked by userId)
      └── payments (linked by bookingId)
      └── trains (linked by trainId)
          └── trainSchedules (linked by trainId)

stations
  └── trains (source/destination matches stationCode)
```

---

## 🐛 Common Issues & Solutions

### Issue: "No trains found for this route"
**Solution**: 
- Verify `trains` collection has documents
- Check `source` and `destination` fields match exactly with selected stations
- Ensure train schedules exist for selected date

### Issue: "No seats available" error during booking
**Solution**:
- Check `trainSchedules` has documents with matching date
- Verify `seatsAvailable > 0` in that schedule
- Check MongoDB/Firestore console for the document

### Issue: Dashboard shows no bookings
**Solution**:
- Verify booking was created in `bookings` collection
- Check `userId` in booking matches current user's Firebase UID
- Confirm booking was not cancelled

### Issue: User can't access Admin panel
**Solution**:
- Go to Firebase → Users → Edit user
- Set custom claims: `{"isAdmin": true}`
- User must log out and log back in to get admin access

---

## 🚀 Testing the Integration

### Quick Test Flow:
1. **Register** → New user should appear in `/users` collection
2. **Search** → Should show trains from `/trains` with available `/trainSchedules`
3. **Book** → Should create document in `/bookings` and `/payments`
4. **Dashboard** → Should show booking from `/bookings` where userId matches
5. **Admin** → Should show all data from all collections

---

**Your Flask app is fully integrated with these collections!** ✅
