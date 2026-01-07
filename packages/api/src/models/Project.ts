import { model, InferSchemaType, Schema } from "mongoose";

export type Project = InferSchemaType<typeof projectSchema>;
export type ProjectSettings = Project["settings"];

const projectSchema = new Schema(
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

export const ProjectModel = model("Project", projectSchema);
