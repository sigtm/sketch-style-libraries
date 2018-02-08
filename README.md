![Icon](assets/icon.svg)

# Sketch Style Libraries

A lightweight plugin that lets you pull layer & text styles from a Sketch Library, so your project is always in sync.

👌 Keep your whole design system in your library, and not just the symbols

👌 No manual export/import via separate "style files"

👌 No need to sync with another cloud service 


## Usage

1. Install plugin
2. Plugins -> 🔗 Sync styles from library...
3. Pick a library to import/update styles from
4. Profit

## Installing

<a href="http://bit.ly/SketchRunnerWebsite"><img src="http://bit.ly/RunnerBadgeBlue" width="160" height="41"></a>

The easiest way to install Style Libraries is via Sketch Runner. Otherwise, you can clone this repo or grab the [latest release](https://github.com/sigtm/sketch-style-libraries/releases/latest)) and double click the `.sketchplugin` file to install it manually.


## What it does

Existing styles are updated (matched by name), and missing ones are added.

If you've placed symbols from a library, it will be selected by default in the library list. If you've used multiple libraries, the most heavily used one will be selected.

*NOTE:* I only came across [Library Styles Sync](https://github.com/zeroheight/library-styles-sync) after publishing this, so check it out and see which one fits your workflow best. That one pulls all styles from any library you have placed a symbol from, while mine pulls from one selected library at a time. 

So a bit more control, but adding an additional step. Beyond that, they do the same thing.

So if you've used multiple libraries (generic iOS/Android libraries for device mockups for example) but dont want their styles added to your project files, this plugin might come in handy. Or if you want just the styles without placing any symbols. Otherwise, Library Styles Sync works just as well :)


## Acknowledgements

This plugin was made almost entirely by repurposing bits of code from existing plugins, as it was the only way I could figure out how to do anything. 

Particular credit goes to these two excellent plugins, which I wholeheartedly recommend:

[Styles Generator](https://github.com/lucaorio/sketch-styles-generator)

[Shared Text Styles](https://github.com/nilshoenson/shared-text-styles)


## Input

Hopefully this functionality will be added natively soon, but I will keep maintaining this in the meantime. If you have any thoughts, suggestions or feedback, please don't hesitate to [create an issue](https://github.com/sigtm/sketch-style-libraries/issues)!