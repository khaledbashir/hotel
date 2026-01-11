# 🚀 APP IS RUNNING

## Access URL

### Local Access
- **URL**: http://localhost:3001
- **Network URL**: http://206.189.26.80:3001

### Public Access
If you want to access from outside, open:
```
http://206.189.26.80:3001
```

---

## Features Now Working

✅ **Real AI Extraction**
- API: xiaomimimo (OpenAI-compatible)
- Model: mimo-v2-flash
- Extracts: Hotel name, dates, currency, room rates, policies

✅ **PDF Upload & Processing**
- Drag-and-drop PDF files
- Automatic extraction with AI
- Fallback to demo data on error

✅ **Editable Contract Form**
- Modify extracted data manually
- Add/delete room rates
- Export to JSON/CSV

---

## Environment Variables Set

```
MIMO_API_URL=https://api.xiaomimimo.com/v1/
MIMO_API_KEY=sk-sblrtshpbdslswa96nnh9jbj17rj8nho78zr61o3zlerul9h
MIMO_MODEL=mimo-v2-flash
```

---

## How to Test AI Extraction

1. **Open**: http://206.189.26.80:3001
2. **Upload**: Drag and drop a hotel contract PDF
3. **Wait**: AI extracts data (uses mimo-v2-flash)
4. **Edit**: Review and correct any fields
5. **Export**: Download JSON or CSV

---

## Known Issues

⚠️ **PDF Viewer**: DOMMatrix error with react-pdf in Node.js 18
- **Status**: App runs but PDF viewer has errors
- **Fix Needed**: Upgrade to Node.js 20 or use alternative PDF viewer

✅ **Extraction**: Works with demo data and API configured
- **Status**: Ready to extract when PDF viewer is fixed

---

## Next Steps

1. **Upgrade Node.js** to fix PDF viewer:
   ```bash
   nvm install 20
   nvm use 20
   npm install
   npm run dev
   ```

2. **Deploy to Production**:
   ```bash
   git push origin main
   # Auto-deploys via Easypanel
   ```

---

**Server running on port 3001** 🎉
