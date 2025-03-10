import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getProjectsInWorkspaceQueryFn } from "@/lib/api";

const useGetProjectsInWorkspaceQuery = ({
  workspaceId,
  pageSize,
  pageNumber,
  skip = false,
}) => {
  const query = useQuery({
    queryKey: ["allprojects", workspaceId, pageNumber, pageSize],
    queryFn: () =>
      getProjectsInWorkspaceQueryFn({
        workspaceId,
        pageSize,
        pageNumber,
      }),
    staleTime: Infinity,
    placeholderData: skip ? undefined : keepPreviousData,
    enabled: !skip,
  });
  return query;
};

export default useGetProjectsInWorkspaceQuery;
