import { useContext } from "react";
import { LoadingBarContext } from "./LoadingBarContext";

export const useLoadingBar = () => {
  const context = useContext(LoadingBarContext);
  if (!context) {
    throw new Error("useLoadingBar must be used within a LoadingBarProvider");
  }
  return context;
};
