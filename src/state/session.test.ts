import { describe, expect, it } from 'vitest'
import { createPrefsStore, PREFIX, type StorageLike } from './prefs'
import { accessOf, createSessionStore, SESSION_PREF } from './session'

function fakeStorage(
  seed: Record<string, string> = {},
): StorageLike & { map: Map<string, string> } {
  const map = new Map(Object.entries(seed))
  return {
    map,
    get length() {
      return map.size
    },
    key: (i) => [...map.keys()][i] ?? null,
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => {
      map.set(k, v)
    },
    removeItem: (k) => {
      map.delete(k)
    },
  }
}

describe('session', () => {
  it('starts signed out when nothing is remembered', () => {
    const session = createSessionStore(createPrefsStore(null))
    expect(session.getState().name).toBeNull()
    expect(session.getState().roleId).toBeNull()
    expect(accessOf(session.getState())).toEqual({ roleId: null })
  })

  it('refuses a blank name with a sentence and signs nobody in', () => {
    const session = createSessionStore(createPrefsStore(null))
    const result = session.getState().signIn('   ')
    expect(result).toEqual({
      ok: false,
      say: 'A name is needed — it is what the quote prints as prepared by.',
    })
    expect(session.getState().name).toBeNull()
  })

  it('signs in with the trimmed name and remembers it through prefs', () => {
    const storage = fakeStorage()
    const session = createSessionStore(createPrefsStore(storage))
    expect(session.getState().signIn('  Asaf ')).toEqual({ ok: true, name: 'Asaf' })
    expect(session.getState().name).toBe('Asaf')
    expect(JSON.parse(storage.map.get(`${PREFIX}${SESSION_PREF}`) ?? 'null')).toEqual({
      name: 'Asaf',
      roleId: null,
    })
  })

  it('a new store over the same prefs reads the remembered name and role back', () => {
    const storage = fakeStorage()
    const first = createSessionStore(createPrefsStore(storage))
    first.getState().signIn('Asaf')
    first.getState().setRole('role-sales')

    const second = createSessionStore(createPrefsStore(storage))
    expect(second.getState().name).toBe('Asaf')
    expect(second.getState().roleId).toBe('role-sales')
    expect(accessOf(second.getState())).toEqual({ roleId: 'role-sales' })
  })

  it('setRole takes a RoleDef id or none, and a blank is none', () => {
    const session = createSessionStore(createPrefsStore(null))
    session.getState().signIn('Asaf')
    session.getState().setRole('role-a')
    expect(session.getState().roleId).toBe('role-a')
    session.getState().setRole('  ')
    expect(session.getState().roleId).toBeNull()
    session.getState().setRole(null)
    expect(session.getState().roleId).toBeNull()
  })

  it('signOut forgets the name and the role, in the store and in prefs', () => {
    const storage = fakeStorage()
    const prefs = createPrefsStore(storage)
    const session = createSessionStore(prefs)
    session.getState().signIn('Asaf')
    session.getState().setRole('role-a')
    session.getState().signOut()
    expect(session.getState()).toMatchObject({ name: null, roleId: null })
    expect(prefs.getState().get(SESSION_PREF)).toBeUndefined()
    expect(storage.map.has(`${PREFIX}${SESSION_PREF}`)).toBe(false)
  })

  it('a remembered value that is not a session reads as nobody', () => {
    for (const garbage of ['"a string"', '42', '[]', '{"name":42}', '{"name":"  "}', 'null']) {
      const storage = fakeStorage({ [`${PREFIX}${SESSION_PREF}`]: garbage })
      const { name, roleId } = createSessionStore(createPrefsStore(storage)).getState()
      /* the stored text rides along so a failure names which one */
      expect({ garbage, name, roleId }).toEqual({ garbage, name: null, roleId: null })
    }
  })

  it('a remembered role without a name is nobody — a role is held by someone', () => {
    const storage = fakeStorage({ [`${PREFIX}${SESSION_PREF}`]: '{"roleId":"role-a"}' })
    const session = createSessionStore(createPrefsStore(storage))
    expect(session.getState()).toMatchObject({ name: null, roleId: null })
  })

  it('forgetting all prefs forgets the session too, on the next open', () => {
    const storage = fakeStorage()
    const prefs = createPrefsStore(storage)
    createSessionStore(prefs).getState().signIn('Asaf')
    prefs.getState().forgetAll()
    expect(createSessionStore(createPrefsStore(storage)).getState().name).toBeNull()
  })
})
