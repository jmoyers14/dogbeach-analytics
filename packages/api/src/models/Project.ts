import { Schema, model, Document } from 'mongoose';

export interface ProjectSettings {
  dataRetentionDays: number;
  allowedOrigins: string[];
}

export interface ProjectDocument extends Document {
  projectId: string;
  name: string;
  apiKey: string;
  settings: ProjectSettings;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<ProjectDocument>(
  {
    projectId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      minlength: 1,
      maxlength: 50,
      match: /^[a-zA-Z0-9-]+$/,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100,
    },
    apiKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    settings: {
      dataRetentionDays: {
        type: Number,
        default: 90,
        min: 1,
        max: 365,
      },
      allowedOrigins: {
        type: [String],
        default: [],
      },
    },
  },
  {
    timestamps: true,
  }
);

export const Project = model<ProjectDocument>('Project', projectSchema);
