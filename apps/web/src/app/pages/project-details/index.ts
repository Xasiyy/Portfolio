import { Cub3DDetail } from "./cub3d";
import { MinishellDetail } from "./minishell";
import { PushSwapDetail } from "./push-swap";

export const projectDetailComponents: Record<string, React.ComponentType<{ project: any }>> = {
  Cub3D: Cub3DDetail,
  Minishell: MinishellDetail,
  push_swap: PushSwapDetail,
};
