import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import QuestionCategoryAutoComplete from ".";

jest.mock("../../utils/api", () => ({
  questionClient: {
    get: jest.fn().mockResolvedValue({ data: { categories: ["DFS"] } }),
  },
}));

describe("Question Category Auto Complete", () => {
  const selectedCategories: string[] = ["DFS"];
  const setSelectedCategories = jest.fn();

  it("Question Category Auto Complete is rendered", async () => {
    render(
      <QuestionCategoryAutoComplete
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
      />
    );

    const category = await screen.findByText("DFS");

    expect(category).toBeInTheDocument();
  });

  it("Adding a new category from the category list", async () => {
    render(
      <QuestionCategoryAutoComplete
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
      />
    );

    const input = screen.getByLabelText("Category");
    fireEvent.change(input, { target: { value: "DFS" } });

    await waitFor(() => expect(screen.getByText("DFS")).toBeInTheDocument());
  });

  // it("Adding a new category not from the category list", async () => {
  //   const { rerender } = render(
  //     <QuestionCategoryAutoComplete
  //       selectedCategories={selectedCategories}
  //       setSelectedCategories={setSelectedCategories}
  //     />
  //   );

  //   const input = screen.getByLabelText("Category");
  //   fireEvent.change(input, { target: { value: "New Category" } });

  //   const valueAdded = 'Add: "New Category"';
  //   expect(await screen.findByText(valueAdded)).toBeInTheDocument();

  //   fireEvent.click(screen.getByText(valueAdded));

  //   const updatedCategories = [...selectedCategories, "New Category"];

  //   rerender(
  //     <QuestionCategoryAutoComplete
  //       selectedCategories={updatedCategories}
  //       setSelectedCategories={setSelectedCategories}
  //     />
  //   );

  //   expect(screen.getByText("New Category")).toBeInTheDocument();
  // });

  it("Remove a category from selected categories", async () => {
    render(
      <QuestionCategoryAutoComplete
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
      />
    );

    const deleteButton = screen.getByTestId("CancelIcon");
    fireEvent.click(deleteButton);

    await waitFor(() => expect(setSelectedCategories).toHaveBeenCalledWith([]));
  });
});
