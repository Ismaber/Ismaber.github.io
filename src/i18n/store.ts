import { DICTS, type Locale } from './dicts'

/**
 * Traduce una clave en base al idioma actual de Astro.
 * - Si la clave apunta a un string → devuelve string
 * - Si la clave apunta a un objeto o array → devuelve ese valor (útil para listas)
 * - Si no existe → devuelve la clave literal
 *
 * Uso:  t(Astro.currentLocale, 'ui.download')
 *       t(Astro.currentLocale, 'experience.items')  // devuelve un array si existe
 */
export function t(locale: string | undefined, key: string): any {
  const l = (locale ?? 'es') as Locale
  const dict = DICTS[l]

  const parts = key.split('.')
  let cur: any = dict

  for (const p of parts) {
    if (cur == null) return key
    cur = cur[p]
  }

  // Si es string, devolvemos el texto
  if (typeof cur === 'string') return cur

  // Si es objeto o array, lo devolvemos tal cual
  if (typeof cur === 'object' && cur !== null) return cur

  // Si no existe, devolvemos la clave original
  return key
}

/**
 * Cambia el idioma del documento (útil para accesibilidad y SSR)
 */
export function setLocale(l: Locale) {
  document.documentElement.lang = l
}
