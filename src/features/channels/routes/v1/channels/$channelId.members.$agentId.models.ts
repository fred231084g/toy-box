import { createFileRoute } from "@tanstack/react-router";
import { listChannelMemberModelsResponse } from "@channels/server/api";

export const Route = createFileRoute("/api/v1/channels/$channelId/members/$agentId/models")({
  server: {
    handlers: {
      GET: ({ params }) => listChannelMemberModelsResponse(params.channelId, params.agentId),
    },
  },
});
