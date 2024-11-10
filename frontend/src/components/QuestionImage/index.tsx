import { Box, ImageListItem, IconButton } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import FullscreenIcon from "@mui/icons-material/Fullscreen";

interface QuestionImageProps {
  url: string;
  handleClickOpen: (url: string) => void;
}

const QuestionImage: React.FC<QuestionImageProps> = ({
  url,
  handleClickOpen,
}) => {
  return (
    <ImageListItem
      sx={{
        width: 128,
        height: 128,
        position: "relative",
        ":hover .moreInfo": {
          opacity: 1,
        },
        borderRadius: 1,
        overflow: "hidden",
      }}
    >
      <img
        src={url}
        loading="lazy"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          borderRadius: 1,
        }}
        alt="question image"
      />

      <Box
        className="moreInfo"
        top={0}
        left={0}
        width="100%"
        height="100%"
        position="absolute"
        borderRadius={1}
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{
          opacity: 0,
          backgroundColor: "#75757599",
          transition: "opacity 0.5s ease",
        }}
      >
        <IconButton
          onClick={() => {
            // switch to window.prompt since navigator.clipboard.writeText is not supported in HTTP
            window.prompt(
              "Copy to clipboard: Ctrl+C, Enter",
              `![image](${url})`
            );
          }}
          sx={{ color: "#fff" }}
          aria-label="copy"
        >
          <ContentCopyIcon />
        </IconButton>

        <IconButton
          onClick={() => handleClickOpen(url)}
          sx={{ color: "#fff " }}
          aria-label="fullscreen"
        >
          <FullscreenIcon />
        </IconButton>
      </Box>
    </ImageListItem>
  );
};

export default QuestionImage;
