import * as React from 'react';
import Viewport from './Viewport';
import './App.css';
import PropertiesView from './PropertiesView';

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <Viewport/>
        <PropertiesView/>
      </div>
    );
  }
}

export default App;
