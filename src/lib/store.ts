import { useSyncExternalStore } from "react";

export type ChecklistItem = { id: string; label: string; done: boolean };
export type Person = { id: string; name: string; items: ChecklistItem[] };

type State = { people: Person[] };

const KEY = "xp-tracker-v1";
const PASS_KEY = "xp-tracker-pass";
const UNLOCK_KEY = "xp-tracker-unlocked";

const listeners = new Set<() => void>();
let state: State = load();

function load(): State {
  if (typeof window === "undefined") return { people: [] };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { people: [] };
}

function save() {
  localStorage.setItem(KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export const store = {
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  get() {
    return state;
  },
  addPerson(name: string) {
    state = { people: [...state.people, { id: uid(), name, items: [] }] };
    save();
  },
  removePerson(id: string) {
    state = { people: state.people.filter((p) => p.id !== id) };
    save();
  },
  renamePerson(id: string, name: string) {
    state = {
      people: state.people.map((p) => (p.id === id ? { ...p, name } : p)),
    };
    save();
  },
  addItem(personId: string, label: string) {
    state = {
      people: state.people.map((p) =>
        p.id === personId
          ? { ...p, items: [...p.items, { id: uid(), label, done: false }] }
          : p,
      ),
    };
    save();
  },
  toggleItem(personId: string, itemId: string) {
    state = {
      people: state.people.map((p) =>
        p.id === personId
          ? {
              ...p,
              items: p.items.map((i) =>
                i.id === itemId ? { ...i, done: !i.done } : i,
              ),
            }
          : p,
      ),
    };
    save();
  },
  removeItem(personId: string, itemId: string) {
    state = {
      people: state.people.map((p) =>
        p.id === personId
          ? { ...p, items: p.items.filter((i) => i.id !== itemId) }
          : p,
      ),
    };
    save();
  },
  renameItem(personId: string, itemId: string, label: string) {
    state = {
      people: state.people.map((p) =>
        p.id === personId
          ? {
              ...p,
              items: p.items.map((i) =>
                i.id === itemId ? { ...i, label } : i,
              ),
            }
          : p,
      ),
    };
    save();
  },
};

export function useStore() {
  return useSyncExternalStore(
    store.subscribe,
    () => state,
    () => ({ people: [] }),
  );
}

// Auth (passcode)
export const auth = {
  hasPasscode() {
    return !!localStorage.getItem(PASS_KEY);
  },
  setPasscode(p: string) {
    localStorage.setItem(PASS_KEY, p);
    localStorage.setItem(UNLOCK_KEY, "1");
    notifyAuth();
  },
  unlock(p: string) {
    if (localStorage.getItem(PASS_KEY) === p) {
      localStorage.setItem(UNLOCK_KEY, "1");
      notifyAuth();
      return true;
    }
    return false;
  },
  lock() {
    localStorage.removeItem(UNLOCK_KEY);
    notifyAuth();
  },
  isUnlocked() {
    return localStorage.getItem(UNLOCK_KEY) === "1";
  },
};

const authListeners = new Set<() => void>();
function notifyAuth() {
  authListeners.forEach((l) => l());
}
export function useAuth() {
  return useSyncExternalStore(
    (l) => {
      authListeners.add(l);
      return () => authListeners.delete(l);
    },
    () => (typeof window !== "undefined" && auth.isUnlocked() ? 1 : 0),
    () => 0,
  );
}
