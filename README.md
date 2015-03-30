# pjax-table

## Introduction
pjax-table is a jQuery plugin that uses [jquery-pjax](https://github.com/defunkt/jquery-pjax) to load server rendered tables and
provides table controls for sorting, pagination, row selection, and more.

## Features
  - pjax loading with push state
  - sorting
  - pagination
  - search filtering
  - row selection and manipulation
  - plugin support

## Documentation
The documentation for pjax-table is available [through github pages](http://50onred.github.io/pjax-table/) and is available in the docs folder.

# Base Markup
The app server needs to define correct markup and data attributes 
to enable features of pjax tables. Some are required, others optional.
See [fifty-tables](https://bitbucket.org/50onred/fifty-tables) for a
python flask implementation that works with pjax-table.

Example of standard table markup with data attributes:
```
<div data-pjax-table data-auto-init="true">
  <table data-total-rows="{{ total_rows }}" 
         data-current-sort-property="{{ current_sort_property }}"
         data-current-sort-order="{{ current_sort_order }}">
    <thead>
      <tr>
        <th data-sortable="true"
            data-property="{{ property }}"
            data-current-sort-order="{{ sort_order }}">
          {{ header_value }}
        </th>
        <!-- ... -->
      </tr>
    </thead>
    <tbody>
      <tr>
        <td data-property="{{ property }}"
            data-value="{{ value }}">
          {{ value }}
        </td>
        <!-- ... -->
      </tr>
    </tbody>
    <tfoot></tfoot>
  </table>
</div>
```

### container data attributes
<table>
  <thead>
    <tr>
      <th>data-attribute</th>
      <th>type</th>
      <th>default</th>
      <th>description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>data-pjax-table</td>
      <td>boolean</td>
      <td>true</td>
      <td>the default selector for initializing tables (only used for init)</td>
    </tr>
    <tr>
      <td>data-auto-init</td>
      <td>boolean</td>
      <td>false</td>
      <td>a flag (only used for init)</td>
    </tr>
    <tr>
      <td>data-url</td>
      <td>string</td>
      <td>window.location.href</td>
      <td>the url to be used for fetching table markup</td>
    </tr>
    <tr>
      <td>data-paginated</td>
      <td>boolean</td>
      <td>true</td>
      <td>a flag to enable/disable pagination controls</td>
    </tr>
    <tr>
      <td>data-ajax-only</td>
      <td>boolean</td>
      <td>false</td>
      <td>a flag to use ajax instead of pjax</td>
    </tr>
    <tr>
      <td>data-push-state</td>
      <td>boolean</td>
      <td>true</td>
      <td>a flag to pass as the pushState option to pjax</td>
    </tr>
    <tr>
      <td>data-pjax-container</td>
      <td>string</td>
      <td>element.id</td>
      <td>the container to be used for loading pjax, defaults to the initializing element's id</td>
    </tr>
    <tr>
      <td>data-search-id</td>
      <td>string</td>
      <td></td>
      <td>the id selector of a search box to be used</td>
    </tr>
    <tr>
      <td>data-sort-query-key</td>
      <td>string</td>
      <td>order</td>
      <td>the string key to be used in building the search query</td>
    </tr>
    <tr>
      <td>data-page-query-key</td>
      <td>string</td>
      <td>page</td>
      <td>the string key to be used in building the page query</td>
    </tr>
    <tr>
      <td>data-perpage-query-key</td>
      <td>string</td>
      <td>perpage</td>
      <td>the string key to be used in building the perpage query</td>
    </tr>
    <tr>
      <td>data-search-query-key</td>
      <td>string</td>
      <td>q</td>
      <td>the string key to be used in building the search query</td>
    </tr>
  </tbody>
</table>


### table data attributes
<table>
  <thead>
    <tr>
      <th>data-attribute</th>
      <th>type</th>
      <th>default</th>
      <th>options</th>
      <th>description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>data-total-rows</td>
      <td>number</td>
      <td>0</td>
      <td></td>
      <td>the total number of rows returned by the server</td>
    </tr>
    <tr>
      <td>data-total-rows</td>
      <td>number</td>
      <td>0</td>
      <td></td>
      <td>the total number of rows returned by the server</td>
    </tr>
    <tr>
      <td>data-current-sort-property</td>
      <td>string</td>
      <td></td>
      <td></td>
      <td>the current sort property name</td>
    </tr>
    <tr>
      <td>data-current-sort-order</td>
      <td>string</td>
      <td>desc</td>
      <td>asc or desc</td>
      <td>the current sort property order (asc/desc)</td>
  </tbody>
</table>


### th data attributes
<table>
  <thead>
    <tr>
      <th>data-attribute</th>
      <th>type</th>
      <th>default</th>
      <th>options</th>
      <th>description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>data-sortable</td>
      <td>boolean</td>
      <td>true</td>
      <td></td>
      <td>whether or not this column is sortable</td>
    </tr>
    <tr>
      <td>data-property</td>
      <td>string</td>
      <td></td>
      <td></td>
      <td>the property name to be used in the sort query</td>
    </tr>
    <tr>
      <td>data-current-sort-order</td>
      <td>string</td>
      <td></td>
      <td>asc or desc</td>
      <td>the current sort order of this column</td>
    </tr>
    <tr>
      <td>data-default-sort-order</td>
      <td>string</td>
      <td></td>
      <td>asc or desc</td>
      <td>the default sort order of this column</td>
    </tr>
  </tbody>
</table>


### td data attributes
<table>
  <thead>
    <tr>
      <th>data-attribute</th>
      <th>type</th>
      <th>default</th>
      <th>description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>data-property</td>
      <td>string</td>
      <td></td>
      <td>the property name for this cell</td>
    </tr>
    <tr>
      <td>data-value</td>
      <td>string or number</td>
      <td></td>
      <td>the value for this cell</td>
    </tr>
  </tbody>
</table>


### js options
JS options override data attributes or the defaults.
<table>
  <thead>
    <tr>
      <th>key</th>
      <th>type</th>
      <th>default</th>
      <th>description</th> 
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>url</td>
      <td>string</td>
      <td>data-url or window.location.href</td>
      <td>see data-url option</td>
    </tr>
    <tr>
      <td>ajaxOnly</td>
      <td>boolean</td>
      <td>data-ajax-only or false</td>
      <td>see data-ajax-only option</td>
    </tr>
    <tr>
      <td>pushState</td>
      <td>boolean</td>
      <td>data-push-state or true</td>
      <td>see data-push-state option</td>
    </tr>
    <tr>
      <td>paginated</td>
      <td>boolean</td>
      <td>data-paginated or true</td>
      <td>see data-paginated option</td>
    </tr>
    <tr>
      <td>pjaxContainer</td>
      <td>string</td>
      <td>data-pjax-container or element.id</td>
      <td>see data-pjax-container option</td>
    </tr>
    <tr>
      <td>noDataTemplate</td>
      <td>function</td>
      <td>see source</td>
      <td>a function returning the default template to use for no data returned</td>
    </tr>
    <tr>
      <td>sortQueryKey</td>
      <td>string</td>
      <td>order</td>
      <td>the query string key for sorting</td>
    </tr>
    <tr>
      <td>pageQueryKey</td>
      <td>string</td>
      <td>page</td>
      <td>the query string key for page</td>
    </tr>
    <tr>
      <td>perPageQueryKey</td>
      <td>string</td>
      <td>perpage</td>
      <td>the query string key for perpage</td>
    </tr>
    <tr>
      <td>searchQueryKey</td>
      <td>string</td>
      <td>q</td>
      <td>the query string key for search</td>
    </tr>
  </tbody>
</table>


# Pagination
### pagination container data attributes
<table>
  <thead>
    <tr>
      <th>data-attribute</th>
      <th>type</th>
      <th>default</th>
      <th>description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>data-current-page</td>
      <td>number</td>
      <td>defined by pagination markup</td>
      <td>the current page</td>
    </tr>
    <tr>
      <td>data-current-perpage</td>
      <td>number</td>
      <td>defined by pagination markup</td>
      <td>the current perpage</td>
    </tr>
  </tbody>
</table>


### pagination perpage data attributes
<table>
  <thead>
    <tr>
      <th>data-attribute</th>
      <th>type</th>
      <th>default</th>
      <th>description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>data-value</td>
      <td>number</td>
      <td></td>
      <td>the number value of records per page</td>
    </tr>
  </tbody>
</table>


### pagination page data attributes
<table>
  <thead>
    <tr>
      <th>data-attribute</th>
      <th>type</th>
      <th>default</th>
      <th>description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>data-value</td>
      <td>number</td>
      <td></td>
      <td>the number value of the page</td>
    </tr>
  </tbody>
</table>


### required pagination classes
<table>
  <thead>
    <tr>
      <th>class</th>
      <th>required children</th>
      <th>description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>ui-pagination</td>
      <td>n/a</td>
      <td>the pagination container with data-current-page and data-current-perpage</td>
    </tr>
    <tr>
      <td>ui-perpage-dropdown</td>
      <td>li with data-value</td>
      <td>the list element of perpage options</td>
    </tr>
    <tr>
      <td>ui-page-select-dropdown</td>
      <td>li with data-value</td>
      <td>the list element of page options</td>
    </tr>
    <tr>
      <td>ui-prev-page</td>
      <td>n/a</td>
      <td>the prev page button</td>
    </tr>
    <tr>
      <td>ui-next-page</td>
      <td>n/a</td>
      <td>the next page button</td>      
    </tr>
  </tbody>
</table>


### Example pagination markup
*The example below uses BS3 classes and markup, but only the classes and structure listed above are required. A base set of styles to make these functional without BS3 may soon be applied. Ideas are welcome.*
```
  <div class="pjax-table-pagination ui-pagination" 
       data-current-page="{{ current_page }}" 
       data-current-perpage="{{ per_page }}">

    <!-- per page controls -->
    <div class="pull-left btn-toolbar">
      <div class="dropdown btn-group" data-per-page="{{ perpage }}">
        <button data-toggle="dropdown" class="btn btn-default btn-sm dropdown-toggle">
          <span class="dropdown-label">Per Page {{ per_page }}</span>
          <span class="fa fa-angle-down"></span>
        </button>
        <ul class="dropdown-menu open-up ui-perpage-dropdown">
          <li data-value="10"><a>10</a></li>
          <li data-value="20"><a>20</a></li>
          <li data-value="50"><a>50</a></li>
          <li data-value="100"><a>100</a></li>
        </ul>
      </div>
      <div class="btn-group btn-sm btn-link">From {{ from }} to {{ to }} of {{ total }}</div>
    </div>

    <!-- page, next page, prev page controls -->
    <div class="pull-right btn-toolbar">
      {{#if on_last_page }}
        <div class="btn-group">
          <button type="button" class="btn btn-default btn-sm ui-prev-page" {{#if on_first_page }}disabled{{/if}}>
            <i class="fa fa-chevron-left"></i>
          </button>
        </div>

        <div class="btn-group">
          <div class="dropdown ui-page-index-dropdown" data-current-page="{{ current_page }}">
            <button class="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown">
              <span class="dropdown-label">Page {{ current_page }}</span>
              <i class="fa fa-angle-down"></i>
            </button>
            <ul class="dropdown-menu open-up ui-page-select-dropdown">
              {{ page_items }}
            </ul>
          </div>
        </div>

        <div class="btn-group">
          <button type="button" class="btn btn-default btn-sm ui-next-page" {{#if on_last_page }}disabled{{/if}}>
            <i class="fa fa-chevron-right"></i>
          </button>
        </div>
      {{else}}
        <div class="btn-group btn-sm btn-link">Page {{ current_page }} of {{ last_page }}</div>
      {{/if}}
    </div>
  </div>
```

# Row Selection
To enable row selection, which includes select/deselect all, you can specify a table header cell and a column of table cells with `data-property="id"`. These cells also need to contain a checkbox for managing selection state.

Example table header and body cells which enable row selection:
```
<!-- in thead > tr -->
<th data-select-all-enabled="true" data-property="id">
  <input type="checkbox">
</th>

<!-- in tbody > tr -->
<th data-property="id" data-value="1">
  <input type="checkbox">
</th>
```

## Events
Most named events are triggered from the container element, with the exception of any plugins which fire events.
The search implementation also fires it's own events which are wrapped by the table.
<table>
  <thead>
    <tr>
      <th>name</th>
      <th>type</th>
      <th>arguments</th>
      <th>trigger</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>table:load</td>
      <td></td>
      <td></td>
      <td>any time the table has finished loaded, on pjax success for initial load, update, and refresh</td>
    </tr>
    <tr>
      <td>table:sort</td>
      <td>object</td>
      <td>sortQuery</td>
      <td>when a column is sorted, includes direction and property</td>
    </tr>
    <tr>
      <td>table:page</td>
      <td>object</td>
      <td>pageQuery</td>
      <td>when a specific page has been chosen to jump to</td>
    </tr>
    <tr>
      <td>table:perpage</td>
      <td>object</td>
      <td>perPageQuery</td>
      <td>when perpage dropdown selection has changed</td>
    </tr>
    <tr>
      <td>table:nextpage</td>
      <td>object</td>
      <td>nextPageQuery</td>
      <td>when next page in pagination clicked</td>
    </tr>
    <tr>
      <td>table:prevpage</td>
      <td>object</td>
      <td>prevPageQuery</td>
      <td>when prev page in pagination clicked</td>
    </tr>
    <tr>
      <td>table:search</td>
      <td>object</td>
      <td>searchQuery</td>
      <td>when a search query is used to filter the table</td>
    </tr>
    <tr>
      <td>table:search:clear</td>
      <td></td>
      <td></td>
      <td>when a search query is cleared</td>
    </tr>
    <tr>
      <td>table:select</td>
      <td>object</td>
      <td>record</td>
      <td>when a row is selected, passing the record object</td>
    </tr>
    <tr>
      <td>table:deselect</td>
      <td>object</td>
      <td>record</td>
      <td>when a row is deselected, passing the record object</td>
    </tr>
    <tr>
      <td>table:select:all</td>
      <td></td>
      <td></td>
      <td>when all records are selected</td>
    </tr>
    <tr>
      <td>table:deselect:all</td>
      <td></td>
      <td></td>
      <td>when all records are deselected</td>
    </tr>
    <tr>
      <td>table:error</td>
      <td></td>
      <td></td>
      <td>when a pjax / ajax error occurs</td>
    </tr>
    <tr>
      <td>table:timeout</td>
      <td></td>
      <td></td>
      <td>when pjax times out</td>
    </tr>
  </tbody>
</table>


### Dependencies
  - [jQuery 1.11.1](http://jquery.com/)
  - [jQuery PJAX 1.9.2](https://github.com/defunkt/jquery-pjax)
  - [spin.js 2.0.2](http://fgnass.github.io/spin.js/)


### Testing
    // running
    karma start ./karma.conf.js


### Building
    // install node dependencies, most notably gulp and gulp plugins
    npm install

    // install client dependencies
    bower install

    // (default task) cleans and then builds standalone and distributable versions
    gulp

