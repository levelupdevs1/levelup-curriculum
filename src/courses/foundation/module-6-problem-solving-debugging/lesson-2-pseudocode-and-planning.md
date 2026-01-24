# Pseudocode and Planning Before Coding

## The Big Idea

Before you write any code, you should have a **plan**.

Writing a plan before coding saves you enormous amounts of time and prevents frustration.

## What is Pseudocode?

Pseudocode is **fake code that looks like English**.

It's not real code. You can't run it. But it describes exactly what your program should do, step by step.

### Example

**What you want to do:**

Find the highest score in a list of test scores and show it.

**Pseudocode for this:**

```
1. Create a list of scores
2. Find the highest score in the list
3. Show the highest score
```

## Why Write Pseudocode?

**Benefit 1: You Think Before You Code**

When you write pseudocode, you must think through the logic before typing code. This catches problems early.

**Benefit 2: It's Easier to Understand**

Pseudocode is in English. Anyone can read it and understand what your program does.

**Benefit 3: It's Easier to Fix**

If your plan is wrong, it's much easier to fix pseudocode than real code.

**Benefit 4: You Can Check Your Logic**

Before writing code, you can test your plan by hand to see if it works.

## How to Write Pseudocode

**Rule 1:** Each line should describe one action
**Rule 2:** Write in simple English
**Rule 3:** Be specific about what happens in each step
**Rule 4:** Use indentation to show order and structure

## Real Examples

### Example 1: Making a Sandwich

**Pseudocode:**

```
1. Get two pieces of bread
2. Open the peanut butter jar
3. Spread peanut butter on the first slice of bread
4. Get a knife
5. Get jelly from the jar
6. Spread jelly on the second slice of bread
7. Press the two slices together
8. Cut the sandwich diagonally
9. Put the sandwich on a plate
```

**Why this works:**

- Anyone can follow these steps
- Each step is clear
- The order is correct

### Example 2: Finding the Oldest Person

**Pseudocode:**

```
1. Create an empty list to store ages
2. Ask the user how many people they want to enter
3. Loop that many times:
   a. Ask the user for a person's age
   b. Add the age to the list
4. Find the highest age in the list
5. Print the highest age
```

**Notice:**

- Step 3 uses indentation because it repeats
- Each sub-step (3a, 3b) is part of the loop
- The logic is clear before any code is written

### Example 3: Checking if a Password is Strong

**Pseudocode:**

```
1. Ask the user to enter a password
2. Check if the password is at least 8 characters long
3. If it's NOT long enough:
   a. Tell the user it's too short
   b. Ask them to try again
4. If it IS long enough:
   a. Accept the password
   b. Save it
   c. Tell the user they're logged in
```

**Notice:**

- The if/else structure is clear
- You can see what happens in each case
- Before writing code, you know exactly what to do

## Common Mistakes in Pseudocode

### Being Too Vague

Bad example:

```
1. Do the thing
2. Get the data
3. Make it work
```

You can't follow these steps because they're not specific enough.

### Being Specific

Good example:

```
1. Ask the user to enter their name
2. Ask the user to enter their age
3. Calculate how many years until they're 65
4. Display the result
```

Each step is clear and specific.

### Writing Actual Code

Bad example:
This would show actual programming syntax

This is code, not pseudocode.

### Using Simple English

Good example:

```
1. Create a list of test scores
2. Find the highest score in the list
3. Print the highest score
```

Much clearer.

## Practice Exercise

Write pseudocode for this problem:

**Problem:** "Create a program that lets a user make a reservation at a restaurant. The program should ask for their name, party size, and preferred time. Then save this information."

**Your pseudocode here:**

---

**Sample solution:**

```
1. Ask the user for their name
2. Ask the user how many people are in their party
3. Ask the user what time they prefer (convert to 24-hour format)
4. Create a reservation with this information
5. Save the reservation to a file or database
6. Tell the user their reservation is confirmed
7. Display the reservation details
```

## Next Steps

Now that you understand pseudocode, you're ready to use it to **find and fix bugs** in your real code.

The next lesson: **The Debugging Process** shows you exactly how to use these skills when something breaks.

## Beginner-friendly resources

- [Khan Academy: Algorithms and pseudocode](https://www.khanacademy.org/computing/computer-science/algorithms/intro-to-algorithms/v/what-is-an-algorithm)
- [YouTube: Introduction to pseudocode](https://www.youtube.com/watch?v=m6Lj6-Dn0ek)
- [FreeCodeCamp: Pseudocode tutorial](https://www.freecodecamp.org/news/pseudocode-in-programming/)
- [MDN: Planning your code](https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/JavaScript_basics)
