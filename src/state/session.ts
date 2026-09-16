import { createStore, type StoreApi } from 'zustand/vanilla'
import type { AccessCtx } from '@/domain/model'
import { prefs as appPrefs, type PrefsStore, type PrefValue } from './prefs'

/* ============================================================
   WHO IS AT THE KEYBOARD.

   READ THIS BEFORE YOU BUILD ON IT. THIS IS NOT AUTHENTICATION. It
   is a name given at the door and remembered in this browser, and
   it provides no security whatsoever: the app is local-first,
   everything runs in the browser, and nothing here keeps anyone out
   of anything. There is no password, because a password that
   protects nothing is fake data (docs/DECISIONS.md, "Sign-in is a
   name until Milestone 6").

   It exists for two honest reasons:
     1. A quote is "prepared by" somebody, and that name belongs on
        the document a customer receives.
     2. `mayDo` asks which job the person holds — a `RoleDef` id —
        and a restricted module answers differently for a
        salesperson and a manager. That is CONFIGURATION, not a
        boundary: it changes what the app OFFERS, and anybody who
        wants past it can edit the browser's storage.

   WHEN REAL AUTH ARRIVES (Milestone 6) the auth client replaces
   this file and NOTHING ELSE CHANGES: every caller reads `name` and
   `roleId` off this store and asks `accessOf` for the `AccessCtx`,
   never a token, never a password. Keep it that way.

   THE NAME IS REMEMBERED THROUGH `prefs`, because prefs is the only
   module allowed to touch the browser's store and a remembered
   sign-in is exactly a per-browser convenience. So `prefs.forgetAll`
   forgets the session too, which is what "forget everything" means.
   ============================================================ */

export interface SessionState {
  /** the name given at the door — what a quote prints as prepared by; null when nobody has */
  name: string | null
  /** the RoleDef this person holds, for `mayDo`; null is nobody in particular */
  roleId: string | null
  /** give a name. Refused with a sentence when the name is blank. */
  signIn(name: string): SignInResult
  signOut(): void
  /** the job assigned to this person, or none */
  setRole(roleId: string | null): void
}

export type SignInResult = { ok: true; name: string } | { ok: false; say: string }

export type SessionStore = StoreApi<SessionState>

/** Who is asking, for `mayDo` and for `CatalogueCtx.access`. */
export const accessOf = (state: Pick<SessionState, 'roleId'>): AccessCtx => ({
  roleId: state.roleId,
})

export const SESSION_PREF = 'session'

/** A remembered session is JSON somebody wrote earlier, so it is
 *  parsed rather than trusted: a non-empty string is a name, a
 *  non-empty string is a role, and anything else is "nobody". */
function remembered(value: PrefValue | undefined): Pick<SessionState, 'name' | 'roleId'> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    return { name: null, roleId: null }
  const name = typeof value.name === 'string' && value.name.trim() !== '' ? value.name.trim() : null
  const roleId =
    typeof value.roleId === 'string' && value.roleId.trim() !== '' ? value.roleId.trim() : null
  return name ? { name, roleId } : { name: null, roleId: null }
}

export function createSessionStore(prefs: PrefsStore): SessionStore {
  const remember = (name: string | null, roleId: string | null): void => {
    if (name) prefs.getState().set(SESSION_PREF, { name, roleId })
    else prefs.getState().remove(SESSION_PREF)
  }

  return createStore<SessionState>()((set, get) => ({
    ...remembered(prefs.getState().get(SESSION_PREF)),
    signIn: (raw) => {
      const name = raw.trim()
      if (name === '') {
        return { ok: false, say: 'A name is needed — it is what the quote prints as prepared by.' }
      }
      set({ name })
      remember(name, get().roleId)
      return { ok: true, name }
    },
    signOut: () => {
      set({ name: null, roleId: null })
      remember(null, null)
    },
    setRole: (roleId) => {
      const clean = roleId && roleId.trim() !== '' ? roleId.trim() : null
      set({ roleId: clean })
      remember(get().name, clean)
    },
  }))
}

/** The app's session, remembered through the app's prefs. */
export const session: SessionStore = createSessionStore(appPrefs)
