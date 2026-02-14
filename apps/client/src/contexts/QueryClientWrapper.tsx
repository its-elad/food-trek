import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useState } from "react";
import { useLoading } from "./LoadingContext";

export const QueryClientWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { setLoading } = useLoading();

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: Infinity,
          },
        },
        mutationCache: new MutationCache({
          onMutate: (_vars, mutation) => {
            !mutation.meta?.disableLoadingDefault && setLoading(true);
          },
          onSettled: (_data, _error, _vars, _mutationRes, mutation) => {
            !mutation.meta?.disableLoadingDefault && setLoading(false);
          },
        }),
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
