import React from 'react';
import ReactDOM from 'react-dom';
import { I18nextProvider } from 'react-i18next';

import i18n from './i18n';
import GameEditor from './game';


ReactDOM.render((
  <I18nextProvider i18n={ i18n }>
    <GameEditor />
  </I18nextProvider>
), document.getElementById('content'))
