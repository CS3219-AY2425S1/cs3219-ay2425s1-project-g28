import { UploadFileOutlined } from "@mui/icons-material";
import { Button, styled } from "@mui/material";

interface QuestionFileContainerProps {
  fileUploadMessage: string;
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
}) => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {};

  return (
    <Button
      component="label"
      role={undefined}
      variant="contained"
      disableElevation
      tabIndex={-1}
      startIcon={<UploadFileOutlined />}
      fullWidth
      sx={(theme) => ({
        borderRadius: 1,
        height: 128,
        backgroundColor: "#fff",
        color: "#757575",
        border: "1px solid",
        borderColor: theme.palette.grey[400],
      })}
    >
      {fileUploadMessage}
      <FileUploadInput
        type="file"
        accept=".txt,.text"
        onChange={(event) => handleFileUpload(event)}
        multiple
      />
    </Button>
  );
};

export default QuestionFileContainer;
