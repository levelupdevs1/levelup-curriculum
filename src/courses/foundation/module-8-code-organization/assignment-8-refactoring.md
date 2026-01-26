# Assessment: Refactor a Messy Code Structure

In this assignment, you will take the role of a Lead Developer. A junior developer has handed you a project that works, but the file structure is a disaster. It is your job to clean it up.

## The Scenario

You are reviewing a "Personal Portfolio" project. Currently, all the files are sitting in the root folder. It looks like this:

```text
/my-portfolio
├── index.html
├── style.css
├── about.html
├── contact.html
├── script.js
├── profile-pic.jpg
├── logo.png
├── reset.css
├── form-validation.js
├── background-pattern.png
├── icon-twitter.svg
├── icon-github.svg
└── fonts.css
```

This is hard to navigate. If we add 10 more images, it will be even worse.

## Your Task

1.  **Analyze the files:** Look at the extensions (`.css`, `.js`, `.png`, `.svg`). What do they do?
2.  **Plan a structure:** specific Create a list of folders that would make this easier to manage.
3.  **Sort the files:** Assign each file to its new folder.

## Output Format

Create a text file (or write on paper) showing the new tree structure. It should look something like this:

```text
/my-portfolio
├── index.html
├── [Folder Name]/
│   ├── file1.css
│   └── file2.css
└── [Folder Name]/
    └── ...
```

_Note: You do not need to move actual files on your computer unless you want to practice your command line skills. This is a planning exercise._

## Grading Checklist (Self-Check)

- [ ] Did you keep `index.html` in the root? (Web servers usually look for it there).
- [ ] Did you group all `.css` files together?
- [ ] Did you group all `.js` files together?
- [ ] Did you group images (`.png`, `.jpg`, `.svg`) together?
- [ ] Are your folder names clear and lowercase (e.g., `css` or `styles`, not `MyStyles`)?

## Submission

Save your new structure plan. You will use similar structures in almost every project you build from now on.
