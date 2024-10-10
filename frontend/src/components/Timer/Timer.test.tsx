import { render, screen } from "@testing-library/react";
import Timer from ".";

describe("Timer", () => {
  it("Timer is rendered", () => {
    render(<Timer totalTime={60} timeLeft={30} />);
    expect(screen.getByTestId("timer")).toBeInTheDocument();
  });

  it("Timer is rendered with correct seconds displayed", () => {
    render(<Timer totalTime={60} timeLeft={30} />);
    expect(screen.getByText("00:30")).toBeInTheDocument();
  });

  it("Timer is rendered with correct minutes displayed", () => {
    render(<Timer totalTime={80} timeLeft={60} />);
    expect(screen.getByText("01:00")).toBeInTheDocument();
  });

  it("Timer is rendered with correct minutes and seconds displayed", () => {
    render(<Timer totalTime={80} timeLeft={70} />);
    expect(screen.getByText("01:10")).toBeInTheDocument();
  });
});
