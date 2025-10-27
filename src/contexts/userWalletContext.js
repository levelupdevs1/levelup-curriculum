import { createContext } from "react";

export const userWalletContext = createContext({
  isLoading: false,
  walletData: null,
  accountId: null,
  signer: null,
  userProfile: null,
  balance: null,
  connectWallet: () => {},
  disconnectWallet: () => {},
});
