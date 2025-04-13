import { fetchBonded, fetchDexScreenPromo, fetchMarketCap, fetchPrice } from "@/lib/token";
import { queryOptions } from "@tanstack/react-query";

export const queryTokenState = (token: string, options?: {
    fetchBonded?: boolean,
    fetchDexScreenPromo?: boolean,
}) => queryOptions({
    queryKey: ["token", token, "state", options],
    queryFn: () => Promise.all([
        fetchPrice(token, "lamports"),
        fetchPrice(token, "usd"),
        fetchMarketCap(token, "usd"),
        options?.fetchBonded ? fetchBonded(token) : Promise.resolve(undefined),
        options?.fetchDexScreenPromo ? fetchDexScreenPromo(token) : Promise.resolve(undefined),
    ]).then(([priceLamports, priceUsd, marketCap, bonded, dexScreenPromo]) => ({
        priceLamports,
        priceUsd,
        marketCap,
        bonded,
        dexScreenPromo,
    })),
})