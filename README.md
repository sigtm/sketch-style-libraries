![Icon](assets/icon.svg)

# Sketch Style Libraries

A lightweight plugin that lets you sync layer & text styles with a Sketch Library, so your project is always in sync.

👌 Keep your whole design system in your library, and not just the symbols

👌 No manual export/import via separate "style files"

👌 No need to sync with another cloud service 


## Usage

1. Install plugin
2. Plugins -> 🔗 Sync styles with library -> Fetch from... *or* Push to...
3. Pick a library
4. Profit

## Installing

<a href="http://bit.ly/SketchRunnerWebsite"><img src="http://bit.ly/RunnerBadgeBlue" width="160" height="41"></a>

The easiest way to install Style Libraries is via Sketch Runner. Otherwise, you can clone this repo or grab the [latest release](https://github.com/sigtm/sketch-style-libraries/releases/latest) and double click the `.sketchplugin` file to install it manually.


## What it does

Existing styles are updated (matched by name), and missing ones are added. If you use "strict mode", it will also remove any styles that don't exist in your library – and vice versa if you're pushing to a library.


## What's new

*1.0.0*

* Strict mode added, which deletes styles that don't exist in the file you're syncing from
* More reliably guesses a default library the first time you run it, by counting the symbols you've placed from each available library
* Remembers your options. Strict mode is stored separately for pushing and pulling in case you only want to use it in one direction.


## What's next

* Look into supporting Cloud Libraries
* Merging duplicate styles if possible


## Acknowledgements

This plugin was made almost entirely by repurposing bits of code from existing plugins, as it was the only way I could figure out how to do anything. 

Particular credit goes to these excellent plugins, which I wholeheartedly recommend:

[Styles Generator](https://github.com/lucaorio/sketch-styles-generator)

[Shared Text Styles](https://github.com/nilshoenson/shared-text-styles)

[Move to library](https://github.com/ahmedmigo/Move-to-library-sketchplugin)


## Input

Hopefully this functionality will be added natively soon, but I will keep maintaining this in the meantime. If you have any thoughts, suggestions or feedback, please don't hesitate to [create an issue](https://github.com/sigtm/sketch-style-libraries/issues)!
