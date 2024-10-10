import { render, screen } from "@testing-library/react";
import QuestionImageDialog from ".";

describe("Question Image Dialog", () => {
  const url = "https://example.com/image.jpg";
  const mockHandleClose = jest.fn();

  it("Question Image Dialog is opened", () => {
    render(
      <QuestionImageDialog
        value={url}
        open={true}
        handleClose={mockHandleClose}
      />
    );

    const image = screen.getByAltText("question image enlarged");

    expect(image).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("Question Image Dialog is closed", () => {
    render(
      <QuestionImageDialog
        value={url}
        open={false}
        handleClose={mockHandleClose}
      />
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("Close the Question Image Dialog", () => {
    render(
      <QuestionImageDialog
        value={url}
        open={true}
        handleClose={mockHandleClose}
      />
    );

    const closeButton = screen.getByRole("button", { name: "close" });
    closeButton.click();

    expect(mockHandleClose).toHaveBeenCalledTimes(1);
  });
});
