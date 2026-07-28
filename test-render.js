import React from 'react';
import { renderToString } from 'react-dom/server';
import ArchiveModal from './src/components/ui/ArchiveModal.jsx';
import ReactDOM from 'react-dom';

const originalCreatePortal = ReactDOM.createPortal;
ReactDOM.createPortal = (node) => node;

global.document = {
  createElement: () => ({ getContext: () => ({}) }),
  body: { style: {} },
  getElementById: () => null
};
global.window = { addEventListener: () => {}, removeEventListener: () => {} };

try {
  const html = renderToString(React.createElement(ArchiveModal, { isOpen: true, item: {} }));
  console.log("Render successful! Output length:", html.length);
  console.log(html.substring(0, 500));
} catch (e) {
  console.error("Render failed:");
  console.error(e);
}
