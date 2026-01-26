# Assessment: Create a repository and push to GitHub

You are now a Git user. Let's prove it.

## The Goal

Create a local project, put it under version control, and publish it to GitHub.

## Instructions

### Part 1: Local Setup

1. Create a folder named `my-git-portfolio`.
2. Inside it, create a file `README.md`.
3. Write "My Git Portfolio" inside that file.
4. Initialize a Git repository (`git init`).
5. Stage the file (`git add`).
6. Commit the file (`git commit`).

### Part 2: GitHub Setup

1. Log in to GitHub.
2. Click the **+** icon in the top right and select **New repository**.
3. Name it `my-git-portfolio`.
4. **Do not** check "Initialize with README" (we already have one).
5. Click **Create repository**.

### Part 3: Connecting them

GitHub will show you instructions. Look for the section **"…or push an existing repository from the command line"**.

1. Copy the commands they give you. They typically look like:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/my-git-portfolio.git
   git branch -M main
   git push -u origin main
   ```
2. Run them in your terminal.

### Part 4: Verification

1. Refresh your GitHub page.
2. You should see your `README.md` file there.

## Checklist

- [ ] Repo exists locally
- [ ] Has at least one commit
- [ ] Repo exists on GitHub
- [ ] Code is pushed from local to remote

If you are able to checklist everything, you are good to go.
