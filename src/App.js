import './App.css';
import { 
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect
  } from "react-router-dom";

import Login from './pages/Login';
import Home from './pages/Home';
import Employers from './pages/Employers';
import Employer from './pages/Employer';
import Settoken from './pages/Settoken';
import Day from './pages/Day';
import Positions from './pages/Positions';

import { useQuery, ApolloProvider } from '@apollo/react-hooks';
import { loader } from 'graphql.macro';

import { client } from './Client';

const Test = loader('./model/test.graphql');

const PrivateRoute = function ({ component: Component, ...rest }) {
    const { loading, error, data } = useQuery(Test);
  
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error :(</p>;
  
    if(data.isAuthorized){
      return (
        <Route {...rest} render={(props) => (
          <Component {...props} />
        )} />
      )
    } else {
      return (
        <Route {...rest} render={(props) => (
          <Redirect to='/login' />
        )} />
      )
    }
}

function About() {
    return (
      <div>
        <h2>About</h2>
      </div>
    );
  }

function App() {
    return (
        <ApolloProvider client={client}>
            <Router basename="/app">
            <div className="App">
                <div style={{ flex: 1, padding: "10px" }}>
                <Switch>
                    <PrivateRoute exact path="/" component={Home} />
                    <PrivateRoute path="/about" component={About} />
                    <PrivateRoute path="/employers" component={Employers} />
                    <PrivateRoute path="/employer/:id/edit" component={Employer} />
                    <PrivateRoute path="/positions" component={Positions} />
                    <PrivateRoute path="/day/:day/:month/:year" component={Day} />
                    <Route path="/login" component={Login} />
                    <Route path="/settoken/:token" component={Settoken} />
                </Switch>
                </div>
            </div>
            </Router>
        </ApolloProvider>
    );
  }
  
  export default App;