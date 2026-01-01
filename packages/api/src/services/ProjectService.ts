import { injectable } from 'tsyringe';
import { Project, ProjectDocument, ProjectSettings } from '../models/Project.js';
import crypto from 'crypto';

export interface CreateProjectInput {
  projectId: string;
  name: string;
  settings?: Partial<ProjectSettings>;
}

export interface UpdateProjectInput {
  projectId: string;
  name?: string;
  settings?: Partial<ProjectSettings>;
}

@injectable()
export class ProjectService {
  // Public methods
  async createProject(input: CreateProjectInput): Promise<ProjectDocument> {
    const existingProject = await Project.findOne({ projectId: input.projectId });
    if (existingProject) {
      throw new Error(`Project with ID '${input.projectId}' already exists`);
    }

    const apiKey = this.generateApiKey();
    const project = new Project({
      projectId: input.projectId,
      name: input.name,
      apiKey,
      settings: {
        dataRetentionDays: input.settings?.dataRetentionDays ?? 90,
        allowedOrigins: input.settings?.allowedOrigins ?? [],
      },
    });

    await project.save();
    return project;
  }

  async deleteProject(projectId: string): Promise<boolean> {
    const result = await Project.deleteOne({ projectId });
    return result.deletedCount > 0;
  }

  async getProject(projectId: string): Promise<ProjectDocument | null> {
    return await Project.findOne({ projectId });
  }

  async getProjectByApiKey(apiKey: string): Promise<ProjectDocument | null> {
    return await Project.findOne({ apiKey });
  }

  async listProjects(): Promise<Omit<ProjectDocument, 'apiKey'>[]> {
    const projects = await Project.find().select('-apiKey').lean();
    return projects;
  }

  async regenerateApiKey(projectId: string): Promise<ProjectDocument | null> {
    const apiKey = this.generateApiKey();
    return await Project.findOneAndUpdate(
      { projectId },
      { $set: { apiKey } },
      { new: true }
    );
  }

  async updateProject(input: UpdateProjectInput): Promise<ProjectDocument | null> {
    const updateData: any = {};

    if (input.name !== undefined) {
      updateData.name = input.name;
    }

    if (input.settings) {
      if (input.settings.dataRetentionDays !== undefined) {
        updateData['settings.dataRetentionDays'] = input.settings.dataRetentionDays;
      }
      if (input.settings.allowedOrigins !== undefined) {
        updateData['settings.allowedOrigins'] = input.settings.allowedOrigins;
      }
    }

    return await Project.findOneAndUpdate(
      { projectId: input.projectId },
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    const project = await this.getProjectByApiKey(apiKey);
    return project !== null;
  }

  // Private methods
  private generateApiKey(): string {
    return `ak_${crypto.randomBytes(32).toString('hex')}`;
  }
}
