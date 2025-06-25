import { useParams } from "react-router-dom";

const User = () => {
  const {id} = useParams();
  return<div>
    User page with id : {id}
  </div>
}
export default User;