// src/i18n/react.tsx
import React, {createContext, useContext, useMemo} from 'react'
import { DICTS, type Dict, type Locale } from './dicts'

type I18nCtx = {
  locale: Locale
  dict: Dict
  t: (key: string) => string
}

const Ctx = createContext<I18nCtx | null>(null)

function makeT(dict: Dict) {
  return (key: string) => {
    const parts = key.split('.')
    let cur: any = dict
    for (const p of parts) {
      if (cur == null) return key
      cur = cur[p]
    }
    return typeof cur === 'string' ? cur : key
  }
}

export function I18nProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const dict = DICTS[locale]
  const t = useMemo(() => makeT(dict), [dict])
  const value = useMemo(() => ({ locale, dict, t }), [locale, dict, t])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useT() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useT() debe usarse dentro de <I18nProvider>')
  return ctx
}
