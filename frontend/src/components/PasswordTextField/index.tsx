import {
  Check,
  Circle,
  Clear,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import {
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  TextFieldProps,
  Tooltip,
} from "@mui/material";
import { forwardRef, useState } from "react";
import { passwordValidators } from "../../utils/validators";

const TooltipMessage: React.FC<{
  input: string;
}> = (props) => {
  const { input } = props;
  return (
    <List>
      {passwordValidators.map((validator, index) => (
        <ListItem
          key={index}
          sx={(theme) => ({
            padding: theme.spacing(0, 0.2),
            alignItems: "flex-start",
          })}
        >
          <ListItemIcon
            sx={(theme) => ({
              minWidth: theme.spacing(4),
              paddingLeft: theme.spacing(0.2),
              paddingTop: theme.spacing(0.7),
            })}
          >
            {!input ? (
              <Circle
                sx={(theme) => ({
                  fontSize: theme.spacing(0.8),
                  marginTop: theme.spacing(0.8),
                  marginLeft: theme.spacing(0.8),
                  color: "white",
                })}
              />
            ) : validator.validate(input) ? (
              <Check
                sx={(theme) => ({
                  fontSize: theme.spacing(2.5),
                  color: "success.main",
                })}
              />
            ) : (
              <Clear
                sx={(theme) => ({
                  fontSize: theme.spacing(2.5),
                  color: "error.main",
                })}
              />
            )}
          </ListItemIcon>
          <ListItemText primary={validator.message} />
        </ListItem>
      ))}
    </List>
  );
};

const PasswordTextField = forwardRef<
  HTMLInputElement,
  TextFieldProps & { displayTooltip?: boolean; input?: string }
>((props, ref) => {
  const { displayTooltip = false, input = "", ...rest } = props;
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [openTooltip, setOpenTooltip] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const handleMouseEnter = () => {
    setOpenTooltip(true);
  };
  const handleMouseLeave = () => {
    if (!isFocused) {
      setOpenTooltip(false);
    }
  };
  const handleFocus = () => {
    setIsFocused(true);
    setOpenTooltip(true);
  };
  const handleBlur = () => {
    setIsFocused(false);
    setOpenTooltip(false);
  };

  return (
    <Tooltip
      open={openTooltip}
      title={displayTooltip && <TooltipMessage input={input} />}
      arrow
      placement="right"
    >
      <TextField
        ref={ref}
        type={showPassword ? "text" : "password"}
        {...rest}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword((prev) => !prev)}
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseUp={(e) => e.preventDefault()}
                  edge="end"
                >
                  {showPassword ? (
                    <VisibilityOff
                      sx={(theme) => ({ fontSize: theme.spacing(2.5) })}
                    />
                  ) : (
                    <Visibility
                      sx={(theme) => ({ fontSize: theme.spacing(2.5) })}
                    />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    </Tooltip>
  );
});

export default PasswordTextField;
