import {
  Autocomplete,
  Box,
  Button,
  Card,
  FormControl,
  Grid2,
  TextField,
  Typography,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";
import { useEffect, useReducer, useState } from "react";

import classes from "./index.module.css";
import AppMargin from "../../components/AppMargin";
import {
  complexityList,
  languageList,
  maxMatchTimeout,
  minMatchTimeout,
  QUESTION_DOES_NOT_EXIST_ERROR,
  USE_MATCH_ERROR_MESSAGE,
} from "../../utils/constants";
import reducer, {
  getQuestionCategories,
  getQuestionList,
  initialState as initialState,
} from "../../reducers/questionReducer";
import CustomChip from "../../components/CustomChip";
import homepageImage from "/homepage_image.svg";
import { useMatch } from "../../contexts/MatchContext";
import Loader from "../../components/Loader";
import { toast } from "react-toastify";

const Home: React.FC = () => {
  const [complexity, setComplexity] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [language, setLanguage] = useState<string>("");
  const [timeout, setTimeout] = useState<number | undefined>(30);

  const [isQueryingQnDB, setIsQueryingQnDB] = useState<boolean>(false);

  const [state, dispatch] = useReducer(reducer, initialState);

  const match = useMatch();
  if (!match) {
    throw new Error(USE_MATCH_ERROR_MESSAGE);
  }
  const { findMatch, loading } = match;

  const isSmallerThan1100px = useMediaQuery("(max-width:1100px)");

  useEffect(() => {
    getQuestionCategories(dispatch);
  }, []);

  useEffect(() => {
    if (isQueryingQnDB) {
      if (state.questions.length > 0) {
        findMatch(complexity, category, language, timeout!);
      } else {
        toast.error(QUESTION_DOES_NOT_EXIST_ERROR);
      }
    }
    setIsQueryingQnDB(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.questions]);

  if (loading) {
    return <Loader />;
  }

  return (
    <AppMargin
      classname={`${classes.fullheight} ${classes.center} ${classes.margins}`}
    >
      <Typography
        component={"h1"}
        variant="h1"
        textAlign={"center"}
        sx={(theme) => ({
          fontWeight: "bold",
          color: "primary.main",
          marginBottom: theme.spacing(4),
        })}
      >
        Start an interactive practice session today!
      </Typography>
      <Typography
        variant="subtitle1"
        textAlign={"center"}
        sx={(theme) => ({
          fontSize: "h5.fontSize",
          marginBottom: theme.spacing(4),
          maxWidth: "80%",
        })}
      >
        Specify your question preferences and sit back as we find you the best
        match.
      </Typography>
      {isSmallerThan1100px && (
        <Box
          component="img"
          src={homepageImage}
          alt="Interview Practice Buddy"
          sx={{
            position: "absolute",
            top: "35%",
            left: "10%",
            width: "128px",
            height: "auto",
            objectFit: "contain",
          }}
        />
      )}
      <Card
        sx={{
          padding: 4,
          width: "100%",
          maxWidth: "700px",
          backgroundColor: "#F5F5F5",
        }}
      >
        <Grid2 container rowSpacing={2} columnSpacing={2} alignItems="center">
          <Grid2 size={2}>
            <Typography
              align="left"
              sx={{ fontWeight: "bold", paddingRight: 2 }}
            >
              Complexity
            </Typography>
          </Grid2>

          <Grid2 size={10}>
            <FormControl
              fullWidth
              required={true}
              sx={{ backgroundColor: "white" }}
            >
              <Autocomplete
                options={complexityList}
                onChange={(_, selectedOption) => {
                  setComplexity(selectedOption || "");
                }}
                renderInput={(params) => <TextField {...params} />}
                renderTags={(tagValue, getTagProps) =>
                  tagValue.map((option, index) => {
                    const tagProps = getTagProps({ index });

                    return (
                      <CustomChip
                        label={option}
                        key={option}
                        onDelete={tagProps.onDelete}
                      />
                    );
                  })
                }
              />
            </FormControl>
          </Grid2>

          <Grid2 size={2}>
            <Typography
              align="left"
              sx={{ fontWeight: "bold", paddingRight: 2 }}
            >
              Category
            </Typography>
          </Grid2>

          <Grid2 size={10}>
            <FormControl
              fullWidth
              required={true}
              sx={{ backgroundColor: "white" }}
            >
              <Autocomplete
                options={state.questionCategories}
                onChange={(_, selectedOption) => {
                  setCategory(selectedOption || "");
                }}
                renderInput={(params) => <TextField {...params} />}
                renderTags={(tagValue, getTagProps) =>
                  tagValue.map((option, index) => {
                    const tagProps = getTagProps({ index });

                    return (
                      <CustomChip
                        label={option}
                        key={option}
                        onDelete={tagProps.onDelete}
                      />
                    );
                  })
                }
              />
            </FormControl>
          </Grid2>

          <Grid2 size={2}>
            <Typography
              align="left"
              sx={{ fontWeight: "bold", paddingRight: 2 }}
            >
              Language
            </Typography>
          </Grid2>

          <Grid2 size={10}>
            <FormControl
              fullWidth
              required={true}
              sx={{ backgroundColor: "white" }}
            >
              <Autocomplete
                options={languageList}
                onChange={(_, selectedOption) => {
                  setLanguage(selectedOption || "");
                }}
                renderInput={(params) => <TextField {...params} />}
                renderTags={(tagValue, getTagProps) =>
                  tagValue.map((option, index) => {
                    const tagProps = getTagProps({ index });

                    return (
                      <CustomChip
                        label={option}
                        key={option}
                        onDelete={tagProps.onDelete}
                      />
                    );
                  })
                }
              />
            </FormControl>
          </Grid2>

          <Grid2 size={2}>
            <Typography
              align="left"
              sx={{ fontWeight: "bold", paddingRight: 2 }}
            >
              Match Timeout
            </Typography>
          </Grid2>

          <Grid2 size={10}>
            <TextField
              required
              fullWidth
              type="number"
              onKeyDown={(event) => event.key === "e" && event.preventDefault()}
              value={timeout !== undefined ? timeout : ""}
              onChange={(event) => {
                const value = event.target.value;
                const newTimeout = value ? parseInt(value, 10) : undefined;
                setTimeout(newTimeout);
              }}
              helperText={`Set a timeout between ${minMatchTimeout} to ${maxMatchTimeout} seconds`}
              error={
                !timeout ||
                timeout < minMatchTimeout ||
                timeout > maxMatchTimeout
              }
              sx={{
                backgroundColor: "white",
                "& .MuiFormHelperText-root": {
                  margin: "0px",
                  backgroundColor: "#F5F5F5",
                },
              }}
            />
          </Grid2>
        </Grid2>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ marginTop: 2 }}
          disabled={
            !timeout ||
            timeout < minMatchTimeout ||
            timeout > maxMatchTimeout ||
            !complexity ||
            !category ||
            !language
          }
          onClick={() => {
            setIsQueryingQnDB(true);
            getQuestionList(1, 1, "", [complexity], [category], dispatch);
          }}
        >
          {isQueryingQnDB ? <CircularProgress /> : "Find my match!"}
        </Button>
      </Card>
    </AppMargin>
  );
};

export default Home;
