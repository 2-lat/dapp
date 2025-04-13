import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { posts } from "@/server/db/schema";
import { env } from "@/env";

export const tokenRouter = createTRPCRouter({
  price: publicProcedure.query(async ({ ctx }) => {
    const lat = env.NEXT_PUBLIC_2LAT_ADDRESS;
    const [usd, lamports] = await Promise.all(
      ["usd", "lamports"].map((quote) =>
        fetch(
          `https://api.pumplify.fun/data/token/price?ca=${lat}&ccy=${quote}`,
        )
          .then((res) => res.json() as Promise<{ price: number }>)
          .then((res) => res.price),
      ),
    );

    return {
      usd,
      lamports,
    };
  }),
});
