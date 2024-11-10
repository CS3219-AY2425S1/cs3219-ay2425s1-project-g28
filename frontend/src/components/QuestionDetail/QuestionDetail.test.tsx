import { render, screen } from "@testing-library/react";
import QuestionDetail from ".";

jest.mock("@uiw/react-md-editor", () => ({
  Markdown({
    source,
  }: {
    source: string;
    components: Partial<React.Component>;
  }) {
    return <div>{source}</div>;
  },
}));

describe("Question details", () => {
  it("Question title is rendered", () => {
    const title = "Test title";
    const complexity = "Easy";
    const categories = ["Algorithms", "Data Structures"];
    const description = "# Test description";
    const pythonTemplate = "Python template";
    const javaTemplate = "Java template";
    const cTemplate = "C template";
    const inputTestCases = ["1", "2"];
    const outputTestCases = ["1", "2"];
    render(
      <QuestionDetail
        title={title}
        complexity={complexity}
        categories={categories}
        description={description}
        pythonTemplate={pythonTemplate}
        javaTemplate={javaTemplate}
        cTemplate={cTemplate}
        inputTestCases={inputTestCases}
        outputTestCases={outputTestCases}
        showCodeTemplate={true}
        showTestCases={true}
      />
    );
    expect(screen.getByText(title)).toBeInTheDocument();
  });

  it("Question complexity is rendered", () => {
    const title = "Test title";
    const complexity = "Easy";
    const categories = ["Algorithms", "Data Structures"];
    const description = "# Test description";
    const pythonTemplate = "Python template";
    const javaTemplate = "Java template";
    const cTemplate = "C template";
    const inputTestCases = ["1", "2"];
    const outputTestCases = ["1", "2"];
    render(
      <QuestionDetail
        title={title}
        complexity={complexity}
        categories={categories}
        description={description}
        pythonTemplate={pythonTemplate}
        javaTemplate={javaTemplate}
        cTemplate={cTemplate}
        inputTestCases={inputTestCases}
        outputTestCases={outputTestCases}
        showCodeTemplate={true}
        showTestCases={true}
      />
    );
    expect(screen.getByText(complexity)).toBeInTheDocument();
  });

  it("Question categories are rendered", () => {
    const title = "Test title";
    const complexity = "Easy";
    const categories = ["Algorithms", "Data Structures"];
    const description = "# Test description";
    const pythonTemplate = "Python template";
    const javaTemplate = "Java template";
    const cTemplate = "C template";
    const inputTestCases = ["1", "2"];
    const outputTestCases = ["1", "2"];
    render(
      <QuestionDetail
        title={title}
        complexity={complexity}
        categories={categories}
        description={description}
        pythonTemplate={pythonTemplate}
        javaTemplate={javaTemplate}
        cTemplate={cTemplate}
        inputTestCases={inputTestCases}
        outputTestCases={outputTestCases}
        showCodeTemplate={true}
        showTestCases={true}
      />
    );
    expect(screen.getByText(categories[0])).toBeInTheDocument();
    expect(screen.getByText(categories[1])).toBeInTheDocument();
  });
});
