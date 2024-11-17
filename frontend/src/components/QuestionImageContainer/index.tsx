import { useState } from "react";
/* c8 ignore next */
import { styled } from "@mui/material/styles";
import { Button, ImageList, ImageListItem } from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { toast } from "react-toastify";

import { createImageUrls } from "../../reducers/questionReducer";
import QuestionImage from "../QuestionImage";
import QuestionImageDialog from "../QuestionImageDialog";
import { FAILED_FILE_UPLOAD, SUCCESS_FILE_UPLOAD } from "../../utils/constants";

interface QuestionImageContainerProps {
  uploadedImagesUrl: string[];
  setUploadedImagesUrl: React.Dispatch<React.SetStateAction<string[]>>;
}

const FileUploadInput = styled("input")({
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  width: 1,
});

const QuestionImageContainer: React.FC<QuestionImageContainerProps> = ({
  uploadedImagesUrl,
  setUploadedImagesUrl,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [selectedValue, setSelectedValue] = useState<string>("");

  const handleClickOpen = (url: string) => {
    setOpen(true);
    setSelectedValue(url);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files) {
      return;
    }

    const formData = new FormData();
    for (const file of event.target.files) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is more than 5MB`);
        continue;
      }
      formData.append("images[]", file);
    }

    if (formData.getAll("images[]").length === 0) {
      return;
    }

    createImageUrls(formData).then((res) => {
      if (res) {
        for (const imageUrl of res.imageUrls) {
          setUploadedImagesUrl((prev) => [...prev, imageUrl]);
        }
        toast.success(SUCCESS_FILE_UPLOAD);
      } else {
        toast.error(FAILED_FILE_UPLOAD);
      }
    });
  };

  if (uploadedImagesUrl.length === 0) {
    return (
      <Button
        component="label"
        variant="contained"
        disableElevation={true}
        sx={(theme) => ({
          borderRadius: 1,
          height: 128,
          width: "100%",
          backgroundColor: "#fff",
          color: "#757575",
          border: "1px solid",
          borderColor: theme.palette.grey[400],
          marginTop: 2,
        })}
      >
        <FileUploadIcon />
        Click to upload images. The maximum image size accepted is 5MB.
        <FileUploadInput
          data-testid="file-input"
          type="file"
          accept="image/png,image/jpeg"
          onChange={(event) => handleImageUpload(event)}
          multiple
        />
      </Button>
    );
  }

  return (
    <>
      <ImageList cols={7} rowHeight={128} sx={{ paddingTop: 2 }}>
        {uploadedImagesUrl.map((image) => (
          <QuestionImage
            key={image}
            url={image}
            handleClickOpen={handleClickOpen}
          />
        ))}

        <ImageListItem sx={{ width: 128, height: 128 }}>
          <Button
            component="label"
            variant="contained"
            disableElevation={true}
            sx={(theme) => ({
              borderRadius: 1,
              height: 128,
              width: 128,
              backgroundColor: "#fff",
              color: "#757575",
              border: "1px solid",
              borderColor: theme.palette.grey[400],
              textAlign: "center",
            })}
          >
            <FileUploadIcon />
            Upload images
            <FileUploadInput
              data-testid="file-input"
              type="file"
              accept="image/png,image/jpeg"
              onChange={(event) => handleImageUpload(event)}
              multiple
            />
          </Button>
        </ImageListItem>
      </ImageList>

      <QuestionImageDialog
        value={selectedValue}
        open={open}
        handleClose={handleClose}
      />
    </>
  );
};

export default QuestionImageContainer;
