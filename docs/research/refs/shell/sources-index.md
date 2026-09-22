# The shell — sources index

Every source driven for the shell sweep, 2026-09-22, headless Chromium, `en-AU`, via `tools/research/capture.ts`. Consent banners were answered with the most privacy-preserving control present; **nothing was signed in, nothing was typed into a form, and no bot protection was fought**. Frames are gitignored; the durable copies are mirrored to `C:\Users\Asaf\dev\hl-refs\hl2\shell\{live,live2,finder,hand,finder2,hand2}\`.

**The figures, counted from the files on disk 2026-09-22.** This index holds **135 rows**; **13 produced no frame** (each named with its reason); so **122 frames** are on disk and **114 are distinct images**. A row is a source driven, not a picture taken. `OPENED` marks the 56 shell frames that were looked at for `notes.md`; a frame not marked was not opened and is not cited.

**Eight frames are a byte-for-byte copy of another, and each is a finding:** four scrolls that never happened (`stripe-dashboard-basics`, `m3-navigation-rail-scrolled`, `m3-window-size-scrolled`, `tailwind-app-shells-scrolled`); `cmdk-raycast` = `cmdk-github` and `cmdk-demo-typed` = `cmdk-demo-rest` because **cmdk.paco.me redirects to the GitHub repository**, so no run of this sweep ever reached cmdk's demo; `cmdk-vercel` = the 6 KB blank `slack-quick-switcher`; and `apple-hig-navigation-bars` = `apple-hig-toolbars` because **Apple has folded navigation bars into Toolbars**.

**Refused or dead, with the reason:** `height-app` — `ERR_CONNECTION_CLOSED`, dead since 24 Sep 2025 (a confirmation of `docs/reference/dense-tables-and-selection.md`). `raycast-home` — `page.screenshot` timed out at 30 s in both runs. `porsche-menu-open`, `cmdk-raycast-typed`, `cmdk-linear`, `cmdk-framer`, `cmdk-demo-linear`, `github-repo-390-more` — a click that never found its control. `linear-docs-390-menu` and `stripe-docs-390-menu` — the same, twice each, the second time by ARIA role. **Access denied or walled, not fought:** Tesla (both pages "Access Denied"), WCAG ("Just a moment…"), Brabus (a cookie wall with no decline). **Blank:** Mercury's demo unpainted three times (6, 6 and 3 KB), Slack's help at 6 KB. **Never re-captured:** nothing a first-run ledger already held was driven again except the four 390 menus that had failed, of which two succeeded (Porsche, Mercury).

**Stock re-read for this screen.** `ref/porsche-top.png` was opened and is cited as the two-tier bar (the wordmark alone on its line, the working row beneath, about 200 px to the stage at 1440 × 900). The quotes sweep already found `ref/tables/` to be mostly marketing, documentation and three bot walls, so nothing else in the stock was opened for a shell.

## `live/` — 59 rows, 1440 × 900, first run

| id | URL | one line |
|---|---|---|
| `linear-app-shot` | linear.app/ | OPENED · the rail: Pulse, Inbox, My issues, Reviews, `Workspace ▾`, `Favorites ▾`; one size, opacity as the hierarchy |
| `linear-your-sidebar` | linear.app/docs/your-sidebar | 52 KB, empty title · not opened, not cited |
| `linear-personalized-sidebar` | linear.app/changelog/2024-12-18-personalized-sidebar | OPENED · Customize sidebar: reorder; Always show / When badged / Hide in more menu / Never show; badge as a count or a dot |
| `linear-new-ui` | linear.app/changelog/2024-03-20-new-linear-ui | OPENED · the 2024 changelog; app icon; `‹ Changelog` back link named for its destination |
| `linear-favorites` | linear.app/docs/favorites | not opened |
| `linear-keyboard-help` | linear.app/changelog/2021-03-25-keyboard-shortcuts-help | OPENED · a searchable Keyboard Shortcuts sheet: `Open command menu ⌘K`, `Open focused item Enter or O` |
| `stripe-dashboard-basics` | docs.stripe.com/dashboard/basics | **byte-identical to live/stripe-dashboard-basics-scrolled.png** — the scroll never happened · not opened |
| `stripe-dashboard-basics-scrolled` | docs.stripe.com/dashboard/basics | not opened (the two live2 section frames were) |
| `attio-navigating` | attio.com/help/reference/attio-101/introduction-to-navigating-attio | not opened |
| `attio-home-rail` | attio.com/ | OPENED · `Quick Actions ⌘K` as the FIRST row of the rail with `/` beside it; a scaled product shot |
| `vercel-command-menu-docs` | vercel.com/docs/dashboard | 29 KB, empty title · not opened, not cited |
| `vercel-geist-command-menu` | vercel.com/geist/command-menu | not opened (live2 open/typed were) |
| `vercel-dashboard-shortcuts` | vercel.com/changelog/quickly-navigate-the-dashboard-with-shortcuts | OPENED · ⌘K menu: `Home` scope chip, "What do you need?", groups Projects / Teams with verb rows `Search Projects… ⇧P`, `Create New Project…` |
| `supabase-database` | supabase.com/database | OPENED · a product page with a tab row (Database · Auth · Storage · Edge Functions · Realtime) over a table; not the studio rail |
| `supabase-database-scrolled` | supabase.com/database | not opened |
| `github-repo-nav` | github.com/microsoft/vscode | OPENED · Search with a `/` key; breadcrumb `microsoft / vscode`; tab row with counts `Issues 5k+ · Pull requests 2.7k · Security 54` |
| `github-search-open` | github.com/microsoft/vscode | not opened (finder/github-search-typed was) |
| `github-command-palette-docs` | docs.github.com/en/get-started/accessibility/github-command-palette | OPENED · "navigate, search, and run commands"; the scope chip `mashed-a…/delish · Issues · Clear`; deactivated by default, public preview |
| `notion-sidebar` | notion.com/help/navigate-with-the-sidebar | not opened (live2 -scrolled was) |
| `notion-search` | notion.com/help/search | not opened |
| `slack-quick-switcher` | slack.com/intl/en-au/help/articles/360059928654-How-to-use-Slack--your-quick-start-guide | 6 KB, blank · not cited · **finder/cmdk-vercel.png is a byte-copy of it** |
| `slack-keyboard-nav` | slack.com/intl/en-au/help/articles/115003340723-Navigate-Slack-with-your-keyboard | not opened |
| `craft-home-rail` | craft.do/ | OPENED · `‹ ›` then a centred pill naming the place (`All Docs`), `+`, a search glyph; rail: New Doc, `Joe's Space` switcher, Starred, Folders; a scaled product shot |
| `arc-spaces` | resources.arc.net/hc/en-us/articles/19228064149143-Spaces-Distinct-Browsing-Areas | not opened (live2 -scrolled was) |
| `arc-command-bar` | start.arc.net/command-bar-actions | 404 · not cited |
| `arc-hide-sidebar` | resources.arc.net/hc/en-us/articles/25619487530519-How-Do-You-Hide-the-Sidebar | not opened |
| `figma-toolbar` | help.figma.com/hc/en-us/articles/360041064174-Access-design-tools-from-the-toolbar | not opened (live2 -scrolled was) |
| `figma-navbar-sidebar` | help.figma.com/hc/en-us/articles/360039831974-Explore-the-navigation-bar-and-left-sidebar | not opened |
| `apple-spotlight` | support.apple.com/en-au/guide/mac-help/mchlp1008/mac | OPENED · Spotlight finds "apps, files, actions, the internet and the Clipboard"; the four kinds drawn as round buttons beside the field |
| `apple-dock` | support.apple.com/en-au/guide/mac-help/mh35859/mac | OPENED · up to three recently used apps; along the bottom by default, left or right by option |
| `apple-macos-tahoe` | apple.com/macos/macos-tahoe/ | 404 "Page Not Found" · not cited |
| `apple-macos-tahoe-scrolled` | apple.com/macos/macos-tahoe/ | 404 "Page Not Found" · not cited |
| `apple-hig-sidebars` | developer.apple.com/design/human-interface-guidelines/sidebars | not opened (live2 -scrolled was) |
| `apple-hig-tab-bars` | developer.apple.com/design/human-interface-guidelines/tab-bars | not opened (the two live2 iPad frames were) |
| `apple-hig-toolbars` | developer.apple.com/design/human-interface-guidelines/toolbars | OPENED · "commands, controls, navigation, and search"; Back at the leading edge as its own group, actions grouped right · **finder2/apple-hig-navigation-bars.png is byte-identical** (HIG folded navigation bars into Toolbars) |
| `apple-hig-searching` | developer.apple.com/design/human-interface-guidelines/searching | not opened |
| `m3-navigation-rail` | m3.material.io/components/navigation-rail/overview | OPENED · 3–7 destinations plus an optional FAB; medium windows and up; "Always put the rail in the same place, even on different screens" · **live2/m3-navigation-rail-scrolled.png is byte-identical** |
| `m3-navigation-bar` | m3.material.io/components/navigation-bar/overview | not opened |
| `m3-window-size-classes` | m3.material.io/foundations/layout/breakpoints/overview | OPENED · five breakpoints, compact to extra-large; single pane to two or three panes as the window grows · **live2/m3-window-size-scrolled.png is byte-identical** |
| `shadcn-sidebar` | ui.shadcn.com/docs/components/base/sidebar | not opened (live2 -scrolled was) |
| `shadcn-sidebar-blocks` | ui.shadcn.com/blocks/sidebar | not opened |
| `shadcn-command` | ui.shadcn.com/docs/components/base/command | not opened (live2 -scrolled was) |
| `tailwind-app-shells` | tailwindcss.com/plus/login | a Tailwind Plus login page · not cited · **live2/tailwind-app-shells-scrolled.png is byte-identical** |
| `porsche-menu-open` | configurator.porsche.com/en-AU/model/992120 | REFUSED · `locator.click` timeout on the configurator; the model-start page answered instead (live2) · **no frame** |
| `tesla-account-support` | tesla.com/support/account-support | "Access Denied" (16 KB) · not cited |
| `tesla-app-support` | tesla.com/support/tesla-app | "Access Denied" (16 KB) · not cited |
| `raycast-home` | raycast.com/ | REFUSED · `page.screenshot` timed out at 30 s in both runs · **no frame** |
| `raycast-windows` | raycast.com/windows | OPENED · the finder itself: "Search for apps and commands…", `Ask AI Tab`, Favourites at rest, rows as name · source · kind |
| `raycast-search-bar` | manual.raycast.com/search-bar | not opened |
| `raycast-action-panel` | manual.raycast.com/action-panel | OPENED · Ctrl K opens the Action Panel on any item; `↵` the primary act; `Esc` back from a submenu; "Each action shows its keyboard shortcut on the right" |
| `superhuman-home` | superhuman.com/ | not opened |
| `height-app` | height.app/ | REFUSED · `ERR_CONNECTION_CLOSED`; dead since 24 Sep 2025, as `docs/reference/dense-tables-and-selection.md` records · **no frame** |
| `mercury-demo` | demo.mercury.com/home | 6 KB, unpainted · not cited |
| `mercury-demo-scrolled` | demo.mercury.com/dashboard | 6 KB, unpainted · not cited |
| `navbar-gallery-sidebar` | navbar.gallery/type/side-bar | OPENED · a gallery of agency-site sidebars (Avéon, bigdirty); nothing app-like; not cited in the notes |
| `recent-design` | recent.design/ | not opened |
| `highfield-nav` | highfieldboats.com/ | OPENED · wordmark left on a translucent dark band over full-bleed water; BOATS · DEALER LOCATOR · REQUEST A QUOTE · SPARE PARTS; EN; `☰` |
| `stacer-nav` | stacer.com.au/ | not opened (2 MB) |
| `brabus-marine-nav` | brabus.com/en-fi/marine/powerboats.html | OCCLUDED · a cookie wall (`CONFIRM SELECTION` / `ACCEPT ALL`) the tool could not decline; the mark and a search field blurred behind it · not cited |

## `live2/` — 25 rows, 1440 × 900, first run

| id | URL | one line |
|---|---|---|
| `geist-command-menu-open` | vercel.com/geist/command-menu | not opened |
| `geist-command-menu-typed` | vercel.com/geist/command-menu | OPENED · "se" typed, `Esc` inside the field, group heads, the page dimmed behind |
| `stripe-dashboard-shortcuts-section` | docs.stripe.com/dashboard/basics#shortcuts | OPENED · Shortcuts: "your pinned and most recently visited pages. After you visit a page, it appears under this section, where you can pin it" |
| `stripe-dashboard-more-section` | docs.stripe.com/dashboard/basics#products | OPENED · Primary navigation: Home, Balances, Transactions, Customers, Product catalog; a Products section; Dashboard settings |
| `mercury-demo-slow` | demo.mercury.com/dashboard | OPENED · the rail: `Mercury Demo · Pro`, Banking | Books, Home, `Tasks 10`, `Command New`, nine more rows, Bookmarks with balances; `Search for anything` in the content head |
| `mercury-demo-dashboard` | demo.mercury.com/dashboard | not opened (near-twin of -slow) |
| `slack-quick-switcher-retry` | slack.com/intl/en-au/help/articles/360059928654-How-to-use-Slack--your-quick-start-guide | OPENED · a YouTube thumbnail of the sidebar (`A1 Company Ltd. ▾`, Channels, Direct messages); no quick switcher visible · not cited |
| `linear-new-command-menu-2019` | linear.app/changelog/2019-12-18-new-command-menu | OPENED · scope chip `Issue · LIN-1615 Changelog` above "Type a command or search…"; a single-key shortcut on every row |
| `linear-contextual-command-menu` | linear.app/changelog/2019-10-07-contextual-command-menu | OPENED · the same menu on right-click: `Change status to…` with seven glyphed states; rail with Search, Inbox, My issues, Favorites |
| `superhuman-palette-shot` | blog.superhuman.com/how-to-build-a-remarkable-command-palette/ | OPENED · rows `Mark Done E · Remind Me H · Star S · Use Snippet ⌘;` in mono; "Users prefer search to menus" |
| `superhuman-palette-shot-2` | blog.superhuman.com/how-to-build-a-remarkable-command-palette/ | not opened |
| `apple-hig-tab-bars-ipad` | developer.apple.com/design/human-interface-guidelines/tab-bars | OPENED · the floating pill with search as a separate bubble; a badge only for critical information; a monochrome bar over colourful content |
| `apple-hig-tab-bars-ipad-2` | developer.apple.com/design/human-interface-guidelines/tab-bars | OPENED · "A tab bar can include a dedicated search tab at the trailing end"; iPadOS: the tab bar near the top, fixed or with a button that converts it to a sidebar |
| `apple-hig-sidebars-scrolled` | developer.apple.com/design/human-interface-guidelines/sidebars | OPENED · let people customize; hide, but never by default; no more than two levels; icon colours must serve a purpose |
| `m3-navigation-rail-scrolled` | m3.material.io/components/navigation-rail/overview | **byte-identical to live/m3-navigation-rail.png** — the scroll never happened |
| `m3-window-size-scrolled` | m3.material.io/foundations/layout/breakpoints/overview | **byte-identical to live/m3-window-size-classes.png** — the scroll never happened |
| `porsche-models-nav` | models.porsche.com/en-AU/model-start | OPENED · `☰ Menu` far left, PORSCHE centred and alone, three glyphs far right; "Do you already have a configuration? Load saved configuration" |
| `porsche-models-menu-open` | models.porsche.com/en-AU/model-start | OPENED · Menu: seven sections in a column, a model column with pictures, the page blurred behind; `Account` at the foot |
| `shadcn-sidebar-scrolled` | ui.shadcn.com/docs/components/base/sidebar | OPENED · SidebarHeader "for branding, titles, or workspace switchers", SidebarRail, SidebarTrigger; the collapsible icon mode |
| `shadcn-command-scrolled` | ui.shadcn.com/docs/components/base/command | OPENED · the cmdk dialog: groups (Suggestions / Settings), a disabled row, `⌘P ⌘B ⌘S` at the right edge — the RTL example |
| `tailwind-app-shells-scrolled` | tailwindcss.com/plus/login | **byte-identical to live/tailwind-app-shells.png** — a login page · not cited |
| `linear-app-shot-head` | linear.app/ | OPENED · rail head `Linear ▾`, search and compose glyphs; issue head `DRV-8852 Faster app launch ★ ···` and `1 / 84 ↑ ↓` |
| `notion-sidebar-scrolled` | notion.com/help/navigate-with-the-sidebar | OPENED · workspace switcher; Search "jump to a recently visited page", `cmd/ctrl + K`; `cmd/ctrl + \` hides the sidebar |
| `arc-spaces-scrolled` | resources.arc.net/hc/en-us/articles/19228064149143-Spaces-Distinct-Browsing-Areas | OPENED · text only: the Space icon at the bottom of the sidebar; `Control-Space n`; `Command-T` and type the name |
| `figma-toolbar-scrolled` | help.figma.com/hc/en-us/articles/360041064174-Access-design-tools-from-the-toolbar | OPENED · text only; the toolbar picture did not land in frame · not cited |

## `finder/` — 18 rows, 1440 × 900, first run

| id | URL | one line |
|---|---|---|
| `cmdk-raycast` | github.com/dip/cmdk | **byte-identical to finder/cmdk-github.png** — cmdk.paco.me redirects to the repository; no demo was reached |
| `cmdk-raycast-typed` | cmdk.paco.me/ | REFUSED · `locator.click` timeout · **no frame** |
| `cmdk-linear` | cmdk.paco.me/ | REFUSED · `locator.click` timeout · **no frame** |
| `cmdk-vercel` | x.com/raunofreiberg | **byte-identical to live/slack-quick-switcher.png** — a 6 KB blank; the tool landed on x.com · nothing |
| `cmdk-framer` | cmdk.paco.me/ | REFUSED · `locator.click` timeout · **no frame** |
| `cmdk-github` | github.com/dip/cmdk | OPENED · dip/cmdk: "Fast, unstyled command menu React component", 13k stars, used by 450K, v1.1.1 |
| `github-search-typed` | github.com/microsoft/vscode | OPENED · "iss" → `Explore › ⊙ Issues · Jump to`, `Search syntax tips` — a page finder |
| `stripe-docs-search-open` | docs.stripe.com/dashboard/basics | not opened |
| `supabase-docs-search-open` | supabase.com/docs/guides/database/tables | not opened |
| `vercel-docs-search-open` | vercel.com/docs | not opened |
| `linear-docs-search-open` | linear.app/docs/search | not opened |
| `raycast-manual-search-open` | manual.raycast.com/keyboard-shortcuts | not opened |
| `algolia-autocomplete-demo` | algolia.com/doc/ui-libraries/autocomplete/introduction/what-is-autocomplete | OPENED · a cookie banner over the introduction page; no federated-results picture · not cited |
| `apple-spotlight-shortcuts` | support.apple.com/en-au/guide/mac-help/mh26783/mac | not opened |
| `notion-keyboard-shortcuts` | notion.com/help/keyboard-shortcuts | not opened |
| `slack-keyboard-shortcuts` | slack.com/intl/en-au/help/articles/201374536-Slack-keyboard-shortcuts | not opened |
| `arc-keyboard-shortcuts` | resources.arc.net/hc/en-us/articles/20595231349911-Keyboard-Shortcuts | not opened |
| `wcag-character-key-shortcuts` | w3.org/WAI/WCAG22/Understanding/character-key-shortcuts.html | "Just a moment…" bot wall · not cited |

## `hand/` — 23 rows, 390 × 844, first run

| id | URL | one line |
|---|---|---|
| `linear-docs-390` | linear.app/docs/search | not opened |
| `linear-docs-390-menu` | linear.app/docs/search | REFUSED · `locator.click` timeout (twice, second time by role) · **no frame** |
| `github-repo-390` | github.com/microsoft/vscode | OPENED · `☰` · mark · Sign in; the breadcrumb; tab row `Code · Issues 5k+ · …` overflowing into `…` |
| `github-repo-390-scrolled` | github.com/microsoft/vscode | not opened |
| `stripe-docs-390` | docs.stripe.com/dashboard/basics | OPENED · `≡ Web Dashboard`; breadcrumb Home / Developer resources / Stripe Dashboard; "press the question mark key (?) for a list of available keyboard shortcuts" |
| `stripe-docs-390-menu` | docs.stripe.com/dashboard/basics | REFUSED · `locator.click` timeout (twice, second time by role) · **no frame** |
| `attio-390` | attio.com/ | not opened |
| `raycast-390` | raycast.com/ | OPENED · marketing in a hand; `☰` in a pill header; no finder shown |
| `apple-hig-tab-bars-390` | developer.apple.com/design/human-interface-guidelines/tab-bars | OPENED · the page in a hand: the tab bar figure; "navigate between top-level sections" |
| `m3-navigation-bar-390` | m3.material.io/components/navigation-bar/overview | OPENED · the page head only: "switch between UI views on smaller devices" |
| `notion-help-390` | notion.com/help/navigate-with-the-sidebar | not opened |
| `shadcn-sidebar-390` | ui.shadcn.com/docs/components/base/sidebar | OPENED · the docs page in a hand; the sidebar figure with the `Acme Inc / Enterprise` switcher; the sheet claim is the doc's, not shown |
| `mercury-demo-390` | demo.mercury.com/home | 3 KB, unpainted · not cited |
| `vercel-docs-390` | vercel.com/docs | not opened |
| `supabase-docs-390` | supabase.com/docs/guides/database/tables | not opened |
| `porsche-configurator-390` | configurator.porsche.com/en-AU/mode/model/992120 | not opened; the title says the vehicle is unavailable |
| `mercury-demo-390-slow` | demo.mercury.com/dashboard | OPENED · `☰ Mer… ⇄ Move`, search glyph, icons, avatar in one header row; the rail folded into `☰` |
| `porsche-model-start-390` | models.porsche.com/en-AU/model-start | OPENED · `☰` · crest centred · three glyphs; "Select a Model Series" |
| `porsche-model-start-390-menu` | models.porsche.com/en-AU/model-start | REFUSED in the first run · succeeded in hand2 by role · **no frame** |
| `github-repo-390-more` | github.com/microsoft/vscode | REFUSED · `locator.click` timeout · **no frame** |
| `attio-390-top` | attio.com/ | not opened |
| `attio-390-menu` | attio.com/ | OPENED · four rows (Platform, Resources, Customers, Pricing) full-screen, `×` top right |
| `linear-app-390` | linear.app/ | OPENED · the homepage app shot survives cropped: the rail's Favorites and the issue's activity |

## `finder2/` — 6 rows, 1440 × 900, this run

| id | URL | one line |
|---|---|---|
| `cmdk-demo-rest` | github.com/dip/cmdk | cmdk.paco.me redirects to github.com/dip/cmdk — the repository page again · not opened (finder/cmdk-github was) |
| `cmdk-demo-typed` | github.com/dip/cmdk | **byte-identical to finder2/cmdk-demo-rest.png** — the keys went to a GitHub page |
| `cmdk-demo-linear` | cmdk.paco.me/ | REFUSED · `locator.click` timeout · **no frame** |
| `apple-macos-page` | apple.com/os/macos/ | OPENED · "macOS 27 Golden Gate"; a pill row of OS sections; no Spotlight in frame · not cited for the finder |
| `apple-macos-page-scrolled` | apple.com/os/macos/ | OPENED · the Apple Intelligence section; no Spotlight · not cited |
| `apple-hig-navigation-bars` | developer.apple.com/design/human-interface-guidelines/toolbars | **byte-identical to live/apple-hig-toolbars.png** — HIG folded navigation bars into Toolbars; cited under that path |

## `hand2/` — 4 rows, 390 × 844, this run

| id | URL | one line |
|---|---|---|
| `porsche-model-start-390-menu` | models.porsche.com/en-AU/model-start | OPENED · full-screen list: Models › Electric › Vehicle Purchase › Shop · Services › Experience › Find a Dealer ›; `Account ›` at the foot; `×` |
| `stripe-docs-390-menu` | docs.stripe.com/dashboard/basics | REFUSED · `locator.click` timeout by role · **no frame** |
| `linear-docs-390-menu` | linear.app/docs/search | REFUSED · `locator.click` timeout by role · **no frame** |
| `mercury-demo-390-menu` | demo.mercury.com/dashboard | OPENED · the press opened "Learn more about Mercury", a promotion sheet, not the menu |

