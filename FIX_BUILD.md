# Build fix — Next.js manifest icon purpose

Fixed TypeScript error in `app/manifest.ts`:

- 192x192 icon: `purpose: 'any'`
- 512x512 icon: `purpose: 'maskable'`

The previous value `purpose: 'any maskable'` is not accepted by the current `MetadataRoute.Manifest` TypeScript definition because it expects one value from `any | maskable | monochrome` for each icon entry.

After replacing the project on GitHub, trigger a new Vercel deployment. This patch addresses the reported manifest type error only. A complete production build still needs to be confirmed by Vercel.
