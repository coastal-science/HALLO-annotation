import { useSelector } from "react-redux";
import Annotator from "./Annotator";
import Modeldeveloper from "./Modeldeveloper";

const Tutorial = () => {
  const { isPowerUser, id } = useSelector((state) => state.user);

  if (!id) return <></>;

  if (isPowerUser) return <Modeldeveloper />;
  else return <Annotator />;
};

export default Tutorial;
