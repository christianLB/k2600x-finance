# Professional Debugging Strategy

## Current Status
- ✅ API endpoints work via curl (tested on port 3001)
- ❌ Frontend buttons not working (according to user)
- ❌ 400 Bad Request on POST from frontend
- ❌ DELETE from table not working

## Debugging Steps You Need to Follow

### 1. **Browser Console Inspection**
Open `http://localhost:3001/admin/diagnostics` in your browser and:

1. **Open Developer Tools** (F12)
2. **Check Console tab** - You should see:
   ```
   🚨🚨🚨 DIAGNOSTICS PAGE LOADED - NEW CODE IS ACTIVE v2 🚨🚨🚨
   🌐 Current location: http://localhost:3001/admin/diagnostics
   ```
3. **If you don't see these logs**: The page isn't loading my updated code

### 2. **Network Tab Analysis**
1. **Clear Network tab**
2. **Click any button** (Create, Update, Delete)
3. **Check for failed requests**:
   - Look for red/failed requests to `/api/strapi/collections/...`
   - Check the Request payload in the Network tab
   - Check the Response for error details

### 3. **Expected vs Actual Debugging**

#### **For Standalone Buttons**:
Expected console logs when clicking Create:
```
🚀 Frontend CREATE - Selected model: api::documento.documento  
🚀 Frontend CREATE - Original parsed: {name: "Test Client", city: "Test City"}
🚀 Frontend CREATE - Clean data: {name: "Test Client", city: "Test City"}
```

Expected server logs:
```
➕ POST request: { collection: "api::documento.documento" }
📦 POST body: {name: "Test Client", city: "Test City"}
✅ POST successful: { id: 24, documentId: "xyz789" }
```

#### **For Table Delete**:
Expected console logs when clicking Delete button in table:
```
🗑️ Deleting row: {id: 3, documentId: "ygsggg9x2hvz0lfzg40d45ky", estado: "pendiente", ...}
🔑 Primary key config: documentId
🆔 Extracted ID: ygsggg9x2hvz0lfzg40d45ky string
```

Expected server logs:
```
🗑️ DELETE request: { collection: "api::documento.documento", id: "ygsggg9x2hvz0lfzg40d45ky" }
✅ DELETE successful
```

### 4. **Common Issues to Check**

1. **Browser Cache**: Hard refresh (Ctrl+F5) to ensure you're getting updated code
2. **Port Mismatch**: Ensure you're on `http://localhost:3001`, not 3000
3. **JavaScript Errors**: Check Console for any red errors that might break the page
4. **Network Errors**: Check if requests are reaching the server at all

### 5. **Manual Testing Commands**

If frontend is broken, test API directly:

```bash
# Test CREATE (should work)
curl -X POST "http://localhost:3001/api/strapi/collections/YXBpOjpkb2N1bWVudG8uZG9jdW1lbnRv" \
  -H "Content-Type: application/json" \
  -d '{"estado": "pendiente", "resumen": "manual test"}' \
  -w "Status: %{http_code}\n"

# Test DELETE (should work)  
curl -X DELETE "http://localhost:3001/api/strapi/collections/YXBpOjpkb2N1bWVudG8uZG9jdW1lbnRv/[SOME-DOCUMENT-ID]" \
  -w "Status: %{http_code}\n"
```

### 6. **What to Report Back**

Please share:
1. **Console logs** when you click buttons
2. **Network tab** showing the actual requests/responses
3. **Any JavaScript errors** in red in the console
4. **Server terminal logs** (if you can see them)

This will tell us exactly where the disconnect is between my code changes and what's actually running in your browser.

## Most Likely Issues

1. **Browser cache serving old code** (most common)
2. **JavaScript compilation error** preventing page load
3. **Mutation functions calling wrong endpoints**
4. **React Query cache/state issues**

## Action Plan

1. **You test in browser** with dev tools open
2. **Share specific error messages/logs**
3. **I fix the actual issues** based on real data
4. **We verify it works** step by step

No more guessing. Let's debug this professionally with real browser data.