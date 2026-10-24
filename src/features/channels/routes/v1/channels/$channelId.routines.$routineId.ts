import { createFileRoute } from "@tanstack/react-router";
import { deleteChannelRoutineResponse } from "@channels/server/api";

export const Route = createFileRoute("/api/v1/channels/$channelId/routines/$routineId")({
  server: {
    handlers: {
      DELETE: ({ params }) => deleteChannelRoutineResponse(params.channelId, params.routineId),
    },
  },
});
