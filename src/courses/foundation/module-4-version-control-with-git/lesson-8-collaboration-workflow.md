# Basic collaboration workflow

The power of Git comes from working together. Here is how professional teams do it.

## The Pull Request (PR) Workflow

Never push directly to the `main` branch if you are working on a team. Instead:

1.  **Branch**: Create a new branch for your feature.
    ```bash
    git switch -c new-feature
    ```
2.  **Commit**: Make your changes and commit them.
    ```bash
    git add .
    git commit -m "Add new feature"
    ```
3.  **Push**: Send your branch to GitHub.
    ```bash
    git push origin new-feature
    ```
4.  **Pull Request**: Go to GitHub. You will see a button "Compare & pull request". Click it.
5.  **Review**: Your teammates review your code. They comment on mistakes or improvements.
6.  **Merge**: Once approved, you (or your manager) click "Merge". Your code is now in `main`.

## Why we do this

- **Code Review**: Two pairs of eyes are better than one.
- **Safety**: `main` always works. Broken code stays in the branch.
- **Documentation**: The Pull Request conversation is a record of _why_ decisions were made.

## Helpful resources

- [GitHub: Proposing changes with Pull Requests](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests)
