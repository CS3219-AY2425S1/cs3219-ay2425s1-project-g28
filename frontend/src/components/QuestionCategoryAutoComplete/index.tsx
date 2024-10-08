import { Autocomplete, Chip, TextField } from "@mui/material";
import { createFilterOptions } from "@mui/material/Autocomplete";
import { useEffect, useReducer } from "react";
import reducer, {
  getQuestionCategories,
  initialState,
} from "../../reducers/questionReducer";

interface QuestionCategoryAutoCompleteProps {
  selectedCategories: string[];
  setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>;
}

const QuestionCategoryAutoComplete: React.FC<
  QuestionCategoryAutoCompleteProps
> = ({ selectedCategories, setSelectedCategories }) => {
  const filter = createFilterOptions<string>();
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    getQuestionCategories(dispatch);
  }, []);

  return (
    <Autocomplete
      multiple
      freeSolo
      options={state.questionCategories}
      sx={{ marginTop: 2 }}
      value={selectedCategories}
      onChange={(_e, newCategoriesSelected) => {
        const newValue =
          newCategoriesSelected[newCategoriesSelected.length - 1];
        if (typeof newValue === "string" && newValue.startsWith(`Add: "`)) {
          const newCategory = newValue.slice(6, -1);
          state.questionCategories.push(newCategory);
          setSelectedCategories((prev) => [...prev, newCategory]);
        } else {
          setSelectedCategories(newCategoriesSelected);
        }
      }}
      filterOptions={(options, params) => {
        const filtered = filter(options, params);

        const { inputValue } = params;

        const isExisting = options.some((option) => inputValue === option);

        if (inputValue !== "" && !isExisting) {
          filtered.push(`Add: "${inputValue}"`);
        }

        return filtered;
      }}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => {
          const { key, ...tagProps } = getTagProps({ index });
          return (
            <Chip
              size="small"
              label={
                typeof option === "string" && option.startsWith(`Add: "`)
                  ? /* c8 ignore next */
                    option.slice(6, -1)
                  : option
              }
              key={key}
              {...tagProps}
            />
          );
        })
      }
      renderInput={(params) => <TextField {...params} label="Category" />}
    />
  );
};

export default QuestionCategoryAutoComplete;
