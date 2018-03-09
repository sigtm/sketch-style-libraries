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
  });

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


// Get the libraryID() of an object as a string
//
var getLibraryID = (obj) => {
  return obj.libraryID().toString();
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
var setDefault = (key, value) => {

  let id = context.plugin.identifier();
  let docData = context.document.documentData();
  let cmd = context.command;

  cmd.setValue_forKey_onLayer_forPluginIdentifier(value, key, docData, id);
};


// Get data from document
//
var getDefault = (key, value) => {

  let id = context.plugin.identifier();
  let docData = context.document.documentData();
  let cmd = context.command;

  let result = cmd.valueForKey_onLayer_forPluginIdentifier(key, docData, id);

  // Return undefined if null, so defaults() doesn't skip it
  if (result === null) {
    result = undefined;
  }

  return result;
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


// Get the most used library in the document, by symbol count
// Returns the ID of the top library
//
var getTopLibrary = () => {

  let foreignSymbols = context.document.documentData().foreignSymbols();

  let usedLibs = {};
  let winner = {
    id: null,
    count: 0
  };

  // Tally up the amount of symbols from each library
  for (let i = 0; i < foreignSymbols.length; i++) {

    let libID = getLibraryID(foreignSymbols[i]);

    if (!usedLibs[libID]) {
      usedLibs[libID] = {
        id: libID,
        count: 0
      }
    }

    let lib = usedLibs[libID];

    lib.count++

    if (lib.count > winner.count) {
      winner = lib;
    }
  }
  
  return winner.id;
}


// Launch popup for picking your push/pull options
// Pass it default values if you want
//
var selectOptions = (opts = {}) => {

  opts = defaults(opts, {
    libs: AppController.sharedInstance().librariesController().userLibraries(),
    deleteStyles: 0,
    infoText: null,
    libraryID: getTopLibrary(),
    messageText: "Pick your library"
  });

  const libNames = map(opts.libs, x => x.name());

  let defaultLibraryIndex = 0;

  // If a default library ID exists, find its index in the libs array
  if (opts.libraryID) {
    for (let i = 0; i < opts.libs.length; i++) {
      if (opts.libraryID == getLibraryID(opts.libs[i])) {
        defaultLibraryIndex = i;
        break;
      }
    }
  }

  // Create alert window

  let alert = COSAlertWindow.new();
  alert.setMessageText(opts.messageText);

  let select = newSelect(libNames);
  select.selectItemAtIndex(defaultLibraryIndex);
  alert.addAccessoryView(select);

  if (opts.infoText) {
    alert.setInformativeText(opts.infoText);
  }

  let deleteStylesCheckbox = newCheckbox("Delete removed styles?", opts.deleteStyles, [0,38,112,16]);
  alert.addAccessoryView(deleteStylesCheckbox);

  alert.addButtonWithTitle('OK');
  alert.addButtonWithTitle('Cancel');

  // Set keyboard responders

  alert.alert().window().setInitialFirstResponder(select);
  select.setNextKeyView(deleteStylesCheckbox);

  // Run modal and evaluate response

  let response = alert.runModal();

  if (response === 1000) {

    opts.library = opts.libs[select.indexOfSelectedItem()];
    opts.libraryID = getLibraryID(opts.library);
    opts.deleteStyles = deleteStylesCheckbox.state();

    return opts;

  }
  else {
    return null;
  }

}



// ----------------------------------------------------------------------------
//
// MAIN METHODS
//
// ----------------------------------------------------------------------------


var pushStyles = (context) => {

  const doc = context.document;
  const libs = AppController.sharedInstance().librariesController().userLibraries();

  // Stop here if there are no user libraries
  if (!libs.length) {
    context.document.showMessage('Couldn\'t find any user defined libraries 🤷‍');
    return;
  }

  // Get user options
  const options = selectOptions({
    deleteStyles: getDefault('defaultPushDeleteStyles'),
    infoText: 'NOTE: If you have your library file open, you have to close and reopen it to see the changes.',
    libraryID: getDefault('defaultLibraryID'),
    libs: libs,
    messageText: 'Push styles to'
  });

  // Stop here if the user clicked cancel
  if (!options) {
    return;
  }

  // Save the user options as defaults for next time
  setDefault('defaultPushDeleteStyles', options.deleteStyles);
  setDefault('defaultLibraryID', options.libraryID);


  // Draw the rest of the owl

  const lib = options.library;
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
  const doc = context.document;

  // Stop here if there are no user libraries
  if (!libs.length) {
    context.document.showMessage('Couldn\'t find any user defined libraries 🤷‍');
    return;
  }

  // Get user options
  options = selectOptions({
    deleteStyles: getDefault('defaultPullDeleteStyles'),
    libraryID: getDefault('defaultLibraryID'),
    libs: libs,
    messageText: 'Fetch styles from',
  });

  // Stop here if the user clicked cancel
  if (!options) {
    return;
  }

  // Save user options as defaults for next time
  setDefault('defaultPullDeleteStyles', options.deleteStyles);
  setDefault('defaultLibraryID', options.libraryID);


  // Draw the rest of the owl

  const lib = options.library;

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