# Calculator Database Save - Testing Guide

## Current Status
✅ Database has **45 existing calculations**
✅ Backend running on port 5002
✅ Auto-login implemented
✅ Save function with auth token added

---

## STEP 1: Verify Auto-Login

### What to do:
1. Open browser: `http://localhost:3001/calculator`
2. Open DevTools: Press **F12**
3. Go to **Console** tab
4. Look for these messages:

### Expected Console Output:
```
🔧 DEV MODE: Attempting auto-login...
✅ DEV MODE: Auto-logged in as admin@kleinpaket.com
```

### Also check:
- **Application** tab → **Local Storage** → `http://localhost:3001`
- Should see `token` key with JWT value

### If auto-login fails:
- Check console for error message
- Verify backend is running: `curl http://localhost:5002/api/v1/auth/login`
- Check Network tab for failed requests

---

## STEP 2: Run Test Calculation

### Form Data:
```
Product Name: Test Product 1
Category: Electronics
Buying Price: 50
Selling Price: 100
Destination Country: Germany
Length: 20 cm
Width: 15 cm
Height: 5 cm
Weight: 0.5 kg
```

### What to do:
1. Fill in all fields
2. Click **"Calculate"** button
3. Wait for results to appear

---

## STEP 3: Check Save Confirmation

### Expected Console Output:
```
🧮 Running calculation with: {...}
📊 Raw calculation result: {...}
✅ Calculation result: {...}
💾 Saving calculation to database...
✅ Calculation saved with ID: 46
```

### Expected Toast Notification:
```
✅ Calculation saved successfully!
```

### If save fails:
Look for these error messages:
- `⚠️ User not logged in - calculation not saved` → Auto-login failed
- `❌ Failed to save calculation: Error: Request failed with status code 401` → Token missing/invalid
- `❌ Failed to save calculation: Error: Network Error` → Backend not running

---

## STEP 4: Verify Database Entry

### Command:
```bash
sqlite3 server/database/kleinpaket.db "SELECT id, json_extract(input_json, '$.product_name') as product_name, datetime(created_at, 'localtime') as created FROM calculations ORDER BY created_at DESC LIMIT 3;"
```

### Expected Output:
```
46|Test Product 1|2025-11-22 18:48:23
45|Large Book Set|2025-11-22 18:24:58
44|Small Electronics Kit|2025-11-22 18:24:58
```

### Alternative (simpler):
```bash
sqlite3 server/database/kleinpaket.db "SELECT COUNT(*) FROM calculations;"
```

Before test: `45`
After test: `46` (should increase by 1)

---

## STEP 5: Test Multiple Calculations

### Test Product 2:
```
Product Name: Test Product 2
Buying Price: 30
Selling Price: 60
Weight: 1.0 kg
```

### Test Product 3:
```
Product Name: Test Product 3
Buying Price: 100
Selling Price: 200
Weight: 3.0 kg
```

### Verify count increased:
```bash
sqlite3 server/database/kleinpaket.db "SELECT COUNT(*) FROM calculations;"
```

Should show: `47` after 2nd test, `48` after 3rd test

---

## STEP 6: Inspect Saved Data

### View input data:
```bash
sqlite3 server/database/kleinpaket.db "SELECT json_extract(input_json, '$.product_name') as name, json_extract(input_json, '$.buying_price') as buy, json_extract(input_json, '$.selling_price') as sell FROM calculations WHERE id = 46;"
```

### Expected Output:
```
Test Product 1|50|100
```

### View full JSON (formatted):
```bash
sqlite3 server/database/kleinpaket.db "SELECT input_json FROM calculations WHERE id = 46;" | python3 -m json.tool
```

### Expected Structure:
```json
{
  "product_name": "Test Product 1",
  "category": "Electronics",
  "buying_price": 50,
  "selling_price": 100,
  "destination_country": "Germany",
  "length_cm": 20,
  "width_cm": 15,
  "height_cm": 5,
  "weight_kg": 0.5
}
```

### View output data:
```bash
sqlite3 server/database/kleinpaket.db "SELECT json_extract(output_json, '$.totals.net_profit') as profit, json_extract(output_json, '$.eligibility') as eligible FROM calculations WHERE id = 46;"
```

---

## Troubleshooting

### Issue: No console logs appear
**Solution:** 
- Refresh page with DevTools open
- Check if Console is filtering messages (should show "All levels")
- Try `console.log('test')` to verify console works

### Issue: "User not logged in" message
**Solution:**
```javascript
// In browser console, check token:
localStorage.getItem('token')

// If null, manually trigger login:
fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@kleinpaket.com',
    password: 'admin123'
  })
})
.then(r => r.json())
.then(d => {
  localStorage.setItem('token', d.token);
  console.log('Token set:', d.token);
  location.reload();
})
```

### Issue: 401 Unauthorized
**Solution:**
- Token expired or invalid
- Clear localStorage and refresh: `localStorage.clear(); location.reload();`
- Check backend logs for auth errors

### Issue: Network Error
**Solution:**
- Backend not running on port 5002
- Start backend: `npm run dev`
- Check proxy in `client/package.json`: should be `"proxy": "http://localhost:5002"`

---

## Quick Verification Commands

### Count calculations:
```bash
sqlite3 server/database/kleinpaket.db "SELECT COUNT(*) FROM calculations;"
```

### Latest 5 calculations:
```bash
sqlite3 server/database/kleinpaket.db "SELECT id, json_extract(input_json, '$.product_name') as name, datetime(created_at, 'localtime') as time FROM calculations ORDER BY id DESC LIMIT 5;"
```

### Check user's calculations:
```bash
sqlite3 server/database/kleinpaket.db "SELECT COUNT(*) FROM calculations WHERE user_id = 1;"
```

### View calculation details:
```bash
sqlite3 server/database/kleinpaket.db "SELECT * FROM calculations WHERE id = 46;" | head -20
```

---

## Success Criteria

✅ Auto-login console messages appear
✅ Token exists in localStorage
✅ Calculation completes and shows results
✅ "Saving to database" console message appears
✅ "Calculation saved with ID" message appears
✅ Toast notification shows success
✅ Database count increases by 1 per calculation
✅ Product name appears in database query
✅ Input JSON contains all form fields
✅ Output JSON contains calculation results

---

## Current Database State

**Total Calculations:** 45
**Latest Entry:** Large Book Set (2025-11-22 18:24:58)
**User ID 1 (admin):** All 45 calculations

After your tests, you should see:
- 46: Test Product 1
- 47: Test Product 2
- 48: Test Product 3

---

## Report Template

Copy this and fill in your results:

```
STEP 1 - Auto-Login:
[ ] Console shows auto-login messages
[ ] Token exists in localStorage
[ ] Error (if any): ___________

STEP 2 - Test Calculation:
[ ] Form filled successfully
[ ] Calculate button clicked
[ ] Results displayed
[ ] Error (if any): ___________

STEP 3 - Save Confirmation:
[ ] "Saving to database" message
[ ] "Calculation saved with ID" message
[ ] Toast notification appeared
[ ] Error (if any): ___________

STEP 4 - Database Verification:
[ ] Count increased from 45 to ___
[ ] Product name appears in query
[ ] Error (if any): ___________

STEP 5 - Multiple Calculations:
[ ] Test Product 2 saved (count: ___)
[ ] Test Product 3 saved (count: ___)
[ ] Error (if any): ___________

STEP 6 - Data Inspection:
[ ] Input JSON looks correct
[ ] Output JSON contains results
[ ] Error (if any): ___________

OVERALL STATUS: [ ] PASS / [ ] FAIL
```

---

**Next Steps After Testing:**
1. If all tests pass → Integration complete! 🎉
2. If any test fails → Report exact error message for debugging
3. Consider adding History page to view saved calculations
4. Consider adding Export functionality
