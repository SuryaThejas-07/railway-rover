# 🚀 Quick Fix: Add Sample Data to Firebase

Your app works perfectly! It just needs data. Follow these steps to add trains and schedules.

---

## STEP 1: Go to Firebase Console

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **railway-reservation-e7952**
3. Click **Firestore Database** (left sidebar)
4. Click **Collections** tab
5. You should see your collections listed

---

## STEP 2: Check & Add Stations

### Check if stations exist:

1. Click **stations** collection
2. Look for documents with codes: `SBC`, `NDLS`
3. If they exist ✅, skip to STEP 3

### If stations are missing, add them:

**Add Station 1:**

- Click **+ Add Document** button
- Choose **Auto ID**
- Add these fields:
  ```
  stationCode   (string):  SBC
  stationName   (string):  Krantiveera Sangolli Rayanna Railway Station
  city          (string):  Bangalore
  state         (string):  Karnataka
  country       (string):  India
  ```
- Click **Save**

**Add Station 2:**

- Click **+ Add Document** button
- Choose **Auto ID**
- Add these fields:
  ```
  stationCode   (string):  NDLS
  stationName   (string):  New Delhi Railway Station
  city          (string):  New Delhi
  state         (string):  Delhi
  country       (string):  India
  ```
- Click **Save**

---

## STEP 3: Check & Add Trains

### Check if trains exist:

1. Click **trains** collection
2. Look for a train with `source: "SBC"` and `destination: "NDLS"`
3. If it exists ✅, go to STEP 4

### If trains are missing, add one:

1. Click **+ Add Document** button
2. Choose **Auto ID** (important! It will generate the document ID)
3. Add these fields:
   ```
   trainNumber      (string):   12295
   trainName        (string):   Bangalore-Delhi Express
   source           (string):   SBC
   destination      (string):   NDLS
   departureTime    (string):   08:00
   arrivalTime      (string):   18:00
   fare             (number):   3500
   totalSeats       (number):   200
   seatsAvailable   (number):   150
   ```
4. Click **Save**

**⚠️ IMPORTANT:** Copy the **Document ID** that was generated (looks like: `aBcDeF123`)
You'll need it in Step 4.

---

## STEP 4: Add Train Schedules

### Check if schedules exist:

1. Click **trainSchedules** collection
2. Look for documents with `date: "2026-07-03"` (the date you searched for)
3. If schedules exist ✅, your data is ready!

### If schedules are missing, add them:

1. Click **+ Add Document** button
2. Choose **Auto ID**
3. Add these fields:
   ```
   trainId         (string):   [PASTE_THE_DOCUMENT_ID_FROM_STEP_3]
   trainNumber     (string):   12295
   date            (string):   2026-07-03
   seatsAvailable  (number):   150
   totalSeats      (number):   200
   isActive        (boolean):  true
   ```
4. Click **Save**

**REPEAT** this 5 more times for consecutive dates:

- `2026-07-04`
- `2026-07-05`
- `2026-07-06`
- `2026-07-07`
- `2026-07-08`

(Just copy/paste and change the date each time)

---

## STEP 5: Test the Search

1. **Refresh your app** (F5 in browser)
2. Go to **Home** page
3. In SearchForm, select:
   - **From:** Bangalore (SBC)
   - **To:** New Delhi (NDLS)
   - **Travel Date:** 7/3/2026
4. Click **Search** button
5. You should now see:
   ✅ "Bangalore-Delhi Express" train
   ✅ Available seats: 150
   ✅ Price: ₹3500

---

## STEP 6: Complete a Test Booking

1. Click **Book** button
2. Enter passenger name, age, gender
3. Click **Proceed to Payment**
4. Review payment details
5. Click **Pay ₹3500**
6. You should see your ticket with **PNR** number ✅

---

## ✅ Troubleshooting

### "Still see 'No trains available'"

- [ ] Check you added `stationCode: "SBC"` and `"NDLS"` to stations
- [ ] Check you added `source: "SBC"` and `destination: "NDLS"` to trains
- [ ] Check you added schedule with `date: "2026-07-03"`
- [ ] Refresh the browser
- [ ] Clear browser cache (Ctrl+Shift+Delete)

### "No seats available on 7/3/2026"

- Check `/trainSchedules` document has `seatsAvailable: 150` (not 0)
- Make sure `isActive: true`

### Stations dropdown is empty

- Refresh the page
- Make sure you added documents to `/stations` collection

---

## 📊 Expected Result

After adding this data:

```
Firebase /trains collection:
├─ Document (auto-ID)
│  ├─ trainNumber: "12295"
│  ├─ trainName: "Bangalore-Delhi Express"
│  ├─ source: "SBC"
│  ├─ destination: "NDLS"
│  ├─ departureTime: "08:00"
│  ├─ arrivalTime: "18:00"
│  ├─ fare: 3500
│  ├─ totalSeats: 200
│  └─ seatsAvailable: 150

Firebase /trainSchedules collection:
├─ Document (auto-ID)
│  ├─ trainId: "[copied from trains document]"
│  ├─ trainNumber: "12295"
│  ├─ date: "2026-07-03"
│  ├─ seatsAvailable: 150
│  ├─ totalSeats: 200
│  └─ isActive: true
└─ ... (5 more documents for 2026-07-04 to 2026-07-08)

Firebase /stations collection:
├─ Document (auto-ID)
│  ├─ stationCode: "SBC"
│  ├─ stationName: "Krantiveera Sangolli Rayanna Railway Station"
│  ├─ city: "Bangalore"
│  ├─ state: "Karnataka"
│  └─ country: "India"
└─ Document (auto-ID)
   ├─ stationCode: "NDLS"
   ├─ stationName: "New Delhi Railway Station"
   ├─ city: "New Delhi"
   ├─ state: "Delhi"
   └─ country: "India"
```

---

## 🎉 Once Done

Your app will work perfectly! You can:

✅ Search trains
✅ See available seats
✅ Book tickets
✅ Get PNR number
✅ View bookings in dashboard
✅ Cancel bookings

---

**Need help?** Check the [FIREBASE_VERIFICATION_CHECKLIST.md](./FIREBASE_VERIFICATION_CHECKLIST.md) for more details.
