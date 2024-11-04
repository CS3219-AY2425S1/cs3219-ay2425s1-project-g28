import FileUploadIcon from "@mui/icons-material/FileUpload";
import { Button, styled } from "@mui/material";
import { toast } from "react-toastify";

interface QuestionFileContainerProps {
  fileUploadMessage: string;
  marginLeft?: number;
  marginRight?: number;
  file: File | null;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
}

const FileUploadInput = styled("input")({
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  width: 1,
});

const QuestionFileContainer: React.FC<QuestionFileContainerProps> = ({
  fileUploadMessage,
  marginLeft,
  marginRight,
  file,
  setFile,
}) => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      return;
    }

    const file = event.target.files[0];
    if (!file.type.startsWith("text/")) {
      toast.error(`${file.name} is not a text file`);
      return;
    }

    if (!file.size) {
      toast.error(`${file.name} is empty. Please upload another text file.`);
      return;
    }

    setFile(file);
  };

  return (
    <Button
      component="label"
      role={undefined}
      variant="contained"
      disableElevation
      tabIndex={-1}
      startIcon={<FileUploadIcon />}
      fullWidth
      sx={(theme) => ({
        borderRadius: 1,
        height: 128,
        backgroundColor: "#fff",
        color: "#757575",
        border: "1px solid",
        borderColor: theme.palette.grey[400],
        marginLeft: { marginLeft },
        marginRight: { marginRight },
      })}
    >
      {file ? file.name : fileUploadMessage}
      <FileUploadInput
        type="file"
        accept=".txt,.text"
        onChange={(event) => handleFileUpload(event)}
      />
    </Button>
  );
};

export default QuestionFileContainer;
