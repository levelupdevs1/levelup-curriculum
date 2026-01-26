# Naming Conventions and Readability

There is a famous saying in computer science: "There are only two hard things in Computer Science: cache invalidation and naming things."

Naming things seems easy, but it is surprisingly difficult. A good name explains _what_ data is held or _what_ a function does, without needing a comment.

## The "Box" Analogy

Imagine you are moving house and packing boxes.

- If you label a box **"Stuff"**, you will have no idea what is inside three months from now.
- If you label a box **"Kitchen - Plates & Bowls"**, you know exactly what is inside.

Variables are just boxes for data. Do not label them "Stuff".

## Core Naming Rules

### 1. Be Descriptive

Avoid single-letter names like `x`, `d`, or `temp`.

- **Bad:** `d = 7` (Is it days? Degrees? Distance?)
- **Good:** `daysInWeek = 7`

### 2. Be Consistent

Pick a style and stick to it. If you use `getUsers` in one place, don't use `fetchClientList` in another. Use the same verb for the same action.

### 3. Use Pronounceable Names

If you can't read the name out loud, it's a bad name.

- **Bad:** `genYyyyMmDd()`
- **Good:** `generateDateString()`

## Common Case Styles

Different languages prefer different styles for capitalization.

### Camel Case (`camelCase`)

The first letter is lowercase, and each new word starts with a capital letter.

- Used in: JavaScript, Java, Swift.
- Examples: `userName`, `isLoggedIn`, `calculateTax`.

### Snake Case (`snake_case`)

All letters are lowercase, separated by underscores.

- Used in: Python, Ruby, Database columns.
- Examples: `user_name`, `is_logged_in`, `calculate_tax`.

### Pascal Case (`PascalCase`)

Every word starts with a capital letter.

- Used in: Classes (Blueprint for objects), React Components.
- Examples: `UserProfile`, `ShoppingCart`.

## Boolean Names (True/False)

For variables that can only be true or false, it helps to add a prefix question.

- `isOpen`
- `hasPermission`
- `isValid`

This makes your logic sound like English: `IF isOpen THEN enter()`.

## Helpful Resources

- [MDN: Grammar and types](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types) - Includes logical naming sections.
- [Google Style Guides](https://google.github.io/styleguide/) - See how Google engineers are required to name their variables in different languages.
- [Naming Cheat Sheet](https://github.com/kettanaito/naming-cheatsheet) - A comprehensive guide on how to name things correctly.
