# Firebase Collections - Code Integration Map

## 🔄 Complete Data Flow Diagram

```
┌─────────── FIREBASE FIRESTORE ───────────────┐
│                                               │
│  ┌──────────────────────────────────────┐   │
│  │       🚆 TRAINS Collection           │   │
│  │  ├─ trainService.getAllTrains()     │   │
│  │  ├─ trainService.searchTrains()     │   │
│  │  ├─ trainService.addTrain()         │   │
│  │  ├─ trainService.updateTrain()      │   │
│  │  └─ trainService.deleteTrain()      │   │
│  └──────────────────────────────────────┘   │
│                    ↓                         │
│  ┌──────────────────────────────────────┐   │
│  │   📅 TRAINSCHEDULES Collection       │   │
│  │  ├─ trainService.getSchedulesForDate()  │
│  │  ├─ trainService.getTrainSchedules()    │
│  │  ├─ trainService.addTrainSchedule()     │
│  │  ├─ trainService.updateTrainSchedule()  │
│  │  └─ trainService.deleteTrainSchedule()  │
│  └──────────────────────────────────────┘   │
│         ↓                          ↓        │
│  ┌──────────────────┐   ┌──────────────────┐
│  │  🎫 BOOKINGS     │   │  💳 PAYMENTS     │
│  │  Collection      │   │  Collection      │
│  │  ├─ createBooking│   │  ├─ auto-created │
│  │  ├─ cancelBooking│   │  │   on booking   │
│  │  ├─ getUserBooks │   │  └─ stores txn   │
│  │  └─ getByPNR()   │   │     details      │
│  └──────────────────┘   └──────────────────┘
│
│  ┌──────────────────────────────────────┐   │
│  │      🏢 STATIONS Collection          │   │
│  │  ├─ stationService.getAllStations()     │
│  │  ├─ stationService.addStation()         │
│  │  ├─ stationService.updateStation()      │
│  │  └─ stationService.deleteStation()      │
│  └──────────────────────────────────────┘   │
│
│  ┌──────────────────────────────────────┐   │
│  │      👤 USERS Collection             │   │
│  │  ├─ auth.registerUser()              │   │
│  │  ├─ auth.getUserRole()               │   │
│  │  └─ AuthContext tracks role          │   │
│  └──────────────────────────────────────┘   │
│                                               │
└───────────────────────────────────────────────┘
```

---

## 📍 Component to Collection Mapping

### **HomeScreen**

```
SearchForm → queries /stations
         → navigates to /search with params
```

### **SearchResults Page**

```
trainService.searchTrains() → /trains (query by source)
trainService.getSchedulesForDate() → /trainSchedules (filter by date)
TrainCard → shows available seats from /trainSchedules
onBook() → navigates to /passenger-details with selected train + date
```

### **PassengerDetails Page**

```
Collects: name, age, gender
onSubmit() → navigates to /payment with:
  - train (from /trains)
  - date
  - passenger details
```

### **Payment Page**

```
bookingService.createBooking() → creates:
  ├─ Document in /bookings
  ├─ Document in /payments
  ├─ Updates /trainSchedules (decrements seatsAvailable)
  └─ Updates /trains (decrements seatsAvailable)
Navigate to /ticket with PNR
```

### **Dashboard Page**

```
bookingService.getUserBookings() → filters /bookings by userId
bookingService.cancelBooking() → updates /bookings + refunds seats
```

### **AdminPanel Page**

```
Train Management:
  ├─ trainService.getAllTrains() → lists all /trains
  ├─ trainService.addTrain() → creates /trains doc + auto-generates 30 schedules
  ├─ trainService.updateTrain() → updates /trains
  └─ trainService.deleteTrain() → deletes /trains + /trainSchedules

Schedule Management:
  ├─ trainService.getTrainSchedules() → lists /trainSchedules for selected train
  ├─ trainService.addTrainSchedule() → creates /trainSchedules doc
  ├─ trainService.updateTrainSchedule() → updates /trainSchedules
  └─ trainService.deleteTrainSchedule() → deletes /trainSchedules

Booking View:
  └─ bookingService.getAllBookings() → lists all /bookings
```

### **Stations Page (Admin)**

```
stationService.getAllStations() → lists all /stations
stationService.addStation() → creates /stations doc
stationService.updateStation() → updates /stations
stationService.deleteStation() → deletes /stations doc
```

---

## ✅ Collection Field Requirements

### /trains Collection

```javascript
{
  id: "auto",           // Firebase document ID
  trainNumber: String,  // "12001" - REQUIRED for queries
  trainName: String,    // "Rajdhani Express"
  source: String,       // "NYC" - REQUIRED (indexed for search)
  destination: String,  // "BOS"
  departureTime: String // "08:00"
  arrivalTime: String,  // "12:00"
  fare: Number,         // 5000
  totalSeats: Number,   // 200
  seatsAvailable: Number, // Updated on each booking
  createdAt: Timestamp  // Auto-generated
}
```

### /trainSchedules Collection

```javascript
{
  id: "auto",
  trainId: String,      // Links to /trains document ID (REQUIRED)
  trainNumber: String,  // Denormalized for easy reference
  date: String,         // "2025-03-15" format (REQUIRED, indexed)
  seatsAvailable: Number, // Updates on each booking
  totalSeats: Number,   // Copy of train's totalSeats
  isActive: Boolean,    // true/false
  createdAt: Timestamp
}
```

### /bookings Collection

```javascript
{
  id: "auto",
  userId: String,       // Firebase Auth UID (REQUIRED, indexed)
  trainId: String,      // Links to /trains
  trainNumber: String,  // Denormalized
  trainName: String,    // Denormalized
  passengerName: String,
  age: Number,
  gender: String,
  coach: String,        // "S1", "A1", etc
  seatNumber: Number,   // Random 1-72
  travelDate: String,   // "2025-03-15"
  PNR: String,          // 10-digit unique (REQUIRED, indexed)
  bookingStatus: String, // "confirmed" or "cancelled"
  createdAt: Timestamp
}
```

### /payments Collection

```javascript
{
  id: "auto",
  bookingId: String,    // Links to /bookings
  userId: String,       // Firebase Auth UID
  amount: Number,       // Same as train fare
  paymentMethod: String, // "card"
  paymentStatus: String, // "success" or "failed"
  transactionId: String, // "TXN" + timestamp
  paymentDate: String,  // ISO date
  createdAt: Timestamp
}
```

### /stations Collection

```javascript
{
  id: "auto",
  stationCode: String,  // "NYC" - REQUIRED
  stationName: String,  // "New York Central Station"
  city: String,         // "New York"
  state: String,        // "NY"
  country: String,      // "USA"
  createdAt: Timestamp
}
```

### /users Collection

```javascript
{
  id: String,           // Firebase Auth UID (NOT auto - must match auth.uid)
  name: String,
  email: String,
  phone: String,
  role: String,         // "user" or "admin"
  createdAt: Timestamp
}
```

---

## 🔍 Required Firestore Indexes

These are automatically created by Firestore when you first query, but you can pre-create them:

### Index 1: trains (for searchTrains)

```
Collection: trains
Field: source (Ascending)
Status: Auto-created on first query
```

### Index 2: bookings (for getUserBookings)

```
Collection: bookings
Field: userId (Ascending)
Status: Auto-created on first query
```

### Index 3: bookings (for getBookingByPNR)

```
Collection: bookings
Field: PNR (Ascending)
Status: Auto-created on first query
```

### Index 4: trainSchedules (for getTrainSchedules)

```
Collection: trainSchedules
Field: trainId (Ascending)
Status: Auto-created on first query
```

### Index 5: trainSchedules (for getSchedulesForDate)

```
Collection: trainSchedules
Field: date (Ascending)
Status: Auto-created on first query
```

---

## 🧪 Verification Commands

### Test in Firestore Console:

**1. Check trains exist:**

```
Query: db.collection('trains').get()
Expected: At least 1 document with all required fields
```

**2. Check schedules for a train:**

```
Query: db.collection('trainSchedules').where('trainId', '==', 'YOUR_TRAIN_ID').get()
Expected: 30 documents (auto-generated for 30 days)
```

**3. Check booking after payment:**

```
Query: db.collection('bookings').where('userId', '==', 'CURRENT_USER_ID').get()
Expected: 1+ booking documents with PNR
```

**4. Check user after registration:**

```
Query: db.collection('users').doc('AUTH_UID').get()
Expected: User document with role='user'
```

---

## ⚡ Performance Tips

1. **Limit queries**: Each query reads all matching documents
2. **Paginate results**: Use `.limit(20)` for large lists
3. **Use indexes**: Composite queries need indexes
4. **Cache data**: Use React Query (already installed) to cache results
5. **Denormalize**: Keep trainNumber in /trainSchedules and /bookings for faster reads

---

## 📊 Expected Document Counts (After Testing)

| Collection     | Expected Count | Notes                      |
| -------------- | -------------- | -------------------------- |
| trains         | 5-10           | Sample trains for routes   |
| trainSchedules | 150-300        | 30 days × number of trains |
| stations       | 10-20          | Major stations             |
| bookings       | Variable       | One per test booking       |
| payments       | Variable       | One per successful booking |
| users          | Variable       | One per registered user    |

---

**Your app is fully integrated with Firebase!** ✅
