import { createFileRoute } from "@tanstack/react-router";
import { createChannelMemberResponse } from "@channels/server/api";

export const Route = createFileRoute("/api/v1/channels/$channelId/members")({
  server: {
    handlers: {
      POST: ({ params, request }) => createChannelMemberResponse(params.channelId, request),
    },
  },
});
