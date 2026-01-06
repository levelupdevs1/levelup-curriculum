# Assessment: Logic Puzzles with Pseudocode

## Overview

In this assessment, you'll solve a series of logic puzzles **using pseudocode and debugging techniques**.

You are **not** required to write actual code. Instead, you'll demonstrate that you understand problem-solving and debugging by working through these puzzles step-by-step.

## Instructions

For each puzzle:

1. **Break down the problem** into smaller pieces
2. **Write pseudocode** to solve it
3. **Test your logic** by hand with an example
4. **Show your debugging thinking** if you find an error

Submit your answers clearly labeled for each puzzle.

---

## Puzzle 1: The Restaurant Bill Splitter

**Problem:**
A group of friends goes to a restaurant. They want to split the bill equally among everyone, but they also need to add a 18% tip.

Write pseudocode for a program that:

1. Gets the total bill amount
2. Gets the number of people
3. Calculates how much each person owes (including tip)

**Your Solution:**

---

**Example to test your logic:**

- Total bill: $100
- Number of people: 4
- Tip: 18% of $100 = $18
- Total with tip: $118
- Per person: $118 ÷ 4 = $29.50

Does your pseudocode produce this result? If not, debug it.

---

## Puzzle 2: The Age Guesser

**Problem:**
Write pseudocode for a game that:

1. Asks the user to think of a number between 1 and 100
2. Makes 7 guesses to find the number
3. After each guess, tells the user if the guess is too high, too low, or correct
4. Celebrates if the program guesses correctly
5. Tells the user they won if the program runs out of guesses

**Your Solution:**

---

**Logic to test:**

- If my guess is 50 and the user says "too high," my next guess should be lower
- If my guess is 25 and the user says "too low," my next guess should be higher
- I should count my guesses and stop after 7

Does your pseudocode do this correctly?

---

## Puzzle 3: The Password Validator

**Problem:**
Write pseudocode for a program that checks if a password is strong.

A strong password must:

- Be at least 8 characters long
- Have at least one number
- Have at least one uppercase letter
- Have at least one lowercase letter

The program should:

1. Ask the user for a password
2. Check if it meets all requirements
3. Tell the user which requirements are NOT met
4. Keep asking until the password is strong enough

**Your Solution:**

---

**Example:**

- User enters: "hello123"
- Missing: Uppercase letter
- Program says: "Password is not strong. You need at least one uppercase letter."
- Ask again

---

## Puzzle 4: The Shopping List Manager

**Problem:**
Write pseudocode for a program that helps someone manage a shopping list.

The program should:

1. Show a menu with options:
   - Add an item
   - Remove an item
   - Show all items
   - Quit
2. Keep running until the user chooses to quit
3. Let the user add and remove items multiple times

**Your Solution:**

---

**Logic to test:**

- If the user adds "milk" then "bread" then "eggs," the list should show all three
- If they remove "bread," the list should only show "milk" and "eggs"
- The menu keeps showing until they choose quit

Does your pseudocode handle this?

---

## Puzzle 5: The Grade Calculator

**Problem:**
Write pseudocode for a program that:

1. Asks a teacher for the names and test scores of 5 students
2. Calculates each student's letter grade (A = 90+, B = 80-89, C = 70-79, D = 60-69, F = below 60)
3. Finds the highest score and lowest score
4. Shows all students with their grades
5. Shows which student had the highest score

**Your Solution:**

---

**Example:**

- Student 1: Alice, 95 → Grade: A
- Student 2: Bob, 87 → Grade: B
- Student 3: Charlie, 72 → Grade: C
- Highest: Alice with 95
- Lowest: Charlie with 72

---

## Submission Checklist

Before you submit, check that you:

- [ ] **Broke down each problem** into clear steps
- [ ] **Wrote pseudocode** in simple English (not actual code)
- [ ] **Tested your logic** by hand with the examples
- [ ] **Used proper indentation** for loops and if statements
- [ ] **Used clear variable names** (not just `x` and `y`)
- [ ] **Explained your thinking** if you caught an error
- [ ] **Are proud of your work** - these are complex problems!

## Evaluation Criteria

Your solutions will be evaluated on:

1. **Clarity (25%):** Can someone else understand your pseudocode?
2. **Correctness (50%):** Does your logic actually solve the problem?
3. **Completeness (25%):** Does your solution handle all requirements?

## Hints If You Get Stuck

**Hint 1:** Use pseudocode that looks like English. Don't write actual code.

**Hint 2:** Think step-by-step. What happens first, second, third?

**Hint 3:** Use loops when something repeats. Use if/else when you need to make decisions.

**Hint 4:** Test your logic by hand before submitting.

**Hint 5:** If your pseudocode doesn't work, use rubber duck debugging—explain it line by line and you'll find the error.

## Extra Challenge (Optional)

Pick one of the puzzles and write **actual code** in your favorite programming language.

You don't have to, but this is a great way to see if your pseudocode actually works!

---

## Summary

These puzzles test all the skills you learned in Module 6:

- Breaking down problems ✓
- Planning with pseudocode ✓
- Testing your logic ✓
- Debugging when needed ✓

Good luck! Remember: this is harder than it seems, and that's a good sign. You're learning real problem-solving skills.

## Beginner-friendly resources

If you need help while working on these puzzles, check these resources:

- [Khan Academy: Problem-solving steps](https://www.khanacademy.org/computing/computer-science/algorithms)
- [YouTube: How to approach programming problems](https://www.youtube.com/watch?v=zDZFkqIZ0DQ)
- [Codecademy: Algorithm design thinking](https://www.codecademy.com/resources/blog/)
- [Dev.to: Getting better at problem-solving](https://dev.to/josethepena/the-best-ways-to-improve-your-programming-problem-solving-skills-c67)
