# Comfortable Atcoder
This is a chrome extension which comforts your atcoder life.

See [Features](#Features) for more detail.

## Installation
1. Download Release.zip from [Releases](https://github.com/drafear/comfortable-atcoder/releases) and extract it

2. Open [chrome://extensions/](chrome://extensions/)

3. Drag & drop the directory to the page to load this chrome extension
<!-- Visit the [website](http://hoge.com) and -->

## Features
- Notify judge result of codes you submit
- Notify new clarifications on the contest page you open
- ~~Sync favorite users~~
- Add a link tab to beta page on non-beta pages
- Dropdown list of problems
- Warn if you select specific languages for submission such as `text`, `bash` and so on (configurable)
- Disable/Enable them

## Developing
To develop this chrome extention, clone this repository first.

You can install recommended modules for [Visual Studio Code](https://code.visualstudio.com/) from `@recommended`.

### Build for developing
1. Run the following command to watch the `src` directory:
```bash
npm run watch
```
2. Load `src` as a chrome extension on [](chrome://extensions/)
3. After you edit some source file and save it, reload [](chrome://extensions/) to apply the changes

### Build for release
1. Run the following command to build the `dist` directory:
```bash
npm run build
```
2. Load `dist` as a chrome extension on [](chrome://extensions/)
