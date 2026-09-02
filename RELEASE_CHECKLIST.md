# Website release checklist

Prepared: July 31, 2026. Last synced with `dina-app`: August 18, 2026.

## Release scope

- DinaLab homepage
- Admin Toolkit for Salesforce product page, privacy policy, and EN/JP manual
- DinaSheet for Salesforce release-candidate page and privacy policy
- Agent for Salesforce product page and privacy policy
- Business guides blog
- Common Tools
- Legacy URL redirects

## Completed in this release

- [x] Replace the Admin Toolkit and Dina Agent raster logos with the current vector marks from `dina-app`, and drop the duplicate `assets/salesforce-agentic-bot-icon.jpg` reference.
- [x] Rebuild all ten business app marks from the exact frame and D geometry in `assets/dinalab-logo.svg`, with a distinct palette and functional glyph for each product.
- [x] Rewrite the homepage as a business product site organized around Salesforce administration, data operations, governance, and context-aware AI.
- [x] Keep only the current business roadmap apps on the homepage: DevOps for Salesforce, Dock for Salesforce, Prompter for Salesforce, and Voice for Salesforce.
- [x] Sync Dina Agent homepage, product, status, and privacy content with version 0.5.0 in the `dina-app` source.
- [x] Add a business blog hub with guides for release org review, safer bulk data updates, and AI credential boundaries.
- [x] Add a dedicated business social-preview image and Open Graph/X metadata.
- [ ] Confirm the new business homepage, Dina Agent, and blog copy reads correctly in Japanese; the strings are newly written and have not received native-language review.
- [ ] Confirm each business roadmap status is still accurate at publish time: DevOps for Salesforce beta 0.1.0, Dock for Salesforce in development 0.1.0, Prompter for Salesforce in development 0.1.0, and Voice for Salesforce prototype 0.1.1.
- [x] Remove Dina Bot for Salesforce, Dina Agent for iOS, and DinaSheet for Google Sheets from the homepage while retaining their legacy asset folders.
- [x] Remove consumer and creative apps from the business homepage. Their legacy folders and assets remain untouched because they may still serve direct or external URLs.
- [ ] Confirm Admin Toolkit 0.9.1 and DinaSheet 0.3.2 store status before publish. Both are validated release candidates in `dina-app` awaiting upload, and the pages frame them as the next release; the published Store items are still 0.9.0 and the earlier DinaSheet build.
- [x] Correct the Admin Toolkit product page against the 0.9.1 source: Metadata Admin is view-only rather than locally editable, the extension requests only `cookies` and `storage`, and Org Differences is now a sixth app.
- [x] Rewrite the Dina Agent product page for 0.5.0, covering the combined business workspaces, advisory AI panel, extension-local Salesforce tools, bounded context, Google account, and honest paid-production gates.
- [x] Expand the Dina Agent route into a Stripe Japan review-oriented business page with clear audience, product scope, USD pricing, non-live sales status, Stripe Checkout and Customer Portal disclosures, support placeholders, and legal navigation.
- [x] Add a dedicated `特定商取引法に基づく表記` page covering seller, address, phone, email, pricing, payment timing, delivery, cancellation, and refund fields without inventing owner information.
- [ ] Replace every Dina Agent `[OWNER INPUT REQUIRED]` and `[OWNER DECISION REQUIRED]` placeholder with owner-approved seller, contact, tax, delivery, cancellation, and refund information before paid sales open.
- [x] Reconcile `manual/_build` with the published manual. The generator had drifted back to 0.8.0 content — section 5 was still GitHub Metadata Sync and the 0.9.0 release notes were missing — so the documented regenerate command would have reverted the manual. It now reproduces the published pages exactly, and section intros can carry a callout.
- [ ] Give the manual a 0.9.1 pass once that release ships: Org Differences as its own app chapter, Metadata Admin change-set retrieval, a six-app popup capture, and the 0.9.1 release notes. The manual currently documents 0.9.0, which is what the Store serves.
- [x] Move every page onto one design system (`assets/dinalab.css`), replacing the three divergent palettes previously inlined per page.
- [x] Add a light/dark theme with a nav toggle, a shared preference key, and no flash of the wrong theme on navigation.
- [x] Apply the Japanese font stack site-wide; previously only the homepage and DinaSheet pages carried CJK fallbacks.
- [x] Rebuild the homepage around sharing knowledge, tools, and ideas, and retire the demo and style-guide pages into `index.html` and `assets/dinalab.css`.
- [x] Update Admin Toolkit public content for v0.8.0, SheetD, and GitHub Metadata Sync.
- [x] Publish the DinaSheet v0.2.0 release-candidate page and privacy-policy URL.
- [x] Add DinaSheet to the homepage, sitemap, site validation, and not-found navigation.
- [x] Publish DinaSheet product pages and screenshot manuals in English and Japanese.
- [x] Keep the requested `Admin Toolkit for Salesforce` product name consistent across the extension, website, manual, privacy policy, and Store materials.
- [x] Use Salesforce in the product name as a compatibility reference and retain clear independence language.
- [x] Add Salesforce trademark attribution and independence language to primary product surfaces.
- [x] Rename Google Cloud Functions copy to the current Cloud Run functions product name.
- [x] Replace personal/portfolio wording with consistent studio and business-facing language.
- [x] Keep privacy disclosures aligned with the described data flows.
- [x] Keep the Chrome Web Store Limited Use disclosure in all extension privacy policies.
- [x] Move stale legacy product and privacy pages to canonical redirects.
- [x] Make the EN/JP manual reproducible from its generator without losing the stored language preference.
- [x] Add canonical metadata to primary public pages.

## Required external actions before publishing

- [ ] Submit the DinaSheet v0.3.2 package, store icon, promotional tiles, and screenshots to the Chrome Web Store.
- [ ] Confirm the DinaSheet Store privacy declarations match its current permissions, local update receipts, and published privacy policy.
- [x] Keep the extension manifest and user-visible extension UI named `Admin Toolkit for Salesforce` in the extension source repository.
- [ ] Confirm the Chrome Web Store item remains named `Admin Toolkit for Salesforce` and update its description and screenshots for version 0.9.1.
- [ ] Confirm the Chrome Web Store privacy declarations exactly match the current extension behavior and the published privacy policy.
- [ ] Confirm the Store single-purpose statement describes one narrow focus area: Salesforce administration and development workflows.
- [ ] Verify the developer support email and privacy-policy URL in the Chrome Web Store dashboard.
- [x] Rename the draft assistant in its source repository to `Agent for Salesforce` before any public submission.
- [x] Exclude Salesforce session IDs, access tokens, cookies, authorization headers, and other Salesforce authentication credentials from AI chat requests; keep Salesforce tool execution inside the extension.
- [ ] Reverify the complete live backend payload, logging, Firestore retention, and OpenAI transport boundaries before releasing Dina Agent.

## Final publish checks

- [ ] Review the production pages at `https://dina.jp/` after deployment.
- [ ] Check every page in both light and dark themes after deployment, including the Common Tools workbench.
- [ ] Confirm the Chrome Web Store item ID still resolves after its listing metadata is updated.
- [x] Confirm EN/JP preference persistence across homepage, app pages, tools, and manuals in local headless Chrome.
- [x] Confirm all local links, image references, and redirects resolve in the release worktree.
- [ ] Confirm no organization IDs, usernames, email addresses, hosts, record IDs, or customer data appear in screenshots.

## Known content warning

The English manual currently includes 10 new screenshots that do not yet have
Japanese counterparts. The Japanese manual remains complete as text and only
renders screenshots that exist, but JP screenshot parity should be completed in
the extension capture environment before treating the manuals as fully matched.
The July 18 capture attempt was blocked because the local Salesforce CLI had no
valid authorization for the required `dinalab` org alias; reauthorize that alias
before rerunning the JP capture test.

## Policy references

- Chrome Web Store Program Policies: <https://developer.chrome.com/docs/webstore/program-policies/policies>
- Chrome Web Store Privacy Policies: <https://developer.chrome.com/docs/webstore/program-policies/privacy>
- Chrome Web Store Limited Use: <https://developer.chrome.com/docs/webstore/program-policies/limited-use>
- Chrome Web Store Listing Requirements: <https://developer.chrome.com/docs/webstore/program-policies/listing-requirements>
- Salesforce Trademark and Copyright Usage Guidelines: <https://www.salesforce.com/company/legal/intellectual-property/>
- OpenAI brand guidelines: <https://openai.com/brand/>
