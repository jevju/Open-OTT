import React from 'react';
// import logo from './logo.svg';
// import './App.css';


import UploadFiles from './UploadFiles';
import UploadApplication from './UploadApplication';
import BrowserApplication from './BrowserApplication';


function App() {
  return (
      <div>

          <div style={{
              width: '80%',
              margin: '0 auto',
              marginTop: '40px'
          }}>
            <UploadApplication/>
            <BrowserApplication/>
          </div>

    </div>

  );
}

export default App;
