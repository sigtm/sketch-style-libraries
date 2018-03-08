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

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

// ----------------------------------------------------------------------------
//
// UTILITIES
//
// ----------------------------------------------------------------------------


// Some shortcuts for checking value types
//
var isDoc = function isDoc(value) {
  return value instanceof MSDocument;
};
var isDocData = function isDocData(value) {
  return value instanceof MSDocumentData;
};
var isUserLibrary = function isUserLibrary(value) {
  return value instanceof MSUserAssetLibrary;
};

// Compares two values to see if they're the same
// (https://github.com/lodash/lodash/blob/master/eq.js)
//
var eq = function eq(value, other) {
  return value === other || value !== value && other !== other;
};

// Apply defaults to an object
// (https://github.com/lodash/lodash/blob/master/defaults.js)
//
var defaults = function defaults(object) {
  for (var _len = arguments.length, sources = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    sources[_key - 1] = arguments[_key];
  }

  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;

  object = Object(object);

  sources.forEach(function (source) {

    if (source != null) {

      source = Object(source);

      for (var key in source) {

        var value = object[key];

        if (value === undefined || eq(value, objectProto[key]) && !hasOwnProperty.call(object, key)) {
          object[key] = source[key];
        }
      }
    }
  });

  return object;
};

// Map function for non-JS arrays
//
var map = function map(array, func) {
  var result = [];

  for (var i = 0; i < array.length; i++) {
    result[i] = func(array[i]);
  }

  return result;
};

// Convert NSString to JS string
//
var plainString = function plainString(value) {
  if (typeof value == 'string') {
    return value;
  } else {
    return value.stringByReplacingPercentEscapesUsingEncoding(NSUTF8StringEncoding);
  }
};

// Create a ComboBox from an array of values
//
var newSelect = function newSelect(array) {
  var frame = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];


  var x = frame[0] || 0;
  var y = frame[1] || 0;
  var w = frame[2] || 240;
  var h = frame[3] || 28;

  var rect = NSMakeRect(x, y, w, h);
  var combo = NSComboBox.alloc().initWithFrame(rect);

  combo.addItemsWithObjectValues(array);
  combo.selectItemAtIndex(0);

  return combo;
};

function newCheckbox(title, state) {
  var frame = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];


  state = state == false ? NSOffState : NSOnState;

  var x = frame[0] || 0;
  var y = frame[1] || 0;
  var w = frame[2] || 240;
  var h = frame[3] || 28;

  var rect = NSMakeRect(x, y, w, h);
  var checkbox = NSButton.alloc().initWithFrame(rect);

  checkbox.setButtonType(NSSwitchButton);
  checkbox.setBezelStyle(0);
  checkbox.setTitle(title);
  checkbox.setState(state);

  return checkbox;
}

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

// Simplified Framer style text templates. Pass an object with keys matching any
// {x}'s contained in the string, and they will be swapped
//
var stringTemplate = function stringTemplate(input, values) {

  var result = input;

  if ((typeof values === 'undefined' ? 'undefined' : _typeof(values)) === 'object') {

    for (var key in values) {
      var pattern = '{' + key + '}';
      var value = values[key];
      result = result.replace(pattern, values[key]);
    }
  } else {
    log('stringTemplate(): values has to be an object');
  }

  return result;
};

// Save data to document
//
var saveToDoc = function saveToDoc(key, value) {

  var id = context.plugin.identifier();
  var docData = context.document.documentData();
  var cmd = context.command;

  cmd.setValue_forKey_onLayer_forPluginIdentifier(value, key, docData, id);
};

// Get data from document
//
var getFromDoc = function getFromDoc(key, value) {

  var id = context.plugin.identifier();
  var docData = context.document.documentData();
  var cmd = context.command;

  return cmd.valueForKey_onLayer_forPluginIdentifier(key, docData, id);
};

// Copy layer and text styles from one document to another,
// updating any that already exist by the same name
//
var copyStyles = function copyStyles(source, dest, callback) {

  var sourceData = source.documentData();
  var destData = dest.documentData();;
  var newCount = 0;
  var updateCount = 0;

  try {
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

          // This should be unnecessary, but fixes the occasional bug where layers in the source document get a 
          // "refresh" icon in the style picker even though its style hasn't changed. So we force refresh it to be sure.
          sourceStyles.updateValueOfSharedObject_byCopyingInstance(sourceStylesByName[name], sourceStylesByName[name].style());
          sourceStyles.synchroniseInstancesOfSharedObject_withInstance(sourceStylesByName[name], sourceStylesByName[name].style());

          updateCount++;
        } else {
          destStyles.addSharedStyleWithName_firstInstance(name, sourceStylesByName[name].style());
          newCount++;
        }
      }
    }

    callback(false, {
      updated: updateCount,
      'new': newCount
    });
  } catch (error) {
    callback(error, null);
  }
};

// Launch popup to pick a library from an array of libraries, along with other options.
//
// Options:
//
// {
//   libs: [Libraries]
//   messageText: [String]
//   infoText: [String] (optional)
// }
//
// Returns:
//
// {
//   lib: [Library],
//   deleteStyles: 1 or 0
// }
//
var pickOptions = function pickOptions() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};


  if (!opts.messageText || !opts.libs) {
    return;
  }

  var doc = context.document;
  var libs = opts.libs;
  var linkedSymbols = doc && doc.documentData().foreignSymbols();

  var defaultIndex = 0;
  var libNames = map(libs, function (x) {
    return x.name();
  });
  var libNamesRaw = map(libNames, function (x) {
    return plainString(x);
  });

  // If a document is provided, the select will default
  // to the most commonly used library in that document.
  // Caveat: If multiple libraries by same name, the first
  // match is used.
  //
  if (linkedSymbols) {

    var usedLibs = {};
    var winner = {};

    // Tally up the amount of symbols from each library
    for (var i = 0; i < linkedSymbols.length; i++) {
      var libName = plainString(linkedSymbols[i].sourceLibraryName());

      usedLibs[libName] = usedLibs[libName] || 0;
      usedLibs[libName]++;

      if (!winner.count || usedLibs[libName] > winner.count) {
        winner.libName = libName;
        winner.count = usedLibs[libName];
      }
    }

    // Find index of the winner in the libIDs array
    var winnerIndex = libNamesRaw.indexOf(winner && winner.libName);

    // I'm not sure it's possible to find symbols in a library
    // not found via AppController, but let's be safe
    defaultIndex = winnerIndex > -1 ? winnerIndex : 0;
  }

  var alert = COSAlertWindow['new']();
  alert.setMessageText(opts.messageText);

  var select = newSelect(libNames);
  select.selectItemAtIndex(defaultIndex);
  alert.addAccessoryView(select);

  if (opts.infoText) {
    alert.setInformativeText(opts.infoText);
  }

  var deleteStyles = newCheckbox("Delete removed styles?", true[(0, 38, 112, 16)]);
  alert.addAccessoryView(deleteStyles);

  alert.addButtonWithTitle('OK');
  alert.addButtonWithTitle('Cancel');

  alert.alert().window().setInitialFirstResponder(select);
  select.setNextKeyView(deleteStyles);

  var response = alert.runModal();

  if (response === 1000) {

    result = {
      lib: libs[select.indexOfSelectedItem()],
      deleteStyles: deleteStyles.state()
    };

    return result;
  } else {
    return null;
  }
};

// ----------------------------------------------------------------------------
//
// MAIN METHODS
//
// ----------------------------------------------------------------------------


var pushStyles = function pushStyles(context) {

  var libs = AppController.sharedInstance().librariesController().userLibraries();

  if (!libs.length) {
    context.document.showMessage('Couldn\'t find any user defined libraries 🤷‍');
    return;
  }

  var doc = context.document;

  var options = pickOptions({
    libs: libs,
    messageText: 'Push styles to',
    infoText: 'NOTE: If you have your library file open, you have to close and reopen it to see the changes.'
  });

  if (!options) {
    return;
  }

  var lib = options.lib;
  var libUrl = lib.locationOnDisk();

  var libDoc = MSDocument['new']();
  libDoc.readDocumentFromURL_ofType_error(libUrl, "sketch", null);
  libDoc.revertToContentsOfURL_ofType_error(libUrl, "sketch", null);

  copyStyles(doc, libDoc, function (error, data) {

    if (error) {
      context.document.showMessage(error);
    } else if (data.updated + data['new'] === 0) {
      context.document.showMessage('Couldn\'t find any styles to push 🤷‍');
    } else {

      try {

        libDoc.writeToURL_ofType_forSaveOperation_originalContentsURL_error_(libUrl, "com.bohemiancoding.sketch.drawing", NSSaveOperation, nil, nil);

        var message = '🤘 Pushed ' + (data.updated + data['new']) + ' styles';
        if (data['new']) message += ' (' + data['new'] + ' new)';
        context.document.showMessage(message);
      } catch (error) {
        context.document.showMessage(error);
      }
    }
  });
};

var pullStyles = function pullStyles(context) {

  var libs = AppController.sharedInstance().librariesController().userLibraries();

  if (!libs.length) {
    context.document.showMessage('Couldn\'t find any user defined libraries 🤷‍');
    return;
  }

  var doc = context.document;

  var options = pickOptions({
    libs: libs,
    messageText: 'Fetch styles from'
  });

  if (!options) {
    return;
  }

  saveToDoc('defaultPullDeleteStyles', options.deleteStyles);
  var test = getFromDoc('deleteStyles');

  var lib = options.lib;

  copyStyles(lib.document(), doc, function (error, data) {

    if (error) {
      context.document.showMessage(error);
    } else if (data.updated + data['new'] === 0) {
      log(data);
      context.document.showMessage('Couldn\'t find any styles to pull 🤷‍');
    } else {

      var message = '🤘 Pulled ' + (data.updated + data['new']) + ' styles';
      if (data['new']) message += ' (' + data['new'] + ' new)';
      context.document.showMessage(message);
    }
  });
};

exports.pullStyles = pullStyles;
exports.pushStyles = pushStyles;

/***/ })
/******/ ]);
  if (key === 'default' && typeof exports === 'function') {
    exports(context);
  } else {
    exports[key](context);
  }
}
that['pullStyles'] = __skpm_run.bind(this, 'pullStyles');
that['onRun'] = __skpm_run.bind(this, 'default');
that['pushStyles'] = __skpm_run.bind(this, 'pushStyles')
