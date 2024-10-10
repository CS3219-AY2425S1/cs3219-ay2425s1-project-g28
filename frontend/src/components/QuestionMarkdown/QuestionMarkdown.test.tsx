import { fireEvent, render, screen } from "@testing-library/react";
import QuestionMarkdown from ".";

jest.mock("@uiw/react-md-editor", () => ({
  __esModule: true,
  default: ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (val: string) => void;
  }) => (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Description"
    />
  ),
  commands: {},
}));

describe("Question Markdown", () => {
  const markdownText = `Hello world`;
  const setMarkdownText = jest.fn();

  it("Question Markdown is rendered", () => {
    render(
      <QuestionMarkdown
        markdownText={markdownText}
        setMarkdownText={setMarkdownText}
      />
    );

    const textarea = screen.getByPlaceholderText("Description");
    expect(textarea).toBeInTheDocument();

    const markdown = screen.getByText("Hello world");
    expect(markdown).toBeInTheDocument();
  });

  it("Update markdown text", () => {
    render(
      <QuestionMarkdown
        markdownText={markdownText}
        setMarkdownText={setMarkdownText}
      />
    );

    const textarea = screen.getByPlaceholderText("Description");
    fireEvent.change(textarea, { target: { value: "Test Description" } });

    expect(setMarkdownText).toHaveBeenCalledWith("Test Description");
  });

  it("Update markdown text to empty", () => {
    render(
      <QuestionMarkdown
        markdownText={markdownText}
        setMarkdownText={setMarkdownText}
      />
    );

    const textarea = screen.getByPlaceholderText("Description");
    fireEvent.change(textarea, { target: { value: "" } });

    expect(setMarkdownText).toHaveBeenCalledWith("");
  });
});
