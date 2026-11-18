import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getSetting, setSetting } from "./repo";

const KEY = "onboarded";
type Ctx = { ready: boolean; done: boolean; complete: () => Promise<void> };
const C = createContext<Ctx>({ ready: true, done: true, complete: async () => {} });

/** Remembers on this phone whether the first-run intro has been seen. */
export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let live = true;
    getSetting(KEY)
      .then((v) => { if (live) setDone(v === "1"); })
      .catch(() => { if (live) setDone(true); }) // never trap the user in the intro if storage fails
      .finally(() => { if (live) setReady(true); });
    return () => { live = false; };
  }, []);

  const value = useMemo<Ctx>(() => ({
    ready, done,
    complete: async () => {
      setDone(true);
      try { await setSetting(KEY, "1"); } catch { /* shown again next launch at worst */ }
    },
  }), [ready, done]);
  return <C.Provider value={value}>{children}</C.Provider>;
}
export const useOnboarding = () => useContext(C);
