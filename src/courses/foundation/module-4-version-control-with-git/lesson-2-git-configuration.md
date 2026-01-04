# Installing Git and basic configuration

Before we can use the time machine, we need to install it.

## 1. Checking if Git is installed

Open your terminal (which you mastered in Module 3!) and type:

```bash
git --version
```

If you see a version number (like `git version 2.30.0`), you are ready.
If it says "command not found", you need to install it.

## 2. Installing Git

- **Windows:** Download and install [Git for Windows](https://git-scm.com/download/win). Use the default settings.
- **Mac:** If you installed Xcode or Homebrew, you likely have it. If not, download from [git-scm.com](https://git-scm.com/download/mac).
- **Linux:** `sudo apt install git` (Ubuntu/Debian) or `sudo dnf install git` (Fedora).

## 3. Introducing yourself to Git

Git needs to know who you are. This information is attached to every change you save, so your team knows who wrote the code.

Run these two commands (replace with your actual name and email):

```bash
git config --global user.name "John Doe"
git config --global user.email "johndoe@example.com"
```

> [!NOTE]
> This email should match the one you use for GitHub later.

## 4. Verifying configuration

To check that it worked:

```bash
git config --list
```

You should see your name and email in the list.

## Helpful resources

- [Git - Installing Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- [First-Time Git Setup](https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup)
