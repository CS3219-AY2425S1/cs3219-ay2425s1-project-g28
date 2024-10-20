import {
  Button,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  styled,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useProfile } from "../../contexts/ProfileContext";
import { passwordValidator } from "../../utils/validators";
import PasswordTextField from "../PasswordTextField";
import {
  PASSWORD_MISMATCH_ERROR_MESSAGE,
  PASSWORD_REQUIRED_ERROR_MESSAGE,
  USE_PROFILE_ERROR_MESSAGE,
} from "../../utils/constants";

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

const StyledForm = styled("form")(({ theme }) => ({
  marginTop: theme.spacing(1),
}));

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = (props) => {
  const { open, onClose } = props;
  const {
    register,
    handleSubmit,
    formState: { errors, dirtyFields, isDirty, isValid },
    watch,
    trigger,
  } = useForm<{
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }>({
    mode: "all",
  });

  const profile = useProfile();

  if (!profile) {
    throw new Error(USE_PROFILE_ERROR_MESSAGE);
  }

  const { updatePassword } = profile;

  return (
    <Dialog fullWidth open={open} onClose={onClose}>
      <DialogTitle fontSize={24} sx={{ paddingBottom: 0 }}>
        Change password
      </DialogTitle>
      <DialogContent>
        <Container maxWidth="sm" disableGutters>
          <StyledForm
            onSubmit={handleSubmit((data) => {
              updatePassword({
                oldPassword: data.oldPassword,
                newPassword: data.newPassword,
              });
              onClose();
            })}
          >
            <PasswordTextField
              label="Current password"
              required
              fullWidth
              margin="normal"
              sx={(theme) => ({ marginTop: theme.spacing(1) })}
              {...register("oldPassword", {
                setValueAs: (value: string) => value.trim(),
                required: PASSWORD_REQUIRED_ERROR_MESSAGE,
              })}
              error={!!errors.oldPassword}
              helperText={errors.oldPassword?.message}
            />
            <PasswordTextField
              displayTooltip
              label="New password"
              required
              fullWidth
              margin="normal"
              sx={(theme) => ({ marginTop: theme.spacing(1) })}
              input={watch("newPassword", "")}
              {...register("newPassword", {
                setValueAs: (value: string) => value.trim(),
                validate: { passwordValidator },
                onChange: () => {
                  if (dirtyFields.confirmPassword) {
                    trigger("confirmPassword");
                  }
                },
              })}
              error={!!errors.newPassword}
              helperText={errors.newPassword?.message}
            />
            <PasswordTextField
              label="Confirm password"
              required
              fullWidth
              margin="normal"
              sx={(theme) => ({ marginTop: theme.spacing(1) })}
              {...register("confirmPassword", {
                setValueAs: (value: string) => value.trim(),
                validate: {
                  matchPassword: (value) =>
                    watch("newPassword") === value ||
                    PASSWORD_MISMATCH_ERROR_MESSAGE,
                },
              })}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
            />
            <Stack
              direction={"row"}
              spacing={2}
              sx={(theme) => ({ marginTop: theme.spacing(1) })}
            >
              <Button
                fullWidth
                variant="contained"
                color="secondary"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                fullWidth
                variant="contained"
                disabled={!isDirty || !isValid}
                type="submit"
              >
                Update
              </Button>
            </Stack>
          </StyledForm>
        </Container>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordModal;
