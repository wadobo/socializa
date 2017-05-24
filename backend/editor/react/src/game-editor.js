import React from 'react';
import ReactDOM from 'react-dom';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

import i18n from './i18n';
import GameEditor from './game';
import GameApp from './reducers';


let store = createStore(GameApp);
window.store = store;


ReactDOM.render((
  <I18nextProvider i18n={ i18n }>
    <Provider store={ store }>
      <GameEditor />
    </Provider>
  </I18nextProvider>
), document.getElementById('content'))
