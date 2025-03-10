/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useContext, useEffect } from "react";
import useWorkspaceId from "@/hooks/use-workspace-id";
import useAuth from "@/hooks/api/use-auth";
import useGetWorkspaceQuery from "@/hooks/api/use-get-workspace";
import { useNavigate } from "react-router-dom";
import usePermissions from "@/hooks/use-permissions";


const AuthContext = createContext(undefined);

export const AuthProvider= ({
  children,
}) => {
  const navigate = useNavigate();
  const workspaceId = useWorkspaceId();

  const {
    data: authData,
    error: authError,
    isLoading,
    isFetching,
    refetch: refetchAuth,
  } = useAuth();
  const user = authData?.user;

  const {
    data: workspaceData,
    isLoading: workspaceLoading,
    error: workspaceError,
    refetch: refetchWorkspace,
  } = useGetWorkspaceQuery(workspaceId);

  const workspace = workspaceData?.workspace;

  useEffect(() => {
    if (workspaceError) {
      if (workspaceError?.errorCode === "ACCESS_UNAUTHORIZED") {
        navigate("/"); // Redirect if the user is not a member of the workspace
      }
    }
  }, [navigate, workspaceError]);

  const permissions = usePermissions(user, workspace);

  const hasPermission = (permission) => {
    return permissions.includes(permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        workspace,
        hasPermission,
        error: authError || workspaceError,
        isLoading,
        isFetching,
        workspaceLoading,
        refetchAuth,
        refetchWorkspace,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useCurrentUserContext must be used within a AuthProvider");
  }
  return context;
};
