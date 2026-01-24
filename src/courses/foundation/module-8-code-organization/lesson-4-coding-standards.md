# Introduction to Coding Standards

Coding standards are a set of rules and guidelines that a team agrees to follow. The goal is to make the code look like it was written by a single person, even if 100 people worked on it.

## Why do we need rules?

Imagine reading a book where:

- Chapter 1 is written in **bold**.
- Chapter 2 is written in _italics_.
- Chapter 3 has no punctuation.
- Chapter 4 involves text aligned to the right.

It would be exhausting to read. You would focus more on the strange formatting than the actual story. Code is the same. Small inconsistencies distract your brain.

## Common Standards

Here are some things standards usually define:

### 1. Indentation

Do we use **Tabs** or **Spaces**? If spaces, do we use 2 or 4?

- **2 Spaces:** Common in JavaScript/Ruby.
- **4 Spaces:** Common in Python/Java.
- **Tabs:** Preferred by some for accessibility (you can adjust tab width).
  The important thing is not _which_ one you choose, but that **everyone chooses the same one**.

### 2. Brackets and Braces

Where do the squiggly brackets `{` go?

- **Same line:**
  ```text
  function doSomething() {
      ...
  }
  ```
- **Next line:**
  ```text
  function doSomething()
  {
      ...
  }
  ```

### 3. Semicolons

Some languages require them (C, Java). Some make them optional (JavaScript, Python). A standard decides: "We will always use them" or "We will never use them."

## Automation: Linters and Formatters

In the old days, humans had to check these rules manually. Now, we have robots.

- **Linters (e.g., ESLint):** These represent the "Grammar Police." They scan your code and say, "Hey, you used a variable here but never defined it!" or "You broke the naming rule!"
- **Formatters (e.g., Prettier):** These are the "Typesetters." You write messy code, hit save, and the formatter automatically fixes your indentation, spacing, and brackets.

## Helpful Resources

- [Prettier](https://prettier.io/) - The most popular code formatter. Look at the playground to see it in action.
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript) - One of the most famous style guides in the world. (Don't memorize it, just look at how detailed it is!)
- [StandardJS](https://standardjs.com/) - A "no configuration" style guide.
