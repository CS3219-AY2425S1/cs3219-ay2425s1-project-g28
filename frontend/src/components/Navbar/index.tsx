import {
  AppBar,
  Avatar,
  Box,
  Button,
  IconButton,
  Link,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import AppMargin from "../AppMargin";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useState } from "react";
import {
  USE_AUTH_ERROR_MESSAGE,
  USE_MATCH_ERROR_MESSAGE,
} from "../../utils/constants";
import { isMatchingPage, isCollabPage } from "../../utils/url";
import { useMatch } from "../../contexts/MatchContext";

type NavbarItem = { label: string; link: string; needsLogin: boolean };

type NavbarProps = { navbarItems?: Array<NavbarItem> };

const Navbar: React.FC<NavbarProps> = (props) => {
  const {
    navbarItems = [
      { label: "Find Match", link: "/home", needsLogin: true },
      { label: "Questions", link: "/questions", needsLogin: false },
    ],
  } = props;

  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const auth = useAuth();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  if (!auth) {
    throw new Error(USE_AUTH_ERROR_MESSAGE);
  }

  const { logout, user } = auth;

  const match = useMatch();
  if (!match) {
    throw new Error(USE_MATCH_ERROR_MESSAGE);
  }
  const { stopMatch } = match;

  const handleClick = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);

  const handleClose = () => setAnchorEl(null);

  return (
    <AppBar
      component={"nav"}
      position="sticky"
      sx={{
        backgroundColor: "common.white",
        color: "primary.main",
        boxShadow: "none",
        borderBottom: "1px solid",
        borderColor: grey[300],
      }}
    >
      <AppMargin>
        <Toolbar sx={{ padding: 0, justifyContent: "space-between" }}>
          <Typography
            component={Box}
            variant="h5"
            sx={{ "&:hover": { cursor: "pointer" } }}
            onClick={() => navigate("/")}
          >
            PeerPrep
          </Typography>
          {isCollabPage(path) ? (
            <Stack direction={"row"} alignItems={"center"} spacing={2}>
              <Button
                variant="outlined"
                color="error"
                onClick={() => stopMatch()}
              >
                Stop matching
              </Button>
            </Stack>
          ) : !isMatchingPage(path) ? (
            <Stack direction={"row"} alignItems={"center"} spacing={2}>
              {navbarItems
                .filter((item) => !item.needsLogin || (item.needsLogin && user))
                .map((item) => (
                  <Link
                    key={item.label}
                    href={item.link}
                    underline="none"
                    sx={{ color: "common.black" }}
                  >
                    {path == item.link ? <b>{item.label}</b> : item.label}
                  </Link>
                ))}
              {user ? (
                <>
                  <Tooltip title={"Account settings"}>
                    <IconButton onClick={handleClick} data-testid="profile">
                      <Avatar src={user.profilePictureUrl} />
                    </IconButton>
                  </Tooltip>
                  <Menu
                    anchorEl={anchorEl}
                    open={!!anchorEl}
                    onClose={handleClose}
                    onClick={handleClose}
                  >
                    <MenuItem
                      onClick={() => {
                        handleClose();
                        navigate(`/profile/${user.id}`);
                      }}
                    >
                      Profile
                    </MenuItem>
                    <MenuItem onClick={logout}>Logout</MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <Button
                    variant="contained"
                    onClick={() => navigate("/auth/signup")}
                  >
                    Sign up
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => navigate("/auth/login")}
                  >
                    Log in
                  </Button>
                </>
              )}
            </Stack>
          ) : (
            <Button
              variant="outlined"
              color="error"
              onClick={() => stopMatch()}
            >
              Stop matching
            </Button>
          )}
        </Toolbar>
      </AppMargin>
    </AppBar>
  );
};

export default Navbar;
