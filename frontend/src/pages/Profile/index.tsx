import { useNavigate, useParams } from "react-router-dom";
import AppMargin from "../../components/AppMargin";
import ProfileDetails from "../../components/ProfileDetails";
import { Autocomplete, Box, Button, Divider, Grid2, IconButton, InputAdornment, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, Typography } from "@mui/material";
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
import Loader from "../../components/Loader";
import { Search } from "@mui/icons-material";
import useDebounce from "../../utils/debounce";

const rowsPerPage = 10;
const searchCharacterLimit = 100;
const statusList = ["Accepted", "Attempted", "Rejected"];

const ProfilePage: React.FC = () => {
  const [page, setPage] = useState<number>(0);
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchFilter, setSearchFilter] = useDebounce<string>("", 1000);
  const [statusFilter, setStatusFilter] = useDebounce<string[]>([], 1000);
  const [state, dispatch] = useReducer(qnHistoryReducer, initialQHState);
  const [loading, setLoading] = useState<boolean>(true);
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
    setLoading(true);
    if (!userId) {
      setTimeout(() => setLoading(false), 500);
      return;
    }

    fetchUser(userId);
    setTimeout(() => setLoading(false), 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const updateQnHistoryList = () => {
    if (userId) {
      getQnHistoryList(
        page + 1, // convert from 0-based indexing
        rowsPerPage,
        userId,
        searchFilter,
        statusFilter,
        sortOrder,
        dispatch
      );
    }
  };

  useEffect(() => {
    if (page !== 0) {
      setPage(0);
    } else {
      updateQnHistoryList();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchFilter, statusFilter, sortOrder]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => updateQnHistoryList(), [page]);

  const areQnHistoriesFiltered = () => {
    return (searchFilter || statusFilter.length > 0);
  };

  if (loading) {
    return <Loader />;
  }
  
  if (!user) {
    return (
      <ServerError
        title="Oops, user not found..."
        subtitle="Unfortunately, we can't find who you're looking for 😥"
      />
    );
  }

  const isCurrentUser = auth.user?.id === userId;

  const tableHeaders = ["Title", "Status", "Date attempted"];

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
          <Stack
            direction="row"
            sx={{ justifyContent: "space-between", alignItems: "center" }}
          >
            <Typography variant="h4" style={{marginBottom: 15}}>Questions attempted</Typography>
            {state.qnHistories.length !== 0 && 
            <Button
              variant="outlined"
              sx={{ height: 40 }}
              onClick={() => {
                if (sortOrder === 1) {
                  setSortOrder(-1);
                } else if (sortOrder === -1) {
                  setSortOrder(1);
                }
              }}>
              { sortOrder === 1 ? "Sort records from latest to earliest date attempted" : "Sort records from earliest to latest date attempted" }
            </Button>}
          </Stack>
          <Grid2
            container
            rowSpacing={1}
            columnSpacing={2}
            sx={(theme) => ({
              marginTop: theme.spacing(2),
              "& .MuiTextField-root": { width: "100%" },
            })}
          >
            <Grid2 size={8}>
              <TextField
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton type="button">
                          <Search />
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                  htmlInput: {
                    maxLength: searchCharacterLimit,
                  },
                  formHelperText: {
                    sx: { textAlign: "right" },
                  },
                }}
                label="Title"
                onChange={(input) => {
                  setSearchInput(input.target.value);
                  setSearchFilter(input.target.value.toLowerCase().trim());
                }}
                helperText={
                  searchInput.length + ` / ${searchCharacterLimit} characters`
                }
                disabled={state.qnHistories.length === 0 && !areQnHistoriesFiltered()}
              />
            </Grid2>
            <Grid2 size={4}>
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={statusList}
                onChange={(_, selectedOptions) => {
                  setStatusFilter(selectedOptions);
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Status" />
                )}
                disabled={state.qnHistories.length === 0 && !areQnHistoriesFiltered()}
              />
            </Grid2>
          </Grid2>
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
                      whiteSpace="pre"
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
