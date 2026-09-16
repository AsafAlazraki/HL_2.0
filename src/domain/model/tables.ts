import type { AccentKey, ColumnSection, FieldDef, FieldType } from './fields'
import type { PriceLevel } from './pricing'

/* ---------------------------------------------------------- */
/* Entities, groups, rows                                     */
/* ---------------------------------------------------------- */

export interface XY {
  x: number
  y: number
}

/* ---------------------------------------------------------- */
/* Industries and table kinds — the domain knowledge that lets */
/* a user pick what they sell instead of designing a schema.   */
/* ---------------------------------------------------------- */

export type IndustryKey = 'marine' | 'automotive' | 'motorcycle' | 'other'

export interface IndustryMeta {
  label: string
  blurb: string
  /** only 'marine' is built; the rest render as COMING SOON */
  available: boolean
}

export const INDUSTRIES: Record<IndustryKey, IndustryMeta> = {
  marine: {
    label: 'Marine',
    blurb: 'Boats, outboards, trailers and the rigs they make together.',
    available: true,
  },
  automotive: {
    label: 'Automotive',
    blurb: 'Cars, utes and the options that come with them.',
    available: false,
  },
  motorcycle: {
    label: 'Motorcycles & ATVs',
    blurb: 'Bikes, quads and side-by-sides.',
    available: false,
  },
  other: {
    label: 'Other',
    blurb: 'Start from a blank sheet and build your own tables.',
    available: false,
  },
}

/** What a table HOLDS. It is a TYPE, not an instance.
 *
 *  ONE TABLE PER BRAND. A `boat` table is a single brand's catalogue —
 *  "Highfield", "Stacer", "Stabicraft" are three separate tables that all
 *  share kind 'boat'. Same for trailers: REDCO, Dunbier and Mackay are
 *  three `trailer` tables.
 *
 *  This is not a preference, it is what the source data demands. The real
 *  Boat Module carries EIGHT brand-specific header rows re-labelling the
 *  same grid, because a column means different things per brand — col I is
 *  "Depth (Mtr)" for Stacer and "Tube Dia." for Highfield; P/Q is "Hull
 *  Weight / Max Motor Weight" for one and "Max Load / Max People" for
 *  another; Highfield has no col U at all. Merging them into one table
 *  would force exactly the untyped, meaning-drifting column soup this
 *  product exists to replace.
 *
 *  The KIND is what lets rules and fitment work across brands: a motor
 *  fitment rule is written once against `boat` and applies to every boat
 *  table, whatever its columns are called. */
export type TableKind = 'boat' | 'motor' | 'trailer' | 'accessory' | 'package' | 'dealer' | 'custom'

/** One way a table can be structured. `levels` are the column names that
 *  form the nesting, outermost first. An empty `levels` is a flat list. */
export interface StructurePreset {
  id: string
  levels: string[]
  caption: string
}

/** A column a kind ships with beyond its hierarchy. `linkTo` asks for a
 *  link to another table of that kind, resolved at creation time and
 *  omitted when no such table exists yet. */
export interface KindColumn {
  name: string
  type: FieldType
  options?: string[]
  linkTo?: TableKind
  /** id of the ColumnSection this belongs to — see TableKindMeta.sections.
   *  A 40-column price sheet is unreadable as one run; the bands are how
   *  the business already draws it. */
  section?: string
  /** the business's own unit, appended to the column name when set.
   *  The MPF stores '52 cm', '105 ltr', '1,188 kg' as TEXT inside otherwise
   *  numeric columns — declaring the unit here is what lets us store a
   *  clean number and still show what it means. */
  unit?: string
}

export interface TableKindMeta {
  label: string
  blurb: string
  accent: AccentKey
  /** first entry is the default */
  structures: StructurePreset[]
  /** the bands a new table of this kind opens with, in order */
  sections?: Array<{ id: string; name: string; accent?: AccentKey }>
  detailColumns: KindColumn[]
}

const FLAT: StructurePreset = {
  id: 'flat',
  levels: [],
  caption: 'One straight list, no grouping.',
}

export const TABLE_KINDS: Record<TableKind, TableKindMeta> = {
  /* Corrected against the real Boat Module — see MPF_GROUND_TRUTH.md §2.1
     and §4.1. "Range" is gone as a default level name: Highfield, Stabicraft,
     Surtees and Haines all write SERIES; only Stacer writes plural range
     names, and level names stay renameable per table anyway. */
  boat: {
    label: 'Boats',
    blurb: 'The boats you sell.',
    accent: 'blue',
    /* The table IS the brand, so Brand is NOT a level — it would repeat on
       every row. Levels start below it. */
    structures: [
      {
        id: 'series-model-variant',
        levels: ['Series', 'Model', 'Variant'],
        caption: 'Series, their models, and each model’s material and colourway SKUs.',
      },
      {
        id: 'series-model',
        levels: ['Series', 'Model'],
        caption: 'Models are sold as one item — no material or colour split.',
      },
      {
        id: 'model-variant',
        levels: ['Model', 'Variant'],
        caption: 'A short catalogue with no series grouping.',
      },
      FLAT,
    ],
    sections: [
      { id: 'identity', name: 'Identity' },
      { id: 'dimensions', name: 'Dimensions' },
      { id: 'capacity', name: 'Capacity' },
      { id: 'cost-build', name: 'Cost Build', accent: 'graphite' },
      { id: 'pricing', name: 'Hull Only Pricing', accent: 'viridian' },
      { id: 'motor-fitment', name: 'Motor Fitment', accent: 'carmine' },
    ],
    /* ── WHAT A PRESET IS ALLOWED TO KNOW ────────────────────────
       UX_PASS §4.4: "Presets are neutral, or they are not presets. A
       `Boats` preset ships the columns every boat has — identity,
       dimensions, capacity, price — and NOT `AUS Sailing`.
       Brand-specific columns are what the import is for."

       SIX COLUMNS AND A WHOLE SECTION CAME OUT, and every one of them
       was one dealership's private vocabulary arriving on a table
       somebody else had just made:

         AUS Sailing        a named account of one business
         Sub Dealer         that business's channel
         Sub (Exclusive)    that business's channel
         HO - MU            "hull only markup", their abbreviation
         BMT - MU           "boat motor trailer markup", theirs
         Matrix             their word for a code scheme

       The `Markups` section went with the two that were in it,
       because a band with no columns is a heading for nothing.

       NOT RENAMED TO SOMETHING NEUTRAL, and that is deliberate. A
       generic `Markup` would be a new name that `pricing.ts`'s
       COST_COLUMNS does not know, and that list is what keeps a
       dealer's buy price off a customer's quotation — so inventing a
       column here would open a hole there. A dealer who marks up adds
       their own, and the import brings the real ones.

       This changes NEW tables only. The seeded file carries its own
       columns from the real workbook and is untouched. */
    detailColumns: [
      { name: 'Model Code', type: 'text', section: 'identity' },
      { name: 'Material', type: 'select', options: ['PVC', 'HYP'], section: 'identity' },
      { name: 'Colourway', type: 'text', section: 'identity' },
      { name: 'Image', type: 'image', section: 'identity' },
      { name: 'OA Length', type: 'number', unit: 'm', section: 'dimensions' },
      { name: 'Beam', type: 'number', unit: 'm', section: 'dimensions' },
      { name: 'Tube Dia.', type: 'number', unit: 'cm', section: 'dimensions' },
      { name: 'Deadrise', type: 'number', unit: '°', section: 'dimensions' },
      { name: 'Fuel Capacity', type: 'number', unit: 'L', section: 'capacity' },
      { name: 'Max Load', type: 'number', unit: 'kg', section: 'capacity' },
      { name: 'Max People', type: 'number', section: 'capacity' },
      { name: 'Boat Weight', type: 'number', unit: 'kg', section: 'capacity' },
      {
        name: 'Currency',
        type: 'select',
        options: ['AUD', 'USD', 'Euro', 'NZ'],
        section: 'cost-build',
      },
      { name: 'EX Rate', type: 'number', section: 'cost-build' },
      { name: 'Base Cost', type: 'number', section: 'cost-build' },
      { name: 'Road Freight', type: 'number', section: 'cost-build' },
      { name: 'Landed Hull Cost', type: 'number', section: 'cost-build' },
      { name: 'Cash', type: 'number', section: 'pricing' },
      { name: 'Trade', type: 'number', section: 'pricing' },
      { name: 'Min HP', type: 'number', section: 'motor-fitment' },
      { name: 'Max HP', type: 'number', section: 'motor-fitment' },
      {
        name: 'Shaft Length',
        type: 'select',
        options: ['S', 'L', 'XL', 'XXL'],
        section: 'motor-fitment',
      },
    ],
  },
  motor: {
    label: 'Motors',
    blurb: 'Outboards and engines.',
    accent: 'carmine',
    /* one table per motor brand — the table IS Yamaha, or Suzuki */
    structures: [
      {
        id: 'series-model',
        levels: ['Series', 'Model'],
        caption: 'Model families, and the models within them.',
      },
      { id: 'model', levels: ['Model'], caption: 'A straight list of models.' },
      FLAT,
    ],
    detailColumns: [
      { name: 'HP', type: 'number' },
      { name: 'Weight kg', type: 'number' },
      { name: 'Shaft', type: 'select', options: ['Short', 'Long', 'Extra long'] },
      { name: 'Price', type: 'number' },
    ],
  },
  trailer: {
    label: 'Trailers',
    blurb: 'Road trailers rated by load and length.',
    accent: 'ochre',
    /* one table per trailer brand — REDCO, Dunbier, Mackay each get their
       own; the middle level is genuinely called SERIES in the source */
    structures: [
      {
        id: 'series-model',
        levels: ['Series', 'Model'],
        caption: 'Series, and the trailers within them.',
      },
      { id: 'model', levels: ['Model'], caption: 'A straight list of trailers.' },
      FLAT,
    ],
    detailColumns: [
      { name: 'Max Load kg', type: 'number' },
      { name: 'Max Length ft', type: 'number' },
      { name: 'Axles', type: 'number' },
      { name: 'Price', type: 'number' },
    ],
  },
  accessory: {
    label: 'Accessories',
    blurb: 'Parts, add-ons and extras.',
    accent: 'viridian',
    structures: [
      {
        id: 'category-product',
        levels: ['Category', 'Product'],
        caption: 'Products grouped under a category.',
      },
      {
        id: 'category-sub-product',
        levels: ['Category', 'Sub-category', 'Product'],
        caption: 'A deeper catalogue with sub-categories.',
      },
      FLAT,
    ],
    detailColumns: [
      { name: 'SKU', type: 'text' },
      { name: 'Price', type: 'number' },
      { name: 'In Stock', type: 'boolean' },
    ],
  },
  package: {
    label: 'Packages',
    blurb: 'A boat, motor and trailer sold together as a rig.',
    accent: 'violet',
    structures: [
      { ...FLAT, caption: 'One straight list of packages.' },
      { id: 'brand-package', levels: ['Brand', 'Package'], caption: 'Packages grouped by brand.' },
    ],
    detailColumns: [
      { name: 'Boat', type: 'reference', linkTo: 'boat' },
      { name: 'Motor', type: 'reference', linkTo: 'motor' },
      { name: 'Trailer', type: 'reference', linkTo: 'trailer' },
      { name: 'Price', type: 'number' },
    ],
  },
  dealer: {
    label: 'Dealers',
    blurb: 'Dealers and locations.',
    accent: 'teal',
    structures: [
      { id: 'region-dealer', levels: ['Region', 'Dealer'], caption: 'Dealers grouped by region.' },
      FLAT,
    ],
    detailColumns: [
      { name: 'Suburb', type: 'text' },
      { name: 'State', type: 'text' },
      { name: 'Phone', type: 'text' },
    ],
  },
  custom: {
    label: 'Custom table',
    blurb: 'Anything the presets do not cover.',
    accent: 'graphite',
    structures: [FLAT],
    detailColumns: [{ name: 'Name', type: 'text' }],
  },
}

/** What a table IS, structurally. The three roles must not be confused —
 *  conflating them is precisely the mess we exist to replace.
 *
 *  - `base`  ONE subject, and only that subject. A Boats table holds boat
 *            columns: brand, range, model, variant, length, weight, HP
 *            envelope, its own prices. It has NO motor column and NO trailer
 *            column, because a motor is not a property of a boat.
 *
 *  - `join`  A declared relationship between two (or more) base tables, plus
 *            whatever belongs to the PAIRING rather than to either side.
 *            Boat × Motor carries the rigging kit, the prop, the engine hole
 *            and "recommended" — none of which is a fact about the boat alone
 *            or the motor alone.
 *
 *  - `view`  The sellable, quotable combination, assembled from base tables
 *            through joins. A stock rig — this hull, that motor, that trailer,
 *            one price — is a VIEW. The spreadsheet draws it as a row and it
 *            looks like a table; it is not one.
 *
 *  Absent = `base` (the common case, and the safe default). */
export type TableRole = 'base' | 'join' | 'view'

/** A table. The name `EntityDef` is kept for portability with the engine
 *  that was ported around it; the word "entity" never reaches a reader. */
export interface EntityDef {
  id: string
  /** THE TENANT KEY, on every persisted record. One organisation per
   *  database today; the Postgres adapter filters on it tomorrow, and
   *  a record that does not carry it cannot be filed. */
  orgId: string
  name: string
  description?: string
  accent: AccentKey
  /** what this table holds — drives its symbol and its presets */
  kind?: TableKind
  /** base (default) | join | view — see TableRole. A base table stays pure:
   *  it never grows a column belonging to another subject. */
  role?: TableRole
  /** history rather than stock. The table and its rows survive so an
   *  old quote still resolves; nothing customer-facing offers it.
   *  See DISCONTINUED_FIELD in rows.ts for the row-level equivalent. */
  retired?: boolean
  /** ordered field ids forming the grouping levels; empty/absent = flat.
   *  Rows stay flat; this is a view transform only.
   *  Level COUNT and level NAME are per-table — there is no universal
   *  "Range". Boats run Brand▸Range▸Model▸Variant, trailers run
   *  Brand▸Series▸Trailer, motors have no taxonomy level at all. */
  hierarchy?: string[]
  /** named bands of columns, e.g. Pricing / Dimensions */
  sections?: ColumnSection[]
  fields: FieldDef[]
  /** field used to label rows elsewhere (reference pickers, node badge);
   *  defaults to the first non-formula field when unset */
  displayFieldId?: string
  /**
   * THE PRICE LADDER THIS TABLE DECLARES — MODULE_SYSTEM §2 defect 3.
   *
   * Without it, `priceLevelsFor` could only fall back to `NAMED_LEVELS`:
   * an exact-name allow-list per `TableKind`, so a dealer whose column
   * is called `Retail` rather than `Cash` has a table the quote cannot
   * price, and nothing on any screen says why. The list is a good
   * LAST RESORT — it is how the seeded file works today and it stays
   * — but it was the only resort, which made a column NAME part of
   * the contract.
   *
   * DECLARED WINS, and `priceLevelsFor` has always read this first;
   * the field simply did not exist on the type, so nothing could
   * write one. `pricing.ts` carried a `MaybeLevelled` shim to read it
   * anyway, with a note saying it would need no edit on the day this
   * landed. This is that day.
   *
   * A DECLARATION POINTING AT A COST COLUMN IS STILL REFUSED, by
   * `priceLevelsFor` and not by good manners: the exclusion of cost
   * and margin from every quote surface is by construction, and a
   * table declaring its own ladder does not get to opt out of it.
   *
   * Absent means "fall back to the names", which is every table on
   * the seeded file and must stay cheap.
   *
   * ON THE PACK IT IS NEVER ABSENT: the packer declares the ladder of
   * every priced table (`PackTableMeta.priceLevels`), so no Northside
   * column name has to live in app code for the seeded file to price.
   */
  priceLevels?: PriceLevel[]
  position: XY
  /** set when the entity sits inside a group frame on the whiteboard */
  groupId?: string
  createdAt: string
  updatedAt: string
}

export interface GroupDef {
  id: string
  /** the tenant key — see EntityDef.orgId */
  orgId: string
  name: string
  accent: AccentKey
  position: XY
  size: { w: number; h: number }
}
