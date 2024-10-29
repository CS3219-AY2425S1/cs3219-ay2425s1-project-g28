import { Box, BoxProps } from "@mui/material";

type TabPanelProps = {
  children?: React.ReactNode;
  selected: string;
  value: string;
};

const TabPanel: React.FC<TabPanelProps & BoxProps> = ({
  children,
  value,
  selected,
  ...others
}) => {
  return (
    <Box
      role="tabpanel"
      {...others}
      sx={(theme) => ({
        display: selected === value ? "flex" : "none",
        flexDirection: "column",
        padding: theme.spacing(0, 2),
      })}
    >
      {children}
    </Box>
  );
};

export default TabPanel;
