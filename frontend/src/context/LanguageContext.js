import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { strings } from '../i18n';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');
  const t = useCallback(
    (key, vars = {}) => {
      const template = strings[lang][key] ?? strings.en[key] ?? key;
      return template.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? String(vars[k]) : `{${k}}`));
    },
    [lang]
  );
  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLang = () => useContext(LanguageContext);
