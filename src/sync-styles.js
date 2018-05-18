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


// Show message
//
var msg = (msg) => {
  context.document.showMessage(msg);
}

// Error handler
//
var error = (msg, error, showMessage = false) => {
  // Display message to user
  if (showMessage) {
    msg(msg);
  }

  // Log it
  log('----------------------------------------');
  log('Style Libraries: ' + msg);
  log('Error:');
  log(error);
}

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
  try {
    return (obj.libraryID && obj.libraryID().toString());
  } catch (e) {
    error("Error while attempting to fetch library ID", e);
    log(obj);
    return undefined;
  }
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
}


// Same as getStylesByName, but returning an array for each name
// instead of just the last style found, to check for duplicates
//
var getAllStylesByName = (styles) => {
  let result = {};

  for (let i = 0; i < styles.numberOfSharedStyles(); i++) {
    let style = styles.objects().objectAtIndex(i);
    let name = style.name();

    if (!result[name]) {
      result[name] = [];
    }

    result[name].push(style);
  }

  return result;
}


// Get instances of a style
//
var getInstancesOfStyle = (style, docData) => {
  let result = [];
  let pages = docData.pages();
  let styleID = style.objectID();
  
  for (let i = 0; i < pages.length; i++) {

    let page = pages[i];
    let children = page.children();
    
    for (let j = 0; j < children.length; j++) {
      
      let child = children[j];
      let sharedObjectID = child.style && child.style().sharedObjectID();
      
      if (sharedObjectID === styleID) {
        result.push(child);
      }
    }
  }

  return result;
}



// Save data to document
//
var setDefault = (key, value) => {

  let id = context.plugin.identifier();
  let docData = context.document.documentData();
  let cmd = context.command;

  cmd.setValue_forKey_onLayer_forPluginIdentifier(value, key, docData, id);
}


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
}


// Create a ComboBox from an array of values
//
var newSelect = (array, frame = {}) => {

  defaults(frame, {
    x: 0,
    y: 0,
    w: 240,
    h: 28
  });

  let rect = NSMakeRect(frame.x, frame.y, frame.w, frame.h);
  let combo = NSComboBox.alloc().initWithFrame(rect);

  combo.addItemsWithObjectValues(array);
  combo.selectItemAtIndex(0);

  return combo;

}


// Create a checkbox
//
function newCheckbox(title, state, frame = {}) {

  state = (state == false) ? NSOffState : NSOnState;

  defaults(frame, {
    x: 0,
    y: 0,
    w: 240,
    h: 24
  });

  let rect = NSMakeRect(frame.x, frame.y, frame.w, frame.h);
  let checkbox = NSButton.alloc().initWithFrame(rect);

  checkbox.setButtonType(NSSwitchButton);
  checkbox.setBezelStyle(0);
  checkbox.setTitle(title);
  checkbox.setState(state);

  return checkbox;
}


// Create text description field
//
function newDescription(text, frame = {}) {

  defaults(frame, {
    x: 0,
    y: 0,
    w: 240,
    h: 28
  });

  let rect = NSMakeRect(frame.x, frame.y, frame.w, frame.h);

  let label = NSTextField.alloc().initWithFrame(rect);

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
var copyStyles = (source, dest, deleteStyles = false, callback = Function()) => {

  let sourceData = source.documentData();
  let destData = dest.documentData();;
  let newCount = 0;
  let updateCount = 0;
  let deleteCount = 0;

  try {

    for (let type of ['layerStyles', 'layerTextStyles']) {
      
      let sourceStyles = sourceData[type]();
      let sourceStylesByName = getStylesByName(sourceStyles);

      let destStyles = destData[type]();
      let destStylesByName = getStylesByName(destStyles);

      for (let name in sourceStylesByName) {
        if (destStylesByName[name]) {

          if (destStyles.updateValueOfSharedObject_byCopyingInstance) {
            destStyles.updateValueOfSharedObject_byCopyingInstance(destStylesByName[name], sourceStylesByName[name].style());
            destStyles.synchroniseInstancesOfSharedObject_withInstance(destStylesByName[name], sourceStylesByName[name].style());

            // This should be unnecessary, but fixes the occasional bug where layers in the source document get a 
            // "refresh" icon in the style picker even though its style hasn't changed. So we force refresh it to be sure.
            sourceStyles.updateValueOfSharedObject_byCopyingInstance(sourceStylesByName[name], sourceStylesByName[name].style());
            sourceStyles.synchroniseInstancesOfSharedObject_withInstance(sourceStylesByName[name], sourceStylesByName[name].style());
          }
          else {
            destStylesByName[name].updateToMatch(sourceStylesByName[name].style());
            destStylesByName[name].resetReferencingInstances();
          }
          updateCount++;
        }
        else {
          if (destStyles.addSharedStyleWithName_firstInstance) {
            destStyles.addSharedStyleWithName_firstInstance(name, sourceStylesByName[name].style());
          }
          else {
            const s = MSSharedStyle.alloc().initWithName_firstInstance(name, sourceStylesByName[name].style());
            destStyles.addSharedObject(s);
          }
          newCount++;
        }
      }
  
      // If the delete option was checked, we delete any style that doesn't have
      // matching style by name in the source document
      //
      if (deleteStyles) {

        for (let name in destStylesByName) {

          if (!sourceStylesByName[name]) {
            destStyles.removeSharedStyle(destStylesByName[name]);
            deleteCount++;
          }
        }

      }
    }

    callback(false, {
      updated: updateCount,
      new: newCount,
      deleted: deleteCount
    });
  }

  catch (error) {
    error('There was a problem while copying styles between documents', error, true);
    callback(error, null);
  }

}


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

    if (libID === undefined) {
      continue;
    }

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
    mergeDuplicates: 1,
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

  if (opts.infoText) {
    alert.setInformativeText(opts.infoText);
  }

  let select = newSelect(libNames);
  select.selectItemAtIndex(defaultLibraryIndex);
  alert.addAccessoryView(select);

  let deleteStylesCheckbox = newCheckbox('Strict sync', opts.deleteStyles, { h: 16 });
  alert.addAccessoryView(deleteStylesCheckbox);

  let deleteStylesDescription = newDescription('Strict sync deletes all styles that don\'t exist in the document you\'re syncing from');
  alert.addAccessoryView(deleteStylesDescription);

  let mergeDuplicatesCheckbox = newCheckbox('Merge duplicate styles', opts.mergeDuplicates);
  alert.addAccessoryView(mergeDuplicatesCheckbox);

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
    opts.mergeDuplicates = mergeDuplicatesCheckbox.state();

    return opts;

  }
  else {
    return null;
  }

}


// ----------------------------------------------------------------------------
//
// MERGE STYLES
//
// ----------------------------------------------------------------------------


// Merge duplicate styles in a document (used for the external library document as well)
var mergeDuplicateStyles = (doc) => {

  let docData = doc.documentData();
  let count = 0;

  try {

    for (let type of ['layerStyles', 'layerTextStyles']) {
      let styles = docData[type]();
      let stylesByName = getAllStylesByName(styles);

      for (let key in stylesByName) {

        let copies = stylesByName[key];

        if (copies.length > 1) {

          for (let i = 1; i < copies.length; i++) {

            // Pre Sketch 50
            if (styles.synchroniseInstancesOfSharedObject_withInstance) {
              styles.synchroniseInstancesOfSharedObject_withInstance(copies[i], copies[0].style());
            }

            // Sketch 50 (maybe older versions too, just don't wanna risk breaking anything I can't test)
            else {
              let instances = getInstancesOfStyle(copies[i], docData);

              for (let instance of instances) {
                instance.style().syncPropertiesFromObject(copies[0].style());
              }              
            }

            styles.removeSharedStyle(copies[i]);
            log('Duplicate style found and merged: ' + copies[i].name());
            count++;

          }

        }

      }

    }

    return count;

  }
  catch (error) {
    msg(error);
  }
}


// Proxy that takes the context as an argument, so merging in the current
// document can be done directly from the menu as well
var mergeCurrentDocDuplicates = (context) => {
  let count = mergeDuplicateStyles(context.document);

  if (count) {
    let message = '🤘 Merged ' + count + ' style';

    if (count > 1) {
      message += 's';
    }

    msg(message);
  }
  else {
    msg('Couldn\'t find any duplicate styles 🤷‍');
  }
}


// ----------------------------------------------------------------------------
//
// PUSH / PULL STYLES
//
// ----------------------------------------------------------------------------


var pushStyles = (context) => {

  const doc = context.document;
  const libs = AppController.sharedInstance().librariesController().userLibraries();

  // Stop here if there are no user libraries
  if (!libs.length) {
    msg('Couldn\'t find any user defined libraries 🤷‍');
    return;
  }

  // Get user options
  const options = selectOptions({
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

  const lib = options.library;
  const libUrl = lib.locationOnDisk();

  const libDoc = MSDocument.new();
  libDoc.readDocumentFromURL_ofType_error(libUrl,"sketch", null);
  libDoc.revertToContentsOfURL_ofType_error(libUrl, "sketch", null);

  copyStyles(doc, libDoc, options.deleteStyles, (error, data) => {

    if (error) {
      return;
    }

    else if (data.updated + data.new === 0) {
      msg('Couldn\'t find any styles to push 🤷‍');
    }

    else {

      try {

        if (options.mergeDuplicates) {
          data.merged = mergeDuplicateStyles(libDoc);
        }

        libDoc.writeToURL_ofType_forSaveOperation_originalContentsURL_error_(libUrl, "com.bohemiancoding.sketch.drawing", NSSaveOperation, nil, nil);

        let message = '🤘 Pushed ' + (data.updated + data.new) + ' style';
  
        if ((data.updated + data.new) > 1) {
          message += 's';
        }
  
        let details = [];

        if (data.new) {
          details.push(data.new + ' new');
        }

        if (data.deleted) {
          details.push('Deleted ' + data.deleted);
        }

        if (data.merged) {
          details.push ('Merged ' + data.merged);
        }

        if (details.length) {
          message += ' (' + details.join(' · ') + ')';
        }

        msg(message);

      }
      catch (error) {
        msg(error);
      }

    }
  });

};


var pullStyles = (context) => {

  const libs = AppController.sharedInstance().librariesController().userLibraries();
  const doc = context.document;

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
    mergeDuplicates: getDefault('defaultMergeDuplicates'),
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

  const lib = options.library;

  copyStyles(lib.document(), doc, options.deleteStyles, (error, data) => {

    if (error) {
      msg(error);
    }

    else if (data.updated + data.new === 0) {
      log(data);
      msg('Couldn\'t find any styles to pull 🤷‍');
    }

    else {

      if (options.mergeDuplicates) {
        data.merged = mergeDuplicateStyles(doc);
      }

      let message = '🤘 Pulled ' + (data.updated + data.new) + ' style';

      if ((data.updated + data.new) > 1) {
        message += 's';
      }

      let details = [];

      if (data.new) {
        details.push(data.new + ' new');
      }

      if (data.deleted) {
        details.push ('Deleted ' + data.deleted);
      }

      if (data.merged) {
        details.push ('Merged ' + data.merged);
      }

      if (details.length) {
        message += ' (' + details.join(' · ') + ')';
      }

      msg(message);

    }
  });

};

export { pullStyles, pushStyles, mergeCurrentDocDuplicates };
