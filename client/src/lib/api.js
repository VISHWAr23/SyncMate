import API from "./axios-client";

export const loginMutationFn = async (data) => {
  const response = await API.post("/auth/login", data);
  return response.data;
};

export const registerMutationFn = async (data) => {
  const response = await API.post("/auth/register", data);
  return response.data;
};

export const logoutMutationFn = async () => {
  const response = await API.post("/auth/logout");
  return response.data;
};

export const getCurrentUserQueryFn = async () => {
  const response = await API.get("/user/current");
  return response.data;
};

//********* WORKSPACE ****************
export const createWorkspaceMutationFn = async (data) => {
  const response = await API.post("/workspace/create/new", data);
  return response.data;
};

export const editWorkspaceMutationFn = async ({ workspaceId, data }) => {
  const response = await API.put(`/workspace/update/${workspaceId}`, data);
  return response.data;
};

export const getAllWorkspacesUserIsMemberQueryFn = async () => {
  const response = await API.get("/workspace/all");
  return response.data;
};

export const getWorkspaceByIdQueryFn = async (workspaceId) => {
  const response = await API.get(`/workspace/${workspaceId}`);
  return response.data;
};

export const getMembersInWorkspaceQueryFn = async (workspaceId) => {
  const response = await API.get(`/workspace/members/${workspaceId}`);
  return response.data;
};

export const getWorkspaceAnalyticsQueryFn = async (workspaceId) => {
  const response = await API.get(`/workspace/analytics/${workspaceId}`);
  return response.data;
};

export const changeWorkspaceMemberRoleMutationFn = async ({ workspaceId, data }) => {
  const response = await API.put(`/workspace/change/member/role/${workspaceId}`, data);
  return response.data;
};

export const deleteWorkspaceMutationFn = async (workspaceId) => {
  const response = await API.delete(`/workspace/delete/${workspaceId}`);
  return response.data;
};

//*******MEMBER ****************
export const invitedUserJoinWorkspaceMutationFn = async (iniviteCode) => {
  const response = await API.post(`/member/workspace/${iniviteCode}/join`);
  return response.data;
};

//********* PROJECTS ****************
export const createProjectMutationFn = async ({ workspaceId, data }) => {
  const response = await API.post(`/project/workspace/${workspaceId}/create`, data);
  return response.data;
};

export const editProjectMutationFn = async ({ projectId, workspaceId, data }) => {
  const response = await API.put(`/project/${projectId}/workspace/${workspaceId}/update`, data);
  return response.data;
};

export const getProjectsInWorkspaceQueryFn = async ({ workspaceId, pageSize = 10, pageNumber = 1 }) => {
  const response = await API.get(
    `/project/workspace/${workspaceId}/all?pageSize=${pageSize}&pageNumber=${pageNumber}`
  );
  return response.data;
};

export const getProjectByIdQueryFn = async ({ workspaceId, projectId }) => {
  const response = await API.get(`/project/${projectId}/workspace/${workspaceId}`);
  return response.data;
};

export const getProjectAnalyticsQueryFn = async ({ workspaceId, projectId }) => {
  const response = await API.get(`/project/${projectId}/workspace/${workspaceId}/analytics`);
  return response.data;
};

export const deleteProjectMutationFn = async ({ workspaceId, projectId }) => {
  const response = await API.delete(`/project/${projectId}/workspace/${workspaceId}/delete`);
  return response.data;
};

//*******TASKS ****************
export const createTaskMutationFn = async ({ workspaceId, projectId, data }) => {
  const response = await API.post(`/task/project/${projectId}/workspace/${workspaceId}/create`, data);
  return response.data;
};

export const getAllTasksQueryFn = async ({
  workspaceId,
  keyword,
  projectId,
  assignedTo,
  priority,
  status,
  dueDate,
  pageNumber,
  pageSize,
}) => {
  const baseUrl = `/task/workspace/${workspaceId}/all`;

  const queryParams = new URLSearchParams();
  if (keyword) queryParams.append("keyword", keyword);
  if (projectId) queryParams.append("projectId", projectId);
  if (assignedTo) queryParams.append("assignedTo", assignedTo);
  if (priority) queryParams.append("priority", priority);
  if (status) queryParams.append("status", status);
  if (dueDate) queryParams.append("dueDate", dueDate);
  if (pageNumber) queryParams.append("pageNumber", pageNumber.toString());
  if (pageSize) queryParams.append("pageSize", pageSize.toString());

  const url = queryParams.toString() ? `${baseUrl}?${queryParams}` : baseUrl;
  const response = await API.get(url);
  return response.data;
};

export const deleteTaskMutationFn = async ({ workspaceId, taskId }) => {
  const response = await API.delete(`task/${taskId}/workspace/${workspaceId}/delete`);
  return response.data;
};