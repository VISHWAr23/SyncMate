import mongoose from "mongoose";
import ProjectModel from "../models/project.model.js";
import TaskModel from "../models/task.model.js";
import { NotFoundException } from "../utils/appError.js";
import { TaskStatusEnum } from "../enums/task.enum.js";

/**
 * Creates a new project.
 * @param {string} userId - The ID of the user creating the project.
 * @param {string} workspaceId - The ID of the workspace the project belongs to.
 * @param {Object} body - The project data.
 * @param {string} [body.emoji] - The project emoji.
 * @param {string} body.name - The project name.
 * @param {string} [body.description] - The project description.
 * @returns {Promise<{ project: any }>} The created project.
 */
export const createProjectService = async (userId, workspaceId, body) => {
  const project = new ProjectModel({
    ...(body.emoji && { emoji: body.emoji }),
    name: body.name,
    description: body.description,
    workspace: workspaceId,
    createdBy: userId,
  });

  await project.save();

  return { project };
};

/**
 * Retrieves all projects in a workspace with pagination.
 * @param {string} workspaceId - The ID of the workspace.
 * @param {number} pageSize - The number of projects per page.
 * @param {number} pageNumber - The current page number.
 * @returns {Promise<{ projects: any[], totalCount: number, totalPages: number, skip: number }>} The paginated projects.
 */
export const getProjectsInWorkspaceService = async (
  workspaceId,
  pageSize,
  pageNumber
) => {
  const totalCount = await ProjectModel.countDocuments({
    workspace: workspaceId,
  });

  const skip = (pageNumber - 1) * pageSize;

  const projects = await ProjectModel.find({
    workspace: workspaceId,
  })
    .skip(skip)
    .limit(pageSize)
    .populate("createdBy", "_id name profilePicture -password")
    .sort({ createdAt: -1 });

  const totalPages = Math.ceil(totalCount / pageSize);

  return { projects, totalCount, totalPages, skip };
};

/**
 * Retrieves a project by its ID and workspace ID.
 * @param {string} workspaceId - The ID of the workspace.
 * @param {string} projectId - The ID of the project.
 * @returns {Promise<{ project: any }>} The project.
 */
export const getProjectByIdAndWorkspaceIdService = async (
  workspaceId,
  projectId
) => {
  const project = await ProjectModel.findOne({
    _id: projectId,
    workspace: workspaceId,
  }).select("_id emoji name description");

  if (!project) {
    throw new NotFoundException(
      "Project not found or does not belong to the specified workspace"
    );
  }

  return { project };
};

/**
 * Retrieves analytics for a project.
 * @param {string} workspaceId - The ID of the workspace.
 * @param {string} projectId - The ID of the project.
 * @returns {Promise<{ analytics: { totalTasks: number, overdueTasks: number, completedTasks: number } }>} The project analytics.
 */
export const getProjectAnalyticsService = async (workspaceId, projectId) => {
  const project = await ProjectModel.findById(projectId);

  if (!project || project.workspace.toString() !== workspaceId.toString()) {
    throw new NotFoundException(
      "Project not found or does not belong to this workspace"
    );
  }

  const currentDate = new Date();

  // Using Mongoose aggregate
  const taskAnalytics = await TaskModel.aggregate([
    {
      $match: {
        project: new mongoose.Types.ObjectId(projectId),
      },
    },
    {
      $facet: {
        totalTasks: [{ $count: "count" }],
        overdueTasks: [
          {
            $match: {
              dueDate: { $lt: currentDate },
              status: {
                $ne: TaskStatusEnum.DONE,
              },
            },
          },
          {
            $count: "count",
          },
        ],
        completedTasks: [
          {
            $match: {
              status: TaskStatusEnum.DONE,
            },
          },
          { $count: "count" },
        ],
      },
    },
  ]);

  const _analytics = taskAnalytics[0];

  const analytics = {
    totalTasks: _analytics.totalTasks[0]?.count || 0,
    overdueTasks: _analytics.overdueTasks[0]?.count || 0,
    completedTasks: _analytics.completedTasks[0]?.count || 0,
  };

  return {
    analytics,
  };
};

/**
 * Updates a project.
 * @param {string} workspaceId - The ID of the workspace.
 * @param {string} projectId - The ID of the project.
 * @param {Object} body - The updated project data.
 * @param {string} [body.emoji] - The updated project emoji.
 * @param {string} body.name - The updated project name.
 * @param {string} [body.description] - The updated project description.
 * @returns {Promise<{ project: any }>} The updated project.
 */
export const updateProjectService = async (workspaceId, projectId, body) => {
  const { name, emoji, description } = body;

  const project = await ProjectModel.findOne({
    _id: projectId,
    workspace: workspaceId,
  });

  if (!project) {
    throw new NotFoundException(
      "Project not found or does not belong to the specified workspace"
    );
  }

  if (emoji) project.emoji = emoji;
  if (name) project.name = name;
  if (description) project.description = description;

  await project.save();

  return { project };
};

/**
 * Deletes a project and its associated tasks.
 * @param {string} workspaceId - The ID of the workspace.
 * @param {string} projectId - The ID of the project.
 * @returns {Promise<any>} The deleted project.
 */
export const deleteProjectService = async (workspaceId, projectId) => {
  const project = await ProjectModel.findOne({
    _id: projectId,
    workspace: workspaceId,
  });

  if (!project) {
    throw new NotFoundException(
      "Project not found or does not belong to the specified workspace"
    );
  }

  await project.deleteOne();

  await TaskModel.deleteMany({
    project: project._id,
  });

  return project;
};