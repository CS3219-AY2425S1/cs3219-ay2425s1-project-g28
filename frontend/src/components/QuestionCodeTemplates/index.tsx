import { HelpOutlined } from "@mui/icons-material";
import {
  Box,
  IconButton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import CodeMirror from "@uiw/react-codemirror";
import { EditorView } from "@codemirror/view";
import { indentUnit } from "@codemirror/language";
import { langs } from "@uiw/codemirror-extensions-langs";
import { basicSetup } from "@uiw/codemirror-extensions-basic-setup";
import { useState } from "react";
import { CODE_TEMPLATES_TOOLTIP_MESSAGE } from "../../utils/constants";

interface QuestionCodeTemplatesProps {
  codeTemplates: {
    [key: string]: string;
  };
  setCodeTemplates?: React.Dispatch<
    React.SetStateAction<{
      [key: string]: string;
    }>
  >;
  isEditable: boolean;
}

const languageSupport = {
  python: langs.python(),
  java: langs.java(),
  c: langs.c(),
};

const QuestionCodeTemplates: React.FC<QuestionCodeTemplatesProps> = ({
  codeTemplates,
  setCodeTemplates,
  isEditable,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>("python");

  const handleLanguageChange = (
    _: React.MouseEvent<HTMLElement>,
    language: string
  ) => {
    if (language) {
      setSelectedLanguage(language);
    }
  };

  const handleCodeChange = (value: string) => {
    if (setCodeTemplates) {
      setCodeTemplates((prevTemplates) => ({
        ...prevTemplates,
        [selectedLanguage]: value,
      }));
    }
  };

  return (
    <Box display="flex" flexDirection="column" marginTop={2}>
      <Stack direction="row" alignItems="center">
        <Typography variant="h6">Code Templates</Typography>
        <Tooltip
          title={
            <Typography variant="body2">
              <span
                dangerouslySetInnerHTML={{
                  __html: CODE_TEMPLATES_TOOLTIP_MESSAGE,
                }}
              />
            </Typography>
          }
          placement="right"
          arrow
        >
          <IconButton>
            <HelpOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
      <ToggleButtonGroup
        value={selectedLanguage}
        exclusive
        onChange={handleLanguageChange}
        sx={{
          marginY: 2,
          height: 42,
        }}
        fullWidth
      >
        <ToggleButton value="python">Python</ToggleButton>
        <ToggleButton value="java">Java</ToggleButton>
        <ToggleButton value="c">C</ToggleButton>
      </ToggleButtonGroup>

      <CodeMirror
        style={{ fontSize: "14px" }}
        basicSetup={false}
        id="codeEditor"
        value={codeTemplates[selectedLanguage]}
        extensions={[
          indentUnit.of("\t"),
          basicSetup(),
          languageSupport[selectedLanguage as keyof typeof languageSupport],
          EditorView.lineWrapping,
          EditorView.editable.of(isEditable),
        ]}
        onChange={handleCodeChange}
      />
    </Box>
  );
};

export default QuestionCodeTemplates;
