import { Box } from "@mui/material";

type AppMarginProps = { classname?: string; children: React.ReactNode };

const AppMargin: React.FC<AppMarginProps> = (props) => {
  const { classname, children } = props;
  return (
    <Box
      className={classname}
      sx={(theme) => ({
        marginLeft: theme.spacing(16),
        marginRight: theme.spacing(16),
      })}
    >
      {children}
    </Box>
  );
};

export default AppMargin;
