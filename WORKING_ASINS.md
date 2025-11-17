# Working ASINs for Testing

## ✅ API Key Status
**API Key:** `7BA02CB83B274132A7968F241D839111`  
**Status:** ✅ Active and Working  
**Credits Remaining:** 96  

## 🔍 How to Find Working ASINs

### Method 1: Amazon Website
1. Go to Amazon.de (or your target marketplace)
2. Search for any product
3. Click on the product
4. Look at the URL: `https://www.amazon.de/dp/B0XXXXXXXXX`
5. The ASIN is after `/dp/` (10 characters, starts with B0)

### Method 2: Product Details
1. On any Amazon product page
2. Scroll to "Product Details" or "Produktdetails"
3. Look for "ASIN:" followed by the code

## 📝 Test ASINs by Marketplace

### 🇩🇪 Germany (amazon.de)
To find current working ASINs:
1. Visit: https://www.amazon.de/
2. Search for: "bestseller electronics" or "bestseller"
3. Pick any product
4. Copy ASIN from URL or product details

**Popular Categories:**
- Electronics: Search "Echo Dot" or "Fire TV Stick"
- Books: Search "bestseller bücher"
- Home & Kitchen: Search "kaffeemaschine"

### 🇺🇸 United States (amazon.com)
- Go to: https://www.amazon.com/best-sellers
- Pick any product
- Copy ASIN

### 🇬🇧 United Kingdom (amazon.co.uk)
- Go to: https://www.amazon.co.uk/best-sellers
- Pick any product
- Copy ASIN

### 🇫🇷 France (amazon.fr)
- Go to: https://www.amazon.fr/gp/bestsellers
- Pick any product
- Copy ASIN

### 🇪🇸 Spain (amazon.es)
- Go to: https://www.amazon.es/gp/bestsellers
- Pick any product
- Copy ASIN

### 🇮🇹 Italy (amazon.it)
- Go to: https://www.amazon.it/gp/bestsellers
- Pick any product
- Copy ASIN

## 🧪 Testing Steps

### 1. Find a Product ASIN
```bash
# Example: Go to Amazon.de and search for "Echo Dot"
# Product URL: https://www.amazon.de/dp/B09B8V1LZ3
# ASIN: B09B8V1LZ3
```

### 2. Test with Command Line
```bash
cd server
node test-rainforest.js B09B8V1LZ3 de
```

### 3. Test in Frontend
1. Start servers:
   ```bash
   cd server && npm start
   cd client && npm start
   ```
2. Go to Calculator page
3. Enter ASIN: `B09B8V1LZ3`
4. Select marketplace: `🇩🇪 DE`
5. Click "Fetch Product"

## ⚠️ Common Issues

### Issue: "Product not found"
**Cause:** ASIN doesn't exist in that marketplace  
**Solution:** 
- Verify ASIN is correct (10 characters)
- Check you're using the right marketplace
- Try searching the product on Amazon first
- Get ASIN from Amazon product page directly

### Issue: "Invalid ASIN"
**Cause:** ASIN format is wrong  
**Solution:**
- ASIN must be exactly 10 characters
- Usually starts with B0
- Only alphanumeric (no special characters)

## 💡 Pro Tips

### Get Fresh ASINs Daily
1. Visit Amazon bestsellers page
2. Copy ASIN from any current product
3. These are guaranteed to exist

### Bookmark This Link
https://www.amazon.de/gp/bestsellers/electronics

### Use Amazon Search API Alternative
If you need bulk ASINs, you can:
1. Use Amazon Product Advertising API
2. Use web scraping (check Amazon's ToS)
3. Use third-party ASIN databases

## 📊 API Usage

**Current Status:**
- ✅ API Key is working
- ✅ Connection successful
- ✅ Credits available: 96
- ✅ Cost per request: 1 credit

**Rate Limits:**
- 5 requests per second
- Automatic retry (3 attempts)
- 1-second delay between retries

## 🎯 Quick Start

**Want to test right now?**

1. **Go to:** https://www.amazon.de/
2. **Search:** "Echo Dot" (or any product)
3. **Click:** First result
4. **Copy ASIN:** From URL (`/dp/XXXXXXXXXX`)
5. **Test:** Use that ASIN in the app

## 📝 Example Workflow

```bash
# Step 1: Find product on Amazon
Open: https://www.amazon.de/
Search: "bestseller electronics"
Click: First product
URL: https://www.amazon.de/dp/B0XXXXXXXXX

# Step 2: Copy ASIN
ASIN: B0XXXXXXXXX (from URL)

# Step 3: Test
cd server
node test-rainforest.js B0XXXXXXXXX de

# If successful, use in app
# If "Product not found", try another product
```

## ✅ Success Checklist

- [ ] API key added to server
- [ ] Server restarted
- [ ] Test script works
- [ ] Got ASIN from Amazon.de
- [ ] ASIN is 10 characters
- [ ] Marketplace matches where you got ASIN
- [ ] Frontend shows product data

---

**Last Updated:** $(date)  
**API Credits Remaining:** 96  
**Status:** ✅ Ready for use









