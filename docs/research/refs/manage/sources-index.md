# Settings (`/manage`): sources index

Driven 2026-10-29 with `tools/research/capture.ts`. There are two modalities: 28 frames at 1440 × 900 in `live/` and 6 at 390 × 844 in `hand/`, mirrored to `C:\Users\Asaf\dev\hl-refs\hl2\manage\live` and `…\hand`. The ledgers are `live/sources.json` and `hand/sources.json`, and the lists that drove them are `list-live.json`, `list-live2.json` and `list-hand.json`. That makes **34 frames captured** (budget 45) and **34 Read calls** (budget 40): 30 new frames and 4 stock.

**OPENED** means the frame was read with the Read tool. A frame marked NOT OPENED is cited nowhere. A **miss** was opened and is not used as a reference.

Before any frame was spent, a probe (`node`, in the scratchpad, no screenshots) listed each candidate page's images and their y offsets, so that every scroll would land on the picture. It found that Stripe's branding doc, Shopify's theme-editor and store-details help, Apple's Appearance and Lock Screen support pages and Linear's docs are **text with no picture of the UI**. Except where a frame below says otherwise, they were not captured.

## live/ (1440 × 900)

| frame | URL | what it shows | |
|---|---|---|---|
| `radix-custom-palette` | https://www.radix-ui.com/colors/custom | Three inputs (Accent 3D63DD · Gray 8B8D98 · Background FFFFFF) derive two 12-step scales, grouped by JOB: Backgrounds 1–2 · Interactive 3–5 · Borders 6–8 · Solid 9–10 · Accessible text 11–12. Light and Dark as a two-segment switch | OPENED |
| `radix-custom-scrolled` | same, scrolled 600 | The scale applied to a kit: a sign-up card, a checklist and avatars. Fake people ("Emily Adams", twice) | OPENED |
| `material-theme-builder` | https://material-foundation.github.io/material-theme-builder/ | A wallpaper picked from five derives a "Source color". A phone preview at the right, three contrast levels as round buttons over it, and "1 of 2 · Add Theme Colors → Pick your fonts" as a footer | OPENED |
| `leonardo-theme` | https://leonardocolor.io/theme.html | Each swatch carries its contrast ratio against the declared background (1.45 · 2.05 · 3.03 · 4.54 · 7 · 10.86 : 1). "Extract from image" is beside "Add color" | OPENED |
| `shadcn-create` | https://ui.shadcn.com/create | A welcome modal over a blurred tool. **Miss**, and it is cited only under avoid | OPENED |
| `rayso-themes` | https://ray.so/themes | Each theme is drawn as Raycast's own window, with its name, author and four colour dots. Dark and Light below, and one act, "Add to Raycast" | OPENED |
| `hubspot-signature` | https://www.hubspot.com/email-signature-generator | A person's card: name, title and company over a hairline, then phone, email, web and address. A photograph, and the company mark under it | OPENED |
| `hubspot-signature-scrolled` | same, scrolled | The same hero with a second card variant: photograph left, name right. The generator itself did not render below | OPENED |
| `invoice-generator` | https://invoice-generator.com/ | The invoice is the form: "+ Add Your Logo", "Who is this from?", Bill To, Date and Payment Terms laid out where they print. An ad covers the right half | OPENED |
| `canva-brand-kit` | https://www.canva.com/pro/brand-kit/ | The marketing hero | OPENED |
| `canva-brand-kit-scrolled` | same, scrolled 1050 | Brand Templates. At its foot is a strip of the OPNHAUS mark on four grounds | OPENED |
| `canva-brand-kit-panel` | same, scrolled 780 | The Brand Kit itself: the mark at its head, then Identity (Logos · Colours · Fonts as three specimen tiles), then Brand Elements. A left rail lists Guidelines · Logos · Colours · Fonts | OPENED |
| `linear-preferences` | https://linear.app/docs/account-preferences | Linear's Preferences in two cards (General · Interface and theme). Each row is a label, a one-line consequence and the control at the right. "App sidebar · Customize item visibility, ordering…" | OPENED |
| `stripe-invoicing-hero` | https://stripe.com/au/invoicing | The hosted invoice a payer sees: the merchant's icon on the merchant's ground, a white card with To · From · Memo, and the pay act in the accent | OPENED |
| `stripe-invoicing-dashboard` | same, scrolled 5000 | The invoices register. Not about settings | OPENED |
| `xero-invoicing-customise` | https://www.xero.com/au/accounting-software/send-invoices/ (scrolled) | "Add your logo, payment terms, and a standard message to a branding theme… Show your ABN, and Xero tracks GST". An illustrated invoice with a dashed logo slot | OPENED |
| `square-receipt-customise` | https://squareup.com/help/au/en/article/5424 (scrolled) | A receipt: the brand colour as the head band, the logo, the total large, the lines, a map, and the business name and address at the foot | OPENED |
| `shopify-brand-assets` | https://help.shopify.com/en/manual/promoting-marketing/managing-brand-assets (scrolled) | A logo slot ("Select image · Explore free images"), and a Brand source offering Default logo · Square logo · Cover image by NAME | OPENED |
| `apple-ios18-home` | https://www.apple.com/newsroom/2024/06/ios-18-makes-iphone-more-personal-capable-and-intelligent-than-ever/ (scrolled) | One tint chosen, and every icon on the Home Screen redrawn in it over the person's own photograph | OPENED |
| `apple-ios18-control` | same, scrolled further | Control Centre: tiles of three sizes arranged by the person, over a gradient | OPENED |
| `apple-ios17-contact-poster` | https://www.apple.com/newsroom/2023/06/ios-17-makes-iphone-more-personal-and-intuitive/ (scrolled) | A Contact Poster: "HARI NAIR" in a heavy condensed face, the colour of the name taken from the photograph behind it | OPENED |
| `apple-ios16-lockscreen` | https://www.apple.com/newsroom/2022/06/apple-unveils-new-ways-to-share-and-communicate-in-ios-16/ (scrolled) | Three personalised Lock Screens. The clock sits behind the subject's head, and widgets sit over the photograph | OPENED |
| `ghost-design-settings` | https://ghost.org/help/design-settings/ (scrolled) | Ghost's Design panel: the live site at the left with Homepage · Post as the surface switch. At the right, Brand · Theme tabs over Accent color, Publication icon ("at least 60x60px"), logo, cover and Typography | OPENED |
| `northside-contact` | https://www.northsidemarine.com.au/pages/contact | Northside's own register: heavy geometric caps, a blue duotone over the yard photograph, "Putting people on the water since 1965", a yellow band, and the mark in blue on white | OPENED |
| `northside-contact-scrolled` | same, scrolled 1700 | Service and Parts cards over photographs, with white type on a dark scrim | OPENED |
| `stripe-checkout-dev` | https://checkout.stripe.dev/checkout | Stripe's integration gallery | NOT OPENED |
| `contrast-finder` | https://app.contrast-finder.org/result.html?foreground=%23F5A623&background=%23FFFFFF… | #F5A623 on white is refused at 2.03 with a red ✗. Below it, "New contrast: 40 results (350 colors tested)", nearest first, each with its ratio and **distance** (#916214 · 5.30 · 109.64) | OPENED |
| `whocanuse` | https://www.whocanuse.com/?b=ffffff&c=f5a623… | It ignored the colours asked for and showed its own default (663399 / FFFFFF, 8.41:1, AAA), then a row for each kind of vision. Cited under avoid | OPENED |

## hand/ (390 × 844)

| frame | URL | what it shows | |
|---|---|---|---|
| `radix-custom-390` | https://www.radix-ui.com/colors/custom | The three inputs stacked full width, Copy below them, and the scale in two columns | OPENED |
| `invoice-generator-390` | https://invoice-generator.com/ | A black ad box covers the form | OPENED |
| `northside-contact-390` | https://www.northsidemarine.com.au/pages/contact (scrolled) | The second site, "Gold Coast · 2/1 Waterway Drive, Coomera", over a map | OPENED |
| `canva-brand-kit-390` | https://www.canva.com/pro/brand-kit/ | — | NOT OPENED |
| `hubspot-signature-390` | https://www.hubspot.com/email-signature-generator | — | NOT OPENED |
| `shadcn-create-390` | https://ui.shadcn.com/create | — | NOT OPENED |

## Stock opened (`docs/research/refs/…`)

| frame | what it shows | |
|---|---|---|
| `document/live/stripe-invoice-design.png` | **Stripe's 404 page.** The document sweep's "invoice design" frame is not an invoice. A miss | OPENED |
| `document/live/stripe-invoice-customize.png` | Stripe's "Customize invoices" doc, which is text only. A miss | OPENED |
| `document/live/xero-invoice-template.png` | Xero's free template, with "Your Company Name" circled as the placeholder | OPENED |
| `components/live/linear-redesign-theme.png` | Linear's redesign essay: the app in a blue-violet theme. A small screenshot inside text | OPENED |

## Failed or not attempted, with the reason

- **Stripe's Dashboard branding page** (its live receipt preview), **Square's Dashboard**, **Xero's branding themes**, **Linear's workspace settings**, **Shopify's store details and theme editor**: each is behind a sign-in. Their public docs, probed, carry no picture of the screen, except Ghost, Shopify brand assets, Linear preferences and Square's receipt, which are captured above.
- `https://docs.stripe.com/payments/checkout/customization/appearance`: timed out at 40 s, twice.
- `https://www.zoho.com/invoice/invoice-generator.html`: timed out.
- `https://docs.github.com/…/managing-your-theme-settings`: 404.
- `https://tailwindcss.com/plus/ui-blocks/…/settings-screens`: a sign-in wall.
- **Arc**: no public page shows its space-colour picker (searched 2026-10-29). Not captured.
- **Figma variables with modes** is Prices' primary (`levels/live/figma-variables-modal-img.png`). It was not opened here and is not cited.
