import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import QuestionImageContainer from ".";
import { questionClient } from "../../utils/api";

jest.mock("../../utils/api", () => ({
  questionClient: {
    post: jest.fn(),
  },
}));

describe("Question Image Container", () => {
  const mockLocalStorage = (() => {
    const store: { [key: string]: string } = { accessToken: "test" };

    return {
      getItem(key: string) {
        return store[key];
      },
      setItem(key: string, value: string) {
        store[key] = value;
      },
    };
  })();

  beforeAll(() =>
    Object.defineProperty(window, "localStorage", {
      value: mockLocalStorage,
      writable: true,
    })
  );

  it("Question Image Container is rendered with no uploaded images", () => {
    const uploadedImagesUrl: string[] = [];
    const setUploadedImagesUrl = jest.fn();

    render(
      <QuestionImageContainer
        uploadedImagesUrl={uploadedImagesUrl}
        setUploadedImagesUrl={setUploadedImagesUrl}
      />
    );

    const uploadImageMessage = screen.getByText(
      "Click to upload images. The maximum image size accepted is 5MB."
    );
    expect(uploadImageMessage).toBeInTheDocument();
  });

  it("Question Image Container is rendered with images", () => {
    const uploadedImagesUrl: string[] = ["https://example.com/image.jpg"];
    const setUploadedImagesUrl = jest.fn();

    render(
      <QuestionImageContainer
        uploadedImagesUrl={uploadedImagesUrl}
        setUploadedImagesUrl={setUploadedImagesUrl}
      />
    );

    const images = screen.getAllByAltText("question image");
    expect(images.length).toBe(uploadedImagesUrl.length);
  });

  it("Click on image buttons", async () => {
    const uploadedImagesUrl: string[] = ["https://example.com/image.jpg"];
    const setUploadedImagesUrl = jest.fn();

    render(
      <QuestionImageContainer
        uploadedImagesUrl={uploadedImagesUrl}
        setUploadedImagesUrl={setUploadedImagesUrl}
      />
    );

    const image = screen.getByAltText("question image");
    fireEvent.mouseOver(image);

    const fullscreenButton = screen.getByLabelText("fullscreen");
    fireEvent.click(fullscreenButton);

    expect(screen.getByRole("dialog")).toBeInTheDocument();

    const closeButton = screen.getByLabelText("close");
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("Upload images", async () => {
    const uploadedImagesUrl: string[] = [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg",
    ];
    const setUploadedImagesUrl = jest.fn();

    const mockedPost = questionClient.post as jest.MockedFunction<
      typeof questionClient.post
    >;

    mockedPost.mockResolvedValue({
      data: {
        imageUrls: ["https://example.com/image1.jpg"],
      },
    });

    render(
      <QuestionImageContainer
        uploadedImagesUrl={uploadedImagesUrl}
        setUploadedImagesUrl={setUploadedImagesUrl}
      />
    );

    const file = new File(["file"], "file.png", { type: "image/png" });
    const input = screen.getByTestId("file-input");
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockedPost).toHaveBeenCalledWith(
        "/images",
        expect.any(FormData),
        expect.objectContaining({
          headers: {
            Authorization: `Bearer ${mockLocalStorage.getItem("accessToken")}`,
            "Content-Type": "multipart/form-data",
          },
        })
      );

      expect(setUploadedImagesUrl).toHaveBeenCalled();
    });
  });

  it("Upload non-images", async () => {
    const uploadedImagesUrl: string[] = [];
    const setUploadedImagesUrl = jest.fn();

    render(
      <QuestionImageContainer
        uploadedImagesUrl={uploadedImagesUrl}
        setUploadedImagesUrl={setUploadedImagesUrl}
      />
    );

    const file = new File(["file"], "file.txt", { type: "text/plain" });
    const input = screen.getByTestId("file-input");
    fireEvent.change(input, { target: { files: [file] } });

    expect(questionClient.post).not.toHaveBeenCalled();
  });

  it("Upload large images", async () => {
    const uploadedImagesUrl: string[] = [];
    const setUploadedImagesUrl = jest.fn();

    render(
      <QuestionImageContainer
        uploadedImagesUrl={uploadedImagesUrl}
        setUploadedImagesUrl={setUploadedImagesUrl}
      />
    );

    const input = screen.getByTestId("file-input");
    const file = new File(["a".repeat(100 * 1024 * 1024)], "image.png", {
      type: "image/png",
    });
    fireEvent.change(input, { target: { files: [file] } });

    expect(questionClient.post).not.toHaveBeenCalled();
  });

  it("Error uploading images", async () => {
    const uploadedImagesUrl: string[] = [];
    const setUploadedImagesUrl = jest.fn();

    const mockedPost = questionClient.post as jest.MockedFunction<
      typeof questionClient.post
    >;

    mockedPost.mockRejectedValueOnce(new Error("Error uploading file"));

    render(
      <QuestionImageContainer
        uploadedImagesUrl={uploadedImagesUrl}
        setUploadedImagesUrl={setUploadedImagesUrl}
      />
    );

    const file = new File(["file"], "file.png", { type: "image/png" });
    const input = screen.getByTestId("file-input");
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(setUploadedImagesUrl).not.toHaveBeenCalled();
    });
  });

  it("No images to upload", async () => {
    const uploadedImagesUrl: string[] = [];
    const setUploadedImagesUrl = jest.fn();

    render(
      <QuestionImageContainer
        uploadedImagesUrl={uploadedImagesUrl}
        setUploadedImagesUrl={setUploadedImagesUrl}
      />
    );

    const input = screen.getByTestId("file-input");
    fireEvent.change(input, { target: { files: null } });

    expect(questionClient.post).not.toHaveBeenCalled();
  });
});
