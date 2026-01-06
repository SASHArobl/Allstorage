import { Response } from "express";
import { Types } from "mongoose";
import { FileModel } from "./files.model";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { deleteFolderRecursive } from "./files.service";

/* создать папку */
export const createFolder = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.sendStatus(401);

    const { name, parent_id } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Folder name is required" });
    }

    const path = parent_id ? `${parent_id}/${name}` : `/${name}`;

    const folder = await FileModel.create({
      owner_id: req.user.id,
      name,
      type: "folder",
      parent_id: parent_id || null,
      path,
    });

    res.status(201).json(folder);
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Folder already exists" });
    }
    res.status(500).json({ error: err.message });
  }
};

/* создать файл (после загрузки в Telegram) */
export const createFile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.sendStatus(401);

    const { name, parent_id, telegram_file_id, size, mime } = req.body;
    if (!name || !telegram_file_id) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const path = parent_id ? `${parent_id}/${name}` : `/${name}`;

    const file = await FileModel.create({
      owner_id: req.user.id,
      name,
      type: "file",
      parent_id: parent_id || null,
      path,
      telegram_file_id,
      size,
      mime,
    });

    res.status(201).json(file);
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "File already exists" });
    }
    res.status(500).json({ error: err.message });
  }
};

/* список файлов */
export const getFiles = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.sendStatus(401);

    const { parent_id } = req.query as { parent_id?: string };

    const files = await FileModel.find({
      owner_id: req.user.id,
      parent_id: parent_id || null,
    }).sort({ type: 1, name: 1 });

    res.json(files);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/* ссылка на скачивание */
export const getDownloadLink = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.sendStatus(401);

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Missing id" });
    }

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid file id" });
    }

    const file = await FileModel.findOne({
      _id: new Types.ObjectId(id),
      owner_id: req.user.id,
      type: "file",
    });

    if (!file || !file.telegram_file_id) {
      return res.status(404).json({ error: "File not found" });
    }

    res.json({
      telegram_file_id: file.telegram_file_id,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/* удалить файл / папку */
export const deleteFile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.sendStatus(401);

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Missing id" });
    }

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const entryId = new Types.ObjectId(id);
    const ownerId = new Types.ObjectId(req.user.id);

    const entry = await FileModel.findOne({
      _id: entryId,
      owner_id: ownerId,
    });

    if (!entry) {
      return res.status(404).json({ error: "Not found" });
    }

    if (entry.type === "folder") {
      await deleteFolderRecursive(entry._id, ownerId);
    } else {
      await FileModel.deleteOne({ _id: entry._id });
    }

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};