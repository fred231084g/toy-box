import { createFileRoute } from "@tanstack/react-router";
import { createChannelResponse, listChannelsResponse } from "@channels/server/api";

export const Route = createFileRoute("/api/v1/channels/")({
  server: {
    handlers: {
      GET: () => listChannelsResponse(),
      POST: ({ request }) => createChannelResponse(request),
    },
  },
});
