# ✅ Firebase Integration - Verification Checklist

Use this checklist to verify all Firebase collections are correctly created and integrated.

---

## 📋 PART 1: Collections Created in Firestore

- [ ] **trains** collection exists
  - [ ] Has at least 1 document with:
    - `trainNumber` (string)
    - `trainName` (string)
    - `source` (string) - matches a station code
    - `destination` (string) - matches a station code
    - `departureTime` (string)
    - `arrivalTime` (string)
    - `fare` (number)
    - `totalSeats` (number)
    - `seatsAvailable` (number)

- [ ] **trainSchedules** collection exists
  - [ ] Has documents for each train (30 days each)
  - [ ] Fields include:
    - `trainId` (string) - matches trains doc ID
    - `trainNumber` (string)
    - `date` (string) - format: YYYY-MM-DD
    - `seatsAvailable` (number)
    - `totalSeats` (number)
    - `isActive` (boolean)

- [ ] **bookings** collection exists
  - [ ] Fields ready for:
    - `userId` (string)
    - `trainId` (string)
    - `trainNumber` (string)
    - `trainName` (string)
    - `passengerName` (string)
    - `age` (number)
    - `gender` (string)
    - `coach` (string)
    - `seatNumber` (number)
    - `travelDate` (string) - format: YYYY-MM-DD
    - `PNR` (string) - 10 digits
    - `bookingStatus` (string)

- [ ] **payments** collection exists
  - [ ] Fields ready for:
    - `bookingId` (string)
    - `userId` (string)
    - `amount` (number)
    - `paymentMethod` (string)
    - `paymentStatus` (string)
    - `transactionId` (string)
    - `paymentDate` (string)

- [ ] **stations** collection exists
  - [ ] Has at least 5 documents with:
    - `stationCode` (string) - 2-3 letter code
    - `stationName` (string)
    - `city` (string)
    - `state` (string)
    - `country` (string)

- [ ] **users** collection exists
  - [ ] Ready to store user documents with:
    - Document ID = Firebase Auth UID (NOT auto-generated)
    - `name` (string)
    - `email` (string)
    - `phone` (string)
    - `role` (string) - "user" or "admin"

---

## 🔗 PART 2: Code Integration Verification

### Test 1: Register a New User

- [ ] Navigate to `/register`
- [ ] Fill form: name, email, phone, password
- [ ] Click Register
- [ ] Check Firebase Console:
  - [ ] New user appears in Authentication
  - [ ] New document in `/users` collection with matching UID
  - [ ] `role` field = "user"
  - [ ] Can see name, email, phone fields

### Test 2: Search for Trains

- [ ] Navigate to Home page
- [ ] In SearchForm:
  - [ ] Station dropdowns load (from `/stations`)
  - [ ] Select source, destination, date
  - [ ] Click Search
- [ ] Verify on SearchResults:
  - [ ] Shows trains going from source to destination
  - [ ] Shows available seats (from `/trainSchedules`)
  - [ ] Only shows trains with seats available

**Debug if failing:**

```
- Check /stations has documents with stationCode
- Check /trains has documents with matching source/destination
- Check /trainSchedules has documents with matching date
- Check seatsAvailable > 0 in /trainSchedules
```

### Test 3: Complete a Booking

- [ ] From SearchResults, click "Book" on a train
- [ ] Fill passenger details (name, age, gender)
- [ ] Click "Proceed to Payment"
- [ ] Review payment details
- [ ] Click "Pay" button
- [ ] Should redirect to `/ticket` with PNR

**Check Firebase Console:**

- [ ] New document in `/bookings` collection:
  - [ ] `userId` = current user's UID
  - [ ] `trainId`, `trainNumber`, `trainName` populated
  - [ ] `PNR` = 10 digits
  - [ ] `coach`, `seatNumber` populated
  - [ ] `bookingStatus` = "confirmed"
- [ ] New document in `/payments` collection:
  - [ ] `bookingId` matches booking doc ID
  - [ ] `userId` matches current user
  - [ ] `amount` = train fare
  - [ ] `paymentStatus` = "success"

- [ ] `/trainSchedules` updated:
  - [ ] `seatsAvailable` decreased by 1

### Test 4: View Bookings in Dashboard

- [ ] Logged in as the user who made booking
- [ ] Navigate to `/dashboard`
- [ ] Should see booking with:
  - [ ] Train name and number
  - [ ] PNR number
  - [ ] Passenger name
  - [ ] Coach and seat
  - [ ] Travel date
  - [ ] Status badge: "confirmed"
  - [ ] "Cancel Booking" button

### Test 5: Search by PNR

- [ ] Navigate to `/pnr-status`
- [ ] Enter the PNR from previous booking
- [ ] Click "Check"
- [ ] Should display booking details

**Debug if not found:**

```
- Check /bookings has document with that PNR
- Verify PNR is exactly 10 digits, no spaces
```

### Test 6: Cancel Booking

- [ ] From Dashboard, click "Cancel Booking"
- [ ] Confirm cancellation
- [ ] Check Firebase Console:
  - [ ] `/bookings` document `bookingStatus` = "cancelled"
  - [ ] `/trains` `seatsAvailable` increased by 1
  - [ ] `/trainSchedules` `seatsAvailable` increased by 1

### Test 7: Admin Panel Access

- [ ] Log in as admin user (must have `role: "admin"` in `/users`)
- [ ] Navigate to `/admin`
- [ ] Should see three tabs: Trains, Train Schedules, Bookings

**If access denied:**

```
- Go to Firebase Auth → Users
- Click user → Custom Claims
- Add: { "isAdmin": true }
- User must log out and back in
```

### Test 8: Admin Train Management

- [ ] Click "Add Train" button
- [ ] Fill in all train details
- [ ] Click "Add Train"
- [ ] Check Firebase Console:
  - [ ] New document in `/trains`
  - [ ] 30 new documents auto-created in `/trainSchedules`
  - [ ] Each schedule has sequential dates starting today
  - [ ] All dates in YYYY-MM-DD format

### Test 9: Admin Schedule Management

- [ ] In Admin panel, go to "Train Schedules" tab
- [ ] Select a train from left panel
- [ ] Click "Add Schedule"
- [ ] Fill date and available seats
- [ ] Click "Add Schedule"
- [ ] Check `/trainSchedules` collection:
  - [ ] New document created for that date
  - [ ] `trainId` matches selected train

### Test 10: Admin Bookings View

- [ ] In Admin panel, go to "Bookings" tab
- [ ] Should list all bookings
- [ ] Click on any booking to verify fields

---

## 🐛 PART 3: Troubleshooting

### Issue: Collections don't show up in code

**Solution:**

- Verify collection names match EXACTLY (case-sensitive):
  - `trains` (not `Trains`)
  - `trainSchedules` (not `trainschedules`)
  - `bookings`, `payments`, `stations`, `users`

### Issue: SearchForm is empty (no stations)

**Solution:**

```
1. Go to Firestore → Collections → stations
2. Click "Add Document"
3. Add: stationCode, stationName, city, state, country
4. Refresh SearchForm
```

### Issue: "No trains available" even after adding trains

**Solution:**

```
1. Check /trains has documents
2. Check source/destination exactly match station codes
3. Check /trainSchedules has documents for selected date
4. Check seatsAvailable > 0
```

### Issue: Booking fails with "No seats available"

**Solution:**

```
1. Verify /trainSchedules document exists for that date
2. Check seatsAvailable > 0
3. Check date format is YYYY-MM-DD
```

### Issue: Admin panel shows "Access denied"

**Solution:**

```
1. Firebase Console → Authentication → Users
2. Click the user email
3. Scroll down to "Custom Claims"
4. Add: { "isAdmin": true }
5. User must log out and log back in
```

### Issue: Dashboard is empty after booking

**Solution:**

```
1. Verify you're logged in as the booking user
2. Check /bookings document has correct userId
3. Refresh dashboard
4. Check browser console for errors
```

### Issue: PNR search not finding booking

**Solution:**

```
1. Verify /bookings has document with that exact PNR
2. PNR must be exactly 10 characters
3. No spaces or special characters
4. Check spelling exactly
```

---

## ✅ FINAL VERIFICATION

After completing all tests above, check these:

- [ ] All 6 collections exist in Firestore
- [ ] Can register and login
- [ ] Stations dropdown populates from data
- [ ] Can search trains
- [ ] Can complete full booking flow
- [ ] Booking appears in Dashboard
- [ ] PNR search works
- [ ] Can cancel booking
- [ ] Admin panel accessible when logged in as admin
- [ ] Can add/edit/delete trains in Admin
- [ ] Can manage schedules in Admin
- [ ] Can view bookings in Admin

---

## 🎯 If Everything Passes → You're Ready!

Your Firebase integration is **100% complete** and working correctly. ✅

The app is ready for:

- User testing
- Data migration
- Production deployment

---

**Last Updated:** March 6, 2025
**Firebase Collections:** 6/6 Integrated
**Status:** ✅ INTEGRATION COMPLETE
