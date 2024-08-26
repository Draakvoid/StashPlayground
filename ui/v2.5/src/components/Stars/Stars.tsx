import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import StarsPage from "./StarsPage"; // Update the path according to your project structure

const App: React.FC = () => {
  return (
    <Router>
      <Switch>
        <Route path="/stars" component={StarsPage} />
        {/* Other routes */}
      </Switch>
    </Router>
  );
};

export default App;
