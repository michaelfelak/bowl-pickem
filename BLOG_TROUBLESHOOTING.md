# Blog Display Troubleshooting Guide

## What to Check

### 1. **Browser Console Errors**
1. Open your browser's **Developer Tools** (F12)
2. Go to the **Console** tab
3. Look for any error messages
4. You should see log messages like:
   - "Loading blogs for year: 2025 from URL: http://localhost:8081/api/v1/blogentry/list/2025"
   - "Blog entries loaded: [...]" (with the API response)
   - "Processed blogs: [...]" (with the formatted blogs)

### 2. **Network Tab**
1. Open **Developer Tools** → **Network** tab
2. Refresh the page
3. Look for a request to `blogentry/list/2025`
4. Check:
   - **Status code**: Should be `200` for success
   - **Response**: Should show JSON array of blog entries
   - If it shows **404**: The backend endpoint doesn't exist
   - If it shows **CORS error**: Cross-origin request issue
   - If it shows **Connection refused**: Backend is not running

### 3. **Backend API Check**
The frontend is trying to call: **`http://localhost:8081/api/v1/blogentry/list/2025`**

To test if the backend endpoint is working:
```bash
# Using curl
curl http://localhost:8081/api/v1/blogentry/list/2025

# Or in PowerShell
Invoke-WebRequest -Uri "http://localhost:8081/api/v1/blogentry/list/2025"
```

Expected response should be a JSON array like:
```json
[
  {
    "Id": 1,
    "Title": "Blog Entry",
    "Body": "This is the blog content...",
    "PostedBy": "The General",
    "CreatedDate": "2025-12-07T00:00:00Z",
    "Year": 2025
  }
]
```

### 4. **Common Issues & Solutions**

#### Issue: "No blog entries available for this year"
**Causes:**
- Backend endpoint not implemented yet
- No data in the database for year 2025
- Backend is returning empty array `[]`

**Solution:**
- Implement the backend endpoints (see `BLOG_BACKEND_IMPLEMENTATION.md`)
- Add test data to the database
- Check backend logs for errors

#### Issue: "Loading blog entries..." stays on screen
**Causes:**
- API request is hanging/not responding
- Backend is not running
- Network connectivity issue

**Solution:**
- Check that backend is running (`localhost:8081`)
- Check Network tab to see if request completes
- Look for CORS errors

#### Issue: Blog content shows but looks ugly
**Causes:**
- HTML formatting issue with line breaks
- CSS styling not applied

**Solution:**
- Check browser console for CSS errors
- Verify `daily-blog.component.scss` is loaded
- Check if HTML is being properly rendered

### 5. **Test with Hardcoded Data**
If the API is not working yet, you can temporarily test the UI with hardcoded data by modifying `daily-blog.component.ts`:

```typescript
private loadBlogs() {
  // Temporarily use hardcoded test data
  const testBlogs: BlogEntry[] = [
    {
      Id: '1',
      Title: 'Test Blog',
      Body: 'This is a test blog entry.\n\nIt has multiple paragraphs.',
      PostedBy: 'Test Author',
      CreatedDate: '2025-12-07T10:00:00Z',
      Year: 2025
    }
  ];
  
  // Then process normally
  this.blogs = testBlogs.map(b => { ... }).sort(...);
  this.isLoading = false;
}
```

### 6. **Current Year Check**
Verify the year being requested:
- Open Console tab
- You'll see: "Loading blogs for year: 2025 from URL: ..."
- Make sure the year in the URL matches the year in your database

## Debug Output to Look For

When you load the home page, check the **Console** for these messages:

```
Loading blogs for year: 2025 from URL: http://localhost:8081/api/v1/blogentry/list/2025
Blog entries loaded: Array(2)
  0: {Id: "1", Title: "Game Analysis", Body: "Content...", PostedBy: "The General", CreatedDate: "2025-12-07T12:00:00Z", Year: 2025, SafeBody: SafeHtml}
  1: {Id: "2", Title: "Update", Body: "More content...", PostedBy: "Admin", CreatedDate: "2025-12-06T12:00:00Z", Year: 2025, SafeBody: SafeHtml}
Processed blogs: Array(2)
```

## Next Steps

1. **Check the Network tab** first to see if the API is being called
2. **Check the Console** for error messages
3. **Verify the backend** is running and the endpoint is implemented
4. **Add test data** to the database if the table is empty
5. **Share any error messages** you see if you need further help
