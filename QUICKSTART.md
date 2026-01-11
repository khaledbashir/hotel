# 🎯 QUICK START GUIDE

## For Developers

### Prerequisites
```bash
Node.js 20.9.0+
npm 9.0+
Git
```

### Setup (3 commands)
```bash
cd /hotel
npm install
npm run dev
```

### Test Demo (No API Key Needed)
1. Open http://localhost:3000
2. Click **"Load Demo Contract Data"**
3. Explore the UI:
   - Edit form fields
   - Add/delete room rates
   - Export JSON/CSV
   - View mock PDF (none loaded in demo)

---

## For Project Managers

### What This Does
Uploads hotel contracts (PDFs), extracts pricing/terms using AI, presents data in editable form for validation, exports to JSON/CSV.

### Status
- ✅ **UI**: 100% complete
- ⚠️ **AI**: Scaffolded, needs OpenAI integration
- ✅ **Export**: Fully functional
- ✅ **Deployment**: Docker ready

### Cost Estimate
- **Development**: 8 hours for OpenAI integration
- **OpenAI API**: ~$0.05 per contract (estimate)
- **Hosting**: $12/month (DigitalOcean droplet)

---

## For DevOps

### Deploy to Production
```bash
# Easypanel/Coolify
git push origin main
# Auto-deploys via webhook

# Manual Docker
docker-compose up --build -d
```

### Environment Variables
```env
OPENAI_API_KEY=sk-proj-...   # Required
NODE_ENV=production          # Auto-set
PORT=3000                    # Default
```

### Health Check
```bash
curl http://your-domain.com/
# Should return 200 with HTML
```

---

## Key Files Reference

| Need | File | Purpose |
|------|------|---------|
| Schema | `lib/schemas/contract-schema.ts` | Zod validation |
| State | `lib/store/contract-store.ts` | Zustand store |
| Upload | `components/upload-zone.tsx` | Drag-and-drop |
| PDF | `components/pdf-viewer.tsx` | Document viewer |
| Form | `components/contract-form.tsx` | Editable data |
| Layout | `app/page.tsx` | Main dashboard |
| Deploy | `Dockerfile` | Production build |
| Docs | `DEPLOYMENT.md` | Full guide |

---

## Common Issues

### Build fails with "Node version"
```bash
nvm install 20
nvm use 20
npm install
```

### PDF viewer not loading
- Check `next.config.ts` has webpack config
- Ensure unpkg.com CDN is accessible
- Verify file is valid PDF

### Form not updating
- Check Zustand store console logs
- Ensure `updateContract()` is called
- Verify Zod validation passes

---

## Next Steps

1. **Implement OpenAI**: See `DEPLOYMENT.md` Section "Phase 1"
2. **Add Authentication**: NextAuth.js or Clerk
3. **Database**: Supabase or Postgres (see schema in `ARCHITECTURE.md`)
4. **Analytics**: Mixpanel or PostHog events

---

## Support

- 📖 **Documentation**: See `README.md`, `DEPLOYMENT.md`, `ARCHITECTURE.md`
- 🐛 **Issues**: Create GitHub issue with steps to reproduce
- 💬 **Questions**: Check inline code comments first

---

**Built for production. No shortcuts. No BS. 🚀**
