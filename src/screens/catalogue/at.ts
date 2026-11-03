/* ============================================================
   WHERE A PERSON IS IN THE CHANDLERY — every position a search param
   (CLAUDE.md, Shape), so Back, a reload and a link sent to a phone at
   the boat all land on the same aisle, supplier, boat and opened part.

     aisle     the aisle open, or '' for the index of aisles
     supplier  the supplier the aisle is narrowed to, by its said name
     boat      the customer's boat, by its line on the price list
     show      all | pictured | without — the parts with a picture
     find      the words typed into find
     sort      file | price | quoted — the order inside each heading
     open      the part opened in place, by its line
     heading   the heading a link from the index lands on
     view      'suppliers' for the page that names them
   ============================================================ */

export type Show = 'all' | 'pictured' | 'without'
export type Sort = 'file' | 'price' | 'quoted'

export interface CatalogueAt {
  aisle: string
  supplier: string
  boat: string
  show: Show
  find: string
  sort: Sort
  open: string
  heading: string
  view: '' | 'suppliers'
}

export const NOWHERE: CatalogueAt = {
  aisle: '',
  supplier: '',
  boat: '',
  show: 'all',
  find: '',
  sort: 'file',
  open: '',
  heading: '',
  view: '',
}

/** The address of a position: only what differs from nowhere is written. */
export function hrefOf(at: Partial<CatalogueAt>): string {
  const q = new URLSearchParams()
  const put = (k: keyof CatalogueAt, v: string | undefined, none: string): void => {
    if (v !== undefined && v !== none) q.set(k, v)
  }
  put('view', at.view, '')
  put('aisle', at.aisle, '')
  put('supplier', at.supplier, '')
  put('boat', at.boat, '')
  put('show', at.show, 'all')
  put('sort', at.sort, 'file')
  put('find', at.find, '')
  put('heading', at.heading, '')
  put('open', at.open, '')
  const s = q.toString()
  return s === '' ? '/catalogue' : `/catalogue?${s}`
}
