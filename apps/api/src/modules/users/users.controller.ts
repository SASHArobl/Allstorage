import { Request, Response } from "express";
import forge from "node-forge";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { UserModel } from "./users.model";

export const setUserKeys = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { public_key, encrypted_private_key } = req.body as {
      public_key?: string;
      encrypted_private_key?: string;
    };

    if (!public_key || !encrypted_private_key) {
      return res.status(400).json({ error: "public_key and encrypted_private_key are required" });
    }

    try {
      forge.pki.publicKeyFromPem(public_key);
    } catch {
      return res.status(400).json({ error: "Invalid public_key PEM" });
    }

    const userId = req.user.id;
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.public_key = public_key;
    user.encrypted_private_key = encrypted_private_key;
    await user.save();

    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
