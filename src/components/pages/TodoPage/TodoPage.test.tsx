import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { TodoPage } from "./TodoPage";

const sampleTodo = {
  id: 1,
  createdAt: new Date("2026-01-15T00:00:00.000Z"),
  title: "Buy peppers",
  description: "Habanero and jalapeño",
};

const sampleTodos = [
  sampleTodo,
  {
    id: 2,
    createdAt: new Date("2026-01-16T00:00:00.000Z"),
    title: "Label bottles",
    description: null,
  },
];

function mockActions() {
  return {
    createTodo: vi.fn(
      async (input: { title: string; description: string | null }) => ({
        id: 100,
        createdAt: new Date("2026-01-17T00:00:00.000Z"),
        title: input.title,
        description: input.description,
      }),
    ),
    updateTodo: vi.fn(
      async (input: {
        id: number;
        title: string;
        description: string | null;
      }) => ({
        id: input.id,
        createdAt: new Date("2026-01-15T00:00:00.000Z"),
        title: input.title,
        description: input.description,
      }),
    ),
    deleteTodo: vi.fn(async () => {}),
  };
}

test("empty initialTodos shows empty message, Add, and Pokedachi heading", async () => {
  const screen = await render(<TodoPage {...mockActions()} />);
  await expect.element(screen.getByText("No todos yet.")).toBeVisible();
  await expect
    .element(screen.getByRole("button", { name: "Add" }))
    .toBeVisible();
  await expect
    .element(screen.getByRole("heading", { name: "Pokedachi" }))
    .toBeVisible();
});

test("non-empty initialTodos shows those titles", async () => {
  const screen = await render(
    <TodoPage initialTodos={sampleTodos} {...mockActions()} />,
  );
  await expect.element(screen.getByText("Buy peppers")).toBeVisible();
  await expect.element(screen.getByText("Label bottles")).toBeVisible();
});

test("add from empty makes the new title visible and removes the empty message", async () => {
  const screen = await render(<TodoPage {...mockActions()} />);
  await screen.getByRole("textbox", { name: "Title" }).fill("Make sauce");
  await screen.getByRole("button", { name: "Add" }).click();
  await expect.element(screen.getByText("Make sauce")).toBeVisible();
  await expect.element(screen.getByText("No todos yet.")).not.toBeInTheDocument();
});
