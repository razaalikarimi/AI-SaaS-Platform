# DevKit

Honestly, I was just tired of keeping 20 tabs open for ChatGPT, Claude, GitHub, and random SEO tools. So I built this to put everything in one place.

DevKit is my personal AI wrapper / workspace. It's built with Next.js 16 (App Router), Tailwind, and Prisma (SQLite locally so I don't have to pay for a hosted DB during dev).

---

### What's inside?

- **AI Chat**: Standard chat interface but with persistent memory. Conversations actually save to the local SQLite db so you don't lose context if you accidentally close the tab.
- **AI Tools**: I hardcoded some prompts I use daily (SEO optimizer, code generator, LinkedIn posts). Just click the tool, type the input, and get the result without writing a massive system prompt every time.
- **Knowledge Base**: Drop PDFs or docs in here to chat with your own context.
- **RepoMind**: You can point it at a GitHub repo URL and it spits out an architecture breakdown. Super useful when diving into messy codebases.
- **Auth**: I'm using Clerk for auth, but I wrapped it in a mock file for local dev so you don't need API keys just to spin it up.

### Recent Updates 🚀
Just updated the UI with a much cleaner dark/light mode layout and dropped the old blurry PNG favicon for a crisp SVG geometric logo. Cleaned up some Next.js Turbopack caching quirks too.

### Tech Stack
- Next.js 16 (Turbopack is insanely fast)
- TailwindCSS & shadcn/ui (because I refuse to write raw CSS anymore)
- Prisma ORM + SQLite
- Vercel AI SDK + OpenAI API

---

### How to run it locally

1. Clone it and install dependencies:
```bash
cd web
npm install
```

2. You'll need an `.env` file at the root of `web/`. Make it look like this:
```env
DATABASE_URL="file:./dev.db"
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Setup the database and run the seed script so you have some dummy data:
```bash
npx prisma db push
node seed.mjs
```

4. Run the dev server:
```bash
npm run dev
```

That's literally it. Go to `http://localhost:3000` and it should be running. If Next.js throws a caching fit, just nuke the `.next` folder and restart.

---

*Note: This is still a major work in progress. If something breaks, it's probably my fault.*
