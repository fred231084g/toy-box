import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Checklist, type ChecklistItem } from "./checklist";

const render = (items: ChecklistItem[]) => renderToStaticMarkup(<Checklist items={items} />);

test("labels every status for assistive tech", () => {
  const html = render([
    { id: "a", title: "Plan", status: "pending" },
    { id: "b", title: "Build", status: "in_progress" },
    { id: "c", title: "Ship", status: "blocked" },
    { id: "d", title: "Scope", status: "done" },
  ]);

  for (const label of ["Pending", "In progress", "Blocked", "Done"]) {
    expect(html).toContain(`aria-label="${label}"`);
  }
});

test("starts done parents collapsed without hiding their supporting actions", () => {
  const html = render([
    {
      id: "done",
      title: "Research",
      status: "done",
      detail: <button type="button">Open report</button>,
      children: [{ id: "hidden", title: "Read the docs", status: "done" }],
    },
    {
      id: "open",
      title: "Build",
      status: "in_progress",
      children: [
        { id: "shown", title: "Write the parser", status: "pending" },
        {
          id: "finished",
          title: "Design",
          status: "done",
          children: [{ id: "nested", title: "Review", status: "done" }],
        },
      ],
    },
  ]);

  expect(html).toContain('aria-expanded="false"');
  expect(html).toContain('aria-expanded="true"');
  expect(html).not.toContain("Read the docs");
  expect(html).toContain("Write the parser");
  expect(html).toContain("Open report");
  expect(html).toContain('aria-label="Subtasks of Research"');
  expect(html).toContain('aria-label="1 of 2 subtasks complete"');
});

test("filtering preserves ancestry and progress without unrelated work", () => {
  const items: ChecklistItem[] = [
    {
      id: "parent",
      title: "Planning parent",
      status: "pending",
      children: [
        {
          id: "ancestor",
          title: "Completed ancestor",
          status: "done",
          children: [
            { id: "active", title: "Active descendant", status: "in_progress" },
            { id: "finished", title: "Finished sibling", status: "done" },
          ],
        },
        { id: "waiting", title: "Waiting sibling", status: "blocked" },
      ],
    },
    {
      id: "active-parent",
      title: "Active parent",
      status: "in_progress",
      children: [{ id: "queued", title: "Queued child", status: "pending" }],
    },
    { id: "unrelated", title: "Unrelated root", status: "pending" },
  ];
  const before = structuredClone(items);
  const html = renderToStaticMarkup(<Checklist items={items} filter="inProgress" />);
  const text = html.replace(/<[^>]+>/g, "");
  for (const title of [
    "Planning parent",
    "Completed ancestor",
    "Active descendant",
    "Active parent",
  ]) {
    expect(text).toContain(title);
  }
  for (const title of ["Finished sibling", "Waiting sibling", "Queued child", "Unrelated root"]) {
    expect(text).not.toContain(title);
  }
  expect(html).toContain('aria-label="1 of 2 subtasks complete"');
  expect(html).toContain('aria-label="0 of 1 subtasks complete"');
  expect(html).not.toContain('aria-label="Subtasks of Active parent"');
  expect(items).toEqual(before);
});

test("filtering shows the empty state when no item or descendant is in progress", () => {
  const html = renderToStaticMarkup(
    <Checklist
      items={[
        {
          id: "pending",
          title: "Pending",
          status: "pending",
          children: [{ id: "blocked", title: "Blocked", status: "blocked" }],
        },
        { id: "done", title: "Done", status: "done" },
      ]}
      filter="inProgress"
      emptyMessage="No tasks in progress."
    />,
  );
  expect(html.replace(/<[^>]+>/g, "")).toBe("No tasks in progress.");
});
