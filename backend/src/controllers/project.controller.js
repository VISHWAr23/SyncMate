import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import {
  createProjectSchema,
  projectIdSchema,
  updateProjectSchema,
} from "../validation/project.validation.js";
import { workspaceIdSchema } from "../validation/workspace.validation.js";
import { getMemberRoleInWorkspace } from "../services/member.service.js";
import { roleGuard } from "../utils/roleGuard.js";
import { Permissions } from "../enums/role.enum.js";
import {
  createProjectService,
  deleteProjectService,
  getProjectAnalyticsService,
  getProjectByIdAndWorkspaceIdService,
  getProjectsInWorkspaceService,
  updateProjectService,
} from "../services/project.service.js";
import { HTTPSTATUS } from "../config/http.config.js";

// Create Project Controller
export const createProjectController = asyncHandler(async (req, res) => {
  const body = createProjectSchema.parse(req.body);
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

  const userId = req.user?._id;
  const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
  roleGuard(role, [Permissions.CREATE_PROJECT]);

  const { project } = await createProjectService(userId, workspaceId, body);

  return res.status(HTTPSTATUS.CREATED).json({
    message: "Project created successfully",
    project,
  });
});

// Get All Projects in Workspace Controller
export const getAllProjectsInWorkspaceController = asyncHandler(async (req, res) => {
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
  const userId = req.user?._id;

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
  roleGuard(role, [Permissions.VIEW_ONLY]);

  const pageSize = parseInt(req.query.pageSize, 10) || 10;
  const pageNumber = parseInt(req.query.pageNumber, 10) || 1;

  const { projects, totalCount, totalPages, skip } =
    await getProjectsInWorkspaceService(workspaceId, pageSize, pageNumber);

  return res.status(HTTPSTATUS.OK).json({
    message: "Projects fetched successfully",
    projects,
    pagination: {
      totalCount,
      pageSize,
      pageNumber,
      totalPages,
      skip,
      limit: pageSize,
    },
  });
});

// Get Project by ID and Workspace ID Controller
export const getProjectByIdAndWorkspaceIdController = asyncHandler(async (req, res) => {
  const projectId = projectIdSchema.parse(req.params.id);
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

  const userId = req.user?._id;

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
  roleGuard(role, [Permissions.VIEW_ONLY]);

  const { project } = await getProjectByIdAndWorkspaceIdService(
    workspaceId,
    projectId
  );

  return res.status(HTTPSTATUS.OK).json({
    message: "Project fetched successfully",
    project,
  });
});

// Get Project Analytics Controller
export const getProjectAnalyticsController = asyncHandler(async (req, res) => {
  const projectId = projectIdSchema.parse(req.params.id);
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

  const userId = req.user?._id;

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
  roleGuard(role, [Permissions.VIEW_ONLY]);

  const { analytics } = await getProjectAnalyticsService(
    workspaceId,
    projectId
  );

  return res.status(HTTPSTATUS.OK).json({
    message: "Project analytics retrieved successfully",
    analytics,
  });
});

// Update Project Controller
export const updateProjectController = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const projectId = projectIdSchema.parse(req.params.id);
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

  const body = updateProjectSchema.parse(req.body);

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
  roleGuard(role, [Permissions.EDIT_PROJECT]);

  const { project } = await updateProjectService(
    workspaceId,
    projectId,
    body
  );

  return res.status(HTTPSTATUS.OK).json({
    message: "Project updated successfully",
    project,
  });
});

// Delete Project Controller
export const deleteProjectController = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const projectId = projectIdSchema.parse(req.params.id);
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
  roleGuard(role, [Permissions.DELETE_PROJECT]);

  await deleteProjectService(workspaceId, projectId);

  return res.status(HTTPSTATUS.OK).json({
    message: "Project deleted successfully",
  });
});