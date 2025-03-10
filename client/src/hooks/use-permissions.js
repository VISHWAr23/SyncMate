import { useEffect, useMemo, useState } from "react";

const usePermissions = (
  user,
  workspace
) => {
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    if (user && workspace) {
      const member = workspace.members.find(
        (member) => member.userId === user._id
      );
      if (member) {
        setPermissions(member.role.permissions || []);
      }
    }
  }, [user, workspace]);

  return useMemo(() => permissions, [permissions]);
};

export default usePermissions;
