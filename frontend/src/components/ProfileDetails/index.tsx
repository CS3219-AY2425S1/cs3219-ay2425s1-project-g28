import { Avatar, Box, Typography } from "@mui/material";
import React from "react";

type ProfileSectionProps = {
  profilePictureUrl?: string;
  firstName: string;
  lastName: string;
  username: string;
  biography?: string;
};

const ProfileDetails: React.FC<ProfileSectionProps> = (props) => {
  const { profilePictureUrl, firstName, lastName, username, biography } = props;

  return (
    <Box>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Box
          sx={(theme) => ({
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            marginTop: theme.spacing(2),
            marginBottom: theme.spacing(2),
          })}
        >
          <Avatar 
            src={profilePictureUrl}
            sx={{ width: 56, height: 56 }}/>
          <Box sx={(theme) => ({ marginLeft: theme.spacing(2) })}>
            <Typography fontSize={"h6.fontSize"}>
              {firstName} {lastName}
            </Typography>
            <Typography>@{username}</Typography>
          </Box>
        </Box>
        <Typography
          sx={(theme) => ({
            marginTop: theme.spacing(2),
            marginBottom: theme.spacing(2),
          })}
        >
          {biography}
        </Typography>
      </Box>
    </Box>
  );
};

export default ProfileDetails;
