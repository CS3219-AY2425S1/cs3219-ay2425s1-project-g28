import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import * as hooks from "../../contexts/AuthContext";
import QuestionList from ".";
import { questionClient } from "../../utils/api";

/* Mock useNavigate */
const mockUseNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockUseNavigate,
}));

/* Mock questionClient APIs */
jest.mock("../../utils/api", () => ({
  questionClient: {
    get: jest.fn(),
  },
}));
const mockedGet = questionClient.get as jest.MockedFunction<
  typeof questionClient.get
>;
const questions = [
  {
    id: "1",
    title: "Question 1",
    description: "Description of Question 1",
    complexity: "Easy",
    categories: ["Trees"],
  },
  {
    id: "2",
    title: "Question 2",
    description: "Description of Question 2",
    complexity: "Medium",
    categories: ["Algorithms", "Data Structures"],
  },
];
mockedGet.mockImplementation((url: string) => {
  switch (url) {
    case "/categories":
      return Promise.resolve({
        data: {
          categories: ["Algorithms", "Data Structures", "Trees"],
        },
      });
    case "":
      return Promise.resolve({
        data: {
          questions: questions,
          questionCount: questions.length,
        },
      });
    default:
      return Promise.reject(new Error("Not found"));
  }
});

describe("Question List Components For All Users", () => {
  /* Mock useAuth */
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

  it("Page header is rendered", async () => {
    render(<QuestionList />);
    expect(await screen.findByText("Questions")).toBeInTheDocument();
  });

  it("Title search is rendered", async () => {
    render(<QuestionList />);
    expect(await screen.findByLabelText("Title")).toBeInTheDocument();
  });

  it("Complexity filter is rendered", async () => {
    render(<QuestionList />);
    expect(await screen.findByLabelText("Complexity")).toBeInTheDocument();
  });

  it("Category filter is rendered", async () => {
    render(<QuestionList />);
    expect(await screen.findByLabelText("Category")).toBeInTheDocument();
  });

  it("Question table headers are rendered", async () => {
    render(<QuestionList />);
    expect(
      await screen.findByRole("columnheader", { name: "Title" })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("columnheader", { name: "Complexity" })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("columnheader", { name: "Categories" })
    ).toBeInTheDocument();
  });

  it("Question table rows are rendered", async () => {
    render(<QuestionList />);
    for (const question of questions) {
      expect(await screen.findByText(question.title)).toBeInTheDocument();
      expect(await screen.findByText(question.complexity)).toBeInTheDocument();
      for (const category of question.categories) {
        expect(await screen.findByText(category)).toBeInTheDocument();
      }
    }
  });

  it("Question table pagination is rendered", async () => {
    render(<QuestionList />);
    expect(
      await screen.findByRole("button", { name: /previous page/i })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("button", { name: /next page/i })
    ).toBeInTheDocument();
  });

  it("Create button is not rendered", async () => {
    render(<QuestionList />);
    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: "Create" })
      ).not.toBeInTheDocument();
    });
  });

  it("Edit/Delete menu is not rendered", async () => {
    render(<QuestionList />);
    await waitFor(() => {
      expect(screen.queryByTestId("edit-delete-menu")).not.toBeInTheDocument();
    });
  });
});

describe("Question List Components for Admin", () => {
  /* Mock useAuth */
  beforeEach(() => {
    jest.spyOn(hooks, "useAuth").mockImplementation(() => ({
      signup: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
      setUser: jest.fn(),
      loading: false,
      user: {
        id: "1",
        firstName: "Admin",
        lastName: "User",
        username: "administrator",
        email: "admin@gmail.com",
        profilePictureUrl: "",
        biography: "",
        createdAt: "",
        isAdmin: true,
      },
    }));
  });

  it("Create button is rendered", async () => {
    render(<QuestionList />);
    const createButton = await screen.findByRole("button", { name: "Create" });
    expect(createButton).toBeInTheDocument();

    fireEvent.click(createButton);
    expect(mockUseNavigate).toHaveBeenCalledWith("new");
  });

  it("Edit/Delete menu is rendered", async () => {
    render(<QuestionList />);
    const editDeleteMenu = await screen.findAllByTestId("edit-delete-menu");
    expect(editDeleteMenu.length).toBe(questions.length);
    editDeleteMenu.forEach((button) => {
      expect(button).toBeInTheDocument();
    });

    fireEvent.click(editDeleteMenu[0]);
    expect(screen.getByRole("menuitem", { name: "Edit" })).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: "Delete" })
    ).toBeInTheDocument();
  });

  it("Edit button redirects to edit question page", async () => {
    render(<QuestionList />);
    const editDeleteMenu = await screen.findAllByTestId("edit-delete-menu");
    fireEvent.click(editDeleteMenu[0]);
    const editButton = screen.getByRole("menuitem", { name: "Edit" });
    fireEvent.click(editButton);
    expect(mockUseNavigate).toHaveBeenCalledWith(`${questions[0].id}/edit`);
  });

  it("Delete button opens confirmation dialog", async () => {
    render(<QuestionList />);
    const editDeleteMenu = await screen.findAllByTestId("edit-delete-menu");
    fireEvent.click(editDeleteMenu[0]);
    const deleteButton = screen.getByRole("menuitem", { name: "Delete" });
    fireEvent.click(deleteButton);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
