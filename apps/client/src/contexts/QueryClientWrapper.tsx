import {
  QueryClient,
  QueryClientProvider,
  useIsMutating,
} from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useLoading } from "./LoadingContext";

const LoadingSyncComponent = ({ children }: { children: React.ReactNode }) => {
  const { setLoading } = useLoading();
  const isMutating = useIsMutating({
    predicate: (mutation) => !mutation.meta?.disableLoadingDefault,
  });

  useEffect(() => {
    setLoading(isMutating > 0);
  }, [isMutating, setLoading]);

  return children;
};

export const QueryClientWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: Infinity,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <LoadingSyncComponent>{children}</LoadingSyncComponent>
    </QueryClientProvider>
  );
};
