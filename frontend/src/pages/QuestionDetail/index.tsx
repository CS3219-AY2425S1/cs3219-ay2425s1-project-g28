import { useEffect, useReducer } from "react";
import { useParams } from "react-router-dom";
import AppMargin from "../../components/AppMargin";
import ServerError from "../../components/ServerError";
import QuestionDetailComponent from "../../components/QuestionDetail";
import reducer, {
  getQuestionById,
  initialState,
  setSelectedQuestionError,
} from "../../reducers/questionReducer";

const QuestionDetail: React.FC = () => {
  const { questionId } = useParams<{ questionId: string }>();
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (!questionId) {
      setSelectedQuestionError("Unable to fetch question.", dispatch);
      return;
    }

    getQuestionById(questionId, dispatch);
    // eslint-disable-next-line  react-hooks/exhaustive-deps
  }, []);

  if (!state.selectedQuestion) {
    if (state.selectedQuestionError) {
      return (
        <ServerError
          title="Question not found..."
          subtitle="Unfortunately, we can't find what you're looking for 😥"
        />
      );
    } else {
      return;
    }
  }

  return (
    <AppMargin>
      <QuestionDetailComponent
        title={state.selectedQuestion.title}
        complexity={state.selectedQuestion.complexity}
        categories={state.selectedQuestion.categories}
        description={state.selectedQuestion.description}
        cTemplate={state.selectedQuestion.cTemplate}
        javaTemplate={state.selectedQuestion.javaTemplate}
        pythonTemplate={state.selectedQuestion.pythonTemplate}
        inputTestCases={state.selectedQuestion.inputs}
        outputTestCases={state.selectedQuestion.outputs}
        showCodeTemplate={false}
        showTestCases={true}
      />
    </AppMargin>
  );
};

export default QuestionDetail;
