# Branches and why they matter

This is Git's superpower.

Imagine you are working on a game. You want to try adding a new "Flying" mechanic, but you aren't sure if it will work. You don't want to break the main game code while you experiment.

In Git, you create a **Branch**.

## Parallel Universes

A branch is a parallel version of your code.

- You can mess up everything in your branch.
- The main branch (usually called `main` or `master`) remains safe and untouched.

## 1. Creating a branch

To create a new universe:

```bash
git branch fly-mechanic
```

## 2. Switching branches

To step into that universe:

```bash
git switch fly-mechanic
```

_(Old Git versions use `git checkout fly-mechanic`)_

Now, any commits you make happen ONLY in `fly-mechanic`. The `main` branch doesn't know about them.

## 3. Merging (Bringing it back)

If your experiment works, you want to bring those changes back to the main game.

1. Switch back to main: `git switch main`
2. Merge the branch: `git merge fly-mechanic`

Now the changes from `fly-mechanic` are part of `main`.

## Helpful resources

- [Git Branching - Basic Branching and Merging](https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging)
- [Learn Git Branching (Interactive Game)](https://learngitbranching.js.org/)
