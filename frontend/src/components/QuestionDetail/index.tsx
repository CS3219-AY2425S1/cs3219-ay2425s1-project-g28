import {
  Box,
  Chip,
  List,
  ListItem,
  Stack,
  Typography,
  styled,
} from "@mui/material";
import MDEditor from "@uiw/react-md-editor";
import QuestionCodeTemplates from "../QuestionCodeTemplates";
import theme from "../../theme";

interface QuestionDetailProps {
  title: string;
  complexity: string | null;
  categories: string[];
  description: string;
  cTemplate: string;
  javaTemplate: string;
  pythonTemplate: string;
  inputTestCases: string[];
  outputTestCases: string[];
  showCodeTemplate: boolean;
  showTestCases: boolean;
}

const StyledBox = styled(Box)(({ theme }) => ({
  margin: theme.spacing(2, 0),
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
  background: theme.palette.divider,
  padding: theme.spacing(1, 2),
  borderRadius: theme.spacing(1),
  whiteSpace: "pre-line",
}));

const QuestionDetail: React.FC<QuestionDetailProps> = ({
  title,
  complexity,
  categories,
  description,
  cTemplate,
  javaTemplate,
  pythonTemplate,
  inputTestCases,
  outputTestCases,
  showCodeTemplate,
  showTestCases,
}) => {
  return (
    <Box
      sx={(theme) => ({
        marginTop: theme.spacing(4),
        marginBottom: theme.spacing(4),
      })}
    >
      <Box
        sx={(theme) => ({
          marginTop: theme.spacing(4),
          marginBottom: theme.spacing(4),
        })}
      >
        <Typography component={"h1"} variant="h3">
          {title}
        </Typography>
        <Stack
          direction={"row"}
          sx={(theme) => ({ marginTop: theme.spacing(2) })}
        >
          {complexity && (
            <Chip
              key={complexity}
              label={complexity}
              color="primary"
              sx={(theme) => ({
                marginLeft: theme.spacing(1),
                marginRight: theme.spacing(1),
              })}
            />
          )}
          {categories.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              sx={(theme) => ({
                marginLeft: theme.spacing(1),
                marginRight: theme.spacing(1),
              })}
            />
          ))}
        </Stack>
      </Box>
      <Stack data-color-mode="light" paddingTop={2}>
        <MDEditor.Markdown
          source={description}
          components={{
            h1({ children }) {
              return (
                <Typography component={"h1"} variant="h4">
                  {children}
                </Typography>
              );
            },
            h2({ children }) {
              return (
                <Typography component={"h2"} variant="h5">
                  {children}
                </Typography>
              );
            },
            h3({ children }) {
              return (
                <Typography component={"h3"} variant="h6">
                  {children}
                </Typography>
              );
            },
            p({ children }) {
              return <Typography>{children}</Typography>;
            },
            ol({ children }) {
              return (
                <List component={"ol"} sx={{ listStyleType: "decimal" }}>
                  {children}
                </List>
              );
            },
            ul({ children }) {
              return (
                <List component={"ul"} sx={{ listStyleType: "disc" }}>
                  {children}
                </List>
              );
            },
            li({ children }) {
              return (
                <ListItem sx={{ display: "list-item" }}>{children}</ListItem>
              );
            },
          }}
        />
      </Stack>

      {showTestCases && (
        <Stack marginTop={theme.spacing(4)}>
          <Typography variant="h6">Test Cases</Typography>
          {Array.from({
            length: Math.max(inputTestCases.length, outputTestCases.length),
          }).map((_, index) => (
            <Box key={index}>
              <StyledBox>
                <Typography variant="overline">Input</Typography>
                <StyledTypography fontFamily={"monospace"}>
                  {inputTestCases[index] || "\u00A0"}
                </StyledTypography>
              </StyledBox>
              <StyledBox>
                <Typography variant="overline">Output</Typography>
                <StyledTypography fontFamily={"monospace"}>
                  {outputTestCases[index] || "\u00A0"}
                </StyledTypography>
              </StyledBox>
            </Box>
          ))}
        </Stack>
      )}

      {showCodeTemplate && (
        <QuestionCodeTemplates
          codeTemplates={{
            python: pythonTemplate,
            java: javaTemplate,
            c: cTemplate,
          }}
          isEditable={false}
        />
      )}
    </Box>
  );
};

export default QuestionDetail;
