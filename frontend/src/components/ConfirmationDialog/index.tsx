import Button from "@mui/material/Button";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";

type ConfirmationDialogProps = {
  titleText: string;
  bodyText: string;
  primaryAction: string;
  handlePrimaryAction: () => void;
  open: boolean;
  handleClose: () => void;
};

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = (props) => {
  const {
    titleText,
    bodyText,
    primaryAction,
    handlePrimaryAction,
    open,
    handleClose,
  } = props;

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>{titleText}</DialogTitle>
      <DialogContent>{bodyText}</DialogContent>
      <DialogActions
        sx={(theme) => ({
          padding: theme.spacing(2, 3),
          justifyContent: "space-between",
        })}
      >
        <Button onClick={handleClose} variant="contained" color="secondary">
          Cancel
        </Button>
        <Button onClick={handlePrimaryAction} variant="contained" color="error">
          {primaryAction}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
