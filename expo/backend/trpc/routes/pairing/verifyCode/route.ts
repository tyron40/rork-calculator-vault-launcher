import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import { pairingRpc } from '../database';

export const verifyCodeProcedure = publicProcedure
  .input(
    z.object({
      code: z.string().length(6),
      parentDeviceId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      return await pairingRpc('pair_parent_with_child_code', {
        p_code: input.code,
        p_parent_device_id: input.parentDeviceId,
      });
    } catch (error) {
      console.error('[Backend] Error in verifyCode:', error);
      throw error;
    }
  });
