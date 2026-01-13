# Cloning, pushing, and pulling

Now we connect our local computer to the cloud.

## 1. Cloning (`git clone`)

If you want to download a project from GitHub to your computer, you use **Clone**.

```bash
git clone https://github.com/username/project-name.git
```

This creates a new folder on your computer with the entire history of that project.

## 2. Remote Origin

When you clone a project (or connect a local one), Git remembers the URL. It calls this remote location `origin`.

To see your remotes:

```bash
git remote -v
```

## 3. Pushing (`git push`)

When you make commits on your laptop, they stay on your laptop. To send them to GitHub:

```bash
git push origin main
```

- **origin**: The nickname for the remote URL.
- **main**: The branch you are sending.

## 4. Pulling (`git pull`)

If you are working with a team, or if you edited a file on the GitHub website, your local computer is now "behind". You need to download the latest changes.

```bash
git pull origin main
```

This updates your code with whatever is on GitHub.

## Golden Rule

**Always `git pull` before you start working** to make sure you have the latest code.

## Helpful resources

- [GitHub: Working with Remotes](https://docs.github.com/en/get-started/getting-started-with-git/managing-remote-repositories)
