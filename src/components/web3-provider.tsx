"use client";

import { WagmiProvider } from "wagmi";
import { base } from "wagmi/chains";
import { env } from "@/env";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";

const config = getDefaultConfig({
  // Your dApps chains
  chains: [base],
  // Required API Keys
  ssr: true,

  projectId: env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,

  // Required App Info
  appName: "Second Latitude",

  // Optional App Info
  appDescription: "Second Latitude",
  appUrl: "https://2.lat", // your app's url
  appIcon: "https://2.lat/icon.png", // your app's icon, no bigger than 1024x1024px (max. 1MB)
});


export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <RainbowKitProvider>{children}</RainbowKitProvider>
    </WagmiProvider>
  );
};
