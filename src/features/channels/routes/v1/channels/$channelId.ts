import { createFileRoute } from "@tanstack/react-router";
import {
  deleteChannelResponse,
  editChannelResponse,
  getChannelResponse,
} from "@channels/server/api";

export const Route = createFileRoute("/api/v1/channels/$channelId")({
  server: {
    handlers: {
      GET: ({ params, request }) => getChannelResponse(params.channelId, request),
      PATCH: ({ params, request }) => editChannelResponse(params.channelId, request),
      DELETE: ({ params }) => deleteChannelResponse(params.channelId),
    },
  },
});
