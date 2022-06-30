import React from 'react';
import { Switch, Route, BrowserRouter, Redirect } from 'react-router-dom';
import { useBlockchainContext } from "./context";

import Welcome from './components/welcome';
import Main from './components/main';
import Login from './admin/login';
import Admin from './admin/admin';
import './App.css';
import 'react-notifications/lib/notifications.css';

function App() {
  const [state
  ] = useBlockchainContext();

  return (
    <BrowserRouter>
      <Switch>
        <Route exact path='/' component={Welcome} />
        <Route exact path='/play'>
          {!state.userstate ? <Redirect to="/" /> : <Main />}
        </Route>
        <Route exact path='/login' component={Login} />
        <Route exact path='/admin'>
          {!sessionStorage.getItem('token') ? <Redirect to="/login" /> : <Admin />}
        </Route>
      </Switch>
    </BrowserRouter>
  );
}

export default App;
