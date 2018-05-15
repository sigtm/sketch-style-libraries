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

// Show message
//
var msg = function msg(_msg) {
  context.document.showMessage(_msg);
};

// Error handler
//
var error = function error(msg, _error) {
  var showMessage = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  // Display message to user
  if (showMessage) {
    msg(msg);
  }

  // Log it
  log('----------------------------------------');
  log('Style Libraries: ' + msg);
  log('Error:');
  log(_error);
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

// Get the libraryID() of an object as a string
//
var getLibraryID = function getLibraryID(obj) {
  try {
    return obj.libraryID && obj.libraryID().toString();
  } catch (e) {
    error("Error while attempting to fetch library ID", e);
    log(obj);
    return undefined;
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

// Same as getStylesByName, but returning an array for each name
// instead of just the last style found, to check for duplicates
//
var getAllStylesByName = function getAllStylesByName(styles) {
  var result = {};

  for (var i = 0; i < styles.numberOfSharedStyles(); i++) {
    var style = styles.objects().objectAtIndex(i);
    var name = style.name();

    if (!result[name]) {
      result[name] = [];
    }

    result[name].push(style);
  }

  return result;
};

// Save data to document
//
var setDefault = function setDefault(key, value) {

  var id = context.plugin.identifier();
  var docData = context.document.documentData();
  var cmd = context.command;

  cmd.setValue_forKey_onLayer_forPluginIdentifier(value, key, docData, id);
};

// Get data from document
//
var getDefault = function getDefault(key, value) {

  var id = context.plugin.identifier();
  var docData = context.document.documentData();
  var cmd = context.command;

  var result = cmd.valueForKey_onLayer_forPluginIdentifier(key, docData, id);

  // Return undefined if null, so defaults() doesn't skip it
  if (result === null) {
    result = undefined;
  }

  return result;
};

// Create a ComboBox from an array of values
//
var newSelect = function newSelect(array) {
  var frame = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};


  defaults(frame, {
    x: 0,
    y: 0,
    w: 240,
    h: 28
  });

  var rect = NSMakeRect(frame.x, frame.y, frame.w, frame.h);
  var combo = NSComboBox.alloc().initWithFrame(rect);

  combo.addItemsWithObjectValues(array);
  combo.selectItemAtIndex(0);

  return combo;
};

// Create a checkbox
//
function newCheckbox(title, state) {
  var frame = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};


  state = state == false ? NSOffState : NSOnState;

  defaults(frame, {
    x: 0,
    y: 0,
    w: 240,
    h: 24
  });

  var rect = NSMakeRect(frame.x, frame.y, frame.w, frame.h);
  var checkbox = NSButton.alloc().initWithFrame(rect);

  checkbox.setButtonType(NSSwitchButton);
  checkbox.setBezelStyle(0);
  checkbox.setTitle(title);
  checkbox.setState(state);

  return checkbox;
}

// Create text description field
//
function newDescription(text) {
  var frame = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};


  defaults(frame, {
    x: 0,
    y: 0,
    w: 240,
    h: 28
  });

  var rect = NSMakeRect(frame.x, frame.y, frame.w, frame.h);

  var label = NSTextField.alloc().initWithFrame(rect);

  label.setStringValue(text);
  label.setFont(NSFont.systemFontOfSize(11));
  label.setTextColor(NSColor.colorWithCalibratedRed_green_blue_alpha(0, 0, 0, 0.5));
  label.setBezeled(false);
  label.setDrawsBackground(false);
  label.setEditable(false);
  label.setSelectable(false);

  return label;
}

// Copy layer and text styles from one document to another,
// updating any that already exist by the same name
//
var copyStyles = function copyStyles(source, dest) {
  var deleteStyles = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var callback = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : Function();


  var sourceData = source.documentData();
  var destData = dest.documentData();;
  var newCount = 0;
  var updateCount = 0;
  var deleteCount = 0;

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

          if (destStyles.updateValueOfSharedObject_byCopyingInstance) {
            destStyles.updateValueOfSharedObject_byCopyingInstance(destStylesByName[name], sourceStylesByName[name].style());
            destStyles.synchroniseInstancesOfSharedObject_withInstance(destStylesByName[name], sourceStylesByName[name].style());

            // This should be unnecessary, but fixes the occasional bug where layers in the source document get a 
            // "refresh" icon in the style picker even though its style hasn't changed. So we force refresh it to be sure.
            sourceStyles.updateValueOfSharedObject_byCopyingInstance(sourceStylesByName[name], sourceStylesByName[name].style());
            sourceStyles.synchroniseInstancesOfSharedObject_withInstance(sourceStylesByName[name], sourceStylesByName[name].style());
          } else {
            destStylesByName[name].updateToMatch(sourceStylesByName[name].style());
            destStylesByName[name].resetReferencingInstances();
          }
          updateCount++;
        } else {
          if (destStyles.addSharedStyleWithName_firstInstance) {
            destStyles.addSharedStyleWithName_firstInstance(name, sourceStylesByName[name].style());
          } else {
            var s = MSSharedStyle.alloc().initWithName_firstInstance(name, sourceStylesByName[name].style());
            destStyles.addSharedObject(s);
          }
          newCount++;
        }
      }

      // If the delete option was checked, we delete any style that doesn't have
      // matching style by name in the source document
      //
      if (deleteStyles) {

        for (var _name in destStylesByName) {

          if (!sourceStylesByName[_name]) {
            destStyles.removeSharedStyle(destStylesByName[_name]);
            deleteCount++;
          }
        }
      }
    }

    callback(false, {
      updated: updateCount,
      'new': newCount,
      deleted: deleteCount
    });
  } catch (error) {
    error('There was a problem while copying styles between documents', error, true);
    callback(error, null);
  }
};

// Get the most used library in the document, by symbol count
// Returns the ID of the top library
//
var getTopLibrary = function getTopLibrary() {

  var foreignSymbols = context.document.documentData().foreignSymbols();

  var usedLibs = {};
  var winner = {
    id: null,
    count: 0
  };

  // Tally up the amount of symbols from each library
  for (var i = 0; i < foreignSymbols.length; i++) {

    var libID = getLibraryID(foreignSymbols[i]);

    if (libID === undefined) {
      continue;
    }

    if (!usedLibs[libID]) {
      usedLibs[libID] = {
        id: libID,
        count: 0
      };
    }

    var lib = usedLibs[libID];

    lib.count++;

    if (lib.count > winner.count) {
      winner = lib;
    }
  }

  return winner.id;
};

// Launch popup for picking your push/pull options
// Pass it default values if you want
//
var selectOptions = function selectOptions() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};


  opts = defaults(opts, {
    libs: AppController.sharedInstance().librariesController().userLibraries(),
    deleteStyles: 0,
    mergeDuplicates: 1,
    infoText: null,
    libraryID: getTopLibrary(),
    messageText: "Pick your library"
  });

  var libNames = map(opts.libs, function (x) {
    return x.name();
  });

  var defaultLibraryIndex = 0;

  // If a default library ID exists, find its index in the libs array
  if (opts.libraryID) {
    for (var i = 0; i < opts.libs.length; i++) {
      if (opts.libraryID == getLibraryID(opts.libs[i])) {
        defaultLibraryIndex = i;
        break;
      }
    }
  }

  // Create alert window

  var alert = COSAlertWindow['new']();
  alert.setMessageText(opts.messageText);

  if (opts.infoText) {
    alert.setInformativeText(opts.infoText);
  }

  var select = newSelect(libNames);
  select.selectItemAtIndex(defaultLibraryIndex);
  alert.addAccessoryView(select);

  var deleteStylesCheckbox = newCheckbox('Strict sync', opts.deleteStyles, { h: 16 });
  alert.addAccessoryView(deleteStylesCheckbox);

  var deleteStylesDescription = newDescription('Strict sync deletes all styles that don\'t exist in the document you\'re syncing from');
  alert.addAccessoryView(deleteStylesDescription);

  var mergeDuplicatesCheckbox = newCheckbox('Merge duplicate styles', opts.mergeDuplicates);
  alert.addAccessoryView(mergeDuplicatesCheckbox);

  alert.addButtonWithTitle('OK');
  alert.addButtonWithTitle('Cancel');

  // Set keyboard responders

  alert.alert().window().setInitialFirstResponder(select);
  select.setNextKeyView(deleteStylesCheckbox);

  // Run modal and evaluate response

  var response = alert.runModal();

  if (response === 1000) {

    opts.library = opts.libs[select.indexOfSelectedItem()];
    opts.libraryID = getLibraryID(opts.library);
    opts.deleteStyles = deleteStylesCheckbox.state();
    opts.mergeDuplicates = mergeDuplicatesCheckbox.state();

    return opts;
  } else {
    return null;
  }
};

// ----------------------------------------------------------------------------
//
// MERGE STYLES
//
// ----------------------------------------------------------------------------


// Merge duplicate styles in a document (used for the external library document as well)
var mergeDuplicateStyles = function mergeDuplicateStyles(doc) {

  var docData = doc.documentData();
  var count = 0;

  try {
    var _arr2 = ['layerStyles', 'layerTextStyles'];


    for (var _i2 = 0; _i2 < _arr2.length; _i2++) {
      var type = _arr2[_i2];
      var styles = docData[type]();
      var stylesByName = getAllStylesByName(styles);

      for (var key in stylesByName) {

        var copies = stylesByName[key];

        if (copies.length > 1) {

          for (var i = 1; i < copies.length; i++) {
            log('Duplicate style found and merged: ' + copies[i].name());
            count++;
            styles.synchroniseInstancesOfSharedObject_withInstance(copies[i], copies[0].style());
            styles.removeSharedStyle(copies[i]);
          }
        }
      }
    }

    return count;
  } catch (error) {
    msg(error);
  }
};

// Proxy that takes the context as an argument, so merging in the current
// document can be done directly from the menu as well
var mergeCurrentDocDuplicates = function mergeCurrentDocDuplicates(context) {
  var count = mergeDuplicateStyles(context.document);

  if (count) {
    var message = '🤘 Merged ' + count + ' style';

    if (count > 1) {
      message += 's';
    }

    msg(message);
  } else {
    msg('Couldn\'t find any duplicate styles 🤷‍');
  }
};

// ----------------------------------------------------------------------------
//
// PUSH / PULL STYLES
//
// ----------------------------------------------------------------------------


var pushStyles = function pushStyles(context) {

  var doc = context.document;
  var libs = AppController.sharedInstance().librariesController().userLibraries();

  // Stop here if there are no user libraries
  if (!libs.length) {
    msg('Couldn\'t find any user defined libraries 🤷‍');
    return;
  }

  // Get user options
  var options = selectOptions({
    deleteStyles: getDefault('defaultPushDeleteStyles'),
    infoText: 'NOTE: If you have your library file open, you have to close and reopen it to see the changes.',
    libraryID: getDefault('defaultLibraryID'),
    libs: libs,
    mergeDuplicates: getDefault('defaultMergeDuplicates'),
    messageText: 'Push styles to'
  });

  // Stop here if the user clicked cancel
  if (!options) {
    return;
  }

  // Save the user options as defaults for next time
  setDefault('defaultLibraryID', options.libraryID);
  setDefault('defaultMergeDuplicates', options.mergeDuplicates);
  setDefault('defaultPushDeleteStyles', options.deleteStyles);

  // Draw the rest of the owl

  var lib = options.library;
  var libUrl = lib.locationOnDisk();

  var libDoc = MSDocument['new']();
  libDoc.readDocumentFromURL_ofType_error(libUrl, "sketch", null);
  libDoc.revertToContentsOfURL_ofType_error(libUrl, "sketch", null);

  copyStyles(doc, libDoc, options.deleteStyles, function (error, data) {

    if (error) {
      return;
    } else if (data.updated + data['new'] === 0) {
      msg('Couldn\'t find any styles to push 🤷‍');
    } else {

      try {

        if (options.mergeDuplicates) {
          data.merged = mergeDuplicateStyles(libDoc);
        }

        libDoc.writeToURL_ofType_forSaveOperation_originalContentsURL_error_(libUrl, "com.bohemiancoding.sketch.drawing", NSSaveOperation, nil, nil);

        var message = '🤘 Pushed ' + (data.updated + data['new']) + ' style';

        if (data.updated + data['new'] > 1) {
          message += 's';
        }

        var details = [];

        if (data['new']) {
          details.push(data['new'] + ' new');
        }

        if (data.deleted) {
          details.push('Deleted ' + data.deleted);
        }

        if (data.merged) {
          details.push('Merged ' + data.merged);
        }

        if (details.length) {
          message += ' (' + details.join(' · ') + ')';
        }

        msg(message);
      } catch (error) {
        msg(error);
      }
    }
  });
};

var pullStyles = function pullStyles(context) {

  var libs = AppController.sharedInstance().librariesController().userLibraries();
  var doc = context.document;

  // Stop here if there are no user libraries
  if (!libs.length) {
    msg('Couldn\'t find any user defined libraries 🤷‍');
    return;
  }

  // Get user options
  options = selectOptions({
    deleteStyles: getDefault('defaultPullDeleteStyles'),
    libraryID: getDefault('defaultLibraryID'),
    libs: libs,
    messageText: 'Fetch styles from',
    mergeDuplicates: getDefault('defaultMergeDuplicates')
  });

  // Stop here if the user clicked cancel
  if (!options) {
    return;
  }

  // Save user options as defaults for next time
  setDefault('defaultLibraryID', options.libraryID);
  setDefault('defaultMergeDuplicates', options.mergeDuplicates);
  setDefault('defaultPullDeleteStyles', options.deleteStyles);

  // Draw the rest of the owl

  var lib = options.library;

  copyStyles(lib.document(), doc, options.deleteStyles, function (error, data) {

    if (error) {
      msg(error);
    } else if (data.updated + data['new'] === 0) {
      log(data);
      msg('Couldn\'t find any styles to pull 🤷‍');
    } else {

      if (options.mergeDuplicates) {
        data.merged = mergeDuplicateStyles(doc);
      }

      var message = '🤘 Pulled ' + (data.updated + data['new']) + ' style';

      if (data.updated + data['new'] > 1) {
        message += 's';
      }

      var details = [];

      if (data['new']) {
        details.push(data['new'] + ' new');
      }

      if (data.deleted) {
        details.push('Deleted ' + data.deleted);
      }

      if (data.merged) {
        details.push('Merged ' + data.merged);
      }

      if (details.length) {
        message += ' (' + details.join(' · ') + ')';
      }

      msg(message);
    }
  });
};

exports.pullStyles = pullStyles;
exports.pushStyles = pushStyles;
exports.mergeCurrentDocDuplicates = mergeCurrentDocDuplicates;

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
that['pushStyles'] = __skpm_run.bind(this, 'pushStyles');
that['mergeCurrentDocDuplicates'] = __skpm_run.bind(this, 'mergeCurrentDocDuplicates')
