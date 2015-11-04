'use strict';

/**
*   A mixin that provides before and after hooks for ajax calls
*/
function ConfirmableMixin(element, options) {
  this._beforeSave = options.beforeSave || null;

  this._init();
}

ConfirmableMixin.prototype._init = function() {
  if (typeof this._save === 'function') {
    this._save = this._wrapFn(this._save, this._beforeSave, this);
  }
};

ConfirmableMixin.prototype._wrapFn = function(fn, beforeFn, context) {
  return function() {
    var args = Array.prototype.slice.call(arguments);
    beforeFn(this._$el, this._record, function() {
      fn.apply(context, args);
    });
  };
};

if (typeof module === 'object') {
  module.exports = ConfirmableMixin;
} else if (typeof define === 'function') {
  define(function() { return ConfirmableMixin; });
} else {
  window.ConfirmableMixin = ConfirmableMixin;
}
