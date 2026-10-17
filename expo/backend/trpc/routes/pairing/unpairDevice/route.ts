import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import { getGlobalStore } from "../../storage";

export const unpairDeviceProcedure = publicProcedure
  .input(
    z.object({
      childDeviceId: z.string(),
      parentDeviceId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const store = getGlobalStore();
    const devices = store.pairedDevicesStore.get(input.parentDeviceId) || [];
    const remainingDevices = devices.filter(
      (device) => device.childDeviceId !== input.childDeviceId
    );

    if (remainingDevices.length === devices.length) {
      return {
        success: false,
        message: "Paired device was not found",
        unpairedAt: new Date().toISOString(),
      };
    }

    store.pairedDevicesStore.set(input.parentDeviceId, remainingDevices);

    return {
      success: true,
      message: "Device unpaired successfully",
      unpairedAt: new Date().toISOString(),
    };
  });
