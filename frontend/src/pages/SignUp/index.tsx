import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import SignUpSvg from "../../assets/signup.svg?react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  emailValidator,
  nameValidator,
  passwordValidator,
  usernameValidator,
} from "../../utils/validators";
import { useForm } from "react-hook-form";
import PasswordTextField from "../../components/PasswordTextField";
import {
  PASSWORD_REQUIRED_ERROR_MESSAGE,
  USE_AUTH_ERROR_MESSAGE,
} from "../../utils/constants";

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  if (!auth) {
    throw new Error(USE_AUTH_ERROR_MESSAGE);
  }
  const { signup } = auth;

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<{
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
  }>({ mode: "all" });

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
            PeerPrep
          </Typography>
          <Stack
            component="form"
            direction="column"
            noValidate
            spacing={1.5}
            sx={(theme) => ({
              marginTop: theme.spacing(2),
              marginBottom: theme.spacing(2),
            })}
            onSubmit={handleSubmit((data) =>
              signup(
                data.firstName,
                data.lastName,
                data.username,
                data.email,
                data.password
              )
            )}
          >
            <TextField
              label="First name"
              required
              fullWidth
              margin="normal"
              {...register("firstName", {
                setValueAs: (value: string) => value.trim(),
                validate: { nameValidator },
              })}
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
            />
            <TextField
              label="Last name"
              required
              fullWidth
              margin="normal"
              {...register("lastName", {
                setValueAs: (value: string) => value.trim(),
                validate: { nameValidator },
              })}
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
            />
            <TextField
              label="Username"
              required
              fullWidth
              margin="normal"
              {...register("username", {
                setValueAs: (value: string) => value.trim(),
                validate: { usernameValidator },
              })}
              error={!!errors.username}
              helperText={errors.username?.message}
            />
            <TextField
              label="Email"
              required
              fullWidth
              margin="normal"
              type="email"
              {...register("email", {
                setValueAs: (value: string) => value.trim(),
                validate: { emailValidator },
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <PasswordTextField
              displayTooltip
              label="Password"
              required
              fullWidth
              margin="normal"
              input={watch("password", "")}
              {...register("password", {
                setValueAs: (value: string) => value.trim(),
                required: PASSWORD_REQUIRED_ERROR_MESSAGE,
                validate: { passwordValidator },
              })}
              error={!!errors.password}
              helperText={errors.password?.message}
            />
            <Button
              type="submit"
              variant="contained"
              sx={(theme) => ({ margin: theme.spacing(2, 0) })}
            >
              Sign up
            </Button>
          </Stack>
          <Stack
            direction="row"
            spacing={0.5}
            sx={{ justifyContent: "flex-end" }}
          >
            <Typography component="span" sx={{ fontSize: 14 }}>
              Have an account?
            </Typography>
            <Typography
              component="span"
              role="button"
              tabIndex={0}
              sx={{
                fontSize: 14,
                cursor: "pointer",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
              onClick={() => navigate("/auth/login")}
            >
              Log in
            </Typography>
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
        <SignUpSvg width="80%" height="80%" />
      </Box>
    </Box>
  );
};

export default SignUp;
