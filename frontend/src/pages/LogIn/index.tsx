import {
  Box,
  Button,
  Stack,
  styled,
  TextField,
  Typography,
  TypographyProps,
} from "@mui/material";
import LogInSvg from "../../assets/login.svg?react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { emailValidator } from "../../utils/validators";
import { useForm } from "react-hook-form";
import PasswordTextField from "../../components/PasswordTextField";
import {
  PASSWORD_REQUIRED_ERROR_MESSAGE,
  USE_AUTH_ERROR_MESSAGE,
} from "../../utils/constants";

const StyledTypography = styled((props: TypographyProps) => {
  return <Typography {...props} component={"span"} />;
})({ fontSize: 14 });

const LogIn: React.FC = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  if (!auth) {
    throw new Error(USE_AUTH_ERROR_MESSAGE);
  }
  const { login } = auth;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string; password: string }>({ mode: "all" });

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
            spacing={1.5}
            sx={(theme) => ({
              marginTop: theme.spacing(2),
              marginBottom: theme.spacing(2),
            })}
            onSubmit={handleSubmit((data) => login(data.email, data.password))}
            noValidate
          >
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
              label="Password"
              required
              fullWidth
              margin="normal"
              {...register("password", {
                setValueAs: (value: string) => value.trim(),
                required: PASSWORD_REQUIRED_ERROR_MESSAGE,
              })}
              error={!!errors.password}
              helperText={errors.password?.message}
            />
            <Button
              type="submit"
              variant="contained"
              sx={(theme) => ({ margin: theme.spacing(2, 0) })}
            >
              Log in
            </Button>
          </Stack>
          <Stack
            direction="row"
            spacing={0.5}
            sx={{ justifyContent: "space-between" }}
          >
            <StyledTypography
              role="button"
              tabIndex={0}
              sx={{
                cursor: "pointer",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
              onClick={() => navigate("/auth/forget-password")}
            >
              Forget password
            </StyledTypography>
            <Box>
              <StyledTypography>Don't have an account? &nbsp;</StyledTypography>
              <StyledTypography
                role="button"
                tabIndex={0}
                sx={{
                  cursor: "pointer",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
                onClick={() => navigate("/auth/signup")}
              >
                Sign up
              </StyledTypography>
            </Box>
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

export default LogIn;
