import "../styles/globals.css";
import type { AppProps } from "next/app";
import "@rainbow-me/rainbowkit/styles.css";
import {
  darkTheme,
  getDefaultWallets,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { mainnet } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { Toaster } from "react-hot-toast";
import {
  createReactClient,
  LivepeerConfig,
  studioProvider,
} from "@livepeer/react";
import "lit-share-modal-v3/dist/ShareModal.css";
import { LitProvider } from "../hooks/useLit";

export default function App({ Component, pageProps }: AppProps) {
  const { chains, provider } = configureChains([mainnet], [publicProvider()]);

  const { connectors } = getDefaultWallets({
    appName: "Livepeer VOD Tokengated app",
    chains,
    projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID as string,
  });

  const wagmiClient = createClient({
    autoConnect: true,
    connectors,
    provider,
  });

  const key = process.env.NEXT_PUBLIC_LIVEPEER_STUDIO_KEY as string;

  const client = createReactClient({
    provider: studioProvider({
      apiKey: key,
    }),
  });
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider
        modalSize="compact"
        chains={chains}
        theme={darkTheme({
          accentColor: "#00FFB2",
          accentColorForeground: "#0f0f0f",
        })}
      >
        <LitProvider>
          <LivepeerConfig client={client}>
            <Component {...pageProps} />
          </LivepeerConfig>
        </LitProvider>

        <Toaster />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
