import { expect, test } from "bun:test";
import { Plus } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";
import { CommandButton } from "./CommandButton";
import { CommandProvider } from "./CommandProvider";

test("a button renders a command its owner provides by id in the server's markup", () => {
  const markup = renderToStaticMarkup(
    <CommandProvider
      commands={[{ id: "test.create", title: "New thing", icon: Plus, run: () => {} }]}
    >
      <CommandButton command="test.create" size="icon" />
    </CommandProvider>,
  );

  expect(markup).toContain('aria-label="New thing"');
});
