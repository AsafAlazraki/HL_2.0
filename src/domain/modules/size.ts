/** A file's size as a person reads it: "820 bytes", "96 KB", "3.4 MB", "32 MB". Its own module,
 *  importing nothing, so the picture rules that say it (`../model/ownPictures.ts`) stay readable
 *  by the tools as well as by the app; the logo rule re-exports it (`./logo.ts`). */
export function sizeSay(bytes: number): string {
  if (bytes < 1024) return `${Math.max(0, Math.round(bytes))} bytes`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  const mb = bytes / (1024 * 1024)
  return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`
}
