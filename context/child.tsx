import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/context/auth';
import { useChildren, ChildWithDetails } from '@/hooks/useChildren';
import { getBracket, formatAge, AgeBracket } from '@/constants/bracketConfig';
import { dbg } from '@/lib/debug';
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

  // Auto-select first child when loaded
  useEffect(() => {
    if (children.length > 0 && !selectedId) {
      dbg.hook('ChildProvider: auto-selecting first child', { id: children[0].id, name: children[0].name });
      setSelectedId(children[0].id);
    }
  }, [children, selectedId]);

  const child = children.find(c => c.id === selectedId) ?? children[0] ?? null;
  const bracket = child ? getBracket(new Date(child.dob)) : null;
  const age = child ? formatAge(new Date(child.dob)) : '';

  // Get parent name
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
  }, [user]);

  function selectChild(childId: string) {
    dbg.hook('ChildProvider: selecting child', { childId });
    setSelectedId(childId);
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
