import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import * as hooks from "../../contexts/AuthContext";
import LogIn from ".";
import { userClient } from "../../utils/api";

/* Mock useNavigate */
const mockUseNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockUseNavigate,
}));

/* Mock userClient APIs */
jest.mock("../../utils/api", () => ({
  userClient: {
    post: jest.fn(),
  },
}));
const mockedPost = userClient.post as jest.MockedFunction<
  typeof userClient.post
>;

describe("Log In Components", () => {
  beforeEach(() => {
    jest.spyOn(hooks, "useAuth").mockImplementation(() => ({
      signup: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
      setUser: jest.fn(),
      loading: false,
      user: null,
    }));
  });

  it("App name is rendered", () => {
    render(<LogIn />);
    expect(screen.getByText("PeerPrep")).toBeInTheDocument();
  });

  it("Email field is rendered", () => {
    render(<LogIn />);
    expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
  });

  it("Password field is rendered", () => {
    render(<LogIn />);
    expect(screen.getByLabelText(/Password/)).toBeInTheDocument();
  });

  it("Log in button is rendered", () => {
    render(<LogIn />);
    expect(screen.getByRole("button", { name: "Log in" })).toBeInTheDocument();
  });

  it("Prompt to sign up is rendered", () => {
    render(<LogIn />);
    const signUpButton = screen.getByRole("button", { name: "Sign up" });
    expect(signUpButton).toBeInTheDocument();

    fireEvent.click(signUpButton);
    expect(mockUseNavigate).toHaveBeenCalledWith("/auth/signup");
  });
});

describe("Log In Events", () => {
  // valid inputs
  const email = "test@gmail.com";
  const password = "Password@123";

  beforeEach(() => {
    jest.spyOn(hooks, "useAuth").mockImplementation(() => ({
      signup: jest.fn(),
      login: (email, password) => {
        return mockedPost("/auth/login", {
          email,
          password,
        });
      },
      logout: jest.fn(),
      setUser: jest.fn(),
      loading: false,
      user: null,
    }));
  });

  it("Successful log in with valid inputs", async () => {
    mockedPost.mockResolvedValue({});

    render(<LogIn />);

    fireEvent.change(screen.getByLabelText(/Email/), {
      target: { value: email },
    });
    fireEvent.change(screen.getByLabelText(/Password/), {
      target: { value: password },
    });
    fireEvent.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() => {
      expect(mockedPost).toHaveBeenCalledWith("/auth/login", {
        email: email,
        password: password,
      });
    });
  });

  it("Unsuccessful log in with invalid email", async () => {
    const invalidEmail = "invalidEmail";

    render(<LogIn />);

    fireEvent.change(screen.getByLabelText(/Email/), {
      target: { value: invalidEmail },
    });
    fireEvent.change(screen.getByLabelText(/Password/), {
      target: { value: password },
    });
    fireEvent.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() => {
      expect(mockedPost).not.toHaveBeenCalled();
    });
  });
});
