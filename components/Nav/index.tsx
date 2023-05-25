import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Navbar() {
  return (
    <div className="absolute top-0 left-0  ml-10 mt-10 flex items-center ">
      <ConnectButton />
    </div>
  );
}
