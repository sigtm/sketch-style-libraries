var that = this;
function __skpm_run (key, context) {
  that.context = context;

var exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

Object.defineProperty(exports, "__esModule", {
  value: true
});
// Pass an array and a property key, and get a new array
// containing just that property for each item
//
var getArrayOfValues = function getArrayOfValues(array, key) {
  var result = [];
  var length = array.count();

  for (var i = 0; i < length; i++) {
    result[i] = array[i][key]();
  }

  return result;
};

// Create a ComboBox from an array of values
//
var newSelect = function newSelect(array, frame) {
  frame = frame || [];
  x = frame[0] || 0;
  y = frame[1] || 0;
  w = frame[2] || 240;
  h = frame[3] || 28;

  var rect = NSMakeRect(x, y, w, h);
  var combo = NSComboBox.alloc().initWithFrame(rect);

  combo.addItemsWithObjectValues(array);
  combo.selectItemAtIndex(0);

  return combo;
};

// Launch popup to pick a library from a set of libraries.
// Returns the chosen library.
//
var pickLibrary = function pickLibrary(libs) {

  var libNames = getArrayOfValues(libs, 'name');

  var alert = COSAlertWindow['new']();
  var select = newSelect(libNames);

  alert.addAccessoryView(select);
  alert.setMessageText('Choose a library to sync styles from...');
  alert.addButtonWithTitle("OK");
  alert.addButtonWithTitle("Cancel");

  alert.alert().window().setInitialFirstResponder(select);

  var response = alert.runModal();

  if (response === 1000) {
    return libs[select.indexOfSelectedItem()];
  } else {
    return -1;
  }
};

// From a set of styles, create an object with the style names as keys
//
var getStylesByName = function getStylesByName(styles) {
  var result = {};

  for (var i = 0; i < styles.numberOfSharedStyles(); i++) {
    var style = styles.objects().objectAtIndex(i);
    result[style.name()] = style;
  }

  return result;
};

// Copy layer and text styles from one document to another,
// updating any that already exist by the same name
//
var copyStylesFromDocument = function copyStylesFromDocument(source, dest, context) {

  var sourceData = source.documentData();
  var destData = dest.documentData();
  var newCount = 0;
  var updateCount = 0;

  var _arr = ['layerStyles', 'layerTextStyles'];
  for (var _i = 0; _i < _arr.length; _i++) {
    var type = _arr[_i];

    var sourceStyles = sourceData[type]();
    var sourceStylesByName = getStylesByName(sourceStyles);

    var destStyles = destData[type]();
    var destStylesByName = getStylesByName(destStyles);

    for (var name in sourceStylesByName) {
      if (destStylesByName[name]) {
        destStyles.updateValueOfSharedObject_byCopyingInstance(destStylesByName[name], sourceStylesByName[name].style());
        destStyles.synchroniseInstancesOfSharedObject_withInstance(destStylesByName[name], sourceStylesByName[name].style());
        updateCount++;
      } else {
        destStyles.addSharedStyleWithName_firstInstance(name, sourceStylesByName[name].style());
        newCount++;
      }
    }
  }

  var totalCount = newCount + updateCount;

  if (totalCount) {
    var message = '🤘 ' + totalCount + ' styles synced';
    if (newCount) message += ' (' + newCount + ' new)';
  } else {
    var message = 'No styles found in the selected library';
  }

  context.document.showMessage(message);
};

var syncStyles = function syncStyles(context) {

  var userLibs = AppController.sharedInstance().librariesController().userLibraries();
  var lib = pickLibrary(userLibs);

  copyStylesFromDocument(lib.document(), context.document, context);
};

exports['default'] = syncStyles;

/***/ })
/******/ ]);
  if (key === 'default' && typeof exports === 'function') {
    exports(context);
  } else {
    exports[key](context);
  }
}
that['onRun'] = __skpm_run.bind(this, 'default')
