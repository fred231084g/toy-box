import { createFileRoute } from "@tanstack/react-router";
import { runChannelRoutineResponse } from "@channels/server/api";

export const Route = createFileRoute("/api/v1/channels/$channelId/routines/$routineId/run")({
  server: {
    handlers: {
      POST: ({ params }) => runChannelRoutineResponse(params.channelId, params.routineId),
    },
  },
});
