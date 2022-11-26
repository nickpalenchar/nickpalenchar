---
title: "Life Changing Git Commands You Probably Aren't Using."
date: 2018-05-27T10:28:33-05:00
tags: ["git"]
aliases: 
  - /git
---

Every developer uses some kind of version-control system (sometimes called VCS). It a fail-safe to losing work, allowing you to jump back in time and reference files as they once were. Because branching is supported, so much more than linearly stepping back in time is possible. VCS is the backbone for agile collaboration, allowing each developer to have their own copy of some codebase, where they can work at their own pace and merge changes back into a master copy when ready.

## Figuring out `git`

If you or your company uses GitHub, you're probably very familiar with git. Depending on how well you can wrangle the CLI, git can be amazingly useful or incredibly infuriating. And like everyone else using git, I've ran into numerous problems and found my own various ways out of them. As my experience grew I began to keep a log of "git solutions", which in turn revealed a few useful commands I commonly employ. While simple, they've come in handy time and again. Maybe they'll come in handy for you as well!

I call these commands "life-changing" because they are so simple yet pretty unknown. But most importantly, after adopting them you will probably find notable differences in your workflow. You'll (hopefully) spend less time on git and more time on what matters--pushing that code!

### `git remote -v`

The `-v` option stands for "verbose". Many people use `git remote` to verify a remote (usually named `origin`) was added to a repo. Fine for that single case, but we don't get much more information. Especially since most repos have only one remote, frequently with the same `origin` name. If you want a bit more info, `-v` gives you the URL to which those generic `origin` remotes are actually pointing too. I like to think of it as knowing what the value of a variable is in a certain instance, which is often helpful in debugging situations.

**Why it's life-changing:** Ever have a directory you _think_ linked to a certain remote repo but wasn't sure? A directory holding a git project does not have to have the same name as the repo on, say, GitHub, so it could be a similar or vastly outdated repo. Out of caution, some developers might just delete the directory and re-clone the repo, ensuring it is the project they want. But `git remote -v` can validate the remote repo in one step. Observe this sample output:

```shell
$ git remote -v
origin  https://github.com/nickpalenchar/nickpalenchar.git (fetch)
origin  https://github.com/nickpalenchar/nickpalenchar.git (push)
```
The location of where I ran this command is a repo that is linked to my `nickpalenchar` repository under my username (`nickpalenchar`). No recloning needed!

### `git commit --allow-empty -m 'your message...'`

Generally, when you try to commit when nothing is staged for doing so, you'll get a `nothing to commit, working tree clean` response, with no commit made. The `--allow-empty` flag bypasses this saftey check, allowing (you guessed it) an empty commit. So even when nothing is staged or changed, a commit will be written to the git log.

**Why it's life-changing:** (I love showing off this one.) There are lots of situations where you need to test doing something with a new commit in order to verify some sort of workflow. A common scenario in my work is verifying a webhook in Continuous Integration will pick up a newly pushed branch. I _could_ `touch yet_another_new_file`, then add it, _then_ commit it. Or I could `git commit --allow-empty -m 'empty commit for debugging'` and push that. So convenient. Just one word of warning: you probably don't want this in a more formal codebase; but it's great for a prototyping/testing repo that you will dispose of.

### `git stash` / `git stash pop`

Admittedly a little more well-known, but if you _weren't_ aware of `stash`, I'm glad I can take this opportunity to enlighten you. `git stash` sets all your working changes aside (on a stack) and gives you a clean working directory. You can git stash multiple times, and the most recent stash will be at the top if the stack that git has been adding them too. As it goes with stacks, `git stash pop` will pop the top-most set of working changes and add them back to the branch you're currently on, ready to be modified or committed.

**Why it's life-changing:** The most common use for a quick `git stash`/`git stash pop` is to move the working changes you've made from one branch to another. Say you've started working on some changes, only to realize you're on the `master` branch! Depending on your repo setup (and if you're in a team), you probably can't push changes from your master branch. You're stuck! This is the classic opportunity for the stash command. Simply `git stash` to set those changes aside, restoring your master branch to good-standing cleanness. Then `git checkout` the branch you intended to use and `git stash pop`. All your new work has been seamlessly moved from one branch to another!

### `git rm --cached`

Another one that's a bit well known, but not known enough in my opinion (or I wouldn't still be removing files that were considered removed). `git rm` can remove a file that has previously been committed, but adding `--cached` will better ensure it does not come back.

**Why it's life-changing:** It's life changing when trying to update a `.gitingore` file. Life gets tough when you `git add .` and commit before you remember to add a certain file to a `.gitignore`. Now you have a file tracked that you did not want. To fix this problem in a fool-proof way, you can `git rm --cached name_of_file` (for directory use `git rm --cached -r name_of_dir`), add the file to `.gitignore` and commit all changes. You won't find that file ever showing up in that repo's tracking again. Another word of caution: this is NOT a solution for removing secrets that were accidentally committed, as they will still exist in the git log! But for something like say, removing `node_modules`, this would be the perfect solution.

### Bonus: git auto-complete

Not an actual command but I had to include as it's probably the biggest life-changing thing you can do with git! Git autocomplete will save you a _LOT_ of time (both in typing and fixing typos). Once set up, you'll be able to start typing a few characters of a name, then tab to auto-complete or see all possibilities of the current name fragment. It can autocomplete names of git subcommands, remotes, and branches. You can find steps to set this up [here](http://code-worrier.com/blog/autocomplete-git/) or here in [my bash profile](https://github.com/nickpalenchar/swanked-out-bash).

I love these commands. They've solved common problems quickly, and  have largley improved my overall git competency. Do you have any git commands/tricks you've found to be time-saving? fool-proofing? life-changing!? I'd love for you to share your common git commands in the comments. Thanks for reading!

