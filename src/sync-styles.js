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

// Launch popup to pick a library from a set of libraries.
// Returns the chosen library.
//
var pickLibrary = (libs, doc) => {

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

    log(usedLibs);
    
    // Find index of the winner in the libIDs array
    let winnerIndex = libNamesRaw.indexOf(winner && winner.libName);

    // I'm not sure it's possible to find symbols in a library
    // not found via AppController, but let's be safe
    defaultIndex = (winnerIndex > -1) ? winnerIndex : 0;
  }

  let alert = COSAlertWindow.new();
  let select = newSelect(libNames);
  select.selectItemAtIndex(defaultIndex);

  alert.addAccessoryView(select);
  alert.setMessageText('Choose a library to sync styles from...');
  alert.addButtonWithTitle("OK");
  alert.addButtonWithTitle("Cancel");

  alert.alert().window().setInitialFirstResponder(select);

  let response = alert.runModal();

  if (response === 1000) {
    return libs[select.indexOfSelectedItem()];
  }
  else {
    return -1;
  }
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

// Copy layer and text styles from one document to another,
// updating any that already exist by the same name
//
var copyStylesFromDocument = (source, dest, context) => {

  let sourceData = source.documentData();
  let destData = dest.documentData();
  let newCount = 0;
  let updateCount = 0;
  
  for (let type of ['layerStyles', 'layerTextStyles']) {
    
    let sourceStyles = sourceData[type]();
    let sourceStylesByName = getStylesByName(sourceStyles);

    let destStyles = destData[type]();
    let destStylesByName = getStylesByName(destStyles);

    for (let name in sourceStylesByName) {
      if (destStylesByName[name]) {
        destStyles.updateValueOfSharedObject_byCopyingInstance(destStylesByName[name], sourceStylesByName[name].style());
        destStyles.synchroniseInstancesOfSharedObject_withInstance(destStylesByName[name], sourceStylesByName[name].style());
        updateCount++;
      }
      else {
        destStyles.addSharedStyleWithName_firstInstance(name, sourceStylesByName[name].style());
        newCount++;
      }
    }
  }

  let totalCount = newCount + updateCount;

  if (totalCount) {
    var message = '🤘 ' + totalCount + ' styles synced';
    if (newCount) message += ' (' + newCount + ' new)';
  }
  else {
    var message = 'No styles found in the selected library';
  }

  context.document.showMessage(message);
};

var syncStyles = (context) => {

  const doc = context.document;
  const libs = AppController.sharedInstance().librariesController().userLibraries();
  const lib = pickLibrary(libs, doc);

  copyStylesFromDocument(lib.document(), doc, context);

};

export default syncStyles;