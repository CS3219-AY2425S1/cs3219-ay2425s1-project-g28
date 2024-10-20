import { render, screen } from "@testing-library/react";
import ServerError from ".";

describe("Not found", () => {
  it("Title is rendered", () => {
    const title = "Page not found...";
    const subtitle = "Unfortunately, we can't find what you're looking for 😢";
    render(<ServerError title={title} subtitle={subtitle} />);
    expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
  });

  it("Subtitle is rendered", () => {
    const title = "Page not found...";
    const subtitle = "Unfortunately, we can't find what you're looking for 😢";
    render(<ServerError title={title} subtitle={subtitle} />);
    expect(screen.getByText(subtitle)).toBeInTheDocument();
  });
});
