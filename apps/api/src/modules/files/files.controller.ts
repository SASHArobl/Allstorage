import { Request, Response } from "express";
import { Types } from "mongoose";
import { FileModel } from "./files.model";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { encryptAES, encryptRSA } from "pkg-crypto";
import { UserModel } from "../users/users.model";
import forge from "node-forge";

export const createFolder = async (req: AuthRequest, res: Response) => {
  try {
    const { name, parent_id } = req.body;

    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    if (!name) {
      return res.status(400).json({ error: "Folder name is required" });
    }

    const owner_id = req.user!.id;

    const path = parent_id ? `${parent_id}/${name}` : `/${name}`;

    const folder = await FileModel.create({
      owner_id,
      name,
      type: "folder",
      parent_id: parent_id || null,
      path,
      encrypted: false,
    });

    res.status(201).json(folder);
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Folder already exists" });
    }
    res.status(500).json({ error: err.message });
  }
};

export const getFiles = async (req: AuthRequest, res: Response) => {
  try {
    const { parent_id } = req.query;

    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const owner_id = req.user!.id;

    const files = await FileModel.find({
      owner_id,
      parent_id: parent_id || null,
    }).sort({ type: 1, name: 1 });

    res.json(files);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createFile = async (req: AuthRequest, res: Response) => {
  try {
    const { name, parent_id, telegram_file_id, size, mime } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!name || !telegram_file_id) {
      return res.status(400).json({ error: "name and telegram_file_id are required" });
    }

    const owner_id = req.user!.id;
    const path = parent_id ? `${parent_id}/${name}` : `/${name}`;

    const file = await FileModel.create({
      owner_id,
      name,
      type: "file",
      parent_id: parent_id || null,
      path,
      telegram_file_id,
      size,
      mime,
      encrypted: false,
    });

    res.status(201).json(file);
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "File already exists" });
    }
    res.status(500).json({ error: err.message });
  }
};

export const getFile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const owner_id = req.user!.id as string;
    const idParam = req.params.id as string;

    if (!Types.ObjectId.isValid(owner_id) || !Types.ObjectId.isValid(idParam)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const file = await FileModel.findOne({
      _id: new Types.ObjectId(idParam),
      owner_id: new Types.ObjectId(owner_id),
    });
    if (!file) {
      return res.status(404).json({ error: "Not found" });
    }

    res.json(file);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const encryptFile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const owner_id = req.user!.id as string;
    const idParam = req.params.id as string;
    const { data_base64 } = req.body;

    if (!Types.ObjectId.isValid(owner_id) || !Types.ObjectId.isValid(idParam)) {
      return res.status(400).json({ error: "Invalid id" });
    }
    if (!data_base64) {
      return res.status(400).json({ error: "data_base64 is required" });
    }

    const user = await UserModel.findById(owner_id);
    if (!user || !user.public_key || !user.encrypted_private_key) {
      return res.status(400).json({ error: "User keys are missing" });
    }
    try {
      forge.pki.publicKeyFromPem(user.public_key);
    } catch {
      return res.status(400).json({ error: "Invalid user public_key PEM" });
    }

    const file = await FileModel.findOne({
      _id: new Types.ObjectId(idParam),
      owner_id: new Types.ObjectId(owner_id),
      type: "file",
    });
    if (!file) {
      return res.status(404).json({ error: "Not found" });
    }
    if (file.encrypted) {
      return res.status(409).json({ error: "Already encrypted" });
    }

    const plaintext = Buffer.from(data_base64, "base64");
    const { encrypted, key, iv } = encryptAES(plaintext);
    const file_key_encrypted = encryptRSA(user.public_key, Buffer.from(key, "base64"));

    file.encrypted = true;
    file.iv = iv;
    file.data = encrypted;
    file.file_key_encrypted = file_key_encrypted;

    await file.save();
    res.json({ id: file._id, encrypted: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getEncryptedContents = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const owner_id = req.user!.id as string;
    const idParam = req.params.id as string;

    if (!Types.ObjectId.isValid(owner_id) || !Types.ObjectId.isValid(idParam)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const file = await FileModel.findOne({
      _id: new Types.ObjectId(idParam),
      owner_id: new Types.ObjectId(owner_id),
      type: "file",
    });
    if (!file) {
      return res.status(404).json({ error: "Not found" });
    }
    if (!file.encrypted || !file.data || !file.iv || !file.file_key_encrypted) {
      return res.status(400).json({ error: "File is not encrypted or missing data" });
    }

    res.json({
      data_base64: file.data,
      iv_base64: file.iv,
      file_key_encrypted_base64: file.file_key_encrypted,
      mime: file.mime,
      size: file.size,
      name: file.name,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
