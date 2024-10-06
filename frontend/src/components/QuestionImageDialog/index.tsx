import { Dialog, DialogContent, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface QuestionImageDialog {
  value: string;
  open: boolean;
  handleClose: () => void;
}

const QuestionImageDialog: React.FC<QuestionImageDialog> = ({
  value,
  open,
  handleClose,
}) => {
  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogContent>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={(theme) => ({
            position: "absolute",
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          })}
        >
          <CloseIcon />
        </IconButton>
        <img
          src={value}
          loading="lazy"
          alt="question image enlarged"
          style={{ width: "550px" }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default QuestionImageDialog;
