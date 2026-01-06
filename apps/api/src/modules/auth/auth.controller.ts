import crypto from "crypto";
import { Request, Response } from "express";
import { UserModel } from "../users/users.model";
import { signToken } from "../../utils/jwt";

const BOT_TOKEN = process.env.BOT_TOKEN!;

const checkTelegramAuth = (data: any) => {
  const secret = crypto
    .createHash("sha256")
    .update(BOT_TOKEN)
    .digest();

  const checkString = Object.keys(data)
    .filter((k) => k !== "hash")
    .sort()
    .map((k) => `${k}=${data[k]}`)
    .join("\n");

  const hmac = crypto
    .createHmac("sha256", secret)
    .update(checkString)
    .digest("hex");

  return hmac === data.hash;
};

export const telegramAuth = async (req: Request, res: Response) => {
  const data = req.body;

  if (!checkTelegramAuth(data)) {
    return res.status(401).json({ error: "Invalid Telegram auth" });
  }

  let user = await UserModel.findOne({ telegram_id: data.id });

  if (!user) {
    user = await UserModel.create({
      telegram_id: data.id,
      username: data.username,
      public_key: "", // добавлю позже
      encrypted_private_key: "",
    });
  }

  const token = signToken({
    id: user._id,
    telegram_id: user.telegram_id,
  });

  res.json({ token });
};