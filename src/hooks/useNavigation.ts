import { useSelector } from "react-redux";
import { navigation } from "@/constants/navigation";
import { hasPermission } from "@/guards/permissions";

export const useNavigation = () => {
  const user = useSelector((state: any) => state.auth?.user);

  return navigation.filter((item) => {
    return hasPermission(user, item.permission);
  });
};
