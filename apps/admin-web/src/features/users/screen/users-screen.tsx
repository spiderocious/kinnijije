import { useEffect, useState } from 'react';
import { Repeat, Show } from 'meemaw';

import { AppEmptyState, AppInput } from '@kinnijije/ui';
import { IconSearch } from '@icons';

import { useCursorList } from '@shared/hooks/use-cursor-list.ts';
import { useDebouncedValue } from '@shared/hooks/use-debounced-value.ts';
import { PageHeader } from '@shared/ui/admin-shell.tsx';
import { CursorPager } from '@shared/ui/cursor-pager.tsx';
import { QueryState } from '@shared/ui/query-state.tsx';

import { useUsers } from '../api/use-users.ts';
import { UserRow } from './parts/user-row.tsx';

// Users list — search by name/email, cursor-paginated.
export function UsersScreen() {
  const [search, setSearch] = useState('');
  const q = useDebouncedValue(search.trim(), 300);
  const pager = useCursorList();

  // Reset paging when the search term changes.
  useEffect(() => {
    pager.reset();
  }, [q, pager]);

  const users = useUsers({ q: q.length > 0 ? q : undefined, cursor: pager.cursor });

  return (
    <>
      <PageHeader title="Users" subtitle="Everyone with an account" />

      <div className="mb-5 max-w-sm">
        <AppInput
          aria-label="Search users"
          placeholder="Search by name or email"
          value={search}
          leading={<IconSearch size={16} aria-hidden="true" />}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <QueryState query={users}>
        {(page) => (
          <Show
            when={page.items.length > 0}
            fallback={
              <AppEmptyState
                glyph="👤"
                title={q.length > 0 ? 'No users match' : 'No users yet'}
                description={
                  q.length > 0 ? 'Try a different search term.' : 'Users appear here once they sign up.'
                }
              />
            }
          >
            <div className="flex flex-col gap-3">
              <Repeat each={page.items}>{(user) => <UserRow key={user.id} user={user} />}</Repeat>
            </div>
            <CursorPager
              hasMore={page.hasMore}
              canGoBack={pager.canGoBack}
              onNext={() => pager.next(page.nextCursor)}
              onBack={pager.back}
              busy={users.isFetching}
            />
          </Show>
        )}
      </QueryState>
    </>
  );
}
