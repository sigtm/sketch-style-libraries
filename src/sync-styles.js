// ----------------------------------------------------------------------------
//
// UTILITIES
//
// ----------------------------------------------------------------------------


// Some shortcuts for checking value types
//
var isDoc = (value) => value instanceof MSDocument;
var isDocData = (value) => value instanceof MSDocumentData;
var isUserLibrary = (value) => value instanceof MSUserAssetLibrary;


// Compares two values to see if they're the same
// (https://github.com/lodash/lodash/blob/master/eq.js)
//
var eq = (value, other) => {
  return value === other || (value !== value && other !== other);
}


// Apply defaults to an object
// (https://github.com/lodash/lodash/blob/master/defaults.js)
//
var defaults = (object, ...sources) => {

  const objectProto = Object.prototype;
  const hasOwnProperty = objectProto.hasOwnProperty;

  object = Object(object);

  sources.forEach((source) => {

    if (source != null) {
      
      source = Object(source);
    
      for (const key in source) {
      
        const value = object[key];

        if (value === undefined || (eq(value, objectProto[key]) && !hasOwnProperty.call(object, key))) {
          object[key] = source[key];
        }
      }
    }
  })

  return object;
}


// Map function for non-JS arrays
//
var map = (array, func) => {
  let result = [];

  for (let i = 0; i < array.length; i++) {
    result[i] = func(array[i]);
  }
  
  return result;
}

// Convert NSString to JS string
//
var plainString = (value) => {
  if (typeof value == 'string') {
    return value;
  }
  else {
    return value.stringByReplacingPercentEscapesUsingEncoding(NSUTF8StringEncoding);
  }
}

// Create a ComboBox from an array of values
//
var newSelect = (array, frame = []) => {

  let x = frame[0] || 0;
  let y = frame[1] || 0;
  let w = frame[2] || 240;
  let h = frame[3] || 28;

  let rect = NSMakeRect(x, y, w, h);
  let combo = NSComboBox.alloc().initWithFrame(rect);

  combo.addItemsWithObjectValues(array);
  combo.selectItemAtIndex(0);

  return combo;

};

function newCheckbox(title, state, frame = []) {

  state = (state == false) ? NSOffState : NSOnState;

  let x = frame[0] || 0;
  let y = frame[1] || 0;
  let w = frame[2] || 240;
  let h = frame[3] || 28;

  let rect = NSMakeRect(x, y, w, h);
  let checkbox = NSButton.alloc().initWithFrame(rect);

  checkbox.setButtonType(NSSwitchButton);
  checkbox.setBezelStyle(0);
  checkbox.setTitle(title);
  checkbox.setState(state);

  return checkbox;

}

// From a set of styles, create an object with the style names as keys
//
var getStylesByName = (styles) => {
  let result = {};

  for (let i = 0; i < styles.numberOfSharedStyles(); i++) {
    let style = styles.objects().objectAtIndex(i);
    result[style.name()] = style;
  }

  return result;

};


// Simplified Framer style text templates. Pass an object with keys matching any
// {x}'s contained in the string, and they will be swapped
//
var stringTemplate = (input, values) => {

  var result = input;

  if (typeof values === 'object') {

    for (let key in values) {
      let pattern = '{' + key + '}';
      let value = values[key];
      result = result.replace(pattern, values[key]);
    }

  }
  else {
    log('stringTemplate(): values has to be an object');
  }

  return result;

};


// Save data to document
//
var saveToDoc = (key, value) => {

  let id = context.plugin.identifier();
  let docData = context.document.documentData();
  let cmd = context.command;

  cmd.setValue_forKey_onLayer_forPluginIdentifier(value, key, docData, id);
};

// Get data from document
//
var getFromDoc = (key, value) => {

  let id = context.plugin.identifier();
  let docData = context.document.documentData();
  let cmd = context.command;
  
  return cmd.valueForKey_onLayer_forPluginIdentifier(key, docData, id);
};

// Copy layer and text styles from one document to another,
// updating any that already exist by the same name
//
var copyStyles = (source, dest, callback) => {

  let sourceData = source.documentData();
  let destData = dest.documentData();;
  let newCount = 0;
  let updateCount = 0;

  try {

    for (let type of ['layerStyles', 'layerTextStyles']) {
      
      let sourceStyles = sourceData[type]();
      let sourceStylesByName = getStylesByName(sourceStyles);

      let destStyles = destData[type]();
      let destStylesByName = getStylesByName(destStyles);

      for (let name in sourceStylesByName) {
        if (destStylesByName[name]) {

          destStyles.updateValueOfSharedObject_byCopyingInstance(destStylesByName[name], sourceStylesByName[name].style());
          destStyles.synchroniseInstancesOfSharedObject_withInstance(destStylesByName[name], sourceStylesByName[name].style());

          // This should be unnecessary, but fixes the occasional bug where layers in the source document get a 
          // "refresh" icon in the style picker even though its style hasn't changed. So we force refresh it to be sure.
          sourceStyles.updateValueOfSharedObject_byCopyingInstance(sourceStylesByName[name], sourceStylesByName[name].style());
          sourceStyles.synchroniseInstancesOfSharedObject_withInstance(sourceStylesByName[name], sourceStylesByName[name].style());

          updateCount++;
        }
        else {
          destStyles.addSharedStyleWithName_firstInstance(name, sourceStylesByName[name].style());
          newCount++;
        }
      }
    }

    callback(false, {
      updated: updateCount,
      new: newCount
    });
  }

  catch (error) {
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
var pickOptions = (opts = {}) => {

  if (!opts.messageText || !opts.libs) {
    return;
  }

  let doc = context.document;
  let libs = opts.libs;
  let linkedSymbols = doc && doc.documentData().foreignSymbols();

  let defaultIndex = 0;
  let libNames = map(libs, x => x.name());
  let libNamesRaw = map(libNames, x => plainString(x));

      
  // If a document is provided, the select will default
  // to the most commonly used library in that document.
  // Caveat: If multiple libraries by same name, the first
  // match is used.
  //
  if (linkedSymbols) {

    let usedLibs = {};
    let winner = {};

    // Tally up the amount of symbols from each library
    for (let i = 0; i < linkedSymbols.length; i++) {
      let libName = plainString(linkedSymbols[i].sourceLibraryName());

      usedLibs[libName] = usedLibs[libName] || 0;
      usedLibs[libName]++;

      if (!winner.count || (usedLibs[libName] > winner.count)) {
        winner.libName = libName;
        winner.count = usedLibs[libName];
      }
    }
    
    // Find index of the winner in the libIDs array
    let winnerIndex = libNamesRaw.indexOf(winner && winner.libName);

    // I'm not sure it's possible to find symbols in a library
    // not found via AppController, but let's be safe
    defaultIndex = (winnerIndex > -1) ? winnerIndex : 0;
  }

  let alert = COSAlertWindow.new();
  alert.setMessageText(opts.messageText);

  let select = newSelect(libNames);
  select.selectItemAtIndex(defaultIndex);
  alert.addAccessoryView(select);

  if (opts.infoText) {
    alert.setInformativeText(opts.infoText);
  }

  let deleteStyles = newCheckbox("Delete removed styles?", true [0,38,112,16]);
  alert.addAccessoryView(deleteStyles);

  alert.addButtonWithTitle('OK');
  alert.addButtonWithTitle('Cancel');

  alert.alert().window().setInitialFirstResponder(select);
  select.setNextKeyView(deleteStyles);

  let response = alert.runModal();

  if (response === 1000) {

    result = {
      lib: libs[select.indexOfSelectedItem()],
      deleteStyles: deleteStyles.state()
    }

    return result;

  }

  else {
    return null;
  }

};


// ----------------------------------------------------------------------------
//
// MAIN METHODS
//
// ----------------------------------------------------------------------------


var pushStyles = (context) => {

  const libs = AppController.sharedInstance().librariesController().userLibraries();

  if (!libs.length) {
    context.document.showMessage('Couldn\'t find any user defined libraries 🤷‍');
    return;
  }

  const doc = context.document;

  const options = pickOptions({
    libs: libs,
    messageText: 'Push styles to',
    infoText: 'NOTE: If you have your library file open, you have to close and reopen it to see the changes.'
  });

  if (!options) {
    return;
  }

  const lib = options.lib;
  const libUrl = lib.locationOnDisk();

  const libDoc = MSDocument.new();
  libDoc.readDocumentFromURL_ofType_error(libUrl,"sketch", null);
  libDoc.revertToContentsOfURL_ofType_error(libUrl, "sketch", null);

  copyStyles(doc, libDoc, (error, data) => {

    if (error) {
      context.document.showMessage(error);
    }

    else if (data.updated + data.new === 0) {
      context.document.showMessage('Couldn\'t find any styles to push 🤷‍');
    }

    else {

      try {

        libDoc.writeToURL_ofType_forSaveOperation_originalContentsURL_error_(libUrl, "com.bohemiancoding.sketch.drawing", NSSaveOperation, nil, nil);

        let message = '🤘 Pushed ' + (data.updated + data.new) + ' styles';
        if (data.new) message += ' (' + data.new + ' new)';
        context.document.showMessage(message);

      }
      catch (error) {
        context.document.showMessage(error);
      }

    }
  });

};


var pullStyles = (context) => {

  const libs = AppController.sharedInstance().librariesController().userLibraries();

  if (!libs.length) {
    context.document.showMessage('Couldn\'t find any user defined libraries 🤷‍');
    return;
  }

  const doc = context.document;

  const options = pickOptions({
    libs: libs,
    messageText: 'Fetch styles from'
  });

  if (!options) {
    return;
  }

  saveToDoc('defaultPullDeleteStyles', options.deleteStyles);
  let test = getFromDoc('deleteStyles');

  const lib = options.lib;

  copyStyles(lib.document(), doc, (error, data) => {

    if (error) {
      context.document.showMessage(error);
    }

    else if (data.updated + data.new === 0) {
      log(data);
      context.document.showMessage('Couldn\'t find any styles to pull 🤷‍');
    }

    else {

      let message = '🤘 Pulled ' + (data.updated + data.new) + ' styles';
      if (data.new) message += ' (' + data.new + ' new)';
      context.document.showMessage(message);

    }
  });

};


export { pullStyles, pushStyles };