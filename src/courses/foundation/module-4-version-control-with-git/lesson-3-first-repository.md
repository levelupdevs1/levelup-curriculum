# Your first repository (init, add, commit)

It is time to create your first Git repository (or "repo"). A repo is just a project folder that Git is watching.

## The Three Stages of Git

Understanding this is the key to mastering Git.

1.  **Working Directory**: Your actual files where you type code.
2.  **Staging Area**: A preparation zone where you choose what to include in the next save.
3.  **Repository (.git)**: The database where your history is saved.

## Step 1: Initialize a repository (`git init`)

Let's create a project:

```bash
mkdir my-git-project
cd my-git-project
git init
```

The `git init` command turns the current folder into a Git repository. It creates a hidden folder named `.git`.

## Step 2: Check status (`git status`)

This command is your best friend. Run it constantly.

```bash
git status
```

It will tell you "nothing to commit" because the folder is empty.

## Step 3: Create a file

```bash
touch index.html
git status
```

Now Git sees the file, but it is **Untracked**. It's in your Working Directory, but not in the Staging Area.

## Step 4: Add to Staging (`git add`)

To tell Git "I want to save this file", we add it to the staging area:

```bash
git add index.html
```

Run `git status` again. It is now green and ready to be committed.

## Step 5: Commit (`git commit`)

Now we permanently save the changes to history. We **must** add a message explaining what we did.

```bash
git commit -m "Create homepage file"
```

Congratulations! You just made your first commit.

## Helpful resources

- [Git Basics - Recording Changes](https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository)
- [Visualizing Git Concepts with D3](http://git-school.github.io/visualizing-git/)
