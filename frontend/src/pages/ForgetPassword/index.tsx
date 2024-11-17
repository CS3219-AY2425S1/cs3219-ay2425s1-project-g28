import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppMargin from "../../components/AppMargin";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import LogInSvg from "../../assets/login.svg?react";
import { emailValidator } from "../../utils/validators";
import "react-toastify/dist/ReactToastify.css";
import PasswordTextField from "../../components/PasswordTextField";
import { useForm } from "react-hook-form";
import { userClient } from "../../utils/api";
import { passwordValidator } from "../../utils/validators";
import classes from "./index.module.css";
import { toast } from "react-toastify";
import {
  PASSWORD_REQUIRED_ERROR_MESSAGE,
  PASSWORD_MISMATCH_ERROR_MESSAGE,
  TOKEN_REQUIRED_ERROR_MESSAGE,
} from "../../utils/constants";

const ForgetPassword: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [hasSentEmail, setHasSentEmail] = useState<boolean>(false);
  const [isLoading, setisLoading] = useState<boolean>(false);

  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: errorsEmail },
  } = useForm<{ email: string }>({ mode: "all" });

  const {
    register: registerPassword,
    watch: watchPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: errorsPassword },
  } = useForm<{ token: string; password: string; confirmPassword: string }>({
    mode: "all",
  });

  const handleSendEmail = async (email: string) => {
    setisLoading(true);
    userClient
      .post("/users/send-reset-password-email", { email })
      .then((res) => {
        setEmail(res.data.data.email);
        toast.success(res.data.message);
        setHasSentEmail(true);
      })
      .catch((err) => {
        toast.error(err.response?.data.message || err.message);
      })
      .finally(() => {
        setisLoading(false);
      });
  };

  const handleResetPassword = async (password: string, token: string) => {
    setisLoading(true);
    userClient
      .post(`/users/reset-password`, { email, token, password })
      .then((res) => {
        navigate("/auth/login");
        toast.success(res.data.message);
      })
      .catch((err) => {
        toast.error(err.response?.data.message || err.message);
      })
      .finally(() => {
        setisLoading(false);
      });
  };

  if (hasSentEmail) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <AppMargin classname={`${classes.fullheight}`}>
          <Box
            sx={(theme) => ({
              textAlign: "center",
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: theme.spacing(1),
              width: "40vw",
              padding: theme.spacing(4),
            })}
          >
            <Typography variant="h5">Change your password</Typography>
            <Typography sx={(theme) => ({ margin: theme.spacing(2, 0) })}>
              An account verification token has been sent to your email.
            </Typography>
            <form
              onSubmit={handleSubmitPassword((data) =>
                handleResetPassword(data.password, data.token)
              )}
            >
              <TextField
                fullWidth
                margin="normal"
                label="Token *"
                sx={(theme) => ({ marginTop: theme.spacing(1) })}
                {...registerPassword("token", {
                  setValueAs: (value: string) => value.trim(),
                  required: TOKEN_REQUIRED_ERROR_MESSAGE,
                })}
                error={!!errorsPassword.token}
                helperText={errorsPassword.token?.message}
              />
              <PasswordTextField
                displayTooltip
                label="Password"
                required
                fullWidth
                margin="normal"
                autoComplete="new-password"
                input={watchPassword("password", "")}
                {...registerPassword("password", {
                  setValueAs: (value: string) => value.trim(),
                  required: PASSWORD_REQUIRED_ERROR_MESSAGE,
                  validate: { passwordValidator },
                })}
                error={!!errorsPassword.password}
                helperText={errorsPassword.password?.message}
              />
              <PasswordTextField
                label="Confirm password"
                required
                fullWidth
                margin="normal"
                sx={(theme) => ({ marginTop: theme.spacing(1) })}
                {...registerPassword("confirmPassword", {
                  setValueAs: (value: string) => value.trim(),
                  validate: {
                    matchPassword: (value) =>
                      watchPassword("password") === value ||
                      PASSWORD_MISMATCH_ERROR_MESSAGE,
                  },
                })}
                error={!!errorsPassword.confirmPassword}
                helperText={errorsPassword.confirmPassword?.message}
              />
              <Stack
                direction="row"
                spacing={2}
                sx={(theme) => ({ marginTop: theme.spacing(4) })}
              >
                <Button
                  fullWidth
                  variant="contained"
                  color="secondary"
                  onClick={() => {
                    handleSendEmail(email);
                  }}
                  disabled={isLoading}
                >
                  Resend
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  type="submit"
                  disabled={isLoading}
                >
                  Change Password
                </Button>
              </Stack>
            </form>
          </Box>
        </AppMargin>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        minHeight: "100vh",
        minWidth: "755px",
      }}
    >
      <Box flex={1}>
        <Stack
          height="100%"
          direction="column"
          sx={(theme) => ({
            backgroundColor: "secondary.main",
            padding: theme.spacing(2, 10),
            justifyContent: "center",
          })}
        >
          <Typography
            component="h1"
            variant="h1"
            sx={{ color: "primary.main", textAlign: "center" }}
          >
            Reset Password
          </Typography>
          <Stack
            component="form"
            direction="column"
            spacing={1.5}
            sx={(theme) => ({
              marginTop: theme.spacing(2),
              marginBottom: theme.spacing(2),
            })}
            onSubmit={handleSubmitEmail((data) => handleSendEmail(data.email))}
            noValidate
          >
            <Typography>
              Enter your email address and we will send you a password reset
              link.
            </Typography>
            <TextField
              label="Email"
              required
              fullWidth
              margin="normal"
              type="email"
              {...registerEmail("email", {
                setValueAs: (value: string) => value.trim(),
                validate: { emailValidator },
              })}
              error={!!errorsEmail.email}
              helperText={errorsEmail.email?.message}
            />
            <Button
              type="submit"
              variant="contained"
              sx={(theme) => ({ margin: theme.spacing(2, 0) })}
              disabled={isLoading}
            >
              Send Reset Link
            </Button>
          </Stack>
        </Stack>
      </Box>
      <Box
        flex={1}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <LogInSvg width="80%" height="80%" />
      </Box>
    </Box>
  );
};

export default ForgetPassword;
