import { fireEvent, render, screen } from "@testing-library/react";
import axios from "axios";
import { faker } from "@faker-js/faker";
import * as authHooks from "../../contexts/AuthContext";
import * as matchHooks from "../../contexts/MatchContext";
import Navbar from ".";
import { MemoryRouter } from "react-router-dom";

jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockUseNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockUseNavigate(),
}));

beforeEach(() => {
  jest.spyOn(matchHooks, "useMatch").mockImplementation(() => ({
    findMatch: jest.fn(),
    stopMatch: () => mockUseNavigate("/home"),
    acceptMatch: jest.fn(),
    rematch: jest.fn(),
    retryMatch: jest.fn(),
    matchingTimeout: jest.fn(),
    matchOfferTimeout: jest.fn(),
    matchId: null,
    matchUser: null,
    matchCriteria: null,
    partner: null,
    matchPending: false,
    loading: false,
    questionId: null,
    questionTitle: null,
  }));
});

describe("Navigation routes", () => {
  it("Question route is present", () => {
    const username = faker.internet.userName();
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email();
    const biography = faker.person.bio();
    const profilePictureUrl = "";
    const createdAt = "";
    const isAdmin = false;
    mockedAxios.get.mockResolvedValue({
      data: {
        data: {
          id: "1",
          username,
          firstName,
          lastName,
          email,
          biography,
          profilePictureUrl,
          createdAt,
          isAdmin,
        },
      },
    });
    jest.spyOn(authHooks, "useAuth").mockImplementation(() => ({
      signup: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
      setUser: jest.fn(),
      loading: false,
      user: {
        id: "1",
        username,
        firstName,
        lastName,
        email,
        profilePictureUrl,
        biography,
        createdAt,
        isAdmin,
      },
    }));
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );
    expect(screen.getByRole("link", { name: "Questions" })).toBeInTheDocument();
  });
});

describe("Unauthenticated user", () => {
  it("Sign up button is rendered", () => {
    mockedAxios.get.mockResolvedValue({ data: { data: null } });
    jest.spyOn(authHooks, "useAuth").mockImplementation(() => ({
      signup: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
      loading: false,
      setUser: jest.fn(),
      user: null,
    }));
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );
    expect(screen.getByRole("button", { name: "Sign up" })).toBeInTheDocument();
  });

  it("Login button is rendered", () => {
    mockedAxios.get.mockResolvedValue({ data: { data: null } });
    jest.spyOn(authHooks, "useAuth").mockImplementation(() => ({
      signup: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
      setUser: jest.fn(),
      loading: false,
      user: null,
    }));
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );
    expect(screen.getByRole("button", { name: "Log in" })).toBeInTheDocument();
  });
});

describe("Authenticated user", () => {
  it("Avatar is rendered", () => {
    const username = faker.internet.userName();
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email();
    const biography = faker.person.bio();
    const profilePictureUrl = "";
    const createdAt = "";
    const isAdmin = false;
    mockedAxios.get.mockResolvedValue({
      data: {
        data: {
          id: "1",
          username,
          firstName,
          lastName,
          email,
          biography,
          profilePictureUrl,
          createdAt,
          isAdmin,
        },
      },
    });
    jest.spyOn(authHooks, "useAuth").mockImplementation(() => ({
      signup: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
      setUser: jest.fn(),
      loading: false,
      user: {
        id: "1",
        username,
        firstName,
        lastName,
        email,
        profilePictureUrl,
        biography,
        createdAt,
        isAdmin,
      },
    }));
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );
    expect(screen.getByTestId("profile")).toBeInTheDocument();
  });

  it("Profile button is rendered", () => {
    const username = faker.internet.userName();
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email();
    const biography = faker.person.bio();
    const profilePictureUrl = "";
    const createdAt = "";
    const isAdmin = false;
    mockedAxios.get.mockResolvedValue({
      data: {
        data: {
          id: "1",
          username,
          firstName,
          lastName,
          email,
          biography,
          profilePictureUrl,
          createdAt,
          isAdmin,
        },
      },
    });
    jest.spyOn(authHooks, "useAuth").mockImplementation(() => ({
      signup: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
      setUser: jest.fn(),
      loading: false,
      user: {
        id: "1",
        username,
        firstName,
        lastName,
        email,
        profilePictureUrl,
        biography,
        createdAt,
        isAdmin,
      },
    }));
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );
    const avatar = screen.getByTestId("profile");
    fireEvent.click(avatar);
    expect(
      screen.getByRole("menuitem", { name: "Profile" })
    ).toBeInTheDocument();
  });

  it("Redirects user to the profile page", () => {
    const username = faker.internet.userName();
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email();
    const biography = faker.person.bio();
    const profilePictureUrl = "";
    const createdAt = "";
    const isAdmin = false;
    mockedAxios.get.mockResolvedValue({
      data: {
        data: {
          id: "1",
          username,
          firstName,
          lastName,
          email,
          biography,
          profilePictureUrl,
          createdAt,
          isAdmin,
        },
      },
    });
    jest.spyOn(authHooks, "useAuth").mockImplementation(() => ({
      signup: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
      setUser: jest.fn(),
      loading: false,
      user: {
        id: "1",
        username,
        firstName,
        lastName,
        email,
        profilePictureUrl,
        biography,
        createdAt,
        isAdmin,
      },
    }));
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );
    const avatar = screen.getByTestId("profile");
    fireEvent.click(avatar);
    expect(mockUseNavigate).toHaveBeenCalled();
  });

  it("Logout button is rendered", () => {
    const username = faker.internet.userName();
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email();
    const biography = faker.person.bio();
    const profilePictureUrl = "";
    const createdAt = "";
    const isAdmin = false;
    mockedAxios.get.mockResolvedValue({
      data: {
        data: {
          id: "1",
          username,
          firstName,
          lastName,
          email,
          biography,
          profilePictureUrl,
          createdAt,
          isAdmin,
        },
      },
    });
    jest.spyOn(authHooks, "useAuth").mockImplementation(() => ({
      signup: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
      loading: false,
      setUser: jest.fn(),
      user: {
        id: "1",
        username,
        firstName,
        lastName,
        email,
        profilePictureUrl,
        biography,
        createdAt,
        isAdmin,
      },
    }));
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );
    const avatar = screen.getByTestId("profile");
    fireEvent.click(avatar);
    expect(
      screen.getByRole("menuitem", { name: "Logout" })
    ).toBeInTheDocument();
  });

  it("Stop matching button is rendered", () => {
    const username = faker.internet.userName();
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email();
    const biography = faker.person.bio();
    const profilePictureUrl = "";
    const createdAt = "";
    const isAdmin = false;
    mockedAxios.get.mockResolvedValue({
      data: {
        data: {
          id: "1",
          username,
          firstName,
          lastName,
          email,
          biography,
          profilePictureUrl,
          createdAt,
          isAdmin,
        },
      },
    });
    jest.spyOn(authHooks, "useAuth").mockImplementation(() => ({
      signup: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
      loading: false,
      setUser: jest.fn(),
      user: {
        id: "1",
        username,
        firstName,
        lastName,
        email,
        profilePictureUrl,
        biography,
        createdAt,
        isAdmin,
      },
    }));
    render(
      <MemoryRouter initialEntries={["/matching"]}>
        <Navbar />
      </MemoryRouter>
    );
    const stopMatchingButton = screen.getByRole("button", {
      name: "Stop matching",
    });
    expect(stopMatchingButton).toBeInTheDocument();

    fireEvent.click(stopMatchingButton);
    expect(mockUseNavigate).toHaveBeenCalledWith("/home");
  });
});
