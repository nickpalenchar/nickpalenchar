---
title: "Consider Less Anonymous Functions"
date: 2018-04-29T10:26:24-05:00
---
This post is about coding style. What is coding style? It's a conscious choice in the way the author writes code where such writing is justified by what the author is trying to express. It is not a "best practice", nor is it appropriate in all situations. But it's great for reflection. Recently I've been thinking about anonymous functions (specifically in JavaScript), and what happens when I use them less often.

Anonymous functions are a great feature in JavaScript (especially with the dawn of Arrow Functions), however there are some nice advantages when you use them less. Here are the ones I've noted:

## Functions are decoupled from the processes that use them.

By design, anonymous functions can only be used once (in their Function Declaration syntax). So it follows that the function body is written wherever it's used. We see this a lot in higher order array methods and other functional programing styles:

```javascript

let recordsAfter2000 = records.map((record, i) => {
  if (record.rlsDate) {
    record.date = record.rlsDate;
    delete record.rlsDate;
  }
  if (record.releaseDate) {
    record.date = record.releaseDate;
    delete record.releaseDate;
  }
  return record;
})
  .filter((record) => record.date >= 2000);

```

This might take some time to understand, especially if you're new to programing. Refactoring is also a bit tricky, since you'll need to track and understand exactly where logic begins and ends.

```javascript

let recordsAfter2000 = records.map(standardizeRecords)
                       .filter(filterBefore2000);

// more detail (if you want it!)
function standardizeRecords (record) {
  if (record.rlsDate) {
    record.date = record.rlsDate;
    delete record.rlsDate;
  }
  if (record.releaseDate) {
    record.date = record.releaseDate;
    delete record.releaseDate;
  }
  return record;
}

function filterBefore2000(record) {
  return record.date >= 2000;
}
```

You don't really need to look at the actual logic of the functions, you now get that the records are standardized in _some sense_ (this example theorizes two different sources of data with a release date written differently). You then know that records before 2000 are being filtered out.

Yes, this is [Higher Order Functions](https://eloquentjavascript.net/05_higher_order.html). But using named functions as a means to decouple from a process, even if the process does only one thing, can be helpful. 

## Easier to scale and reuse.

You may never think you'll need to reuse that anonymous function from a `.map`, but how many times to requirements and architecture change? And when they do change, you'll need to take some time to reorient yourself with the old function, remembering where it begins and ends, and making sure you don't mistakingly drag out any code that isn't part of the function. I also enjoy the discipline that starting with a named function implies--you are starting from the assumption that the code _will_ scale, and are being careful as deliberate as such.

## Easier to debug.

This is an often forgotten point, but when a program crashes, the name of the function will be available in the stack trace. Depending on the situation, it can be very helpful to know that a program definitively crashed at a certain function. When the crash was a result of multiple functions, seeing every name of each one involved could save a lot of time where you would otherwise manually trace where the data was flowing call to call.

> hint: this can be used inline even if you're not abstracting functions, i.e. `something.map(function ADD_NAME(item) { /*...*/ })`

## (Usually) More Readable.

This can be especially helpful when working in a shared codebase. Maybe you've written a function that is designed to be pure, only to have another engineer modify it to add side-effects, or even just do a secondary task which leads to confusing logic. Maybe the extra code prevents the function's original job in some edge cases. A named function might prevent the odd modification from ever arising. Just the name `filterBefore2000` on a function implies it should do a specific, singular task. Who knows, other engineers might think twice before modifying.

## Minimizes indentation
Anonymous functions are almost always inside another block of code. Sometimes, I just really like as few indentations as possible. Especially when other engineers contribute, there's a better chance if the entire script being well written and organized. In the example above, code is never indented more than once. Yay!

I've enjoyed naming more of my functions for all these reasons, as well as the general mindset doing so puts me in. There is lots of power in being very declarative with your programming. Code is more readable, and the coding is driven by intention, ensuring you've thought through the process of every step needed to achieve your app's goals.

Thanks for reading!

