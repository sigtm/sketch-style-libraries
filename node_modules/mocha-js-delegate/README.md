MochaJSDelegate
===============

What is it?
-----------

`MochaJSDelegate` is a way for scripts written in CocoaScript ([Mocha](https://github.com/logancollins/Mocha)) to create delegates for use with native AppKit/UIKit classes. This was originally written for use in Sketch 3+.

How do I use it?
----------------

The following example will create a `WebView` and set its frame delegate:

````javascript
@import 'MochaJSDelegate.js'

/*
    This is so our script's JSContext sticks around,
    instead of being destroyed as soon as the current execution block is finished.
*/

COScript.currentCOScript().setShouldKeepAround_(true);

//	Create a WebView

var webView = WebView.new();

//	Create a delegate

var delegate = new MochaJSDelegate({
    "webView:didFinishLoadForFrame:": (function(webView, webFrame){
        var app = [NSApplication sharedApplication];
        [app displayDialog:"WebView Loaded!" withTitle:"Success!"];

        COScript.currentCOScript().setShouldKeepAround_(false);
    })
});

//	(You can also do this:)

delegate.setHandlerForSelector("webView:didFinishLoadForFrame:", function(webView, webFrame){
    var app = [NSApplication sharedApplication];
    [app displayDialog:"WebView Loaded!" withTitle:"Success!"];
});

//	Set WebView's frame load delegate

webView.setFrameLoadDelegate_(delegate.getClassInstance());
webView.setMainFrameURL_("http://google.com/");
````

There are a few other convience methods `MochaJSDelegate` makes available, for more information check out the source.

How does it work?
----------------

`MochaJSDelegate` leverages [Mocha's](https://github.com/logancollins/Mocha) methods for manipulating the Objective-C runtime. Each delegate creates an `NSObject` subclass, creates method implementations corresponding to your selectors, and ensures that your function is invoked when they are called. (Mocha makes this really easy, once you wade through the source and figure it all out.)

Notes/Caveats:
----------

 - Every time you create a `MochaJSDelegate`,  a new `NSObject` subclass is created. I've taken pains to ensure none of them is likely to conflict with any others floating around the runtime, so the only issue one might have is a bunch of classes being created in the runtime.
 - This won't work for classes that require their delegates to implement a specific Protocol (and perform a strict check). It's technically possible for the subclass to inherit and implement the necessary Protocol, but that isn't possible at this time for certain [reasons](https://github.com/logancollins/Mocha/issues/25).
 - I'm very new to Sketch/CocoaScript/Mocha, so I might be doing something stupid here (correction: *am likely doing something stupid)
