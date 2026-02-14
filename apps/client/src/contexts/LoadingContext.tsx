import React, { createContext, useContext, useState } from "react";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

const LoadingContext = createContext<{
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

export const useLoading = (): NonNullable<
  React.ContextType<typeof LoadingContext>
> => {
  try {
    const context = useContext(LoadingContext);
    if (!context) {
      throw new Error("useLoading must be used within a LoadingProvider");
    }
    return context;
  } catch {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
};

export const LoadingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [loading, setLoading] = useState(false);

  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      {children}
      <Backdrop
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress size={100} />
      </Backdrop>
    </LoadingContext.Provider>
  );
};
