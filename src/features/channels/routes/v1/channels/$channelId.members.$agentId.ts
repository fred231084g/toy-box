import { createFileRoute } from "@tanstack/react-router";
import { removeChannelMemberResponse, updateChannelMemberResponse } from "@channels/server/api";

export const Route = createFileRoute("/api/v1/channels/$channelId/members/$agentId")({
  server: {
    handlers: {
      PATCH: ({ params, request }) =>
        updateChannelMemberResponse(params.channelId, params.agentId, request),
      DELETE: ({ params }) => removeChannelMemberResponse(params.channelId, params.agentId),
    },
  },
});
