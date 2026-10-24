import { expect, mock, spyOn, test } from "bun:test";
import { executeCommand, type Command } from "./command";

const command = (fields: Partial<Command> = {}): Command => ({
  id: "test",
  title: "Test",
  run: () => {},
  ...fields,
});

test("runs a command and reports that it succeeded", async () => {
  const run = mock(() => {});

  expect(await executeCommand(command({ run }))).toBe(true);
  expect(run).toHaveBeenCalledTimes(1);
});

test("never runs a disabled command", async () => {
  const run = mock(() => {});

  expect(await executeCommand(command({ run, disabled: true }))).toBe(false);
  expect(run).not.toHaveBeenCalled();
});

test("contains a failing command, reporting that it failed", async () => {
  const error = spyOn(console, "error").mockImplementation(() => {});

  expect(await executeCommand(command({ run: () => Promise.reject(new Error("boom")) }))).toBe(
    false,
  );
  expect(error).toHaveBeenCalled();
  error.mockRestore();
});
