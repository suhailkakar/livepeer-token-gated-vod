import React, { useEffect, useMemo, useRef, useState } from "react";
import Button from "../shared/Button";
import Input from "../shared/Input";
import Steps from "../Steps";
import useLit from "../../hooks/useLit";
import { nanoid } from "nanoid";
import { toast } from "react-hot-toast";
import { LivepeerProvider, useAsset, useCreateAsset } from "@livepeer/react";
import Link from "next/link";
import { useAccount } from "wagmi";
import Image from "next/image";

//@ts-ignore
import LitJsSdk from "lit-js-sdk";
//@ts-ignore
import LitShareModal from "lit-share-modal-v3";

type LitGateParams = {
  unifiedAccessControlConditions: any[] | null;
  permanent: boolean;
  chains: string[];
  authSigTypes: string[];
};

const resourceId = {
  baseUrl: "token-gated-vod.withlivepeer.com",
  path: `/asset/${nanoid()}`,
  orgId: "some-app",
  role: "",
  extraData: `createdAt=${Date.now()}`,
};

export default function Hero() {
  // Inputs
  const [file, setFile] = useState<File | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lit
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [savedSigningConditionsId, setSavedSigningConditionsId] =
    useState<string>();
  const [authSig, setAuthSig] = useState<Record<string, object>>({});
  const { litNodeClient, litConnected } = useLit();

  const [litGateParams, setLitGateParams] = useState<LitGateParams>({
    unifiedAccessControlConditions: null,
    permanent: false,
    chains: [],
    authSigTypes: [],
  });

  // Misc
  const { address: publicKey } = useAccount();

  // Step 1: pre-sign the auth message
  useEffect(() => {
    if (publicKey) {
      Promise.resolve().then(async () => {
        try {
          setAuthSig({
            ethereum: await LitJsSdk.checkAndSignAuthMessage({
              chain: "ethereum",
              switchChain: false,
            }),
          });
        } catch (err: any) {
          alert(`Error signing auth message: ${err?.message || err}`);
        }
      });
    }
  }, [publicKey]);

  // Step 2: Creating an asset
  const {
    mutate: createAsset,
    data: createdAsset,
    status: createStatus,
    progress,
  } = useCreateAsset(
    file
      ? {
          sources: [
            {
              file: file,
              name: file.name,
              playbackPolicy: {
                type: "webhook",
                webhookId: "3e02c844-d364-4d48-b401-24b2773b5d6b",
                webhookContext: {
                  accessControl: litGateParams.unifiedAccessControlConditions,
                  resourceId: resourceId,
                },
              },
            },
          ] as const,
        }
      : null
  );

  // Step 3: Getting asset and refreshing for the status
  const {
    data: asset,
    error,
    status: assetStatus,
  } = useAsset({
    assetId: createdAsset?.[0].id,
    refetchInterval: (asset) =>
      asset?.storage?.status?.phase !== "ready" ? 5000 : false,
  });

  const progressFormatted = useMemo(
    () =>
      progress?.[0].phase === "failed" || createStatus === "error"
        ? "Failed to upload video."
        : progress?.[0].phase === "waiting"
        ? "Waiting"
        : progress?.[0].phase === "uploading"
        ? `Uploading: ${Math.round(progress?.[0]?.progress * 100)}%`
        : progress?.[0].phase === "processing"
        ? `Processing: ${Math.round(progress?.[0].progress * 100)}%`
        : null,
    [progress, createStatus]
  );

  const isLoading = useMemo(
    () =>
      createStatus === "loading" ||
      assetStatus === "loading" ||
      (asset && asset?.status?.phase !== "ready") ||
      (asset?.storage && asset?.storage?.status?.phase !== "ready"),
    [asset, assetStatus, createStatus]
  );

  const handleClick = async () => {
    if (!publicKey) {
      toast("Please connect your wallet to continue", {
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });
      return;
    }

    if (!file) {
      toast("Please choose a file", {
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });
      return;
    }
    if (!litGateParams.unifiedAccessControlConditions) {
      toast("Please choose the access control conditions", {
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });
      return;
    }
    createAsset?.();
  };

  // Step 4: After an asset is created, save the signing condition
  useEffect(() => {
    if (
      createStatus === "success" &&
      asset?.id &&
      asset?.id !== savedSigningConditionsId
    ) {
      setSavedSigningConditionsId(asset?.id);
      // @ts-ignore
      const ACConditions = asset?.playbackPolicy.webhookContext.accessControl;
      Promise.resolve().then(async () => {
        try {
          await litNodeClient.saveSigningCondition({
            unifiedAccessControlConditions: ACConditions,
            authSig,
            resourceId: resourceId,
          });
        } catch (err: any) {
          alert(`Error saving signing condition: ${err?.message || err}`);
        }
      });
    }
  }, [litNodeClient, createStatus, savedSigningConditionsId, authSig, asset]);

  return (
    <section className="p-10 h-screen flex flex-col lg:flex-row-reverse">
      <div className="w-full h-1/2 lg:h-full lg:w-1/2 ">
        <div className="relative">
          <img
            src="https://solana-nft.withlivepeer.com/_next/image?url=%2Fhero.png&w=2048&q=75"
            alt="BannerImage"
            className=" h-[90vh] w-full lg:object-cover lg:block hidden rounded-xl"
          />
        </div>
      </div>
      <div className="lg:w-1/2  w-full h-full lg:mr-20">
        <p className="text-base font-light text-primary lg:mt-20 mt-5">
          Livepeer x Ethereum x Lit
        </p>
        <h1 className="text-5xl font-bold font-MontHeavy text-gray-100 mt-6 leading-tight">
          Token gate your videos on Ethereum with Livepeer.
        </h1>
        <p className="text-base font-light text-zinc-500 mt-2">
          Token gating is a powerful tool for content creators who want to
          monetize their video content. With Livepeer, you can easily create a
          gated video that requires users to hold a certain amount of tokens/NFT
          in order to access the content. <br /> <br /> Livepeer&apos;s token
          gating feature is easy to use and highly customizable
        </p>
        <div className="flex flex-col mt-6">
          <div className="h-4" />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-dashed border-zinc-800 border rounded-md text-zinc-700  p-4 flex items-center justify-center hover:border-zinc-700 "
          >
            <p className="">
              {file ? (
                file.name +
                " - " +
                Number(file.size / 1024 / 1024).toFixed() +
                " MB"
              ) : (
                <>Choose a video file to upload</>
              )}
            </p>
          </div>
          <div className="h-5" />
          <div onClick={() => setShowShareModal(true)}>
            <Input
              disabled
              readOnly
              value={
                !litGateParams.unifiedAccessControlConditions
                  ? ""
                  : JSON.stringify(
                      litGateParams.unifiedAccessControlConditions,
                      null,
                      2
                    )
              }
              placeholder={"Choose the access control conditions"}
            />
          </div>

          <input
            onChange={(e) => {
              if (e.target.files) {
                setFile(e.target.files[0]);
              }
            }}
            type="file"
            accept="video/*"
            ref={fileInputRef}
            hidden
          />
        </div>
        <div className="flex flex-row items-center mb-20 lg:mb-0">
          <Button onClick={handleClick}>
            {isLoading ? progressFormatted || "Uploading..." : "Upload"}
          </Button>
          {asset?.status?.phase === "ready" && (
            <div>
              <div className="flex flex-col justify-center items-center ml-5 font-matter">
                <p className="mt-6 text-white">
                  Your token-gated video is uploaded, and you can view it{" "}
                  <Link
                    className="text-primary"
                    target={"_blank"}
                    rel={"noreferrer"}
                    href={`/watch/${asset?.playbackId}`}
                  >
                    here
                  </Link>
                </p>
              </div>
            </div>
          )}
        </div>
        <Steps
          publickey={publicKey}
          litGateParams={JSON.stringify(
            litGateParams.unifiedAccessControlConditions
          )}
          completed={false}
        />

        {showShareModal && (
          <div className="fixed top-0 left-0 w-full h-full z-50 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="w-1/3 h-[95%] mt-10">
              <LitShareModal
                onClose={() => {
                  setShowShareModal(false);
                }}
                chainsAllowed={["ethereum"]}
                injectInitialState={true}
                defaultChain={"ethereum"}
                initialUnifiedAccessControlConditions={
                  litGateParams?.unifiedAccessControlConditions
                }
                onUnifiedAccessControlConditionsSelected={(
                  val: LitGateParams
                ) => {
                  setLitGateParams(val);
                  setShowShareModal(false);
                }}
                darkMode={true}
                injectCSS={false}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
