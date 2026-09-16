/* ============================================================
   PEOPLE — the customer a quote is addressed to.

   A customer is a row in the register, in the dealer's own columns,
   editable in the sheet like any other row; that thesis is carried
   over whole (`domain/people/customers` reads the register by its
   well-known column ids). What the CONTRACT adds is the two shapes a
   quote holds about a person — the frozen block it prints and the
   pointer it keeps — and the record a customer is filed as, so a
   register row and a persisted record say the same things under the
   same names and both carry the tenant key.

   NOTHING IN THIS FILE KNOWS WHAT IS SOLD. A customer is a customer
   whether the yard sells boats, tractors or bandsaws; there is not a
   marine word in it and there must never be one.
   ============================================================ */

/** WHAT THE DOCUMENT PRINTS, and the only thing it prints. Frozen the
 *  moment a customer is picked, exactly like a line's price. `contact`
 *  is the printable lines in printing order — phone, email, address —
 *  with blanks dropped; the yard's own note is never among them. */
export interface FrozenCustomer {
  name: string
  contact?: string[]
}

/** WHO A QUOTE WAS ADDRESSED TO, AS A ROW — the "open this row on the
 *  sheet" pointer, and nothing a renderer ever resolves. `tableId`
 *  travels with `rowId` because the register is an ordinary table
 *  with an ordinary id. See `QuoteDef.customerRef`. */
export interface CustomerRef {
  tableId: string
  rowId: string
}

/** A customer, as a record.
 *
 *  THE THREE CONTACT LINES carry their own names because a quote
 *  freezes them onto itself, and freezing needs to know which columns
 *  are safe to print on a document the customer is handed. THE NOTE
 *  is named so it can be deliberately LEFT OFF that document: it is
 *  for the yard, searchable ("the one with the blue Hilux") and never
 *  printed. A dealer's own further columns are the dealer's own
 *  business and are not on this record — a register grows "Credit
 *  limit" within a month of real use, and a rule that printed every
 *  filled cell would put it on the customer's copy of their own quote.
 *
 *  '' is a real state for `name`: a row exists and nobody has named it
 *  yet. Never substituted with a placeholder that could be mistaken
 *  for a name. */
export interface CustomerDef {
  id: string
  /** the tenant key — see EntityDef.orgId */
  orgId: string
  name: string
  phone?: string
  email?: string
  address?: string
  /** for the yard — never printed on a quote */
  note?: string
  createdAt: string
  updatedAt: string
}
