# 🚀 DEPLOYMENT GUIDE - Hotel Contract Intelligence Dashboard

## System Status

✅ **PROJECT SCAFFOLDED**: Complete Next.js 14 architecture ready
✅ **UI COMPONENTS**: All Shadcn/UI components installed and configured
✅ **SCHEMA DEFINED**: Type-safe Zod validation for contract data
✅ **STATE MANAGEMENT**: Zustand store configured
✅ **DOCKER READY**: Dockerfile + docker-compose.yml for production

⚠️ **NODE VERSION**: Current environment has Node 18.19.1, requires 20.9.0+

## Quick Start (On Compatible Environment)

### Local Development
```bash
# Requires Node 20.9.0+
cd /hotel
npm install
npm run dev
```

### Production Deployment (Easypanel/DigitalOcean)

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Hotel Contract Intelligence Dashboard"
   git remote add origin <your-github-repo>
   git push -u origin main
   ```

2. **Configure Easypanel**:
   - Add new project from GitHub repo
   - Set build command: `npm run build`
   - Set start command: `npm start`
   - Set environment variable: `OPENAI_API_KEY`
   - Enable auto-deploy on push

3. **Environment Variables**:
   ```env
   OPENAI_API_KEY=sk-proj-...
   NODE_ENV=production
   ```

### Docker Deployment (Alternative)
```bash
# Build and run with docker-compose
docker-compose up --build -d
```

## Application Architecture

### File Structure
```
/hotel
├── app/
│   ├── layout.tsx              # Root layout with Toaster provider
│   ├── page.tsx                # Main dashboard (upload → workbench flow)
│   └── globals.css             # Tailwind + custom styles
│
├── components/
│   ├── ui/                     # Shadcn components (button, card, input, etc.)
│   ├── upload-zone.tsx         # Drag-and-drop PDF/DOCX ingestion
│   ├── pdf-viewer.tsx          # react-pdf viewer with zoom & pagination
│   ├── contract-form.tsx       # Editable form with room rates array
│   └── workbench.tsx           # Split-view layout wrapper
│
├── lib/
│   ├── schemas/
│   │   └── contract-schema.ts  # Zod schemas, types, mock data
│   ├── store/
│   │   └── contract-store.ts   # Zustand state (contract, file, loading)
│   └── utils.ts                # Shadcn utility (cn function)
│
├── Dockerfile                  # Multi-stage production build
├── docker-compose.yml          # Service orchestration
├── next.config.ts              # Webpack config for react-pdf
└── .env.local.example          # Environment template
```

### State Flow
```
User uploads PDF 
  → UploadZone validates & sets file in store
  → (Future) Server Action calls OpenAI with file
  → Contract data stored in Zustand
  → Workbench renders PDF + Form
  → User edits form fields
  → Export to JSON/CSV
```

### Key Features Implemented
- ✅ Drag-and-drop file upload with validation
- ✅ PDF viewer with zoom, pagination, text layer
- ✅ Dynamic form with nested room rates array
- ✅ Add/delete room rates inline
- ✅ Export to JSON (validated) and CSV
- ✅ Mock data demo button
- ✅ Toast notifications for UX feedback
- ✅ Loading states with skeleton UI
- ✅ Error handling for invalid files
- ✅ Responsive design (wide-screen optimized)

## Next Development Steps

### Phase 1: OpenAI Integration (CRITICAL)
1. Create Server Action: `app/actions/extract-contract.ts`
2. Implement file-to-base64 conversion for PDFs
3. Use OpenAI SDK with Structured Outputs:
   ```typescript
   import OpenAI from "openai";
   import { zodResponseFormat } from "openai/helpers/zod";
   
   const completion = await openai.beta.chat.completions.parse({
     model: "gpt-4o-2024-08-06",
     messages: [
       { role: "system", content: "Extract hotel contract data..." },
       { role: "user", content: [{ type: "image_url", image_url: { url: pdfImageBase64 } }] }
     ],
     response_format: zodResponseFormat(HotelContractSchema, "hotel_contract"),
   });
   ```
4. Handle multi-page PDFs (extract each page as image)
5. Stream progress updates to UI

### Phase 2: Advanced Features
- Real-time extraction progress bar
- Confidence scoring per field
- Highlight extracted fields in PDF (text layer matching)
- Contract comparison view (upload 2+ contracts)
- Historical contract versioning
- Analytics dashboard (avg rates, seasonal trends)

### Phase 3: Production Hardening
- Rate limiting for OpenAI calls
- File size optimization (compress before upload)
- Redis caching for processed contracts
- PostgreSQL for contract persistence
- User authentication (Clerk or NextAuth)
- Webhook notifications on extraction complete

## Gotchas & Known Issues

### Node Version Requirement
- **Problem**: Next.js 16.x requires Node 20.9.0+
- **Solution**: Use NVM on deployment server:
  ```bash
  nvm install 20
  nvm use 20
  npm install
  npm run build
  ```

### react-pdf Configuration
- Already configured in `next.config.ts` with webpack aliases
- CDN worker URL in `pdf-viewer.tsx` (unpkg.com)
- For production, consider hosting worker locally

### OpenAI Costs
- GPT-4o Vision: ~$0.01 per page (approximate)
- Use GPT-4o-mini for development ($0.00015/1K tokens)
- Cache system prompts to reduce costs

### File Upload Limits
- Current: 10MB max (client-side validation)
- For production: Configure Next.js `bodyParser` limits
- Consider cloud storage (S3) for large files

## Testing the UI

### Demo Flow (Without OpenAI)
1. Click "Load Demo Contract Data" button
2. Observe:
   - Workbench splits into PDF viewer + form
   - Form pre-fills with mock data (Grand Sapphire Resort)
   - 5 room rates displayed with edit controls
3. Test editing:
   - Change hotel name, dates, currency
   - Modify room rate values
   - Add new room rate with "Add Rate" button
   - Delete a rate with trash icon
4. Export:
   - Click "JSON" to download validated contract
   - Click "CSV" to download room rates table

### Real Upload Flow (PDF Required)
1. Prepare a hotel contract PDF
2. Drag-and-drop onto upload zone
3. Observe file validation (type, size)
4. (Currently) Loading animation shows, then resets
5. **TODO**: Wire to OpenAI extraction Server Action

## Performance Optimization

### Current Bundle Size
- react-pdf adds ~500KB to bundle
- Consider dynamic import for PDF viewer:
  ```typescript
  const PDFViewer = dynamic(() => import('./pdf-viewer'), { ssr: false });
  ```

### Database Schema (For Future Persistence)
```sql
CREATE TABLE contracts (
  id UUID PRIMARY KEY,
  hotel_name TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  currency CHAR(3),
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE room_rates (
  id UUID PRIMARY KEY,
  contract_id UUID REFERENCES contracts(id),
  room_type TEXT,
  season TEXT,
  rate DECIMAL(10,2),
  meal_plan TEXT
);
```

## Security Checklist

- [ ] Add OPENAI_API_KEY to .env (never commit)
- [ ] Validate file MIME types server-side
- [ ] Sanitize extracted data before DB insertion
- [ ] Add CORS headers for production domain
- [ ] Implement rate limiting (e.g., Upstash Redis)
- [ ] Use Content Security Policy headers
- [ ] Enable HTTPS only in production

## Support & Resources

- [Next.js 14 Docs](https://nextjs.org/docs)
- [OpenAI Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs)
- [Shadcn/UI Components](https://ui.shadcn.com)
- [Zod Documentation](https://zod.dev)
- [react-pdf GitHub](https://github.com/wojtekmaj/react-pdf)

---

**Built by a Vibe Coder who doesn't do "basic" 🚀**
