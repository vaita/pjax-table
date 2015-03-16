(function ($, window) {
  'use strict';
  var slice = Array.prototype.slice;
  
  /**
  *   Table implements script controls for pjax table
  *   "_" prefixed methods are considered internal usage only
  *
  *   @constructor
  *
  *   @param {object} el is the table container element the module is being initialized with
  *   @param {object} options
  *     @param {string} options.url the url to be used for fetching table markup
  *     @param {Array<object>} options.refreshEvents a list of delegated event configurations that should trigger a table refresh.
  *       event listeners are attached at the table container element level, filters are optional.
  *       config example: [{ eventName: 'click', filter: '.my-class-selector' }]
  *     @param {Array<object>} options.plugins a list of jQuery prototype based plugin configurations to be intialized and
  *       re-initialized on table load. Plugins are initialized for each row, being passed the row record and current query state.
  *       config example: [{ target: '[data-plugin-element-selector]', constructorName: 'myPlugin'}]
  *     @param {boolean} options.ajaxOnly Flag for ajax only ( disabled by default )
  *     @param {boolean} options.pushState Passes the push state flag to pjax ( push state enabled by default )
  *     @param {boolean} options.paginated Flag for pagination ( enabled by default )
  *     @param {string} options.pjaxContainer ID Selector for the pjax container, defaults to the initializing
  *       element's id attribute
  *     @param {Function} options.noDataTemplate A function to be used for creating the no data message
  *     @param {string} options.searchId  A selector for a search box to be used with the table.
  *     @param {string} sortQueryKey The key to be used in creating the sort query string
  *     @param {string} pageQueryKey The key to be used in creating the page query string
  *     @param {string} perPageQueryKey The key to be used in creating the per page query string
  *     @param {string} searchQueryKey The key to be used in creating the search query string
  *
  *   Data Attribute Params, parameters expected to be included on the table container element for initialization
  *   @param {string}  data-url the url to be used for fetching table markup
  *   @param {string}  data-pjax-container the selector for the container to be passed to pjax requests
  *   @param {boolean} data-ajax-only whether to not to disable pjax and enable ajax
  *   @param {boolean} data-push-state a flag for whether or not to enable pjax push state
  *   @param {boolean} data-paginated whether or not pagination is enabled
  *   @param {string}  data-search-id an optional search control element id
  *   @param {string}  data-sort-query-key the string key to be used in building the search query
  *   @param {string}  data-page-query-key the string key to be used in building the page query
  *   @param {string}  data-perpage-query-key the string key to be used in building the perpage query
  *   @param {string}  data-search-query-key the string key to be used in building the search query
  *
  *   Notes on search module: 
  *     Events which are registered within the table
  *     search:submit triggers a table search query when triggered by the element specified in options.search_id
  *     search:clear triggers a clearance of the current search query when triggered by the element specified in options.search_id
  *
  *   Events, triggered by the table on the table container element
  *     table:load triggered any time the table has finished loaded, on pjax success for initial load, update, and refresh
  *     table:sort {object}, triggered when a column is sorted, includes direction and property
  *     table:page {object}, triggered when a specific page has been chosen to jump to
  *     table:perpage {object}, triggered when perpage dropdown selection has changed
  *     table:nextpage {object}, triggered when next page in pagination clicked
  *     table:prevpage {object}, triggered when prev page in pagination clicked
  *     table:select {object}, triggered when a row is selected, passing the record object
  *     table:deselect {object}, triggered when a row is deselected, passing the record object
  *     table:select:all {}, triggered when all records are selected using the check all box
  *     table:deselect:all {}, triggered when all records are deselected using the check all box
  *     table:search {object}, triggered when a search query is used to filter the table
  *     table:search:clear {}, triggered when a search query is cleared
  *     table:error {}, triggered when a pjax / ajax error occurs
  *     table:timeout {}, triggered when pjax times out
  */
  function PjaxTable(el, options) {
    this._options = options || {};
    this._$el = $(el);
    this._$tbody = null;

    this._url = this._options.url || this._$el.data('url') || window.location.href;
    this._ajaxOnly = this._options.ajaxOnly || this._$el.data('ajax-only') || false;
    this._pushState = this._options.pushState || this._$el.data('push-state') || true;
    this._paginated = this._options.paginated || this._$el.data('paginated') || true;
    this._pjaxContainer = this._options.pjaxContainer || this._$el.data('pjax-container') || this._$el.attr('id');
    this._noDataTemplate = this._options.noDataTemplate || this._noDataTemplate;
    this._sortQueryKey = this._options.sortQueryKey || this._$el.data('sort-query-key') || 'order';
    this._pageQueryKey = this._options.pageQueryKey || this._$el.data('page-query-key') || 'page';
    this._perPageQueryKey = this._options.perPageQueryKey || this._$el.data('perpage-query-key') || 'perpage';
    this._searchQueryKey = this._options.searchQueryKey || this._$el.data('search-query-key') || 'q';
    
    this._totalRows = null;
    
    var searchId = this._options.searchId || this._$el.data('search-id') || null;
    this._$searchBox = searchId ? $(searchId) : null;

    this._sortMap = { asc: 'desc', desc: 'asc' };
    this._queryState = {};
    
    this._init();
  }

  $.extend(PjaxTable.prototype, {
    
    _noDataTemplate: function(numColumns) {
      return [
        '<tr>',
          '<td class="empty-table-content" colspan="' + numColumns + '">',
            'Whoops! Looks like there\'s nothing in this table!',
          '</td>',
        '</tr>'
      ].join('');
    },

    _createSortQuery: function(property, order) {
      var query = {};
      query[this._sortQueryKey] = property + '__' + order;
      return query;
    },

    _desyncSort: function() {
      delete this._queryState[this._sortQueryKey];
    },

    _createPageQuery: function(page) {
      var query = {};
      query[this._pageQueryKey] = page;
      return query;
    },

    _createPerPageQuery: function(perpage) {
      var query = {};
      query[this._perPageQueryKey] = perpage;
      return query;
    },

    _createSearchQuery: function(searchStr) {
      var query = {};
      query[this._searchQueryKey] = searchStr;
      return query;
    },

    _desyncSearch: function() {
      delete this._queryState[this._searchQueryKey];
    },

    _syncSort: function(property, order) {
      $.extend(this._queryState, this._createSortQuery(property, order));
    },

    _syncPage: function(page) {
      $.extend(this._queryState, this._createPageQuery(page));
    },

    _syncPerPage: function(perpage) {
      $.extend(this._queryState, this._createPerPageQuery(perpage));
    },

    _syncSearch: function(searchStr) {
      $.extend(this._queryState, this._createSearchQuery(searchStr));
    },

    _load: function() {
      if (!this._ajaxOnly) {
        return $.pjax({
          url: this._url,
          data: this._queryState,
          push: this._pushState,
          container: this._pjaxContainer
        });
      }

      this._addLoadMask();
      return $.ajax($.extend({
        type: 'GET',
        url: this._url,
        data: this._queryState,
        context: this
      }, params))
      .done(this._onAjaxSucces)
      .fail(this._onAjaxError);
    },

    _addLoadMask: function() {
      var $loadMask = $('<div class="ui-load-mask">');
      this._$el.css({ position: 'relative' });
      this._$el.append($loadMask);
      $loadMask.spin(options.loadMaskConfig || 'small');
    },
    
    _removeLoadMask: function() {
      this._$el.find('.ui-load-mask').remove();
      this._$el.css({ position: '' });
    },

    // Syncs the query state with what's being displayed
    _syncQueryState: function() {
      var $table = this._$el.find('table');
      var $pagination = this._$el.find('.ui-pagination');
      var page = $pagination.data('current-page');
      var perpage = $pagination.data('current-perpage');
      var sortProperty = $table.data('current-sort-property');
      var sortOrder = $table.data('current-sort-order');
      var searchStr = $table.data('current-search-str');

      if (this._paginated) {
        this._syncPage(page);
        this._syncPerPage(perpage);
      }

      if (sortProperty) {
        this._syncSort(sortProperty, sortOrder)
      } else {
        this._desyncSort();
      }

      if (searchQuery) {
        this._syncSearch(searchStr);
      } else {
        this._desyncSearch();
      }
    },

    _onTableLoaded: function() {
      // create this shortcut whenever the table loads
      this._$tbody = this._$el.find('tbody');

      var totalRows = this._$el.find('table').data('total-rows');
      this._totalRows = !isNaN(totalRows) ? parseInt(totalRows) : 0;

      if (this._totalRows === 0) {
        this._$tbody.html(this._noDataTemplate(this.getNumColumns()));
      }

      this._$el.trigger('table:load');
    },

    _onAjaxSucces: function(data, textStatus, jqXHR) {
      this._$el.html(data);
      this._onTableLoaded();
      this._removeLoadMask();
    },

    _onAjaxError: function(jqXHR, textStatus, errorThrown) {
      this._removeLoadMask();
      this._$el.trigger('table:error');
    },

    _onPjaxStart: function(e) {
      this._addLoadMask();
    },

    _onPjaxBeforeReplace: function(e) {
      e.stopPropagation();
      this._removeLoadMask();
    },

    _onPjaxTimeout: function(e) {
      e.preventDefault(); // prevent retry
      this._$el.trigger('table:timeout');
    },

    _onPjaxSuccess: function (e, data, status, xhr, options) {
      this._onTableLoaded();
      e.stopPropagation();
    },

    _onPjaxError: function (e, xhr, textStatus, error, options) {
      e.stopPropagation();
      this._removeLoadMask();
      this._$el.trigger('table:error');
    },

    _onClickSortable: function (e) {
      var $sortable = $(e.target).closest('th[data-sortable="true"]');
      var property = $sortable.data('property');
      var order = this._sortMap[$sortable.data('current-sort-order')] || $sortable.data('default-sort-order');

      this._$el.trigger('table:sort', this._createSortQuery(property, order));
      this._syncSort(property, order);
      this._load();
    },

    _onPerPageSelect: function (e) {
      var perpage = $(e.currentTarget).data('value');

      this._$el.trigger('table:perpage', this._createPerPageQuery(perpage));
      this._syncPerPage(perpage);
      this._syncPage(1); // reset the page to 1 when changing per page
      this._load();
    },

    _onPageSelect: function (e) {
      var pageIndex = $(e.currentTarget).data('value');

      this._$el.trigger('table:page', this._createPageQuery(pageIndex));
      this._syncPage(pageIndex);
      this._load();
    },

    _onPrevPageSelect: function (e) {
      var pageIndex = parseInt($el.find('.ui-pagination').data('current-page'));
      var prevPageIndex = pageIndex - 1;

      this._$el.trigger('table:prevpage', this._createPageQuery(prevPageIndex));
      this._syncPage(prevPageIndex);
      this._load();
    },

    _onNextPageSelect: function (e) {
      var pageIndex = parseInt($el.find('.ui-pagination').data('current-page'));
      var nextPageIndex = pageIndex + 1;

      this._$el.trigger('table:nextpage', this._createPageQuery(nextPageIndex));
      this._syncPage(nextPageIndex);
      this._load();
    },

    _onRowCheckboxSelect: function (e) {
      var $checkbox = $(this);
      var property = $checkbox.parent('th').data('property');

      if ($checkbox.prop('checked')) {
        this._$el.find('td[data-property=' + property + '] input[type="checkbox"]').prop('checked', true);
        this._$tbody.find('tr').addClass('ui-selected');
        this._$el.trigger('select_all:table');
      } else {
        this._$el.find('td[data-property=' + property + '] input[type="checkbox"]').prop('checked', false);
        this._$tbody.find('tr').removeClass('ui-selected');
        this._$el.trigger('deselect_all:table');
      }
    },

    _onClickIdColumn: function(e) {
      $(this).closest('tr').data('shiftKey', e.shiftKey);
    },

    _onRowCheckboxChange: function (e) {
      var $checkbox = $(this);
      var $tr = $(this).closest('tr');
      var record = getRecord($tr.get(0));
      var shiftClickId = this._$el.data('last_selected');

      // handle shift click by selecting everything inbetween
      if (shiftClickId && $tr.data('shiftKey')) {
        this._shiftSelectRows($tr, shiftClickId);
      }
      // always set last selected, whether or not it was checked on or off
      this._$el.data('last_selected', record.id);

      // ignore header check all input for selected state
      if ($checkbox.prop('checked')) {
        $tr.addClass('ui-selected');
        this._$el.trigger('table:select', record);
      } else {
        $tr.removeClass('ui-selected');
        this._$el.find('th[data-select-all-enabled="true"] input[type="checkbox"]').prop('checked', false);
        this._$el.trigger('table:deselect', record);
      }
    },

    _shiftSelectRows: function($tr, shiftClickId) {
      var $lastSelectedTr = this._$tbody.find('td[data-value="' + shiftClickId + '"]').parent();
      var $allVisibleRows = this._$tbody.find('tr');
      var currentSelectedIndex = $allVisibleRows.index($tr);
      var lastSelectedIndex = $allVisibleRows.index($lastSelectedTr);
      var start = Math.min(currentSelectedIndex, lastSelectedIndex);
      var end = Math.max(currentSelectedIndex, lastSelectedIndex);
      
      // if selecting from top down, don't process the first one
      if (lastSelectedIndex < currentSelectedIndex && $lastSelectedTr.hasClass('ui-selected')) {
        ++start;
      } else {
        ++end;
      }

      $allVisibleRows.slice(start, end).each(function() {
        var $row = $(this);
        if (!$lastSelectedTr.hasClass('ui-selected')) {
          $row.removeClass('ui-selected').children().first().find('input').prop('checked', false);
        } else {
          $row.addClass('ui-selected').children().first().find('input').prop('checked', true);
        }
      });
    },

    _onSubmitSearch: function(e, searchStr) {
      this._$el.trigger('table:search', this._createSearchQuery(searchStr));
      this._syncSearch(searchStr);
      this._syncPage(1);
      this._load();
    },

    _onClearSearch: function(e) {
      this._$el.trigger('table:search:clear');
      this._desyncSearch();
      this._syncPage(1);
      this._load();
    },

    /**
    *   Generic row level plugin initialization, providing the row record as a pojo ( plugins expected to be prototype based )
    *
    *   Notes:
    *     uses extend for the queryState to copy primitives so that the plugin has access to the current table state but cannot directly edit it
    *
    *   @param {Array.<object>}
    *     @param {string} (definition.target) the plugin target selector to be used with find on the row
    *     @param {string} (definition.costructorName) the name of the plugin constructor
    *     @param {object} (definition.options) options to be passed to the plugin (currently is not allowed to override table query state or row record)
    */
    _applyPlugins: function(pluginDefinitions) {
      $.each(pluginDefinitions, function(index, definition) {
        this._$el.on('click', definition.target, function(e) {
          var $currentTarget = $(e.currentTarget);
          if (!$currentTarget.data('plugin-initialized')) {
            $currentTarget[definition.constructorName]($.extend({}, definition.options, {
              queryState: $.extend({}, this._queryState), // copy
              record: this._getRecord($currentTarget.closest('tr').get(0)) // creates a new object based on DOM attributes
            }));
            $currentTarget.data('plugin-initialized', true);
          }
        }.bind(this));
      }.bind(this));
    },

    _onPluginRefreshEvent: function(e) {
      this.refresh();
    },

    /**
    *   Adds event listeners to the table element ( with filters when provided ) that will trigger refresh
    *   See docs at top of table module for details on the structure of refresh events configuration
    */
    _initPluginRefreshEvents: function() {
      var length;
      var refreshEvent;
      if (this._options.refreshEvents) {
        length = this._options.refreshEvents.length;
        for (var i = 0; i < length; i++) {
          refreshEvent = options.refreshEvents[i];
          if (refreshEvent.filter) {
            this._$el.on(refreshEvent.eventName, refreshEvent.filter, this._onPluginRefreshEvent.bind(this));
          } else {
            this._$el.on(refreshEvent.eventName, this._onPluginRefreshEvent.bind(this));
          }
        }
      }
    },

    _init: function() {
      this._syncQueryState();
      this._onTableLoaded();
      
      // pjax timing out, we want to cancel the automatic retry
      this._$el.on('pjax:timeout', this._onPjaxTimeout.bind(this));
      this._$el.on('pjax:success', this._onPjaxSuccess.bind(this));
      this._$el.on('pjax:start', this._onPjaxStart.bind(this));
      this._$el.on('pjax:beforeReplace', this._onPjaxBeforeReplace.bind(this));
      this._$el.on('pjax:error', this._onPjaxError.bind(this));

      this._$el.on('click', 'th[data-sortable="true"]', this._onClickSortable.bind(this));
      this._$el.on('click', '.ui-perpage-dropdown > li', this._onPerPageSelect.bind(this));
      this._$el.on('click', '.ui-page-select-dropdown > li', this._onPageSelect.bind(this));
      this._$el.on('click', '.ui-prev-page', this._onPrevPageSelect.bind(this));
      this._$el.on('click', '.ui-next-page', this._onNextPageSelect.bind(this));
      this._$el.on('change', 
        'th[data-select-all-enabled="true"] input[type="checkbox"]',
        this._onRowCheckboxSelect.bind(this)
      );
      this._$el.on('click', 'td[data-property="id"]', this._onClickIdColumn.bind(this));
      this._$el.on('change', 'input[type="checkbox"]', this._onRowCheckboxChange.bind(this));

      if (this._$searchBox) {
        this._$searchBox.on('search:submit', this._onSubmitSearch.bind(this));
        this._$searchBox.on('search:clear', this._onClearSearch.bind(this));
      }
    
      this.refreshPlugins();
      this._initPluginRefreshEvents();
    },

    /**
    *   @param {Object} a tr DOM element
    *   @return {Object}
    */
    _getRecord: function(rowEl) {
      var record = { additionalFields: {} };

      $(rowEl).children().each(function () {
        var $cell = $(this);
        var data = $cell.data();

        record[data.property] = data.value;

        // add additional fields, ignore constructures and objects / arrays, allow primitives
        $.each($cell.data(), function (key, value) {
          if (key !== 'property' && key !== 'value') {
            if (typeof value !== 'function' && typeof value !== 'object') {
              record.additionalFields[key] = value;
            }
          }
        });
      });

      return record;
    },

    /**
    *   Finds a row by id by comparing against the cell with data-propert="id", typically the first cell
    *   @param {number} id the id to match
    *   @return {object} the row DOM element
    */
    _findRowById: function(id) {
      return this._$tbody.find('tr').filter(function (index, rowElement) {
        if (this._getRecord(this).id === id) {
          return true;
        }
        return false;
      }.bind(this)).get(0);
    },

    /**
    *   Updates cell values for a given row, using jQuery.data() which updates them in memory, not on the original element attributes
    *     * Note: for editable cells, and eventually all cells, with appropriate attributes, this will update the cell display value as well
    *   @param {object} the row DOM element
    *   @param {object} the object of key value pairs to match and update
    */
    _updateRowFields: function(row, data, callback) {
      var $row = $(row);

      $.each(data, function (key, value) {
        var $cell = $row.find('td[data-property="' + key + '"]');
        $cell.data(key, value);
        $cell.find($cell.data('display-target')).text(value);

        if (typeof callback === 'function') {
          callback($cell, key, value);
        }
      });
    },

    /**
    *   Refreshes the configured plugins by applying them to all rows
    *   See docs at top of table module or applyPlugins for plugin defintion details
    */
    refreshPlugins: function() {
      if (this._options.plugins) {
        this._applyPlugins(this._options.plugins);
      }
    },

    /**
    *  Updates parameters and triggers a table refresh
    *  @param {Object} key value pairs to update the query state with
    *  @return {Object} _this, the module instance object
    */
    update: function(data) {
      this.updateParameters(data);
      this._load();
      return this;
    },

    /**
    *  @return {Object} _this, the module instance object
    */
    refresh: function() {
      this._load();
      return this;
    },

    /**
    * @return {string} the url used by this table
    */
    getUrl: function() {
      return this._url;
    },

    /**
    *  @param {Object} key value pairs to update the query state with
    *  @return {Object} _this, the module instance object
    */
    updateParameters: function(data) {
      for (var key in data) {
        if(typeof data[key] === 'undefined' || data[key] === null){
          delete this._queryState[key];
        } else {
          this._queryState[key] = data[key];
        }
      }

      return this;
    },

    /**
    *   @param {string|Array.<string>|function} a string key, array of keys, or function to filter
    *   @return {object} _this, the module instance object
    *
    *   Returning true from a filter function will delete the current key in iteration
    */
    removeParameters: function(options) {
      if (!options) {
        return this;
      }

      if (typeof options === 'string') {
        // Remove a single item from the queryState
        delete this._queryState[options];
      } else if (Array.isArray(options)) {
        // Remove all of the items in the array
        for (var i = 0; i < options.length; i++) {
          delete this._queryState[options[i]];
        }
      } else if (typeof options === 'function') {
        // deleting while iterating is okay
        $.each(this._queryState, function(key, value) {
          if (options(key, value)) {
            delete this._queryState[key];
          }
        }.bind(this));
      } else {
        throw new Error('Must provide a string or array');
      }

      return this;
    },

    /**
    *  @return {Object} the query state
    */
    getParameters: function(options) {
      var state = $.extend({}, this._queryState);

      if (typeof options === 'function') {
        $.each(state, function(key, value) {
          if (!options(key, value)) {
            delete state[key];
          }
        });
      }

      return state;
    },

    /**
    *   @return {number} number of rows
    */
    getNumRecords: function() {
      return this._$tbody.find('tr').length;
    },

    /**
    *   @return {number} number of columns
    *   Note: this is only the number of columns in the header.  If subsequent rows include
    *   subheaders, split columns, or columns with colspans other than 1, this will NOT return
    *   the correct number of columns for those rows.
    */
    getNumColumns: function() {
      return this._$el.find('thead tr').children().length;
    },

    /**
    *   @return {boolean} has any selected values
    */
    hasSelected: function() {
      return this._$tbody.find('tr.ui-selected').length > 0;
    },

    /**
    *   @return {number} number of selected rows
    */
    getNumSelected: function() {
      return this._$tbody.find('tr.ui-selected').length;
    },

    /**
    *   @return {Array.<object>} selected records
    */
    getSelected: function(formatFn) {
      return this._$tbody.find('tr.ui-selected').map(function (index, rowElement) {
        if (typeof formatFn === 'function') {
          return formatFn(this._getRecord(this));
        }
        return this._getRecord(this);
      }.bind(this)).get();
    },

    /**
    * @return {Array.<Numbers>} selected records
    */
    getSelectedIds: function() {
      return this.getSelected().map(function(record) { return record.id; });
    },

    /**
    *   @return {Array.<object>} all records
    */
    getAllRecords: function() {
      return this._$tbody.find('tr').map(function (index, rowElement) {
        return this._getRecord(this);
      }.bind(this)).get();
    },

    /**
    *   Updates cell values for a given row, using jQuery.data() which updates them in memory, not on the original element attributes
    *     * Note: for editable cells, and eventually all cells, with appropriate attributes, this will update the cell display value as well
    *     *       see updateRowFields for more details
    *
    *   @param {number} the id of the row, located in the row's first cell, data-property="id"
    *   @param {Object} and object of key value pairs to update corresponding cell data-property - data-value pairs
    *   @param {function} a callback to process the row
    */
    updateRow: function(id, data, callback) {
      this._updateRowFields(this._findRowById(id), data, callback);
    },

    getTotalRows: function() {
      return this._totalRows;
    }
  });
    
  $.fn.pjaxTable = function(options) {
    var args = slice.call(arguments);
    var allowedMethods = [
      'update',
      'refresh',
      'refreshPlugins',
      'getUrl',
      'updateParameters',
      'removeParameters',
      'getParameters',
      'getNumRecords',
      'getNumColumns',
      'hasSelected',
      'getNumSelected',
      'getSelected',
      'getSelectedIds',
      'getAllRecords',
      'updateRow',
      'getTotalRows'
    ];
    var values = []; // return values

    $(this).each(function() {
      // get the current instance or create a new one
      var $el = $(this);
      var widget = $el.data('pjaxTable');
      var methodReturn;

      if (!widget) {
        widget = $el.data('pjaxTable', new PjaxTable(this, options)).data('pjaxTable');
      }

      // execute methods and return the method return or this element for chaining
      if (typeof options === 'string' && widget) {
        // special case for resetting widgets, cleanup and reset
        if (options === 'destroy') {
          if (typeof widget.destroy === 'function') {
            widget.destroy();
          }
          
          delete $el.data()[finalName];
          $el = null;
        } else if (indexOf(options, allowedMethods) === -1) {
          throw new Error('Invalid method: ' + options);
        } else {
          methodReturn = widget[options].apply(this, args.slice(1, args.length));
          values.push(methodReturn);
        }
      } else {
        values.push(widget);
      }
    });
    
    // return only 1 value if possible
    if (values.length > 1) {
      return values;
    } else if (values.length === 1) {
      return values[0];
    }
  };

  // auto-init tables
  $(function(){ $('[data-pjax-table][data-auto-init]').pjaxTable({}); });
})(jQuery, window);
