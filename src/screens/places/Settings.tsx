import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowCounterClockwiseIcon, LinkIcon, UploadSimpleIcon } from '@phosphor-icons/react'
import { Button, Field, Input, Picture, Plate, Segmented, Tile, say, undo, unsay } from '@/ui'
import { pictures, srcSetOf } from '@/data/pictures'
import type { HeroPick, MarkPick, PlaceDress } from '@/domain/model'
import { isDone, type CatalogueCommand } from '@/domain/catalogue/commands'
import { LINE_MAX, dressPlace } from '@/domain/catalogue/placeCommands'
import { logoFromAddress } from '@/domain/modules/logo'
import {
  GROUNDS,
  GROUND_FLOOR,
  dressKey,
  dressOf,
  heroesOf,
  inkOf,
  markInks,
  onOf,
} from '@/domain/modules/livery'
import { useCatalogue } from '@/app/useStores'
import { catalogue } from '@/state/catalogue'
import { readMark, readPhotograph, type FileRead } from './files'
import type { PlaceCard } from './read'
import { Selling } from './Selling'

/* ============================================================
   A PLACE'S SETTINGS — the four things Northside gives it, each
   bounded and each with its consequence said where it is chosen:

     its LINE, one line under its name, refused past 90 characters with
     the figure (nothing prints until one is written);
     its MARK, the maker's own in white on its colour or in its own
     colours on a white plate, Northside's own file, or its name in
     type — an ink the maker does not ship is refused with the reason;
     its PHOTOGRAPH, only ever one of ITS OWN boats as the app ships
     them, each captioned with the model it shows, or Northside's own
     (uploaded, or by address), or none;
     its COLOUR, from a bounded set every one of which white words clear
     at 4.5 : 1, the figure said for the one chosen.

   The photographs offered are fetched at once, never lazily: a place
   has at most eighteen, and a lazy one could stand blank under the
   tick that says it is chosen (m4-walk-390-06, the critic's minor).

   Every press is ONE step with its way back (`dressPlace`), said with
   its Undo, and lands on the page head at once.
   ============================================================ */

const STEP = 'places-step'
const NOTHING = 'Nothing to change.'
const AS_IT_CAME = (name: string) => `${name} is back as it came.`

const ratio = (v: number): string => `${v.toFixed(1)} : 1`

export function Settings({ card }: { card: PlaceCard }) {
  const modules = useCatalogue((s) => s.modules)
  const dress: PlaceDress = useMemo(() => dressOf(card.place, modules), [card.place, modules])
  const book = pictures()
  const inks = useMemo(() => markInks(card.name, book), [card.name, book])
  const own = useMemo(() => heroesOf(card.tableIds, book), [card.tableIds, book])
  const name = card.name

  useEffect(() => () => unsay(STEP), [])

  const [problem, setProblem] = useState<{ at: string; why: string } | null>(null)
  const [note, setNote] = useState<{ at: string; say: string } | null>(null)

  function apply(next: PlaceDress, said: string, at: string): boolean {
    const command: CatalogueCommand = dressPlace(
      card.place.moduleId,
      dressKey(card.place),
      next,
      said,
      name,
    )
    const outcome = catalogue.getState().apply(command)
    if (!isDone(outcome)) {
      if (outcome.refused !== '') setProblem({ at, why: outcome.refused })
      else say(NOTHING, { id: STEP })
      return false
    }
    setProblem(null)
    const eventId = outcome.event.id
    undo(
      outcome.said,
      () => {
        const back = catalogue.getState().undo(eventId)
        say(isDone(back) ? back.said : back.refused || NOTHING, { id: STEP })
      },
      { id: STEP },
    )
    return true
  }

  /* ---- the line ---- */
  /* what is being typed, or null while nothing has been: the saved line is read through */
  const [draft, setDraft] = useState<string | null>(null)
  const line = draft ?? dress.line ?? ''
  const lineChanged = line.trim() !== (dress.line ?? '')

  /* ---- the mark ---- */
  /* on the colour (the maker's light ink) or on a plate (its own colours) */
  type MarkChoice = 'ground' | 'plate' | 'own' | 'name'
  const ownMark = dress.mark?.from === 'own' ? dress.mark : null
  /* Northside's own file stays offered after another mark is chosen, for this visit */
  const [lastOwn, setLastOwn] = useState(ownMark)
  const keptMark = ownMark ?? lastOwn
  const markNow: MarkChoice =
    dress.mark?.from === 'own'
      ? 'own'
      : dress.mark?.from === 'name'
        ? 'name'
        : dress.mark?.from === 'maker'
          ? onOf(dress.mark.ink)
          : card.mark.drawn
            ? card.mark.mark.on
            : 'name'
  const markOptions = [
    {
      value: 'ground' as const,
      label: 'In white',
      ...(inks.white ? {} : { refusedBecause: inks.noWhite }),
    },
    {
      value: 'plate' as const,
      label: 'On a plate',
      ...(inks.dark ? {} : { refusedBecause: inks.noDark }),
    },
    ...(keptMark ? [{ value: 'own' as const, label: 'Your own' }] : []),
    { value: 'name' as const, label: 'Name in type' },
  ]
  const pickMark = (v: MarkChoice) => {
    const mark: MarkPick =
      v === 'own' && keptMark
        ? keptMark
        : v === 'name'
          ? { from: 'name' }
          : { from: 'maker', ink: inkOf(v === 'ground' ? 'ground' : 'plate') }
    const words: Record<MarkChoice, string> = {
      ground: `${name} wears its maker’s mark in white.`,
      plate: `${name} wears its maker’s own colours on a white plate.`,
      own: `${name} wears Northside’s own mark.`,
      name: `${name} wears its name in type.`,
    }
    apply({ ...dress, mark }, words[v], 'mark')
  }
  const markFile = useRef<HTMLInputElement>(null)
  const [markAddress, setMarkAddress] = useState('')
  const takeOwnMark = (read: FileRead) => {
    if (!read.ok) return setProblem({ at: 'mark', why: read.why })
    setNote(read.note ? { at: 'mark', say: read.note } : null)
    const mark: MarkPick = { from: 'own', image: read.image, ink: inkOf('plate') }
    setLastOwn(mark)
    apply({ ...dress, mark }, `${name} wears Northside’s own mark, on a white plate.`, 'mark')
  }

  /* ---- the photograph ---- */
  const heroNow =
    dress.hero?.from === 'none'
      ? 'none'
      : dress.hero?.from === 'own'
        ? 'own'
        : card.hero.shown && card.hero.from === 'maker'
          ? card.hero.picture.id
          : 'none'
  const pickHero = (hero: HeroPick, said: string) => apply({ ...dress, hero }, said, 'hero')
  const heroFile = useRef<HTMLInputElement>(null)
  const [heroAddress, setHeroAddress] = useState('')
  const takeOwnHero = (read: FileRead) => {
    if (!read.ok) return setProblem({ at: 'hero', why: read.why })
    setNote(read.note ? { at: 'hero', say: read.note } : null)
    pickHero({ from: 'own', image: read.image }, `${name} stands on Northside’s own photograph.`)
  }

  const groundNow = card.ground

  return (
    <div className="pl-pane pl-settings">
      <Selling card={card} />
      {/* ---- its line ---- */}
      <Plate as="section" pad="md" label={`${name}’s line`}>
        <h3 className="pl-set__head">Its line</h3>
        <form
          className="pl-set__line"
          onSubmit={(e) => {
            e.preventDefault()
            if (!lineChanged) return
            const kept = apply(
              { ...dress, line },
              line.trim() === '' ? `${name}’s line is taken off.` : `${name}’s line is set.`,
              'line',
            )
            if (kept) setDraft(null)
          }}
        >
          <Field
            label={`What is ${name} to Northside, in a line?`}
            description={
              dress.line
                ? `It prints under the name at the head of this page. Up to ${LINE_MAX} characters.`
                : `Nothing prints until you write one. Up to ${LINE_MAX} characters.`
            }
            error={problem?.at === 'line' ? problem.why : undefined}
          >
            <Input value={line} onValueChange={setDraft} name="line" autoComplete="off" />
          </Field>
          <span className="pl-set__acts">
            {lineChanged ? (
              <Button intent="primary" type="submit">
                {line.trim() === '' ? 'Take the line off' : 'Keep this line'}
              </Button>
            ) : null}
          </span>
        </form>
      </Plate>

      {/* ---- its mark ---- */}
      <Plate as="section" pad="md" label={`${name}’s mark`}>
        <h3 className="pl-set__head">Its mark</h3>
        <div className="pl-set__marks">
          <Segmented
            label={`Which of its maker’s marks, or its name, ${name} wears`}
            options={markOptions}
            value={markNow}
            onValueChange={pickMark}
          />
        </div>
        <div className="pl-set__give">
          <Button
            intent="secondary"
            size="sm"
            icon={UploadSimpleIcon}
            onClick={() => markFile.current?.click()}
          >
            Upload Northside’s own
          </Button>
          <input
            ref={markFile}
            className="pl-set__file"
            type="file"
            accept="image/*"
            aria-label={`Upload a mark for ${name}`}
            tabIndex={-1}
            onChange={(e) => {
              const f = e.target.files?.[0]
              e.target.value = ''
              if (f) void readMark(f).then(takeOwnMark)
            }}
          />
          <form
            className="pl-set__address"
            onSubmit={(e) => {
              e.preventDefault()
              const read = logoFromAddress(markAddress)
              takeOwnMark(read.ok ? { ok: true, image: read.ref } : read)
              if (read.ok) setMarkAddress('')
            }}
          >
            <Field
              label="Or paste its address"
              error={problem?.at === 'mark' ? problem.why : undefined}
              description={note?.at === 'mark' ? note.say : undefined}
            >
              <Input
                value={markAddress}
                onValueChange={setMarkAddress}
                icon={LinkIcon}
                inputMode="url"
              />
            </Field>
            {markAddress.trim() !== '' ? (
              <Button intent="secondary" size="sm" type="submit">
                Use this address
              </Button>
            ) : null}
          </form>
        </div>
      </Plate>

      {/* ---- its photograph ---- */}
      <Plate as="section" pad="md" label={`${name}’s photograph`}>
        <h3 className="pl-set__head">Its photograph</h3>
        <p className="pl-set__say">
          {own.length > 0
            ? `Only ${name}’s own boats are offered, each named for the model it shows.`
            : `No photograph of ${name} on the water yet. Upload Northside’s own, or paste its address.`}
        </p>
        <ul className="pl-set__heroes">
          {own.map((p) => (
            <li key={p.id} className="pl-set__hero">
              <Tile
                selected={heroNow === p.id}
                tick="foot"
                label={p.subject}
                onSelect={() =>
                  pickHero({ from: 'maker', id: p.id }, `${name} stands on its ${p.subject}.`)
                }
              >
                <span className="pl-set__hero-in">
                  <span className="pl-set__shot">
                    <Picture
                      src={p.src}
                      srcSet={srcSetOf(p)}
                      sizes="200px"
                      alt=""
                      width={p.width}
                      height={p.height}
                    />
                  </span>
                  <span className="pl-set__caption">{p.subject}</span>
                </span>
              </Tile>
            </li>
          ))}
          {dress.hero?.from === 'own' ? (
            <li className="pl-set__hero">
              <Tile selected={heroNow === 'own'} tick="foot" label="Northside’s own photograph">
                <span className="pl-set__hero-in">
                  <span className="pl-set__shot">
                    <Picture
                      src={dress.hero.image.src}
                      alt=""
                      width={dress.hero.image.w ?? 1600}
                      height={dress.hero.image.h ?? 1000}
                    />
                  </span>
                  <span className="pl-set__caption">Northside’s own photograph</span>
                </span>
              </Tile>
            </li>
          ) : null}
          <li className="pl-set__hero">
            <Tile
              selected={heroNow === 'none'}
              tick="foot"
              label="No photograph"
              onSelect={() => pickHero({ from: 'none' }, `${name} stands on its colour alone.`)}
            >
              <span className="pl-set__hero-in">
                <span className="pl-set__bare" data-livery={groundNow.key} aria-hidden="true" />
                <span className="pl-set__caption">Its colour alone</span>
              </span>
            </Tile>
          </li>
        </ul>
        <div className="pl-set__give">
          <Button
            intent="secondary"
            size="sm"
            icon={UploadSimpleIcon}
            onClick={() => heroFile.current?.click()}
          >
            Upload Northside’s own
          </Button>
          <input
            ref={heroFile}
            className="pl-set__file"
            type="file"
            accept="image/*"
            aria-label={`Upload a photograph for ${name}`}
            tabIndex={-1}
            onChange={(e) => {
              const f = e.target.files?.[0]
              e.target.value = ''
              if (f) void readPhotograph(f).then(takeOwnHero)
            }}
          />
          <form
            className="pl-set__address"
            onSubmit={(e) => {
              e.preventDefault()
              const read = logoFromAddress(heroAddress)
              takeOwnHero(read.ok ? { ok: true, image: read.ref } : read)
              if (read.ok) setHeroAddress('')
            }}
          >
            <Field
              label="Or paste its address"
              error={problem?.at === 'hero' ? problem.why : undefined}
              description={note?.at === 'hero' ? note.say : undefined}
            >
              <Input
                value={heroAddress}
                onValueChange={setHeroAddress}
                icon={LinkIcon}
                inputMode="url"
              />
            </Field>
            {heroAddress.trim() !== '' ? (
              <Button intent="secondary" size="sm" type="submit">
                Use this address
              </Button>
            ) : null}
          </form>
        </div>
      </Plate>

      {/* ---- its colour ---- */}
      <Plate as="section" pad="md" label={`${name}’s colour`}>
        <h3 className="pl-set__head">Its colour</h3>
        <ul className="pl-set__grounds">
          {GROUNDS.map((g) => (
            <li key={g.key} className="pl-set__ground">
              <Tile
                shape="chip"
                selected={groundNow.key === g.key}
                onSelect={() =>
                  apply(
                    { ...dress, ground: g.key },
                    `${name} stands on ${g.name.toLowerCase()}.`,
                    'ground',
                  )
                }
              >
                <span className="pl-set__ground-in">
                  <span className="pl-set__swatch" data-livery={g.key} aria-hidden="true" />
                  {g.name}
                </span>
              </Tile>
            </li>
          ))}
        </ul>
        <p className="pl-set__say" data-testid="place-contrast">
          White words on {groundNow.name.toLowerCase()} read at {ratio(groundNow.contrast)}, over
          the {ratio(GROUND_FLOOR)} they need to be read. Every colour offered here clears it.
        </p>
      </Plate>

      {Object.keys(dress).length > 0 ? (
        <span className="pl-set__reset">
          <Button
            intent="quiet"
            icon={ArrowCounterClockwiseIcon}
            onClick={() => apply({}, AS_IT_CAME(name), 'reset')}
          >
            Put {name} back as it came
          </Button>
        </span>
      ) : null}
    </div>
  )
}
