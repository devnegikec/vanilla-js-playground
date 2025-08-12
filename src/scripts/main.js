// ES Modules supported out-of-the-box
import { greet } from './utils.js';

// DOM manipulation example
document.getElementById('app').innerHTML = greet('Developer');

// Modern JS features
const lazyLoad = () => {
  console.log('Dynamic import available');
};

// Feature detection
if ('serviceWorker' in navigator) {
  console.log('PWA-ready');
}