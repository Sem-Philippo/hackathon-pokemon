import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { Footer } from "./Footer";

test("renders copyright text", async () => {
  const screen = await render(<Footer />);
  await expect.element(screen.getByText("© 2026 Pokedachi")).toBeVisible();
});

test("renders Terms and Privacy links with href #", async () => {
  const screen = await render(<Footer />);
  await expect
    .element(screen.getByRole("link", { name: "Terms" }))
    .toHaveAttribute("href", "#");
  await expect
    .element(screen.getByRole("link", { name: "Privacy" }))
    .toHaveAttribute("href", "#");
});
