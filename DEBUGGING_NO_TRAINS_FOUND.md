# 🐛 Train Search Not Working - Debugging Guide

## Problem Analysis

The search shows "No trains available" when searching for **SBC → NDLS on 7/3/2026**

This happens when:

1. ❌ No trains exist with that route
2. ❌ No schedules exist for that date
3. ❌ Date format mismatch
4. ❌ seatsAvailable = 0

---

## ✅ Step 1: Check Your Firebase Data

### Check 1A: Do you have the /stations collection?

1. Go to Firebase Console → Firestore → Collections
2. Click **stations** collection
3. Look for documents with:
   - `stationCode: "SBC"` (Bangalore)
   - `stationCode: "NDLS"` (New Delhi)

**If missing:** Add these stations:

```json
Document 1:
{
  "stationCode": "SBC",
  "stationName": "Krantiveera Sangolli Rayanna Railway Station",
  "city": "Bangalore",
  "state": "Karnataka",
  "country": "India"
}

Document 2:
{
  "stationCode": "NDLS",
  "stationName": "New Delhi Railway Station",
  "city": "New Delhi",
  "state": "Delhi",
  "country": "India"
}
```

### Check 1B: Do you have trains with SBC → NDLS route?

1. Go to Firebase Console → Firestore → Collections → **trains**
2. Look for any train with:
   - `source: "SBC"`
   - `destination: "NDLS"`

**If missing:** Add a test train:

```json
{
  "trainNumber": "12295",
  "trainName": "Bangalore-Delhi Express",
  "source": "SBC",
  "destination": "NDLS",
  "departureTime": "08:00",
  "arrivalTime": "18:00",
  "fare": 3500,
  "totalSeats": 200,
  "seatsAvailable": 150
}
```

### Check 1C: Do you have trainSchedules for the selected date?

1. Go to Firebase Console → Firestore → Collections → **trainSchedules**
2. Look for documents where:
   - The date matches **2026-07-03** (ISO format: YYYY-MM-DD)
   - `seatsAvailable > 0`

**Important:** The date format MUST be exactly: **YYYY-MM-DD**

The user selected 7/3/2026, which should be stored as **2026-07-03**

**If missing:** Add schedules for these dates:

```json
{
  "trainId": "[THE_TRAIN_DOC_ID_FROM_PREVIOUS_STEP]",
  "trainNumber": "12295",
  "date": "2026-07-03",
  "seatsAvailable": 150,
  "totalSeats": 200,
  "isActive": true
}
```

---

## ✅ Step 2: Fix the Date Format Issue

The problem might be date format. The code expects dates in **ISO format: YYYY-MM-DD**

### In the browser console (F12), check what date is being sent:

```javascript
// Check if you're on /search page:
const params = new URLSearchParams(window.location.search);
console.log("Date param:", params.get("date"));
// Should print: 2026-07-03
```

**If it shows something like "7/3/2026":** There's a format issue.

---

## ✅ Step 3: Add Sample Data in Firebase

Since you're seeing the search page, your app is working. You just need test data.

### Quick Setup (5 minutes):

1. **Add Stations** (if not done):
   - Go to Firestore → stations collection → Add Document
   - Add these 4 stations:
     ```
     SBC, Bangalore South, Bangalore, Karnataka, India
     NDLS, New Delhi, New Delhi, Delhi, India
     HWH, Howrah, Kolkata, West Bengal, India
     CST, Mumbai Central, Mumbai, Maharashtra, India
     ```

2. **Add 1 Train** (SBC to NDLS):
   - Go to Firestore → trains collection → Add Document
   - Fill in:
     ```
     trainNumber: 12295
     trainName: Bangalore-Delhi Express
     source: SBC
     destination: NDLS
     departureTime: 08:00
     arrivalTime: 18:00
     fare: 3500
     totalSeats: 200
     seatsAvailable: 150
     ```
   - **Copy the document ID** (you'll need it)

3. **Add Schedule** (for the selected date):
   - Go to Firestore → trainSchedules collection → Add Document
   - Fill in:
     ```
     trainId: [PASTE_THE_DOCUMENT_ID_FROM_STEP_2]
     trainNumber: 12295
     date: 2026-07-03
     seatsAvailable: 150
     totalSeats: 200
     isActive: true
     ```

4. **Refresh the search page** and try again

---

## ✅ Step 4: If Still Not Working - Debug the Code

Add this to SearchResults.tsx to see what's happening:

Open browser Developer Tools (F12 → Console) and look for messages like:

```
Error loading trains: {error message}
Could not load schedules: {error message}
```

These will tell you exactly what's wrong.

---

## ✅ Common Causes & Fixes

| Issue                                      | Cause                                          | Fix                                                    |
| ------------------------------------------ | ---------------------------------------------- | ------------------------------------------------------ |
| "No trains found for this route"           | No trains with SBC→NDLS                        | Add train to `/trains` collection                      |
| Shows trains but says "No seats available" | No schedules for that date OR seatsAvailable=0 | Add schedule to `/trainSchedules` for that date        |
| Schedules not found                        | Date format wrong                              | Use format: **2026-07-03** (not 7/3/2026)              |
| Stations dropdown empty                    | No stations in database                        | Add documents to `/stations` collection                |
| Can see trains but can't book              | seatsAvailable ≤ 0 in schedule                 | Update schedule document, change seatsAvailable to > 0 |

---

## 🔍 How the Search Works

```
1. User selects: Source="SBC", Destination="NDLS", Date="7/3/2026"
2. App converts date to ISO format: "2026-07-03"
3. searchTrains() queries /trains collection:
   - Finds all trains where source=="SBC"
   - Filters to those with destination=="NDLS"
4. getSchedulesForDate() queries /trainSchedules:
   - Finds all schedules with date=="2026-07-03"
5. Filters trains to only those that have schedules for that date
6. Shows available trains
```

---

## ✅ Verification Steps

After adding data:

1. **Home page** → SearchForm should have SBC and NDLS in dropdowns
2. **Select:** SBC → NDLS → 7/3/2026
3. **Click Search** → Should show "Bangalore-Delhi Express" train
4. **Click Book** → Should proceed to passenger details
5. **Complete booking** → Should show ticket with PNR

If all these work, your Firebase integration is correct! ✅

---

## Still Stuck?

Check these:

1. **Firebase Console → Firestore → Data:**
   - [ ] `/stations` has SBC and NDLS documents
   - [ ] `/trains` has at least 1 document with source="SBC", destination="NDLS"
   - [ ] `/trainSchedules` has documents with date="2026-07-03"

2. **Browser Console (F12):**
   - Look for any red error messages
   - Check network tab for failed requests

3. **Date Format:**
   - Must be: YYYY-MM-DD (e.g., 2026-07-03)
   - Not: MM/DD/YYYY or other formats

---

**Once you add the sample data, the search will work!** ✅
