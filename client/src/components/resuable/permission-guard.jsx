import React from "react";
import { useAuthContext } from "@/context/auth-provider";



const PermissionsGuard = ({
  requiredPermission,
  showMessage = false,
  children,
}) => {
  const { hasPermission } = useAuthContext();

  if (!hasPermission(requiredPermission)) {
    return (
      showMessage && (
        <div
          className="text-center 
        text-sm pt-3
        italic
        w-full
        text-muted-foreground"
        >
          You do not have the permission to view this
        </div>
      )
    );
  }

  return <>{children}</>;
};

export default PermissionsGuard;
