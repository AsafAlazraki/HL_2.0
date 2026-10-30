# Choosing in the build — every frame

Driven 2026-10-30 with `tools/research/capture.ts` at 1440×900. 38 frames on disk in three modalities (`dnd/`, `live/`, `shop/`); one source failed with no frame (`lego-pick-a-brick-in`, the age gate's Continue never became pressable). Frames are gitignored and mirrored to `C:\Users\Asaf\dev\hl-refs\hl2\choosing\`. "Cited" means the notes lean on it; "failed" means it is listed and never cited as a pattern.

## dnd/

| frame | URL | what is there |
|---|---|---|
| `dndkit-home.png` | https://dndkit.com/ | Docs overview: draggable, droppable, sortable as concepts; nothing to drag. Context only. |
| `dndkit-a11y-docs.png` | https://dndkit.com/legacy/guides/accessibility/ | Full page (8,150px). The keyboard rules (Space or Enter picks up, arrows move, Space or Enter drops, Escape cancels), screen-reader instructions, live announcements. Cited. |
| `dndkit-multi-containers.png` | storybook `presets-sortable-multiple-containers--basic-setup` | Four columns, three cards each, a handle on each column head, "+ Add column". At rest. |
| `dndkit-multi-keyboard-lifted.png` | same, after Tab, Space, → | The board shifted left by 40px. No lifted card is visible, so the frame proves nothing. Not cited. |
| `dndkit-trashable.png` | storybook `…--trashable-items` | At rest. The trash zone only appears during a drag and was not captured. Not cited. |
| `dndkit-multiple-droppables.png` | storybook `core-droppable-usedroppable--multiple-droppables` | A dark "draggable" pill at x 40 and three white "droppable" squares, each showing an icon and the word. Cited. |
| `dndkit-droppable-keyboard.png` | same, after Tab, Space, →, → | The pill has moved 45px right (bounding box x 40→85, measured) and now carries a lifted shadow. A keyboard drag, shown in a still. Cited. |
| `atlassian-pdnd-guidelines.png` | https://atlassian.design/components/pragmatic-drag-and-drop/design-guidelines | Head of the guidelines and its contents ("Drag handle icons", "Drag previews"). The rule on alternatives is quoted from the sibling page https://atlassian.design/components/pragmatic-drag-and-drop/accessibility-guidelines (read as text, the same day). Cited. |

## live/

| frame | URL | what is there |
|---|---|---|
| `polestar-4-configure.png` | https://www.polestar.com/au/configure/polestar-4-suv | Full page (8,983px). A state modal over the first screen. Swatches grouped Metallic and Matte. Wheels and seats as picture cards, with "Only available with Plus pack" printed above them. Packs shown as two photographs, a contents list and Add / Read more. Single options as ticked lines with prices. Extras as counted bands ("Towbar (1)", "Interior (13)"). Cited, primary. |
| `toyota-hilux-accessories.png` | https://www.toyota.com.au/hilux/accessories | Title and a lifestyle hero. Context. |
| `toyota-hilux-accessories-scrolled.png` | same, scrolled 1,300 | "Load up, your way.", with tabs PROTECTION · URBAN · RURAL · ADVENTURE · TRADES: accessories grouped by what they are for. Cited, primary. |
| `rivian-gearshop.png` | https://gearshop.rivian.com/ | A "Fit your vehicle" chip in the header, and aisle pills (Charging, Adventure Gear, Wheels and Tires, Accessories) with "View all". Cited, primary. |
| `bcf-boating.png` | https://www.bcf.com.au/boating | "SHOP BY" tiles, each a blue line drawing of the aisle plus its name (Marine Electronics, Life Jackets, Marine Batteries), then a row of brand marks. Cited, primary. |
| `whitworths-home.png` | https://www.whitworths.com.au/ | An Australian chandlery. "Catalogue" in the navigation, and photographic aisle tiles SAILING · FISHING · POWER · LEISURE. Supporting. |
| `yamaha-waverunner-shop-accessories.png` | https://yamaha-motor.com/shop/waverunner/accessories | Four vests at one height on one white ground, each with its name, price and "2 colors available". Above them, eight filter dropdowns. Cited, both for and against. |
| `yamaha-waverunner-build.png` | https://www.yamahawaverunners.com/build-and-price/ | "BUILD AND PRICE YOUR WAVERUNNER", "Select your preferred series" and a series tab strip. Supporting. |
| `seadoo-accessories-au.png` | https://sea-doo.brp.com/au/en/accessories-parts-gear.html | A name and email form over the accessories page. Cited as a failure. |
| `westmarine-outfitting.png` | https://www.westmarine.com/boat-outfitting/ | A 404, but the navigation shows aisles named by purpose (Anchor & Docking, Safety, Marine Electrical, Engine Systems) and a "Parts Finder" link. Supporting, navigation only. |
| `axopar-configurator-full.png` | https://www.axopar.com/configurator/ | Full page: the model chooser only (Axopar 38 XC / Sun Top / Cross Top, "Configure →"). No accessory step reached. |
| `tesla-shop-accessories.png` | https://shop.tesla.com/category/vehicle-accessories | Failed: Access Denied. |
| `volvo-accessories.png` | https://www.volvocars.com/au/accessories/ | Failed: Access Denied. |
| `rivian-accessories.png` | https://rivian.com/accessories | Failed: 404. |
| `polestar-accessories.png` | https://www.polestar.com/au/accessories/ | Failed: 404. |
| `landrover-defender-accessories.png` | https://www.landrover.com.au/vehicles/defender/accessories.html | Failed: Page Not Found. |
| `bmw-accessories.png` | https://www.bmw.com.au/en/topics/offers-and-services/original-bmw-accessories/overview.html | Failed: blank page (6 KB). |
| `seadoo-build-price.png`, `seadoo-accessories.png` | sea-doo.brp.com/us/en/… | Failed: Error 404. |
| `yamaha-waverunner-accessories.png` | https://www.yamahawaverunners.com/accessories | Failed: 404. |
| `boatsnet-yamaha-diagrams.png` | https://www.boats.net/catalog/yamaha/outboard | Failed: bot check ("Just a moment..."). Not fought. |

## shop/

| frame | URL | what is there |
|---|---|---|
| `apple-ipad-pro-buy.png` | https://www.apple.com/au/shop/buy-ipad/ipad-pro | Full page (12,646px). Two-tone step heads ("Apple Pencil. Select one that fits your needs."). Add-ons as peer cards, each with its own "No …" card. Later steps greyed until earlier ones are answered. A compare grid saying what each model supports. A question, "Which Apple Pencil will work with this iPad?". Cited. |
| `ikea-pax-tool.png` | https://www.ikea.com/addon-app/storageone/pax/web/latest/au/en/ | Two doors, "PAX Planning Tool" and "Open a saved design — Enter a design code", over "Choose a combination to customise", a row of photographs of finished wardrobes. Cited, primary. |
| `ikea-kitchen-planner.png` | https://www.ikea.com/au/en/planners/kitchen-planner/ | A landing page under a consent card that offers only "Ok" and "Cookies settings" (left unanswered). No planner. Not cited. |
| `ikea-kreativ.png` | https://www.ikea.com/au/en/home-design/ | A landing page under the same consent card, with "Open design with code". Not cited. |
| `lego-pick-a-brick.png`, `lego-pick-and-build.png` | lego.com/en-au/pick-and-build/… | Failed: the LEGO.com and Play Zone gate covers the catalogue. |
| `nike-by-you-dunk.png` | https://www.nike.com/au/u/custom-nike-dunk-low-by-you-10001535 | "THE PRODUCT YOU ARE LOOKING FOR IS NO LONGER AVAILABLE" over "You Might Also Like". Cited as a failure. |
| `shopify-bundles-app.png` | https://apps.shopify.com/shopify-bundles | Full page. The app's claims, plus reviews: one praises customers seeing what is in the kit at checkout, and a 1-star review says the imagery does not carry over. Cited. |
| `shopify-bundles-help.png` | https://help.shopify.com/en/manual/products/bundles | Help article head. Not opened. |

## Stock re-read (not re-captured)

- `docs/research/refs/configurator/premium/ikea-pax-planner.png`: IKEA's planning-tools page. Its hero is a photograph of the planner on a laptop: a rail of product pictures on the left, the room on the right, and view switches along the foot. A photograph of a screen, so it is cited for composition only.
- `docs/research/refs/configurator/premium/nike-by-you.png` (2026-09-17): the same "no longer available / You Might Also Like" page. Nike By You failed twice, a month apart.
- `docs/research/refs/configurator/premium/trek-project-one.png`: Project One's landing page under a consent bar. No builder reached. Not cited.
