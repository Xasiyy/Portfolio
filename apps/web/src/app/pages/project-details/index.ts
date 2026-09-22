import { Cub3DDetail } from "./cub3d";
import { MinishellDetail } from "./minishell";

export const projectDetailComponents: Record<string, React.ComponentType<{ project: any }>> = {
  Cub3D: Cub3DDetail,
  Minishell: MinishellDetail,
};
