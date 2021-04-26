import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import AuthCallback from 'src/pages/github/AuthCallback'
import Index from 'src/pages/Index'
import Home from 'src/pages/Home'

function App() {
  return (
    <BrowserRouter>  
      <Switch>
        <Route exact path="/" component={Index} />
        <Route exact path="/home" component={Home} />
        <Route exact path="/github/auth_callback" component={AuthCallback} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
