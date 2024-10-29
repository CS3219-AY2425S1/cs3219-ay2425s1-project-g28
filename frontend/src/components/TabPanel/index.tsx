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
    <div
      role="tabpanel"
      style={{
        display: selected === value ? "flex" : "none",
        flexDirection: "column",
      }}
    >
      {value === selected && <Box {...others}>{children}</Box>}
    </div>
  );
};

export default TabPanel;
