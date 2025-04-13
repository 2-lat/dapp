import { queryTokenState } from "@/queries/tokenState";
import { useQuery } from "@tanstack/react-query";

export const useTokenState = (token: string) =>
  useQuery(
    queryTokenState(token, {
      fetchBonded: true,
      fetchDexScreenPromo: true,
    }),
  );
