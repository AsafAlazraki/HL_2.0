/* ============================================================
   Domain model — the single source of truth for all features.
   Do not fork these shapes locally; import from '@/domain/model'.

   The contract is split by concern; this barrel re-exports every
   name so every old `@/types/model` import resolves here unchanged.
   ============================================================ */

export * from './fields'
export * from './images'
export * from './tables'
export * from './rows'
export * from './rules'
export * from './views'
export * from './modules'
export * from './pricing'
export * from './people'
export * from './quote'
export * from './offer'
export * from './project'
export * from './pack'
export * from './ctx'
