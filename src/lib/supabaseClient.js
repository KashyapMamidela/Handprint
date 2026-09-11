import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Copy .env.example to .env.local and fill in your Supabase project values.'
  );
}

// Give this browser tab its own auth identity so a volunteer session in one
// tab and an admin session in another can coexist (useful for demos).
// Two things are needed, not just one:
//  1. `storage: sessionStorage` -- isolated per tab, unlike the default
//     localStorage which every tab of the same origin shares.
//  2. A per-tab `storageKey` -- supabase-js also syncs auth state across
//     tabs via a BroadcastChannel named after the storage key, independent
//     of which Storage object you configured (see
//     @supabase/auth-js GoTrueClient.js, `_initialize`). Without a unique
//     key, logging in on one tab still broadcasts and overwrites every
//     other tab's in-memory session. The id is cached in this tab's own
//     sessionStorage so it survives a refresh but not closing the tab.
function getTabStorageKey() {
  const TAB_ID_KEY = 'handprint-tab-id';
  let tabId = sessionStorage.getItem(TAB_ID_KEY);
  if (!tabId) {
    tabId = crypto.randomUUID();
    sessionStorage.setItem(TAB_ID_KEY, tabId);
  }
  return `sb-handprint-auth-${tabId}`;
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: window.sessionStorage,
    storageKey: getTabStorageKey(),
  },
});
