import ResultsPage from './components/results-page';
import Autocomplete from './components/autocomplete';

import instantsearch from 'instantsearch.js';
import algoliasearch from 'algoliasearch';
import { configure, hits, searchBox, index } from 'instantsearch.js/es/widgets';

import {
  connectHits,
  connectRefinementList,
} from 'instantsearch.js/es/connectors';

let appID = 'OQDKDT4QZ3';
let apiKey = '430ffb2b3aadcab27365e2a840fb98ca';

const search = instantsearch({
  indexName: 'products',
  searchClient: algoliasearch(appID, apiKey),
});

// Customize UI of the Query Suggestion Hits
const renderQSHits = ({ widgetParams, hits }, isFirstRender) => {
  const container = document.querySelector(widgetParams.container);

  container.innerHTML = `<ul>
    ${hits
      .map(
        (item) => `
        <li>${instantsearch.highlight({ hit: item, attribute: 'brand' })}</li>
      `
      )
      .join('')}
  </ul>`;
};

const QSHits = connectHits(renderQSHits);

// Customize UI of the category column
const renderFederatedRefinement = ({ widgetParams, items }, isFirstRender) => {
  const container = document.querySelector(widgetParams.container);

  container.innerHTML = `<ul>
    ${items
      .map(
        (item) => `
        <li>${item.label}</li>
      `
      )
      .join('')}
  </ul>`;
};

const federatedRefinement = connectRefinementList(renderFederatedRefinement);

// Add the widgets
search.addWidgets([
  searchBox({
    container: '#search-box',
    placeholder: 'Search for products',
    showReset: true,
    showSubmit: true,
    showLoadingIndicator: true,
  }),
  index({
    indexName: 'products',
    indexId: 'products',
  }).addWidgets([
    configure({
      hitsPerPage: 7,
    }),
    hits({
      container: '#products',
      templates: {
        empty: 'No results',
        item: `
              <div class="item">
                  <figure class="hit-image-container"><div class="hit-image-container-box"><img class="hit-image" src="{{image}}" alt=""></div></figure>
                  <p class="hit-category">&#8203;​</p>
                  <div class="item-content">
                      <p class="brand hit-tag">{{{_highlightResult.brand.value}}}</p>
                      <p class="name">{{{_highlightResult.name.value}}}</p>
                      <div class="hit-description"><b class="hit-currency">$</b>{{{price}}}</div>
                  </div>
              </div>
              <br>`,
      },
    }),
  ]),
  index({
    indexName: 'products',
  }).addWidgets([
    configure({
      hitsPerPage: 16,
    }),
    QSHits({
      container: '#suggestions',
    }),
  ]),
  federatedRefinement({
    attribute: 'categories',
    container: '#categories',
    limit: 15,
  }),
]);

search.start();

// Display and hide box on focus/blur
search.on('render', () => {
  const federatedResults = document.querySelector(
    '.federated-results-container'
  );
  const searchBox = document.querySelector('.ais-SearchBox-wrapper');

  searchBox.querySelector('input').addEventListener('focus', () => {
    federatedResults.style.display = 'grid';
    searchBox.classList.add('is-open');
  });
  window.addEventListener('click', () => {
    federatedResults.style.display = 'none';
  });
  searchBox.addEventListener('click', (e) => {
    e.stopPropagation();
  });
  federatedResults.addEventListener('click', (e) => {
    e.stopPropagation();
  });
});


class SpencerAndWilliamsSearch {
  constructor() {
    this._initSearch();
    this._registerEvents();
  }

  _initSearch() {
    this.autocompleteDropdown = new Autocomplete();
    this.resultPage = new ResultsPage();
  }

  _registerEvents() {
    //const autocomplete = document.querySelector('.autocomplete');
    const autocomplete = document.querySelector('.federated-results-container');
    const searchbox = document.querySelector('.ais-SearchBox-wrapper');

  //  const searchbox = document.querySelector('#searchbox input');

    searchbox.addEventListener('click', () => {
      autocomplete.style.display = 'block';
    });

    searchbox.addEventListener('blur', () => {
      autocomplete.style.display = 'none';
    });
  }
}

const app = new SpencerAndWilliamsSearch();
