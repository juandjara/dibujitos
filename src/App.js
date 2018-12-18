import React, { Fragment } from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import Header from './Header';
import Home from './Home';
import Show from './Show';
import NotFound from './NotFound';

function App() {
  return (
    <BrowserRouter>
      <Fragment>
        <Header></Header>
        <Switch>
          <Route exact path="/" render={() => (<Redirect to="/home" />)} />
          <Route path="/home" component={Home} />
          <Route path="/show/:slug" component={Show} />
          <Route component={NotFound} />
        </Switch>
      </Fragment>
    </BrowserRouter>
  );
}

export default App;
