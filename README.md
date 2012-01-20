LowKick simplifies running and verifying cross-platform javascript tests on command-line. 

It aims to:

  * Publish JavaScript tests at a specified URL
  * Run the tests through drivers (VMs, Remote Machines etc)
  * Provide test frameworks an API to save test results
  * Let developers setup remote test servers

Install
=======
```bash
$ npm install lowkick
```

The Concept
===========
See [test/config.json](https://github.com/azer/lowkick/blob/master/test/config.json) and following screenshots;

  * https://p.twimg.com/Ai3M7nUCAAE6W26.png:large

First Steps
===========

To give LowKick a try, you can run the tests of LowKick. It uses itself to test its frontend API.

```bash
$ git clone git@github.com:azer/lowkick.git
$ cd lowkick
$ make publish
```

It'll start publishing the frontend tests at http://localhost:1314. Visit this page with any web browser.

```bash
$ $BROWSER http://localhost:1314
```

It'll execute specified the JavaScripts, and save the result of execution to a JSON file defined at
the [config file](https://github.com/azer/lowkick/blob/master/test/config.json)

After running the tests on varied environments, you can see the summary of the results;

```bash
$ make verify
Passed: chrome, v8, webkit, safari
Not Tested: ie6, ie, dom, ie8, gecko, ie7, node, firefox

Revision: 0.0.1
Results Source: test/results.json
Config: test/config.json
```

The summary above shows that the tests are run by Google Chrome successfully
and the other target environments such as IE6, firefox haven't been tested yet.

You can simply open the test URL with Internet Explorer, if you feel
comfortable with that way. For those who hate seeing IE, LowKick has drivers and commands.

[The config file](https://github.com/azer/lowkick/blob/master/test/config.json)
of LowKick defines commands the commands IE6, IE7 and IE8 to run its tests
through virtual machines, using the VirtualBox driver, like below;

```json
"ie8": {
  "driver": "virtualbox-ie",
  "vm": "ie8",
  "url": "http://10.0.2.2:1314"
}
```

As you may notice, it uses the driver `virtualbox-ie`, instead of `virtualbox`, to not duplicate some
details that can be seen below;

```json
"ie8": {
  "driver": "virtualbox-ie",
  "vm": "ie8",
  "exec": "C:\\Program Files\\Internet Explorer\\iexplore.exe",
  "params": "http://10.0.2.2:1314"
}
```

# Test Frameworks
LowKick itself is not a test framework and doesn't provide anything test frameworks already accomplish. 
It aims to let developers run all kind of tests on varied environments, from command-line. 

## Jasmine
Download and add those following files to on top of the scripts defined your config file and you're all set to go!

  * https://github.com/pivotal/jasmine/blob/master/lib/jasmine-core/jasmine.js
  * https://raw.github.com/pivotal/jasmine/master/lib/jasmine-core/jasmine-html.js
  * https://raw.github.com/gist/1645217/d49f09320feb1e64f77a0e31ae178573fdb6b1aa/gistfile1.js


# REST API
FIXME

# Projects Using LowKick

  * HighKick
