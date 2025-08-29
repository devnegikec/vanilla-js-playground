
import { getItem } from '/data.utils.js';


const templateFn = (item) => {
  return `<section class="feed__item">
          <img class="feed__item__img" alt="Avatar for logo" src="${item.url}"/>
          <div class="feed__item__description">
              <h2 class="h2-header">${item.name}</h2>
              <p class="p-text">${item.description}</p>
          </div>
      </section>`.trim();
};

// DOM manipulation example
const app =document.getElementById('app');
const feed = document.createElement('div');
feed.classList.add('feed');
const items = Array(1000)
  .fill(null)
  .map((_, index) => templateFn(getItem(index)))
  .join('')
  .trim();
feed.innerHTML = items;
app.insertAdjacentElement('afterbegin', feed);

// Modern JS features
const lazyLoad = () => {
  console.log('Dynamic import available');
};

// Feature detection
if ('serviceWorker' in navigator) {
  console.log('PWA-ready');
}
