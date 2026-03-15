"use server";

import { inngest } from "@/inngest/client";

export const onInvoke = async (value: string) => {
    await inngest.send({
        name: "agent-code/run",
        data: { value },
    });
};