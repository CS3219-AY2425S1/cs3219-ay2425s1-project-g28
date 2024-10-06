import ServerError from "../../components/ServerError";

const PageNotFound: React.FC = () => {
  return (
    <ServerError
      title="Oops, page not found..."
      subtitle="Unfortunately, we can't find what you're looking for 😥"
    />
  );
};

export default PageNotFound;
