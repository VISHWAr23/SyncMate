import { TaskPriorityEnum, TaskStatusEnum } from "../enums/task.enum.js";
import MemberModel from "../models/member.model.js";
import ProjectModel from "../models/project.model.js";
import TaskModel from "../models/task.model.js";
import { BadRequestException, NotFoundException } from "../utils/appError.js";

/**
 * Creates a new task.
 * @param {string} workspaceId - The ID of the workspace.
 * @param {string} projectId - The ID of the project.
 * @param {string} userId - The ID of the user creating the task.
 * @param {Object} body - The task data.
 * @param {string} body.title - The task title.
 * @param {string} [body.description] - The task description.
 * @param {string} body.priority - The task priority.
 * @param {string} body.status - The task status.
 * @param {string} [body.assignedTo] - The ID of the user assigned to the task.
 * @param {string} [body.dueDate] - The task due date.
 * @returns {Promise<{ task: any }>} The created task.
 */
export const createTaskService = async (
  workspaceId,
  projectId,
  userId,
  body
) => {
  const { title, description, priority, status, assignedTo, dueDate } = body;

  const project = await ProjectModel.findById(projectId);

  if (!project || project.workspace.toString() !== workspaceId.toString()) {
    throw new NotFoundException(
      "Project not found or does not belong to this workspace"
    );
  }

  if (assignedTo) {
    const isAssignedUserMember = await MemberModel.exists({
      userId: assignedTo,
      workspaceId,
    });

    if (!isAssignedUserMember) {
      throw new Error("Assigned user is not a member of this workspace.");
    }
  }

  const task = new TaskModel({
    title,
    description,
    priority: priority || TaskPriorityEnum.MEDIUM,
    status: status || TaskStatusEnum.TODO,
    assignedTo,
    createdBy: userId,
    workspace: workspaceId,
    project: projectId,
    dueDate,
  });

  await task.save();

  return { task };
};

/**
 * Updates a task.
 * @param {string} workspaceId - The ID of the workspace.
 * @param {string} projectId - The ID of the project.
 * @param {string} taskId - The ID of the task.
 * @param {Object} body - The updated task data.
 * @param {string} body.title - The updated task title.
 * @param {string} [body.description] - The updated task description.
 * @param {string} body.priority - The updated task priority.
 * @param {string} body.status - The updated task status.
 * @param {string} [body.assignedTo] - The ID of the user assigned to the task.
 * @param {string} [body.dueDate] - The updated task due date.
 * @returns {Promise<{ updatedTask: any }>} The updated task.
 */
export const updateTaskService = async (
  workspaceId,
  projectId,
  taskId,
  body
) => {
  const project = await ProjectModel.findById(projectId);

  if (!project || project.workspace.toString() !== workspaceId.toString()) {
    throw new NotFoundException(
      "Project not found or does not belong to this workspace"
    );
  }

  const task = await TaskModel.findById(taskId);

  if (!task || task.project.toString() !== projectId.toString()) {
    throw new NotFoundException(
      "Task not found or does not belong to this project"
    );
  }

  const updatedTask = await TaskModel.findByIdAndUpdate(
    taskId,
    {
      ...body,
    },
    { new: true }
  );

  if (!updatedTask) {
    throw new BadRequestException("Failed to update task");
  }

  return { updatedTask };
};

/**
 * Retrieves all tasks with filters and pagination.
 * @param {string} workspaceId - The ID of the workspace.
 * @param {Object} filters - The filters to apply.
 * @param {string} [filters.projectId] - The ID of the project to filter tasks.
 * @param {string[]} [filters.status] - The statuses to filter tasks.
 * @param {string[]} [filters.priority] - The priorities to filter tasks.
 * @param {string[]} [filters.assignedTo] - The IDs of users assigned to tasks.
 * @param {string} [filters.keyword] - The keyword to search in task titles.
 * @param {string} [filters.dueDate] - The due date to filter tasks.
 * @param {Object} pagination - The pagination settings.
 * @param {number} pagination.pageSize - The number of tasks per page.
 * @param {number} pagination.pageNumber - The current page number.
 * @returns {Promise<{ tasks: any[], pagination: { pageSize: number, pageNumber: number, totalCount: number, totalPages: number, skip: number } }>} The paginated tasks.
 */
export const getAllTasksService = async (workspaceId, filters, pagination) => {
  const query = {
    workspace: workspaceId,
  };

  if (filters.projectId) {
    query.project = filters.projectId;
  }

  if (filters.status && filters.status.length > 0) {
    query.status = { $in: filters.status };
  }

  if (filters.priority && filters.priority.length > 0) {
    query.priority = { $in: filters.priority };
  }

  if (filters.assignedTo && filters.assignedTo.length > 0) {
    query.assignedTo = { $in: filters.assignedTo };
  }

  if (filters.keyword && filters.keyword !== undefined) {
    query.title = { $regex: filters.keyword, $options: "i" };
  }

  if (filters.dueDate) {
    query.dueDate = {
      $eq: new Date(filters.dueDate),
    };
  }

  // Pagination setup
  const { pageSize, pageNumber } = pagination;
  const skip = (pageNumber - 1) * pageSize;

  const [tasks, totalCount] = await Promise.all([
    TaskModel.find(query)
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 })
      .populate("assignedTo", "_id name profilePicture -password")
      .populate("project", "_id emoji name"),
    TaskModel.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    tasks,
    pagination: {
      pageSize,
      pageNumber,
      totalCount,
      totalPages,
      skip,
    },
  };
};

/**
 * Retrieves a task by its ID.
 * @param {string} workspaceId - The ID of the workspace.
 * @param {string} projectId - The ID of the project.
 * @param {string} taskId - The ID of the task.
 * @returns {Promise<any>} The task.
 */
export const getTaskByIdService = async (workspaceId, projectId, taskId) => {
  const project = await ProjectModel.findById(projectId);

  if (!project || project.workspace.toString() !== workspaceId.toString()) {
    throw new NotFoundException(
      "Project not found or does not belong to this workspace"
    );
  }

  const task = await TaskModel.findOne({
    _id: taskId,
    workspace: workspaceId,
    project: projectId,
  }).populate("assignedTo", "_id name profilePicture -password");

  if (!task) {
    throw new NotFoundException("Task not found.");
  }

  return task;
};

/**
 * Deletes a task.
 * @param {string} workspaceId - The ID of the workspace.
 * @param {string} taskId - The ID of the task.
 * @returns {Promise<void>}
 */
export const deleteTaskService = async (workspaceId, taskId) => {
  const task = await TaskModel.findOneAndDelete({
    _id: taskId,
    workspace: workspaceId,
  });

  if (!task) {
    throw new NotFoundException(
      "Task not found or does not belong to the specified workspace"
    );
  }

  return;
};