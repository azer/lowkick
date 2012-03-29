Simplifies executing JavaScript code on varied environments, from command-line. 

It aims to:

  * Publish JavaScript tests at a specified URL
  * Run the tests through drivers (VMs, Remote Machines etc)
  * Provide test frameworks an API to save test results
  * Let developers setup remote test servers

# Install

```bash
$ npm install lowkick
```

# Concept

LowKick can be considered as a JavaScript server coming with several utilities and APIs that provide developers a unified way of JavaScript execution.
It abstracts the differences of varied platforms by defining [drivers](https://github.com/azer/lowkick/tree/master/lib/drivers) and [commands](https://github.com/azer/lowkick/blob/master/test/config.json#L24).


See example configuration files:

  * [test/config.json](https://github.com/azer/lowkick/blob/master/test/config.json)
  * [test/remote-server-config.json](https://github.com/azer/lowkick/blob/master/test/remote-server-config.json)
  * [test/remote-client-config.json](https://github.com/azer/lowkick/blob/master/test/remote-client-config.json)

And following screenshots:

  * https://p.twimg.com/Ai3M7nUCAAE6W26.png:large

# First Steps

To give LowKick a try, you can run the tests of LowKick. It uses itself to test its frontend API.

```bash
$ git clone git@github.com:azer/lowkick.git
$ cd lowkick
$ make publish # equivalent of "lowkick publish test/config.json"
```

It'll start publishing the frontend tests at http://localhost:1314. Visit this page with any web browser.

```bash
$ $BROWSER http://localhost:1314
```

It'll execute specified the JavaScripts, and save the result of execution to a JSON file defined at
the [config file](https://github.com/azer/lowkick/blob/master/test/config.json)

After running the tests on varied environments, you can see the summary of the results;

```bash
$ make verify # equivalent of "lowkick verify test/config.json"
Passed: chrome, v8, webkit, safari
Not Tested: ie6, ie, dom, ie8, gecko, ie7, node, firefox

Revision: 0.0.1
Results Source: test/results.json
Config: test/config.json
```

The summary above shows that the tests are run by Google Chrome successfully
and the other target environments such as IE6, firefox haven't been tested yet.

## Testing IE Headlessly

You can simply open the test URL with Internet Explorer, if you feel
comfortable with that way. For those who hate seeing IE should LowKick's drivers and commands.

If you have a VirtualBox VM named "ie6" (ie7 or ie8 counts, as well) on your system, following command should work;

```bash
$ make test-ie6 # equivalent of "lowkick command ie6 test/config.json"
```

First question came to your mind is probably "Does LowKick provide these commands?", the answer is no. 
Commands are defined in config files. Which means, you can edit the IE command above if it doesn't work for you. 

## Defining Commands

[The config file](https://github.com/azer/lowkick/blob/master/test/config.json)
of LowKick defines the commands IE6, IE7 and IE8 to run its tests
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

# REST API

FIX ME

# Working with Test Frameworks
LowKick itself is not a test framework and doesn't provide anything test frameworks already accomplish. 
It aims to let developers run all kind of tests on varied environments, from command-line. 

## Jasmine

Download and add those following files to on top of the scripts defined your config file and you're all set to go!

  * https://github.com/pivotal/jasmine/blob/master/lib/jasmine-core/jasmine.js
  * https://raw.github.com/pivotal/jasmine/master/lib/jasmine-core/jasmine-html.js
  * https://raw.github.com/gist/1645217/d49f09320feb1e64f77a0e31ae178573fdb6b1aa/gistfile1.js

# Setting Up Remote Servers

# Projects Using LowKick

  * [HighKick](http://github.com/azer/highkick)

# Troubleshooting

  * Resetting VMs solves problems.
  * Make sure that the VM on which you're trying to run tests is saved.
  * To reset a VM running headlessly; `vboxmanage controlvm "$1" reset`