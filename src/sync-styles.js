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

// Map function for non-JS arrays
//
var map = (array, func) => {
  let result = [];

  for (let i = 0; i < array.length; i++) {
    result[i] = func(array[i]);
  }
  
  return result;
};

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
var newSelect = (array, frame) => {
  frame = frame || [];
  x = frame[0] || 0;
  y = frame[1] || 0;
  w = frame[2] || 240;
  h = frame[3] || 28;

  let rect = NSMakeRect(x, y, w, h);
  let combo = NSComboBox.alloc().initWithFrame(rect);

  combo.addItemsWithObjectValues(array);
  combo.selectItemAtIndex(0);

  return combo;
};

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


// Copy layer and text styles from one document to another,
// updating any that already exist by the same name
//
var copyStyles = (source, dest, context, callback) => {

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


// Launch popup to pick a library from an array of libraries.
// Returns the chosen library.
//
var pickLibrary = (libs, doc, messageText, infoText) => {

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
  alert.setMessageText(messageText);

  let select = newSelect(libNames);
  select.selectItemAtIndex(defaultIndex);
  alert.addAccessoryView(select);

  if (infoText) {
    alert.setInformativeText(infoText);
  }

  alert.addButtonWithTitle('OK');
  alert.addButtonWithTitle('Cancel');

  alert.alert().window().setInitialFirstResponder(select);

  let response = alert.runModal();

  if (response === 1000) {
    return libs[select.indexOfSelectedItem()];
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
  const lib = pickLibrary(libs, doc, 'Push styles to', 'NOTE: If you have your library file open, you have to close and reopen it to see the changes.');

  if (!lib) {
    return;
  }

  const libUrl = lib.locationOnDisk();

  const libDoc = MSDocument.new();
  libDoc.readDocumentFromURL_ofType_error(libUrl,"sketch", null);
  libDoc.revertToContentsOfURL_ofType_error(libUrl, "sketch", null);

  copyStyles(doc, libDoc, context, (error, data) => {

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
  const lib = pickLibrary(libs, doc, 'Fetch styles from');

  if (!lib) {
    return;
  }

  copyStyles(lib.document(), doc, context, (error, data) => {

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