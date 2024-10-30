import { Box } from "@mui/material";

type TabPanelProps = {
  children?: React.ReactNode;
  selected: string;
  value: string;
};

const TabPanel: React.FC<TabPanelProps> = ({ children, value, selected }) => {
  return (
    <Box
      role="tabpanel"
      sx={(theme) => ({
        display: selected === value ? "flex" : "none",
        flexDirection: "column",
        padding: theme.spacing(0, 2),
        flex: 1,
      })}
    >
      {children}
    </Box>
  );
};

export default TabPanel;
