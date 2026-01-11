# Hotel Contract Intelligence Dashboard

AI-powered document processing for hotel contracts. Extract pricing, terms, and room rates automatically using OpenAI GPT-4o.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + Shadcn/UI
- **AI**: OpenAI SDK with Structured Outputs
- **Validation**: Zod
- **State Management**: Zustand
- **PDF Processing**: react-pdf

## Features

- 📄 Drag-and-drop PDF/DOCX upload
- 🤖 AI-powered structured data extraction
- 📊 Split-view workbench (PDF viewer + editable form)
- ✏️ Manual data correction and editing
- 💾 Export to JSON/CSV
- 🎨 Corporate hospitality aesthetic

## Getting Started

### Prerequisites

- Node.js 20.9.0 or higher
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Environment Variables

Create a `.env.local` file:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

## Project Structure

```
/hotel
├── app/
│   ├── layout.tsx          # Root layout with Toaster
│   ├── page.tsx            # Main dashboard page
│   └── globals.css         # Global styles
├── components/
│   ├── ui/                 # Shadcn UI components
│   ├── upload-zone.tsx     # Drag-and-drop ingestion
│   ├── pdf-viewer.tsx      # PDF rendering component
│   ├── contract-form.tsx   # Editable extraction form
│   └── workbench.tsx       # Split-view layout
├── lib/
│   ├── schemas/
│   │   └── contract-schema.ts  # Zod schemas & types
│   ├── store/
│   │   └── contract-store.ts   # Zustand state management
│   └── utils.ts           # Utility functions
└── next.config.ts         # Next.js configuration
```

## Deployment (DigitalOcean VPS via Easypanel)

This project is designed for production deployment on DigitalOcean using Easypanel/Coolify:

1. Push code to GitHub repository
2. Configure Easypanel to watch the repository
3. Auto-deployment triggers on push
4. Set environment variables in Easypanel dashboard

**No localhost loops** - always deploy to production VPS.

## Development Roadmap

- [x] Scaffold Next.js 14 project
- [x] Define Zod schema for hotel contracts
- [x] Build split-view workbench layout
- [x] Create drag-and-drop upload zone
- [x] Build dynamic editable form
- [x] Implement PDF viewer
- [ ] **Next**: Implement OpenAI Server Action with Structured Outputs
- [ ] Add real-time extraction progress tracking
- [ ] Implement data validation with error highlighting
- [ ] Add contract comparison view
- [ ] Build analytics dashboard

## License

MIT

---

Built by a Vibe Coder who doesn't do "basic" 🚀


## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
