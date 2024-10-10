import { fireEvent, render, screen } from "@testing-library/react";
import QuestionImage from ".";

Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

describe("Question Image", () => {
  const url = "https://example.com/image.jpg";
  const mockHandleClickOpen = jest.fn();

  it("Question Image is rendered", () => {
    render(<QuestionImage url={url} handleClickOpen={mockHandleClickOpen} />);

    const image = screen.getByAltText("question image");

    expect(image).toBeInTheDocument();
  });

  it("Copy Question Image url", () => {
    render(<QuestionImage url={url} handleClickOpen={mockHandleClickOpen} />);

    const copyButton = screen.getByLabelText("copy");
    fireEvent.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      `![image](${url})`
    );
  });

  it("Expand Question Image", () => {
    render(<QuestionImage url={url} handleClickOpen={mockHandleClickOpen} />);

    const fullscreenButton = screen.getByLabelText("fullscreen");
    fireEvent.click(fullscreenButton);

    expect(mockHandleClickOpen).toHaveBeenCalledWith(url);
  });
});
