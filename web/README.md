# Kiaros Web

The Kiaros web application for AI-assisted trading signals, transparent track
records, and community trading tools.

## Languages

Use the **English / ខ្មែរ** selector in the public header, dashboard, admin
header, or account forms. The `kiaros-language` cookie remembers the selection
for one year. English is the default. Switching preserves the current URL,
query filters, and mounted client state, and refreshes server-rendered content.

Khmer interface translations live in `src/lib/i18n/messages/`, grouped into
common, landing, trading, and admin copy. English source phrases are the keys.
Use `<T>English phrase</T>` for text, `useTranslation().t()` in interactive
components, and `await getTranslations()` for server attributes and metadata.
Use complete messages with `{name}` placeholders for variable text. Add the
matching Khmer entry whenever interface copy changes. Unknown user-authored
content, third-party data, and text inside uploaded images retain their source
language. The bundled Noto Sans Khmer fonts provide Khmer typography.

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
