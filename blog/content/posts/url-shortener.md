---
title: "An interviewer once asked me how I would build a url-shortener app. After discussion, I decided to actually do it. Here's what I designed (and how you can contribute to the Open Source project)"
date: 2018-03-31T10:22:20-05:00
tags: ["tutorial", "interview prep"]
external: false
---
About a year back I had an on-site interview at a very large finance company. I spent the day meeting engineers from every department, and was asked to whiteboard solutions to many problems. Some were very mathmatical algorithms, others were architectures for things like microservices and AWS. Among the questions, my favorite was making a URL shortener, similar to bit.ly.

```
THE CHALLENGE
Design a URL shortener app. It should have a dashboard for users that can submit a link to be shortened. The app will generate a shortened version (using its own domain) that would redirect to the URL when navigated to.

EXAMPLE
Submitting www.averylonglink.com/with/additional/routes would produce shortener.io/ohk4 (or something like that). Navigating to shortener.io/ohk4 would load www.averylonglink.com/with/additional/routes.
```

There was no coding, or talk of specific technologies. However, fast-forward to 8 months later, we have a chosen stack and a deployed app.

![](http://www.nickpalenserve.us/public/images/palento_home.png "The home page.")

---

![](http://www.nickpalenserve.us/public/images/palento_dashboard.png "The dashboard.")

The end result is palen-to (The first two syllables of my last name, and the .to TLD).

Most of the original considerations from the interview room went into the implementation (with more on the way). Among these were:

+ A way to randomly generate a URL.
+ A way to ensure all URLs are unique.
+ A way to make custom shortened URL names.
+ A way to preview potentially malicious redirects (planned)

Because Palen-to is branded with my last name, I'm only allowing signups from family members that share it. So I've since built in the following feature:

+ Sign-up restricted to whitelisted individuals.

## How it's made.

I've built a minimal implementation as a fullstack javascript application. Here's the stack with some pertinent technologies:

+ Static HTML \[Frontend]
  + Bootstrap 3 components (minimal)
+ Node/expressJS \[Server]
  + [Swig](http://node-swig.github.io/swig-templates) rendering.
+ MongoDB \[Database]

That's it! Simple, no?

### Setting up redirect routes.

Obviously, the name of the game is looking up dynamic shortened routes and redirecting to a specified longer URL. But that's not the _only_ thing this app should do. Like any well-designed app, this one should have a dashboard and functional routes that allow users to create redirects. These _static_ (or hard-coded, pre-defined) routes should _not_ cause a redirect but instead render our own internal views or api functionality.

So let's start by defining some views:

```
/           -> Landing Page/login
/dashboard  -> Swig-rendered list of redirect routes made, and a field to make new ones.
/error      -> Rendering of errors
/api/*      -> Namespace for different api routes, to allow things like a POST request for making new urls
/:redirect  -> All the rest will attempt to lookup and redirect a short route to a url.
```


It's important to node re: Express, that the order of these routes are _very important_. In general, important/static routes should go first, and dynamic/general routes should go second/last. Express will trigger middlewere the first time it's match. Take this simple example.

```javascript

app.get('/:redirectURL', (req, res) => res.status(308).send('this would be the redirect'));

app.get('/dashboard', (req, res) => res.status(200).send('got the dashboard!');

```

Since the first route is a param (preceeded by a `:`), the route would act as a wild card, catching any named route, _including_ dashboard. If you tried to get to your actual dashboard, we would be intercepted by a redirect lookup every time!

We can reverse these without the inverse being true, however. If `/dashboard` came first, any top level route that wasn't `/dashboard` would skip that middleware and eventually find its way to the redirect lookup.

In the full example, all of these pre-defined routes should go before the redirectURL.

### Creating and looking up redirect links.

Enough planning, let's dive into the main course: the actual shortening of the links. I've opensourced Palen-to into a generic app ready for cloning and deploying, called [https://github.com/nickpalencharopen/tinytiny](TinyTiny). I'll refer to the code there when going into detail about the app, but will refer to the domain where my version is deployed to: [palen.to](https://palen.to). Feel free to clone the opensource version and follow along, or view on GitHub!

#### Data model.

There's only one important data model here, the `Link`. Every url gets shortened to a unique route in the app, such as `'abc'` in `palen.to/abc`. And that identifier has a one-to-one relation with the expanded url. Both these


Assuming the request is not a reserved route (such as `palen.to/dashboard`), we should look up the document in the data model by that route. There we can find the full URL to direct to. In the data model, we have the following values:

+ **link_id**: The shortened link (`abc` in `palen.to/abc`). Also serves as the unique id for the document (looking up documents by the native Mongo `_id` is not nescessary).
+ **expandedUrl**: The full url that the shortened route is supposed to redirect to (i.e. `www.nickpalenchar.com`).

Additionally, we'll add some meta data to the model. Knowing the user that made the shortened link is always helpful for getting list of links for a logged in user, and auditing purposes. A creation date is always a good idea as well.

The full schema of the Link model looks like this! ([view on github](https://github.com/nickpalencharOpen/tinytiny/blob/master/models/link.js)):

```javascript
let mongoose = require('mongoose');

let LinkSchema = new mongoose.Schema({
    link_id: {type: String, unique: true, required: true},
    expandedUrl: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    creationDate: { type: Date, default: Date.now }
});

mongoose.model('Link', LinkSchema);
```

Getting a redirect route is a matter of finding a Link document by its `link_id`. If we get a document back, we can use the `expandedUrl` property for the redirection. Express makes redirects very easy, just call the `res.redirect` method and "Bam!", you get to your destination. If we can't find a document, we send back an internal 404.

([view on github](https://github.com/nickpalencharOpen/tinytiny/blob/master/app.js#L121-L130))

```javascript

app.get('/:id', (req, res) => {
    //@@~~**REDIRECTION TIME**~~@@
    // THIS IS WHAT WE CAME HER FOR PPL1//
    console.log("looking up ", req.params.id);
    return Link.findOne({link_id: req.params.id})
        .then(result => {
            if(result) res.redirect(result.expandedUrl); // i.e. www.nickpalenchar.com
            else res.redirect('/error?code=404'); // beginning with a slash will go to the error route within our app.
        })
});
```


Creating links is a bit more complicated, we need to consider:

+ What characters can make up a shortened link
+ How to prevent duplicate shortened links from being created
+ How to allow custom shortened link names to override randomly created shortened link names, without conflicting with reserved routes.

Choosing the allowed characters and randomly generating a shortened link name is a matter of a utility function:

([view on github](https://github.com/nickpalencharOpen/tinytiny/blob/master/helper/index.js))

```javascript
module.exports.randomHash = function(num=2) {
    let validChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';

    // loop through a number of times specfied when calling (`num`) creating a random string of that length.
    for(let i = 0; i < num; i++){
        result += validChars[Math.floor(Math.random() * validChars.length)]; // concatonate a single random character
    }
    return result;
};
```

I'm choosing to start my random shortened link names to be especially small, 2 characters long. I chose this because there will not be much scale in users (I'm restricting signups to my family, of which none of them are interested in using it ¯\\\_(ツ)\_/¯ ). Still, the possible combination of links will quickly fill up, with the chance of a duplicate being produced likely to happen faster still.

We need a way to both try again if the produced name is taken, and to _increase_ the possible number of available names, should the majority be taken.

```javascript
function tryLink(n=defaultStartLength, attempt=1){
    // randomly tries to find an available link
    return new Promise((resolve, reject) => {
        let id = req.body.customName || randomHash(n); // only make a random name
        return Link.find({link_id: id})
            .then(result => {
                if(result.length) {
                    if(attempt > 100) reject({nick:true, error: "Gave up finding an available link", body: "This might be solved " +
                    "if you try again. If not, the admin might have to expand the algorithm. Wow this app grew quick!"});
                    else return tryLink(n+1, attempt+1);
                }
                if(reserved.includes(id.toLowerCase())){
                    reject({ nick:true, error: "Link is a reserved word", body: "You can't use that! Because programming needs. " +
                    "Try something else. Please note that no uppercase version of the reserved word can be used either, " +
                    "to avoid ambiguity."});
                }
                else return Link.create({link_id: id, expandedUrl, author: req.user._id})
                    .then(result => resolve(result));
            })
    })
}
```


This function wraps a Promise around Mongo lookups, so when our api calls it, we can `.then` off it once, and the final result will be accessible for us to use.

It starts by storing a variable either by a customName (passed in from `req.body`, via a user input form), or a random name (using the util function described earlier).

In both cases we want to make sure the link isn't previously in use, by looking up a Link with `link_id` equal to the name in question. If there is _not_ any document returned, the name has no document and therefore is not in use. A final check is to make sure the name does not conflict with any reserved routes. Reserved routes are kept as an Array in a separate json file and `requireelif in (as `reserved`). We can use `Array.includes`, an ES2016 feature, can be used to make sure the name we came up with is not contained here.

If we find a result, we try again, recursively calling the function. By wraping the entire function in a Promise, and only invoking a resolve in a non-recursive, ending case, we can easily handle the asynchronous nature of Mongo lookups within our recursive calls. The recursive call also increments the length of the random name to generate by 1 _and_ keeps track of how many times it has been recursively called, using a second parameter left alone at the start. This is important--increasing the length after a failed attempt expands the available link names as the app scales, and keeping track of attempts allows me to add an additional fail-safe: to avoid running into, say, an infinite loop by means of something I might have overlooked, we break and error out after the 100th attempt.


The full middleware for this is described below:

([view on github](https://github.com/nickpalencharOpen/tinytiny/blob/master/routes/api.js#L17-L53))


```javascript
router.post('/new-link', requireAuthentication ,(req, res) => {
    let { expandedUrl, customName } = req.body;
    if(!/^https?:\/\//.test(expandedUrl)) expandedUrl = "http://" + expandedUrl; // add `http://` if not already provided, for consistency.

    tryLink()
        .then(result => {
            res.redirect('/dashboard?success=' + JSON.stringify(result));
        })
        .catch( err => {
            if(err.nick) res.render('error', {err} );
            else res.redirect('/error?code=1');
        })
});
```

With these two features in place, you have a minimal app that creates fun little links to easily send around! There's is of course a lot more to this app besides this core feature. Getting into the project will show a lot of additional design for the front end views, authentication/user restriction, security, and so much more. While these two aspects are critical to the app's use, it only scratches the the very top surface in terms of how the app is made. If you really want to level up your coding skills, I would be honored if you checkd out the [open source project](https://www.github.com/nickpalencharOpen/tinytiny) and consider getting involved. I am actively maintaining the app and would love to work with you! 🙌🙌🙌

