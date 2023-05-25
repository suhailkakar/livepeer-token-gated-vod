import type { NextApiRequest, NextApiResponse } from "next";
//@ts-ignore
import * as LitJsSdk from "@lit-protocol/lit-node-client-nodejs";

interface Payload {
  baseUrl: string;
  path: string;
  orgId: string;
  iat: number;
  exp: number;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { accessKey, webhookContext } = req.body;

  const { verified, header, payload } = LitJsSdk.verifyJwt({
    jwt: accessKey,
  }) as { verified: boolean; header: object; payload: Payload };


  if (!verified) {
    res.status(403).json({ message: "Access token is not correct" });
  } else if (
    webhookContext?.resourceId &&
    (webhookContext.resourceId.baseUrl !== payload.baseUrl ||
      webhookContext.resourceId.path !== payload.path ||
      webhookContext.resourceId.orgId !== payload.orgId)
  ) {
    res.status(403).json({ message: "ResourceId does not match" });
  } else {
    res.status(200).json({ message: "Success" });
  }
};

export default handler;
