# 🏗️ Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     HOTEL CONTRACT INTELLIGENCE                  │
│                         Next.js 14 App Router                    │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│   Upload Zone    │──────▶│  Server Action   │──────▶│   OpenAI API     │
│  (Drag & Drop)   │       │  extract-contract│       │   GPT-4o Vision  │
│                  │       │                  │       │  Structured Out  │
└──────────────────┘       └──────────────────┘       └──────────────────┘
         │                         │                            │
         │                         ▼                            │
         │                  ┌──────────────────┐               │
         │                  │   Zod Schema     │◀──────────────┘
         │                  │   Validation     │
         │                  └──────────────────┘
         │                         │
         ▼                         ▼
┌──────────────────────────────────────────────────────────────────┐
│                        ZUSTAND STORE                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐ │
│  │  pdfFile   │  │  contract  │  │ isLoading  │  │   error    │ │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘ │
└──────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                         WORKBENCH                                │
│  ┌───────────────────────┐     ┌───────────────────────┐       │
│  │   PDF Viewer          │     │   Contract Form       │       │
│  │  ┌─────────────────┐  │     │  ┌─────────────────┐  │       │
│  │  │ react-pdf       │  │     │  │ Hotel Details   │  │       │
│  │  │ - Zoom          │  │     │  │ - Name          │  │       │
│  │  │ - Pagination    │  │     │  │ - Dates         │  │       │
│  │  │ - Text Layer    │  │     │  │ - Currency      │  │       │
│  │  └─────────────────┘  │     │  └─────────────────┘  │       │
│  │                       │     │  ┌─────────────────┐  │       │
│  │  Page 1 / 5          │     │  │ Room Rates []   │  │       │
│  │  [Zoom: 100%]        │     │  │ - Type/Season   │  │       │
│  │                       │     │  │ - Rate/Meal     │  │       │
│  │                       │     │  │ [+ Add Rate]    │  │       │
│  │                       │     │  └─────────────────┘  │       │
│  │                       │     │  [Export JSON/CSV]    │       │
│  └───────────────────────┘     └───────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Upload Phase
```
User Action         → Component              → Store
────────────────────────────────────────────────────────
Drop PDF           → UploadZone              → setPdfFile(file)
Validate file      → UploadZone (client)     → setLoading(true)
```

### 2. Extraction Phase (Future Implementation)
```
Trigger            → Server Action           → External Service
────────────────────────────────────────────────────────────────
File uploaded      → extractContractData()   → OpenAI API
Convert to base64  → PDF → Images            → Vision model
Prompt + Schema    → Zod response format     → GPT-4o structured
Parse response     → Validate with Zod       → Return to client
```

### 3. Editing Phase
```
User Action         → Component              → Store
────────────────────────────────────────────────────────
Edit field         → ContractForm            → updateContract(patch)
Add room rate      → ContractForm            → updateContract({roomRates: [...]})
Delete rate        → ContractForm            → updateContract({roomRates: [...]})
```

### 4. Export Phase
```
User Action         → Component              → Output
────────────────────────────────────────────────────────
Click JSON         → ContractForm            → Download .json file
Click CSV          → ContractForm            → Download .csv file
Validate before    → Zod.parse()             → Show error if invalid
```

## Component Hierarchy

```
app/layout.tsx
└── app/page.tsx (Main Dashboard)
    ├── Header
    │   ├── Logo
    │   └── Reset Button (conditional)
    │
    ├── Main Content (conditional rendering)
    │   │
    │   ├── IF no contract:
    │   │   ├── UploadZone
    │   │   └── "Load Demo" Button
    │   │
    │   └── IF contract exists:
    │       └── Workbench
    │           ├── PDFViewer (Left Column)
    │           │   ├── Toolbar (zoom, pagination)
    │           │   └── Document (react-pdf)
    │           │
    │           └── ContractForm (Right Column)
    │               ├── General Info Section
    │               │   ├── Hotel Name
    │               │   ├── Start/End Dates
    │               │   ├── Currency
    │               │   ├── Cancellation Policy
    │               │   └── Payment Terms
    │               │
    │               ├── Room Rates Section
    │               │   └── RoomRateCard[] (dynamic array)
    │               │       ├── Room Type
    │               │       ├── Season
    │               │       ├── Rate
    │               │       ├── Meal Plan
    │               │       ├── Valid From/To
    │               │       └── Delete Button
    │               │
    │               └── Export Buttons
    │                   ├── Export CSV
    │                   └── Export JSON
    │
    └── Footer
        └── Credits

Toaster (from layout.tsx - global)
```

## State Management (Zustand)

### Store Schema
```typescript
interface ContractState {
  // Data
  contract: HotelContract | null;
  pdfFile: File | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setContract: (contract: HotelContract) => void;
  setPdfFile: (file: File) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateContract: (updates: Partial<HotelContract>) => void;
  reset: () => void;
}
```

### Why Zustand?
- ✅ Simpler than Redux (no boilerplate)
- ✅ TypeScript-first
- ✅ No provider wrapper needed
- ✅ Minimal bundle size (~1KB)
- ✅ Perfect for small-to-medium state needs

## Type Safety with Zod

### Contract Schema Definition
```typescript
const HotelContractSchema = z.object({
  hotelName: z.string().min(1),
  contractStartDate: z.string().refine(isValidDate),
  contractEndDate: z.string().refine(isValidDate),
  currency: z.string().default("USD"),
  cancellationPolicy: z.string().optional(),
  paymentTerms: z.string().optional(),
  roomRates: z.array(RoomRateSchema).min(1),
  extractedAt: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
});
```

### Benefits
1. **Runtime Validation**: Catches invalid data before it reaches UI
2. **TypeScript Inference**: Auto-generates types from schema
3. **OpenAI Integration**: Used with `zodResponseFormat()` for structured outputs
4. **Form Validation**: Validates before export

## Styling System

### Tailwind CSS + Shadcn/UI
- **Base**: Tailwind utility classes
- **Components**: Shadcn/UI (Radix primitives + Tailwind)
- **Theme**: CSS variables in `globals.css`
- **Dark Mode**: Built-in support (class-based)

### Color Palette (Neutral Theme)
```css
--background: 0 0% 100%;
--foreground: 0 0% 3.9%;
--primary: 0 0% 9%;
--primary-foreground: 0 0% 98%;
--muted: 0 0% 96.1%;
--muted-foreground: 0 0% 45.1%;
```

### Design Principles
- **Corporate Hospitality Aesthetic**: Clean, professional, trustworthy
- **Wide-screen Optimized**: 2-column layout for workbench
- **Minimal Motion**: Only loading spinners and subtle hover states
- **High Contrast**: Accessibility-first (WCAG AA compliant)

## Performance Optimizations

### Current
- ✅ Server Components by default (Next.js 14)
- ✅ Client components only where needed (`"use client"`)
- ✅ Automatic code splitting (Next.js)
- ✅ Image optimization (none used currently)

### Planned
- [ ] Dynamic import for PDFViewer (reduces initial bundle)
- [ ] Memoize expensive form renders with `useMemo`
- [ ] Virtualize room rates list (if >50 items)
- [ ] Cache OpenAI responses (Redis)
- [ ] Compress PDFs before upload

## Security Considerations

### Implemented
- ✅ Client-side file validation (type, size)
- ✅ Environment variables for secrets
- ✅ No sensitive data in client bundle

### Required for Production
- [ ] Server-side file validation
- [ ] Rate limiting (prevent API abuse)
- [ ] CORS configuration
- [ ] CSP headers
- [ ] Input sanitization for extracted data
- [ ] Authentication (NextAuth.js)
- [ ] File upload to S3 (not local storage)

## Deployment Strategy

### Container-First Approach
```
Local Development  →  GitHub Repo  →  Easypanel VPS
      ↓                    ↓                ↓
  npm run dev         git push        auto-build
                                           ↓
                                      Docker Image
                                           ↓
                                    DigitalOcean VPS
                                           ↓
                                   https://your-app.com
```

### No Localhost Loops
- Development happens locally
- Testing happens on VPS
- No reliance on `localhost:3000` as final output

---

**Architecture designed for scale, maintainability, and that sweet, sweet production vibe 🔥**
