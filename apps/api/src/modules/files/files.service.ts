import { Types } from "mongoose";
import { FileModel } from "./files.model";


// Рекурсивно удаляет папку и всё её содержимое

export const deleteFolderRecursive = async (
  folderId: Types.ObjectId,
  ownerId: Types.ObjectId
) => {
  const children = await FileModel.find({
    parent_id: folderId,
    owner_id: ownerId,
  });

  for (const child of children) {
    if (child.type === "folder") {
      await deleteFolderRecursive(child._id, ownerId);
    } else {
      await FileModel.deleteOne({ _id: child._id });
    }
  }

  await FileModel.deleteOne({ _id: folderId });
};