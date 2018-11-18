import React, { Fragment } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Header from './Header';
import Home from './Home';
import Show from './Show';

function App() {
  return (
    <BrowserRouter>
      <Fragment>
        <Header></Header>
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/show/:slug" component={Show} />
        </Switch>
      </Fragment>
    </BrowserRouter>
  );
}

export default App;
