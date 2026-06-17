import { create } from 'zustand';

export type AccountSummary = { email: string; firstName: string; lastName: string; isAdmin: boolean } | null;

type AccountState = {
  account: AccountSummary;
  hydrated: boolean;
  setAccount: (account: AccountSummary) => void;
};

/** Client mirror of the (httpOnly) session, hydrated once on mount via a server action. */
export const useAccount = create<AccountState>((set) => ({
  account: null,
  hydrated: false,
  setAccount: (account) => set({ account, hydrated: true }),
}));
