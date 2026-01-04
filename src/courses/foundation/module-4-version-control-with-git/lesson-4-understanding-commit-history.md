# Understanding commit history (log, diff)

You have made some saves. Now, how do you see them?

## 1. Viewing History (`git log`)

To see a list of everything that has happened in your repository:

```bash
git log
```

You will see something like this:

```text
commit 8a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p
Author: John Doe <johndoe@example.com>
Date:   Mon Jan 1 12:00:00 2024 -0500

    Create homepage file
```

### Breaking it down:

- **Commit Hash**: That long random string (`8a1b2c...`). It is the unique ID for this specific save.
- **Author**: Who did it.
- **Date**: When they did it.
- **Message**: What they said they did.

### Tips for log

If your history gets long, use:

```bash
git log --oneline
```

This shows a simplified version (short hash + message).

## 2. Checking changes before committing (`git diff`)

Before you run `git add`, it is smart to check what exactly you changed.

```bash
git diff
```

This will show you the changes in your Working Directory that are **not yet staged**.

- Lines starting with `+` (green) are new additions.
- Lines starting with `-` (red) are deletions.

## 3. What if I already staged it?

If you already ran `git add`, `git diff` won't show anything. You need:

```bash
git diff --staged
```

## Helpful resources

- [Git Basics - Viewing the Commit History](https://git-scm.com/book/en/v2/Git-Basics-Viewing-the-Commit-History)
- [Atlassian: Git Log tutorial](https://www.atlassian.com/git/tutorials/git-log)
