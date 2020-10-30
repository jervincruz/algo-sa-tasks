import algoliasearch from 'algoliasearch';
import instantsearch from 'instantsearch.js';

// Instant Search Widgets
import { hits, searchBox, configure } from 'instantsearch.js/es/widgets';

// Autocomplete Template
import autocompleteProductTemplate from '../templates/autocomplete-product';

/**
 * @class Autocomplete
 * @description Instant Search class to display content in the page's autocomplete
 */
class Autocomplete {
  /**
   * @constructor
   */
  constructor() {
    this._registerClient();
    this._registerWidgets();
    this._startSearch();
  }

  /**
   * @private
   * Handles creating the search client and creating an instance of instant search
   * @return {void}
   */
  _registerClient() {
    this._searchClient = algoliasearch('latency', '6be0576ff61c053d5f9a3225e2a90f76');

    this._searchInstance = instantsearch({
      indexName: 'instant_search',
      searchClient: this._searchClient,
    });
  }

  /**
   * @private
   * Adds widgets to the Algolia instant search instance
   * @return {void}
   */
  _registerWidgets() {


    // Customize UI of the Query Suggestion Hits
    const renderQSHits = ({ widgetParams, hits }, isFirstRender) => {
      const container = document.querySelector(widgetParams.container);

      container.innerHTML = `<ul>
        ${hits
          .map(
            (item) => `
            <li>${instantsearch.highlight({ hit: item, attribute: 'query' })}</li>
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


    this._searchInstance.addWidgets([
      searchBox({
        container: '#search-box',
        placeholder: 'Search for products',
        showReset: true,
        showSubmit: true,
        showLoadingIndicator: true,
      }),
      index({
        indexName: 'instant_search',
        indexId: 'products',
      }).addWidgets([
        configure({
          hitsPerPage: 3,
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
                          <div class="hit-description">{{{price}}}<b class="hit-currency">$</b></div>
                      </div>
                  </div>
                  <br>`,
          },
        }),
      ]),
      index({
        indexName: 'query_suggestions',
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
  }

  /**
   * @private
   * Starts instant search after widgets are registered
   * @return {void}
   */
  _startSearch() {
    this._searchInstance.start();
  }
}

export default Autocomplete;
