import { Box, Chip, List, ListItem, Stack, Typography } from "@mui/material";
import MDEditor from "@uiw/react-md-editor";

interface QuestionDetailProps {
  title: string;
  complexity: string | null;
  categories: string[];
  description: string;
}

const QuestionDetail: React.FC<QuestionDetailProps> = ({
  title,
  complexity,
  categories,
  description,
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
    </Box>
  );
};

export default QuestionDetail;
