import { fireEvent, render, screen } from "@testing-library/react";
import QuestionImage from ".";

describe("Question Image", () => {
  const url = "https://example.com/image.jpg";
  const mockHandleClickOpen = jest.fn();

  it("Question Image is rendered", () => {
    render(<QuestionImage url={url} handleClickOpen={mockHandleClickOpen} />);

    const image = screen.getByAltText("question image");
    expect(image).toBeInTheDocument();
  });

  it("Copy Question Image url", () => {
    const promptSpy = jest.spyOn(window, "prompt").mockImplementation(() => "");

    render(<QuestionImage url={url} handleClickOpen={mockHandleClickOpen} />);

    const copyButton = screen.getByLabelText("copy");
    fireEvent.click(copyButton);

    expect(promptSpy).toHaveBeenCalledWith(
      "Copy to clipboard: Ctrl+C, Enter",
      `![image](${url})`
    );

    promptSpy.mockRestore();
  });

  it("Expand Question Image", () => {
    render(<QuestionImage url={url} handleClickOpen={mockHandleClickOpen} />);

    const fullscreenButton = screen.getByLabelText("fullscreen");
    fireEvent.click(fullscreenButton);

    expect(mockHandleClickOpen).toHaveBeenCalledWith(url);
  });
});
