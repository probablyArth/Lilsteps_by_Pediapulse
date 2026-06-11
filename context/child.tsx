import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/context/auth';
import { useChildren, ChildWithDetails } from '@/hooks/useChildren';
import { getBracket, formatAge, AgeBracket } from '@/constants/bracketConfig';
import { dbg } from '@/lib/debug';
import { appStorage, StorageKeys } from '@/lib/storage';
import { supabase } from '@/lib/supabase';

interface ChildContextState {
  /** Currently selected child */
  child: ChildWithDetails | null;
  /** All children for this parent */
  children: ChildWithDetails[];
  /** Computed age bracket from DOB */
  bracket: AgeBracket | null;
  /** Formatted age string e.g. "2y 3m" */
  age: string;
  /** Parent name from DB */
  parentName: string;
  /** Loading state */
  loading: boolean;
  /** Switch to a different child */
  selectChild: (childId: string) => void;
  /** Refetch children from DB */
  refetch: () => Promise<void>;
}

const ChildContext = createContext<ChildContextState | null>(null);

export function ChildProvider({ children: providerChildren }: { children: ReactNode }) {
  const { user } = useAuth();
  const { children, loading, refetch } = useChildren();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Auto-select when loaded: prefer the persisted choice, else first child
  useEffect(() => {
    if (children.length === 0 || selectedId) return;
    let cancelled = false;
    (async () => {
      const saved = await appStorage.getItem(StorageKeys.activeChildId);
      if (cancelled) return;
      const match = saved ? children.find(c => c.id === saved) : undefined;
      const pick = match ?? children[0];
      dbg.hook('ChildProvider: auto-selecting child', { id: pick.id, name: pick.name, restored: !!match });
      // Don't clobber a selection the user made while storage was loading
      setSelectedId(prev => prev ?? pick.id);
    })();
    return () => { cancelled = true; };
  }, [children, selectedId]);

  const child = children.find(c => c.id === selectedId) ?? children[0] ?? null;
  const bracket = child ? getBracket(new Date(child.dob)) : null;
  const age = child ? formatAge(new Date(child.dob)) : '';

  // Get parent name. Re-runs when the children list refreshes too — onboarding
  // saves the parent's name right before refetching children, so this is what
  // keeps the home greeting fresh without an app restart.
  const [parentName, setParentName] = useState('');
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('parents')
        .select('name')
        .eq('id', user.id)
        .single();
      if (data?.name) {
        dbg.hook('ChildProvider: parent name loaded', { name: data.name });
        setParentName(data.name);
      }
    })();
  }, [user, children]);

  function selectChild(childId: string) {
    dbg.hook('ChildProvider: selecting child', { childId });
    setSelectedId(childId);
    appStorage.setItem(StorageKeys.activeChildId, childId); // fire-and-forget
  }

  return (
    <ChildContext.Provider
      value={{
        child,
        children,
        bracket,
        age,
        parentName,
        loading,
        selectChild,
        refetch,
      }}
    >
      {providerChildren}
    </ChildContext.Provider>
  );
}

export function useChild() {
  const ctx = useContext(ChildContext);
  if (!ctx) throw new Error('useChild must be used within ChildProvider');
  return ctx;
}
