---
title: "The 7 Habits of Highly Effective Node CLIs"
date: 2018-02-28T10:17:31-05:00
tags: ["javascript", "nodejs"]
aliases:
  - articles/the-7-habits-of-highly-effective-node-clis
---
title:The 7 Habits of Highly Node CLIs (And how to make your own!)
tags:coding,node,javascript
date:02/28/2018

I love building CLI's, and I recommend everyone learning to code build one (or more!). It will teach you a lot about how computers work at a slightly more in-depth level than web browser JavaScript. There one of my favorite types of projects, often done at work. However, I recently finished building the open source CLI, [giftwrap](https://www.npmjs.com/package/@npalenchar/giftwrap)! It turns vanilla JavaScript functions into a CLI themselves (meta, I know). This includes reading the source function's argument's names and setting them as Unix-like flags.


```
// vanilla (ES6) file.
function hello(name="world", greeter="computer"){
  console.log(`Hello ${name}! My name is ${greeter}\n`);
}
```


```
# CLI invokation!
~ $ giftwrap hello --greeter='blog post'
Hello, world! My name is blog post


```


This project definitely involved a few... "creative" solutions, but I learned a ton about architecting a CLI and manipulating data in the process. Throughout developing giftwrap (and internal projects at work), I started a list of the 7 best concepts ("Habits") to learn which will help you build an awesome CLI. Here I will attempt to explain each of these Habits, how they work (with practical examples), and resources for learning and leveraging them further. Note that the list assumes a complete, basic understanding of NodeJS. Furthermore, these Habits were chosen out of my own bias opinion, based on the needs I usually encounter from my own project designs. Even so, I'd bet that you'll likely run into a problem at some point which one of these will solve. Let's get going!


# Habit #1.`process.argv`
> "What's my name?"
> -Walter White


You will probably want users to flag/set options in your CLI. On the command line, this is generally done with single or double dashes (i.e. `-v`, `--dry-run`, `--custom=my-value`). Sometimes it's just the presence of a flag that changes behavior (adding a `-a` flag to `ls` displays **a**ll files including hidden ones), and others require a value, usually delimited by `=` or a space (such as `--set-upstream-to=origin/master` in git).


The node process is aware of extra inputs typed after the file that is ran. Just like how a function can take an arbitrary number of arguments, invoking a node process on the command line can be followed with an arbitrary number of options.
```
~ $ node giftwrap.js --cli-name=hello
```


This example has an extra `--cli-name=hello` after the actual JavaScript file, `giftwrap.js`. Node has a global variable `process.argv`, that keeps track of this data in an array. The 0th index is the `process.execPath` and the 1st index being the name of the file that was just called by Node. More importantly, every additional command given from the shell, delimited by a space, becomes a string argument in that array (this _includes_ plain numbers, i.e. `node giftwrap.js 0` becomes `"0"` in the js file). You can add your own logic to check these values and perform different things depending on their presence/values.


## Parsing the extra flags.


The flags can take any format (such as `-hello`, `hello` or `\$$$%`), but convention would tell you that starting with dashes are the way to go. For simple options such as `-v`, you could use `Array.includes`:

```
let verbose;
if (process.argv.includes('-v') {
    verbose = true;
}
```

Some options allow users to specify extra information, usually in the form of `--key=value` or `--key value`. I'm a fan of using the former syntax, and I usually parse them into an object.

```
// example using `node example.js --key=value`
let options = {};

process.argv.forEach( str => {
    if(/=/.test(str) {
        str = str.split('='); // ['--key', 'value']
        str[0] = str[0].replace(/^--?/, ""); // remove dashes for object (easier access)
        options[str[0]] = str[1];
}

console.log(options.key) //-> 'value';
console.log(options.other) //-> undefined;
```

## Additional resources for Habit #1

Once you get comfortable with this concept, try out npm modules that can do a lot of the heavy lifting for you, such as [argvee](https://www.npmjs.com/package/argvee).

# Habit #2. Regular Expressions
> "Seek and ye shall find" -Matthew 7:7

Regular Expressions (RegEx/RegExp for short) are incredibly powerful. Personally, they're one of my favorite concepts in programming. Once mastered, they can save a ton of time reading through and transforming files (as well as validating many types of inputs like phone numbers and email). If you know the syntax, you'd've realized that RegExp was used just in the last concept example!

`giftwrap` relies on RegExp to both find a function in a file and its arguments. The function's arguments, needed for the options of its future CLI file, is done with a RegExp in this line from [`postFunc.js`](https://github.com/nickpalenchar/gift-wrap/blob/9db325070a8d9bb6364e82472bf567f2de4b4bba/bin/fragments/postFunc.js#L7):

```
let paramNames = fnRef.toString().match(/function.*\((.*)\)/)[1].replace(/\s/g,"").split(',');
```

This line takes the function-to-be-CLI'd and stringifies it, then uses the RegExp `/function.*\((.*)\)/` to look for the function keyword, where after it captures the names within the function body's parenthesis that follows, in a subset. The RegExp.prototype.match method returns the subset needed in the 1st index, hence the `[1]` that comes after. Finally, since arguments are comma separated, I did a `split` on that delimiter to make a neat array of the name of each parameter that will be needed.

The regular expression looks a bit archaic, but once you learn the basic metacharacters, writing simple RegExp becomes a sinch!

![Hello](http://nickpalenserve.herokuapp.com/public/images/function-regexp-breakdown.png "My RegExp explained")

It doesn't hurt that it looks like you can write in a hieroglyphic language either 😉

## Additional resources for Habit #2

Unfortunately, the site where RegExp really clicked for me seems to be gone. If you know of a good resource for learning, let me know in the comments and I'll add it here!

# Habit #3. Prompting the user
> "Can I have a name?" -the Starbucks Barista

Have you ever seen a CLI ask you something like the following?:

```
confirm (y/n): _
```

```
GitHub username: _
```

```
email address (this WILL be public): _
```

These are all prompts, a moment where the CLI pauses and waits for input from that user. In addition to being a requirement for many CLI's, prompts are a great way to make everything more interactive and fun for the user experience.

Unfortunately, one thing Node lacks is a proper `prompt` function (Unlike Python or Ruby, which both have simple ones built-in). But that doesn't mean we can't build our own!

I've found the npm module [`cli-prompt`](https://www.npmjs.com/package/cli-prompt) to fit my basic needs. It gives you a function `prompt` where you can customize the text on the prompt line and get back a response the user types in.

You can, of course, customize this further. I wanted a more specific confirmation prompt that I could use over and over again. I put this in the [helpers section](https://github.com/nickpalenchar/gift-wrap/blob/master/helper/index.js) of my CLI, and imported it everywhere!

```
module.exports.confirm = function confirm (promptText="y/n? ") {


  // set up promise
  return new Promise((resolve) => {


    prompt(promptText, data=> {
      if(/^ye?s?\s*$/i.test(data)){
        // got a yes
        return resolve(true);
      }
      if(/^no?\s*$/i.test(data)) {
        // got a no
        return resolve(false);
      }


      // if we get here the user entered something incorrect. Recursively call to try again.
      console.log(chalk.red("Invalid response, please enter `y` or `n` (without quotes)"));
      return confirm()
    })
  })
};
```
Thanks to wrapping in a promise, I can further chain like so:

```
confirm('Do you really want to exit?')
  .then(response => response && process.exit());
```

# Habit #4. Basic shell commands

The Unix shell is amazing. It gives you power to the computer limited only by what you know (and whether you can `sudo` 😂). While Node is _JavaScript_ in your machine, the shell (_Bash_) is still often used, (via `child_process`). And shell commands can be very convenient.

There's lots of resources for learning these useful commands. You can google them, or type them into a Linux shell or Terminal on Mac to see what they do. Here's a one-line summary of each.

> Note that what Finder (and Window's explorer) call "folders", Linux calls "directories". They are interchangeable, but I'll be using the latter term as its more technical.

+ `ls` - "list" - lists all files and directories within the directory you're currently in.
+ `cd <location>` - "change directory" - change directory to a location specified (Like `~/Desktop`). Typing nothing changes to home.
+ `pwd` - "print working directory" - print the working directory, AKA the directory you're currently in.
+ `cat <file1> [<file2...>]` - "concatenate" - although its original intention was to combine multiple text files and output the result, it is often now used for quickly displaying the contents of a file on the terminal. I use this all the time!
+ `echo <stuff>` - print everything written. A sort of `console.log` of the shell. Useful for getting the values of environment variables (not covered in this post)
+ `mkdir <name>` - "make directory" - Makes a new directory of the given name.
+ `touch <name>` - makes a new, empty file of a given name.
+ `rm <name>` - "remove" - removes a file. To remove a directory, use `rm -rf <name>`.
+ `.` - represents the current directory you're in.
+ `..` - represents one directory up from the one you're in. Useful with `cd`, as `cd ..` brings you out of the current directory and back to its parent.
+ `~` - represents the home directory. Useful shorthand as many important paths start at the home.
+ `/` - represents the root directory. Here is where everything starts. It is the beginning of absolute paths to important system files and everything else.
+ `>>` - "redirect output" - you can redirect output to a file, and the shell will create it if it doesn't exist. Useful with echo: to create a new text file with "Hello World" in it, use `echo "Hello World" >> new-file.txt`

## Additional resources for Habit #4

+ [ShellJS](http://documentup.com/shelljs/shelljs) is a handy npm module that gives you access to the shell in the following form.

```
shelljs.ls('-a').stdout;
// same as `ls -a` in bash shell

shelljs.pwd().stdout;
// same as `pwd` in bash shell

let allFiles = shelljs.ls().stdout.split('\n');
```

Sometimes, shelljs is handier than an `exec` or another child process, as there's no setup needed to read stdio (just remember add the `.stdout` or other i/o name at the end of the method!). Of particular interest to me is the final example, which is an easy one-line way to get names of all files in a directory as an array of filenames.

+ The _Linux Essentials: The LPI Introductory Programme_ manual is a great start to going much deeper, and can be found under the "Linux Essentials" header on [this page](https://www.lpi.org/how-to-get-certified/free-training-materials).

# Concept 5. File System (`fs`) & navigation.
> "Not all those who wander are lost" -The Lord of the Rings

Often, a CLI needs to look around. It might need to create/read files or directories, often in multiple places. At the very least, you will be importing JavaScript files via `require`, all which leverages the Unix file system.

In brief, the file system is how your computer's files are organized. Simple in theory, but the more comfortable you are with the Unix file tree structure, including its syntax, the better you will be at creating powerful CLI's that read and manipulate files and directories, sometimes en masse. It's very powerful and makes you feel really hax0r lvl.

You've probably already navigated a bit using something like `require('../../myModule')`. In the aforementioned example script, the require function looks two levels up from the current working directory for _either_ a file _or_ a directory. Did you get that? It's often a missed point; if `myModule` is a directory, Node looks for an `index.js` file _implicitly_. This is a subtle but great trick as it can be leveraged to scale from one file to a directory of files with more imports, without ever changing the file path.

## Absolute vs Relative paths.

An absolute path begins with a `/` or a `~`, and denotes a _full_ path to a file/directory. A relative path begins with a `..` or `.` (if you want to be explicit), or simply the name of a file/directory within the current working directory. Node (or the shell) will walk the relative path given starting from the current working directory. Developing a keen eye for spotting the difference between the two path types will save a lot of developer time.

Here's a quick case-in-point debugging example: Say a require statement was written as `require('/../../myModule')`, that would be an _absolute_ path (with syntax that looks relative). In fact, this was definitely intended to be a relative path, but because of the beginning `/` it means something completely different. In this case, we're saying, "start at the root, then go up two levels from there \[which would never, ever exist\], and look for `myModule`. App-crashing error!

The better you are with paths, the faster your debugging of silly, silly errors will be.

## `__dirname`

The `__dirname` variable (two underscores), contains a string of the working directory the current file is in. This can come in handy when you need to look around from the file's starting point. `__dirname` can be used in conjunction with a relative path via `path.join`. The result is the ability to use relative paths where absolute paths might be required.

```
let fragment = fs.readFileSync(path.join(__dirname, '../fragments/startFrag.js')); // one level up and then into `fragments` for `startFrag.js`
```
## Additional resources for Habit #5


+ Check out the Node [File System Docs](https://nodejs.org/api/fs.html

# Habit #6. `child_process`
> "Go Forth and Multiply!" -Genisis 9:7

Arguably one of the best things about Node is the child process, which can allow a single-threaded language to scale in parallel. It comes in many forms, `exec`, `execFile`, `spawn`, `fork` and more, and each one gives you access to the shell (see Habit #4). This means that you could execute another file (i.e. `exec('node anotherFile.js')`), you could run a shell script (`execFile('myShellScript.bash'`), or asynchronously fire off a ton of workers (`execAsync('node worker1.js'); execAsync('node worker2.js'); ...`). Or, being a shell, you can execute shell commands directly (`exec('mkdir output && cat frag1.txt frag2.txt >> ./output/newFile.txt')`).

Just as handy is the information returned from these processes. You can get data on if the process failed, and logs or Standard Output the child processes are receiving and can respond to those immediately.

```
const { execFile } = require('child_process');
const path = require('path');

let stderrs = [];

let process = execFile(path.join(__dirname, './myFile.sh', (error, stdout, stderr) => {
  if(error) {
    throw error;
  }
  if(stderr) {
    stderrs.push(stderr)
  }
  if(stdout) {
    console.log(`[child process]: ${stdout}`);
);

process.on('exit', (code) => {
  console.log(`process ended with exit code ${code}`);
  if(stderrs.length) {
    console.log(`${stderrs.length} messages written to stderr, they are:\n ${stderrs.join('\n')`);
    }
  }
});
```
## Additional resources for Habit #5
+ [Node.js Child Processes: Everything You Need To Know](https://medium.freecodecamp.org/node-js-child-processes-everything-you-need-to-know-e69498fe970a) - the difference between `exec`, `fork`, etc can be a bit confusing. This article from [freeCodeCamp](http://www.freecodecamp.org) demystifies it all.

# Habit #7. Publishing Your Node App as a CLI (npm, linking, package.json, .npmignore)
> "It's alive! It's alive, it's alive, it's alive! It's ALIVE" -Dr. Henry Frankenstine

The beauty of running a CLI is the convenience--you simply type the name of the CLI and it runs, no matter where you are in the shell. It's a fundamental feature that many of us take for granted until you realize you always have to run something like `node path/to/giftwrap.js` to invoke a node project. Running a node app as a CLI requires a slightly different configuration.

## Set up your package.json

The first thing you'll want to do is add a `"bin"` key to your `package.json`, this will be an object with keys being the command to type on the terminal, and the value is the path (relative from your project's root) of the file you want to execute _in your shell_.

```
// package.json
{
  // ...
  "bin" {
    "giftwrap": "bin/index.js"
  }
}
```
This example sets `<myProjectRoot>/bin/index.js` to run whenever `giftwrap` is typed (after the next few steps are completed).

Next, we'll have to add a shebang that specifies the language used to interpret the file (node). Remember, the file ran via `bin` is executed in the _shell_, and most of the time the shells default language is Bash. Adding a shebang line will change it to Node.

In `bin/index.js`.

```
#!/usr/bin/env node

let { fork } = require('child_process);

// continue with JavaScript!
```


## Setting up to run your CLI locally

Now you are all set up to execute the binary from the shell. Finally, in a shell, `cd` to your Node project and run `npm link`. This will link the binaries you specified in your `package.json` (`"bin"`) with your `PATH` (which is how all commands you run in the shell are found). You can now run your CLI on your computer anywhere! If you make changes in your project and save them, those changes will be immediately reflected when you run the project in the shell.

Of course, this wouldn't be very useful if only you could run the project, so read on to publish!

## Publishing.

Running `npm publish` in your project's root will attempt to publish your project by looking at the contents of the `package.json`. There are a few properties in that file which have heightened importance at this juncture and are worth reviewing.

```
"name"
```

The `name` property is the name of your project, and that will become the name of your published module. It will be searched on npm as that name and will be downloaded as `npm install <thatName> -g` as well. Names are **global** by default, so if you tried naming your module `bootstrap`, the publish will error and you'll have to choose a different name.

You _can_ publish as a scoped package by using your npm username in the name--it looks like `"@username/packagename"`. When doing this you'll have to run `npm publish --access public` to keep your module accessible to the world (and why wouldn't you!?). If published this way, users will have to specify the fully scoped package name to find it (i.e. you download mine by running `npm install -g @npalenchar/giftwrap`)

It's worth reiterating that you don't _run_ the globally installed npm module as, say, `@npalenchar/giftwrap`; the command(s) you run is strictly defined in the `"bin"` section of the `package.json`. You could `npm install @npalenchar/giftwrap` and then have to run `react-create-app` in the shell, if that's what was specified in your `package.json` (this of course is very misleading).

```
"version"
```

This is another property in your `package.json` that might be ignored until you find you can no longer publish updates to npm! Every time you run `npm publish`, the `"version"` must be unique. Generally, this involves increasing the number. But you could also decrease it, or add words, so long as it hasn't been published as that version in the past. The following would all be acceptable versions for a `package.json`:

```
"1"
"0.9.0"
"2.3.30-beta"
"alpha"
```

The version, however, should always be a string.

I generally follow some sort of `x.y.z` visioning scheme, but it's up to you!

## Additional Resources for Habit #7

+ [npmjs.org - How to publish & update a package](https://docs.npmjs.com/getting-started/publishing-npm-packages) - these are the official docs I read to publish my first CLI. It's fairly easy to pick up and comes with a how-to example video as well!

With these Habits under your belt, you should be able to conjure up a good amount of CLI's that can do some very useful tasks. If you run into problems or find other useful resources, please let me know in the comments and I'll add them to the lists/try to help!
