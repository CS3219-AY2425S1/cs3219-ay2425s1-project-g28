import {
  Avatar,
  Button,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  styled,
  TextField,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useForm } from "react-hook-form";
import { useProfile } from "../../contexts/ProfileContext";
import {
  bioValidator,
  nameValidator,
  profilePictureValidator,
} from "../../utils/validators";
import {
  FAILED_PROFILE_UPDATE_MESSAGE,
  PROFILE_PIC_MAX_SIZE_ERROR_MESSAGE,
  USE_AUTH_ERROR_MESSAGE,
  USE_PROFILE_ERROR_MESSAGE,
} from "../../utils/constants";
import { useRef, useState } from "react";
import { Restore } from "@mui/icons-material";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";

interface EditProfileModalProps {
  onClose: () => void;
  open: boolean;
  currProfilePictureUrl?: string;
  currFirstName: string;
  currLastName: string;
  currBiography?: string;
}

const StyledForm = styled("form")(({ theme }) => ({
  marginTop: theme.spacing(1),
}));

const EditProfileModal: React.FC<EditProfileModalProps> = (props) => {
  const {
    open,
    onClose,
    currProfilePictureUrl,
    currFirstName,
    currLastName,
    currBiography,
  } = props;

  const {
    register,
    formState: { errors, isValid, isDirty },
    handleSubmit,
    setValue,
    getFieldState,
  } = useForm<{
    profilePic: File | null;
    profilePictureUrl: string;
    firstName: string;
    lastName: string;
    biography: string;
  }>({
    defaultValues: {
      profilePic: null,
      profilePictureUrl: currProfilePictureUrl || "",
      firstName: currFirstName,
      lastName: currLastName,
      biography: currBiography || "",
    },
    mode: "all",
  });

  const profile = useProfile();

  if (!profile) {
    throw new Error(USE_PROFILE_ERROR_MESSAGE);
  }

  const { user, uploadProfilePicture, updateProfile } = profile;

  const auth = useAuth();

  if (!auth) {
    throw new Error(USE_AUTH_ERROR_MESSAGE);
  }

  const { setUser } = auth;

  // profile pic functionality referenced and adapted from https://dreamix.eu/insights/uploading-files-with-react-hook-form/
  const [picPreview, setPicPreview] = useState<string | null>(
    currProfilePictureUrl || null
  );
  const hiddenFileInputRef = useRef<HTMLInputElement | null>(null);
  const { ref: registerRef, ...rest } = register("profilePic", {
    validate: profilePictureValidator,
  });
  const onClickUpload = () => {
    hiddenFileInputRef.current?.click();
  };
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPicPreview(URL.createObjectURL(file));
      setValue("profilePic", file, { shouldValidate: true, shouldDirty: true });

      if (currProfilePictureUrl) {
        setValue("profilePictureUrl", "", { shouldDirty: true });
      }
    }
  };

  const onClickReset = () => {
    if (getFieldState("profilePic").isDirty) {
      setValue("profilePic", null, { shouldValidate: true, shouldDirty: true });
      if (hiddenFileInputRef.current) {
        hiddenFileInputRef.current.value = "";
      }
    }
    if (getFieldState("profilePictureUrl").isDirty) {
      setValue("profilePictureUrl", currProfilePictureUrl || "", {
        shouldDirty: true,
      });
    }
    setPicPreview(currProfilePictureUrl || "");
  };

  const onClickDelete = () => {
    if (getFieldState("profilePic").isDirty) {
      setValue("profilePic", null, { shouldValidate: true, shouldDirty: true });
      if (hiddenFileInputRef.current) {
        hiddenFileInputRef.current.value = "";
      }
    }
    if (currProfilePictureUrl) {
      setValue("profilePictureUrl", "", { shouldDirty: true });
    }
    setPicPreview(null);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle fontSize={24} sx={{ paddingBottom: 0 }}>
        Edit profile
      </DialogTitle>
      <DialogContent>
        <Container maxWidth="sm" disableGutters>
          <StyledForm
            onSubmit={handleSubmit((data) => {
              if (data.profilePic) {
                uploadProfilePicture(data.profilePic).then((res) => {
                  if (res) {
                    const url_data = {
                      firstName: data.firstName,
                      lastName: data.lastName,
                      biography: data.biography,
                      profilePictureUrl: res.imageUrl,
                    };
                    updateProfile(url_data).then((res) => {
                      if (res && user) {
                        const updatedUser = {
                          id: user.id,
                          username: user.username,
                          firstName: url_data.firstName,
                          lastName: url_data.lastName,
                          email: user.email,
                          biography: url_data.biography,
                          profilePictureUrl: url_data.profilePictureUrl,
                          createdAt: user.createdAt,
                          isAdmin: user.isAdmin,
                        };
                        setUser(updatedUser);
                      }
                    });
                    onClose();
                  } else {
                    toast.error(FAILED_PROFILE_UPDATE_MESSAGE);
                  }
                });
              } else {
                const url_data = {
                  firstName: data.firstName,
                  lastName: data.lastName,
                  biography: data.biography,
                  profilePictureUrl: data.profilePictureUrl,
                };
                updateProfile(url_data).then((res) => {
                  if (res && user) {
                    const updatedUser = {
                      id: user.id,
                      username: user.username,
                      firstName: url_data.firstName,
                      lastName: url_data.lastName,
                      email: user.email,
                      biography: url_data.biography,
                      profilePictureUrl: url_data.profilePictureUrl,
                      createdAt: user.createdAt,
                      isAdmin: user.isAdmin,
                    };
                    setUser(updatedUser);
                  }
                });
                onClose();
              }
            })}
          >
            <Stack
              direction="row"
              spacing={2}
              display="flex"
              alignItems="center"
              sx={(theme) => ({ marginBottom: theme.spacing(2) })}
            >
              {!picPreview ? (
                <Avatar sx={{ width: 56, height: 56 }} />
              ) : (
                <Avatar src={picPreview} sx={{ width: 56, height: 56 }} />
              )}
              {/* input referenced from https://dreamix.eu/insights/uploading-files-with-react-hook-form/ */}
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                {...rest}
                ref={(e) => {
                  registerRef(e);
                  hiddenFileInputRef.current = e;
                }}
                onChange={handleImageChange}
              />
              <Button
                size="small"
                variant="outlined"
                onClick={onClickUpload}
                sx={{ height: 30 }}
              >
                Upload
              </Button>
              <IconButton onClick={onClickReset}>
                <Restore color="success" />
              </IconButton>
              <IconButton onClick={onClickDelete}>
                <DeleteIcon color="error" />
              </IconButton>
            </Stack>
            {errors.profilePic ? (
              <Typography color="error" sx={{ fontSize: 13, marginBottom: 2 }}>
                {errors.profilePic.message}
              </Typography>
            ) : (
              <Typography
                sx={{ fontSize: 13, marginBottom: 2, color: "#808080" }}
              >
                {PROFILE_PIC_MAX_SIZE_ERROR_MESSAGE}
              </Typography>
            )}
            <TextField
              fullWidth
              required
              label="First name"
              margin="normal"
              sx={(theme) => ({ marginTop: theme.spacing(1) })}
              {...register("firstName", {
                setValueAs: (value: string) => value.trim(),
                validate: { nameValidator },
              })}
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
            />
            <TextField
              fullWidth
              required
              label="Last name"
              margin="normal"
              sx={(theme) => ({ marginTop: theme.spacing(1) })}
              {...register("lastName", {
                setValueAs: (value: string) => value.trim(),
                validate: { nameValidator },
              })}
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
            />
            <TextField
              fullWidth
              multiline
              label="Biography"
              margin="normal"
              sx={(theme) => ({ marginTop: theme.spacing(1) })}
              {...register("biography", {
                setValueAs: (value: string) => value.trim(),
                validate: { bioValidator },
              })}
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
                type="submit"
                disabled={!isDirty || !isValid}
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

export default EditProfileModal;
