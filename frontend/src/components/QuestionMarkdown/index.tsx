import MDEditor, { commands } from "@uiw/react-md-editor";
import { Stack } from "@mui/material";
import "./index.css";

interface QuestionMarkdownProps {
  markdownText: string;
  setMarkdownText: (value: string) => void;
}

const QuestionMarkdown: React.FC<QuestionMarkdownProps> = ({
  markdownText,
  setMarkdownText,
}) => {
  return (
    <Stack data-color-mode="light" paddingTop={2}>
      <MDEditor
        textareaProps={{
          placeholder: "Description",
        }}
        value={markdownText}
        onChange={(value) => setMarkdownText(value || "")}
        preview="edit"
        commands={[
          commands.bold,
          commands.italic,
          commands.strikethrough,
          commands.title,
          commands.link,
          commands.quote,
          commands.codeBlock,
          commands.image,
          commands.table,
          commands.orderedListCommand,
          commands.unorderedListCommand,
        ]}
        extraCommands={[
          commands.codeEdit,
          commands.codeLive,
          commands.codePreview,
          commands.divider,
          commands.help,
        ]}
        visibleDragbar={false}
        height={300}
        minHeight={270}
      />
    </Stack>
  );
};

export default QuestionMarkdown;
