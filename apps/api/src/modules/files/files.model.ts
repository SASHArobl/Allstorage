import { Schema, model, Types } from "mongoose";

export type FileType = "file" | "folder";

export interface IFile {
  _id: Types.ObjectId;

  owner_id: Types.ObjectId;

  name: string;
  type: FileType;

  parent_id: Types.ObjectId | null;
  path: string;

  telegram_file_id?: string;
  size?: number;
  mime?: string;

  created_at: Date;
  updated_at: Date;
}

const FileSchema = new Schema<IFile>(
  {
    owner_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["file", "folder"],
      required: true,
    },

    parent_id: {
      type: Schema.Types.ObjectId,
      ref: "File",
      default: null,
      index: true,
    },

    path: {
      type: String,
      required: true,
      index: true,
    },

    telegram_file_id: {
      type: String,
    },

    size: Number,
    mime: String,
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

// 🔒 нельзя создать файл без telegram_file_id
FileSchema.pre<IFile>("save", async function () {
  if (this.type === "file" && !this.telegram_file_id) {
    throw new Error("File must have telegram_file_id");
  }
});

// уникальность имён в папке
FileSchema.index(
  { owner_id: 1, parent_id: 1, name: 1 },
  { unique: true }
);

export const FileModel = model<IFile>("File", FileSchema);