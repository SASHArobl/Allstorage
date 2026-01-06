import { Request, Response } from "express";
import { FileModel } from "./files.model";
import { AuthRequest } from "../../middlewares/auth.middleware";

export const createFolder = async (req: AuthRequest, res: Response) => {
  try {
    const { name, parent_id } = req.body;

    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    if (!name) {
      return res.status(400).json({ error: "Folder name is required" });
    }

    const owner_id = req.user.id;

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

    const owner_id = req.user.id;

    const files = await FileModel.find({
      owner_id,
      parent_id: parent_id || null,
    }).sort({ type: 1, name: 1 });

    res.json(files);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};