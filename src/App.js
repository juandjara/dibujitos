import React, { Fragment } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Header from './Header';
import Home from './Home';

function App() {
  return (
    <BrowserRouter>
      <Fragment>
        <Header></Header>
        <Switch>
          <Route path="/" component={Home} />
        </Switch>
      </Fragment>
    </BrowserRouter>
  );
}

export default App;
