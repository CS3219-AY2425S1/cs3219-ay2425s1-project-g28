import { useNavigate, useParams } from "react-router-dom";
import AppMargin from "../../components/AppMargin";
import ProfileDetails from "../../components/ProfileDetails";
import { Box, Button, Divider, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography } from "@mui/material";
import classes from "./index.module.css";
import { useEffect, useReducer, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import ServerError from "../../components/ServerError";
import EditProfileModal from "../../components/EditProfileModal";
import ChangePasswordModal from "../../components/ChangePasswordModal";
import { useProfile } from "../../contexts/ProfileContext";
import {
  USE_AUTH_ERROR_MESSAGE,
  USE_PROFILE_ERROR_MESSAGE,
} from "../../utils/constants";
import qnHistoryReducer, { getQnHistoryList, initialQHState } from "../../reducers/qnHistoryReducer";
import { grey } from "@mui/material/colors";
import { convertDateString } from "../../utils/sessionTime";

const rowsPerPage = 10;

const ProfilePage: React.FC = () => {
  const [page, setPage] = useState<number>(0);
  const [state, dispatch] = useReducer(qnHistoryReducer, initialQHState);
  const navigate = useNavigate();

  const { userId } = useParams<{ userId: string }>();
  const auth = useAuth();

  const profile = useProfile();

  if (!auth) {
    throw new Error(USE_AUTH_ERROR_MESSAGE);
  }

  if (!profile) {
    throw new Error(USE_PROFILE_ERROR_MESSAGE);
  }

  const {
    user,
    editProfileOpen,
    passwordModalOpen,
    fetchUser,
    setEditProfileModalOpen,
    setPasswordModalOpen,
  } = profile;

  useEffect(() => {
    if (!userId) {
      return;
    }

    fetchUser(userId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const updateQnHistoryList = () => {
    if (userId) {
      getQnHistoryList(
        page + 1, // convert from 0-based indexing
        rowsPerPage,
        userId,
        dispatch
      );
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => updateQnHistoryList(), [page]);

  if (!user) {
    return (
      <ServerError
        title="Oops, user not found..."
        subtitle="Unfortunately, we can't find who you're looking for 😥"
      />
    );
  }

  const isCurrentUser = auth.user?.id === userId;

  const tableHeaders = ["Title", "Status", "Date submitted"];

  return (
    <AppMargin classname={classes.fullheight}>
      <Box
        sx={(theme) => ({
          marginTop: theme.spacing(4),
          display: "flex",
        })}
      >
        <Box sx={(theme) => ({ flex: 1, paddingRight: theme.spacing(4) })}>
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <ProfileDetails
              profilePictureUrl={user.profilePictureUrl}
              username={user.username}
              firstName={user.firstName}
              lastName={user.lastName}
              biography={user.biography}
            />
            {isCurrentUser && (
              <>
                <Divider />
                <Stack
                  spacing={2}
                  sx={(theme) => ({
                    marginTop: theme.spacing(4),
                    marginBottom: theme.spacing(4),
                  })}
                >
                  <Button
                    variant="contained"
                    onClick={() => setEditProfileModalOpen(true)}
                    sx={{ textTransform: "none" }}
                  >
                    Edit profile
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => setPasswordModalOpen(true)}
                    sx={{ textTransform: "none" }}
                    color="secondary"
                  >
                    Change password
                  </Button>
                </Stack>
              </>
            )}
          </Box>
        </Box>
        <Divider variant="fullWidth" orientation="vertical" flexItem />
        <Box sx={(theme) => ({ flex: 3, paddingLeft: theme.spacing(4) })}>
          <Typography variant="h4" style={{marginBottom: 15}}>Questions attempted</Typography>
          <TableContainer>
            <Table
              sx={(theme) => ({
                "& .MuiTableCell-root": { padding: theme.spacing(1.2) },
                whiteSpace: "nowrap",
              })}
            >
              <TableHead>
                <TableRow>
                  {tableHeaders.map((header) => (
                    <TableCell key={header}>
                      <Typography component="span" variant="h6">
                        {header}
                      </Typography>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
              {state.qnHistories.slice(0, rowsPerPage).map((qnHistory) => (
                <TableRow key={qnHistory.id}>
                  <TableCell
                    sx={{
                      width: "50%",
                      maxWidth: "250px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {isCurrentUser
                      ? <Typography
                          component="span"
                          sx={{
                            "&:hover": { cursor: "pointer", color: "primary.main" },
                          }}
                          onClick={() => navigate(`${qnHistory.id}`)}
                        >
                          {qnHistory.title}
                        </Typography>
                      : <Typography
                          component="span"
                        >
                          {qnHistory.title}
                        </Typography>
                    }
                  </TableCell>
                  <TableCell
                    sx={{
                      borderLeft: "1px solid #E0E0E0",
                      borderRight: "1px solid #E0E0E0",
                    }}
                  >
                    <Typography
                      component="span"
                      sx={{
                        color:
                          qnHistory.submissionStatus === "Accepted"
                            ? "success.main"
                            : qnHistory.submissionStatus === "Attempted"
                            ? "#D2C350"
                            : qnHistory.submissionStatus === "Rejected"
                            ? "error.main"
                            : grey[500],
                      }}
                    >
                      {qnHistory.submissionStatus}
                    </Typography>
                  </TableCell>
                  <TableCell
                    sx={{
                      borderLeft: "1px solid #E0E0E0",
                    }}
                  >
                    <Typography
                      component="span"
                    >
                      {convertDateString(qnHistory.dateAttempted)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[rowsPerPage]}
            component="div"
            count={state.qnHistoryCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, page) => setPage(page)}
          />
          {state.qnHistories.length === 0 && (
            <Stack
              direction="column"
              spacing={1}
              sx={{ alignItems: "center", fontStyle: "italic" }}
            >
              <Typography>
                There are currently no records.
              </Typography>
            </Stack>
          )}
        </Box>
        {editProfileOpen && (
          <EditProfileModal
            open={editProfileOpen}
            onClose={() => setEditProfileModalOpen(false)}
            currProfilePictureUrl={user.profilePictureUrl}
            currFirstName={user.firstName}
            currLastName={user.lastName}
            currBiography={user.biography}
          />
        )}
        {passwordModalOpen && (
          <ChangePasswordModal
            open={passwordModalOpen}
            onClose={() => setPasswordModalOpen(false)}
          />
        )}
      </Box>
    </AppMargin>
  );
};

export default ProfilePage;
