/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useState } from "react";
import { userClient } from "../utils/api";
import {
  FAILED_PROFILE_UPDATE_MESSAGE,
  FAILED_PW_UPDATE_MESSAGE,
  SUCCESS_PROFILE_UPDATE_MESSAGE,
  SUCCESS_PW_UPDATE_MESSAGE,
} from "../utils/constants";
import { toast } from "react-toastify";
import axios from "axios";
import { getToken } from "../utils/token";

interface UserProfileBase {
  firstName: string;
  lastName: string;
  biography?: string;
  profilePictureUrl?: string;
}

interface UserProfile extends UserProfileBase {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
}

type ProfileContextType = {
  user: UserProfile | null;
  editProfileOpen: boolean;
  passwordModalOpen: boolean;
  fetchUser: (userId: string) => void;
  uploadProfilePicture: (
    data: File
  ) => Promise<{ message: string; imageUrl: string } | null>;
  updateProfile: (data: UserProfileBase) => Promise<boolean>;
  updatePassword: ({
    oldPassword,
    newPassword,
  }: {
    oldPassword: string;
    newPassword: string;
  }) => void;
  setEditProfileModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setPasswordModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const ProfileContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [editProfileOpen, setEditProfileModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const fetchUser = (userId: string) => {
    userClient
      .get(`/users/${userId}`)
      .then((res) => setUser(res.data.data))
      .catch(() => setUser(null));
  };

  const uploadProfilePicture = async (
    data: File
  ): Promise<{ message: string; imageUrl: string } | null> => {
    const formData = new FormData();
    formData.append("profilePic", data);

    try {
      const res = await userClient.post("/users/images", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    } catch {
      return null;
    }
  };

  const updateProfile = async (data: UserProfileBase): Promise<boolean> => {
    const token = getToken();
    try {
      const res = await userClient.patch(`/users/${user?.id}`, data, {
        headers: { Authorization: token },
      });
      setUser(res.data.data);
      toast.success(SUCCESS_PROFILE_UPDATE_MESSAGE);
      return true;
    } catch (error) {
      console.error("Error:", error);
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data.message || FAILED_PROFILE_UPDATE_MESSAGE;
        toast.error(message);
        return false;
      } else {
        toast.error(FAILED_PROFILE_UPDATE_MESSAGE);
        return false;
      }
    }
  };

  const updatePassword = async ({
    oldPassword,
    newPassword,
  }: {
    oldPassword: string;
    newPassword: string;
  }) => {
    const token = getToken();
    await userClient
      .patch(
        `/users/${user?.id}`,
        { oldPassword, newPassword },
        { headers: { Authorization: token } }
      )
      .then(() => toast.success(SUCCESS_PW_UPDATE_MESSAGE))
      .catch((err) => {
        const message = err.response?.data.message || FAILED_PW_UPDATE_MESSAGE;
        toast.error(message);
      });
  };

  return (
    <ProfileContext.Provider
      value={{
        user,
        passwordModalOpen,
        editProfileOpen,
        fetchUser,
        uploadProfilePicture,
        updateProfile,
        updatePassword,
        setEditProfileModalOpen,
        setPasswordModalOpen,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);

export default ProfileContextProvider;
