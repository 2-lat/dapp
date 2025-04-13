export const fetchPrice = (token: string, nomination: "usd" | "lamports" | "sol") =>
  fetch(`https://api.pumplify.fun/data/token/price?ca=${token}&ccy=${nomination}`)
    .then((res) => res.json() as Promise<{ price: number }>)
    .then((res) => res.price);

export const fetchMarketCap = (
  token: string,
  nomination: "usd" | "lamports" | "sol",
) =>
  fetch(
    `https://api.pumplify.fun/data/token/market-cap?ca=${token}&ccy=${nomination}`,
  )
    .then((res) => res.json() as Promise<{ price: number }>)
    .then((res) => res.price);

export const fetchBonded = (token: string) =>
  fetch(`https://api.pumplify.fun/data/token/bonded?ca=${token}`)
    .then((res) => res.json() as Promise<{ bonded: boolean }>)
    .then((res) => res.bonded);

export const fetchDexScreenPromo = (token: string) =>
  fetch(`https://api.pumplify.fun/data/token/dex-screen-promo?ca=${token}`)
    .then((res) => res.json() as Promise<{ paid: boolean }>)
    .then((res) => res.paid);
