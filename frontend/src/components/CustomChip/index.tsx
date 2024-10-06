import React from "react";
import { Chip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const CustomChip: React.FC<{
  label: string;
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  onDelete: (event: any) => void;
}> = ({ label, onDelete }) => {
  return (
    <Chip
      size="medium"
      label={label}
      deleteIcon={
        <CloseIcon onMouseDown={(event) => event.stopPropagation()} />
      }
      onDelete={onDelete}
      sx={(theme) => ({
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        marginRight: theme.spacing(1),
        "& .MuiChip-deleteIcon": {
          color: theme.palette.primary.contrastText,
        },
      })}
    />
  );
};

export default CustomChip;
