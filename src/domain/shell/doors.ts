/* ============================================================
   THE COUNTS ON THE DOORS — what figure stands beside each word on
   the pill, as a pure function of figures the stores already hold.

   THE DOOR COUNTS WHAT THE SCREEN BEHIND IT COUNTS, and that is the
   whole rule. The shell wrote it on 2026-09-23 to fix the tables count
   (51 on the door, 53 on the two screens it opens) and left it broken
   one door along: the Quotes door printed OPEN DRAFTS, so on a desk
   with one issued quote the pill read `Quotes 0` beside a register
   whose first line is "1 quote is filed in this browser" (critique of
   Milestone 2, #9). A door that disagrees with the screen it opens is
   the "dialogs stop lying" fault in one word.

   So the Quotes figure is the register's own `held` — every draft,
   issued and superseded quote this browser holds, which is also what
   the door's own sentence in `src/app/ways.ts` promises. Open drafts
   are still read, because they are the one figure here that is WORK
   WAITING rather than the size of something, and the phone draws that
   as a dot (`src/screens/shell/shell.css`). They are said aloud with
   the count, so a reader hears both facts and a sighted person at a
   desk sees the one the register prints.

   `null` DRAWS NOTHING, and it means "this store has not answered", or
   "there is no register to count": a zero printed before a read is a
   figure nobody measured, and "0 people" is a count of a book nobody
   has made (the book is a table that does not exist until the first
   person is filed). A real zero is printed as zero — three honest
   zeros on day one is the decision the register's own bands made.

   History carries no figure at all: every event in it is already on a
   document counted somewhere else, and a diary's length is not a thing
   anybody glances at a navigation bar to learn.
   ============================================================ */

export interface DoorCount {
  /** the figure beside the word */
  count: number
  /** what the figure is of, said aloud after the door's word: "1 filed" */
  say: string
  /** whether any of it is work waiting — only open drafts are */
  waiting: boolean
}

export interface DoorCounts {
  quotes: DoorCount | null
  customers: DoorCount | null
  data: DoorCount | null
}

export interface SeenByTheShell {
  /** whether the quotes store has read this browser yet */
  quotesRead: boolean
  /** every quote filed — the register's own `held` */
  filed: number
  /** the drafts among them */
  drafts: number
  /** everyone the Customers screen counts as a customer — kept in the
   *  book or named on a quote (`countCustomers`) — or null before the
   *  quotes are read */
  people: number | null
  /** tables on the file, or null when no file is open */
  tables: number | null
}

const au = (n: number): string => n.toLocaleString('en-AU')

export function readDoorCounts(seen: SeenByTheShell): DoorCounts {
  return {
    quotes: seen.quotesRead
      ? {
          count: seen.filed,
          say:
            `${au(seen.filed)} filed` +
            (seen.drafts === 0
              ? ''
              : `, ${au(seen.drafts)} of them ${seen.drafts === 1 ? 'an open draft' : 'open drafts'}`),
          waiting: seen.drafts > 0,
        }
      : null,
    customers:
      seen.people === null || seen.people === 0
        ? null
        : {
            count: seen.people,
            say: `${au(seen.people)} ${seen.people === 1 ? 'customer' : 'customers'}`,
            waiting: false,
          },
    data:
      seen.tables === null
        ? null
        : {
            count: seen.tables,
            say: `${au(seen.tables)} ${seen.tables === 1 ? 'table' : 'tables'}`,
            waiting: false,
          },
  }
}
