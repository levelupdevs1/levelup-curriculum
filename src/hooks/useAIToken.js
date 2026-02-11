import { useContext } from "react";
import { AITokenContext } from "../contexts/createAITokenContext";

export const useAIToken = () => {
  const context = useContext(AITokenContext);
  if (!context) {
    throw new Error("useAIToken must be used within AITokenProvider");
  }
  return context;
};
