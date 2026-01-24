# File and Folder Structure Basics

As your project grows from one file to ten, and then to a hundred, you cannot keep everything in one place. A good folder structure is like a well-organized library. If books were just thrown in a pile on the floor, you would never find the one you want.

## The Principle of Separation of Concerns

This is a fancy way of saying: "Put things that do different things in different places."

- **Content** goes in one place.
- **Style** (how it looks) goes in another.
- **Logic** (how it works) goes in a third.

In a kitchen, you don't keep your forks in the fridge. You keep utensils in a drawer and food in the fridge. You separate them based on their purpose.

## Common Generic Structure

While every language is different, most software projects share a similar anatomy:

```text
project-root/
├── src/            (Source Code - where you do your work)
│   ├── components/ (Reusable building blocks)
│   ├── helpers/    (Utility functions)
│   └── data/       (Static information)
├── assets/         (Static files)
│   ├── images/
│   └── fonts/
├── docs/           (Documentation about the project)
└── README.md       (The instruction manual for your project)
```

## Why this helps

1.  **Onboarding:** A new developer knows exactly where to look for images (`assets/images`) without asking you.
2.  **Navigation:** You don't have to scroll through 50 files to find the one script you need.
3.  **Mental Load:** When you are working on "Logic", you open the `src` folder. You can ignore the `assets` folder completely.

## Relative Paths

When you move files into folders, you need to tell the computer how to find them. This is done with **paths**.

- `./` means **"Look in the same folder I am in"**.
- `../` means **"Go up one folder level"** (Go to the parent).

**Example:**
If you are in `src/logic/math.txt` and you want to open `docs/manual.txt`, you might weirdly have to go:
`../../docs/manual.txt` (Go up from math, up from logic, then down into docs).

## Helpful Resources

- [Dealing with files](https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/Dealing_with_files) - An explanation on common structures.
