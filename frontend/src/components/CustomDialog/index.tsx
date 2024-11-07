import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

type CustomDialogProps = {
  titleText: string;
  bodyText: React.ReactNode;
  primaryAction: string;
  handlePrimaryAction: () => void;
  secondaryAction: string;
  open: boolean;
  handleClose: () => void;
};

const CustomDialog: React.FC<CustomDialogProps> = (props) => {
  const {
    titleText,
    bodyText,
    primaryAction,
    handlePrimaryAction,
    secondaryAction,
    open,
    handleClose,
  } = props;

  return (
    <Dialog
      sx={(theme) => ({
        "& .MuiDialog-paper": {
          padding: theme.spacing(2.5),
        },
      })}
      open={open}
      onClose={handleClose}
    >
      <DialogTitle sx={{ textAlign: "center", fontSize: 20 }}>
        {titleText}
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ textAlign: "center", fontSize: 16 }}>
          {bodyText}
        </DialogContentText>
      </DialogContent>
      <DialogActions
        sx={(theme) => ({
          justifyContent: "center",
          paddingBottom: theme.spacing(2.5),
        })}
      >
        <Button
          sx={{ flex: 1 }}
          variant="contained"
          color="secondary"
          onClick={handleClose}
        >
          {secondaryAction}
        </Button>
        <Button
          sx={{ flex: 1 }}
          variant="contained"
          onClick={handlePrimaryAction}
        >
          {primaryAction}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomDialog;
