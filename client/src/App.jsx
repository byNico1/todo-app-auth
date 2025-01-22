import { useCallback, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import ListHeader from "./components/ListHeader.jsx";
import ListItem from "./components/ListItem.jsx";
import Auth from "./components/Auth.jsx";

const App = () => {
  const [tasks, setTasks] = useState(null);
  const [cookies] = useCookies(["user"]);

  const authToken = cookies.AuthToken;
  const userEmail = cookies.Email;

  const getData = useCallback(async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_SERVERURL}/todos/${userEmail}`
      );
      if (response.status === 200) {
        const json = await response.json();
        setTasks(json);
      }
    } catch (error) {
      console.error(error);
    }
  }, [userEmail]);

  useEffect(() => getData, [getData]);

  //Sort by date
  const sortedTasks = tasks?.sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  return (
    <div className="app">
      {!authToken && <Auth />}
      {authToken && (
        <>
          <ListHeader
            listName={"📃to-do authenticated app"}
            getData={getData}
          />
          <p className="user-email">Welcome {userEmail}</p>
          {sortedTasks?.map((task) => (
            <ListItem key={task.id} task={task} getData={getData} />
          ))}
        </>
      )}
    </div>
  );
};

export default App;
