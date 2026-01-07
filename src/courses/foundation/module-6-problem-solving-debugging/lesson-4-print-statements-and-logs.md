# Lesson 4: Using Print Statements and Logs

## The Big Idea

The simplest debugging tool is **printing the values in your code**.

This shows you what's actually happening, which helps you find bugs.

## What is a Print Statement?

A print statement displays information on your screen so you can see what's happening inside your code.

Different programming languages have different names for this feature, but they all do the same thing: they show you the values and information you want to check.

## Why Print Statements Are Powerful

Print statements let you see:

- What values do your variables have?
- Does code reach a certain line?
- What happens inside a loop?
- Why is the result wrong?

## How to Use Print Statements for Debugging

### Step 1: Identify Where to Check

Based on where you think the bug is, add display statements to show the values.

**Example scenario:** A program that's supposed to double a number

You want to check: Is the number correct? Is the doubling working?

So you add checks at different points:

- Check 1: Display the original number
- Check 2: Display the doubled result

**If the original is 5 and the result is 10, the math works correctly.**

But what if you got the wrong answer? You might add more checks to see where the problem is.

### Step 2: Look at the Output

Check what was displayed and compare it to what you expected.

**Expected results:**

- The number should be 5
- The doubled result should be 10

**If what displays matches what you expected**, the bug is elsewhere.
**If something doesn't match**, you found where the problem is.

### Step 3: Add More Display Checks

If the first checks didn't reveal the problem, add more.

Add checks **inside loops, inside conditional statements, and everywhere the code gets interesting.**

**Example scenario:** A program that adds up scores

You could add checks to see:

- What's the starting total? (should be 0)
- What's the first score being added?
- What's the total after adding the first score?
- Continue checking after each score is added
- What's the final total?
- What's the average?

By displaying values at each step, you can see exactly where the calculation goes wrong.
Current score: 78
Total after adding: 255
Current score: 95
Total after adding: 350
Current score: 88
Total after adding: 438
Final total: 438
Average: 87.6

```

Now you can see exactly what happens in each step.

## Examples of Good vs Bad Display Checks

### Bad Display Check

Just show a value without context.

"Shows: 34"

You don't know what the 34 represents.

### Good Display Check

Show a value with a clear label explaining what it is.

"Calculated age: 34"

Now it's obvious what the 34 means.

## Using Display Checks in Different Situations

### Situation 1: Checking If Code Runs

Sometimes you need to know if a section of code even runs.

You can add a check that says "This part ran!"

If you never see that check displayed, you know that section isn't being executed when it should be.

### Situation 2: Finding Where a Loop Gets Stuck

You can add a check inside a loop that shows which iteration you're on.

This tells you exactly which loop cycle caused the problem.

### Situation 3: Checking Function Input and Output

Add checks before and after a function runs.

Show what information goes into the function and what comes back out.

This helps you see if the function is receiving the right input or producing the right output.

## Real-World Debugging Example

**Problem:** A program that calculates age is giving wrong results.

**Your checks might show:**
- Birth year: 1990
- Current year: 2024
- Calculated age: 34

**But you expected 33.**

**Adding more checks:**
- Birth year: 1990
- Current year: 2024
- (Wait, is the current year really 2024? Let me check again...)

The checks revealed the real bug: the current year value was wrong, not the calculation formula.

## Cleaning Up Your Code

Once you find the bug and fix it, **remove the display checks** or mark them as comments.

Keep your code clean so it's easy to read.

**Before (with debugging):**
Display the number being used, display the result being calculated, display the final answer.

**After (clean):**
Only display the final answer the user needs to see.

Or keep the debug checks as comments in case you need them later to debug something else.

Logging is like display checks but better because you can:

- Save messages to a file
- Filter messages by importance
- Turn debugging on/off without changing code

Different tools and languages have different ways to do logging and show messages in different colors so you can spot errors quickly.

But for now, **simple display checks are enough.**

## Key Takeaway

Display checks are your best friend when debugging.

**Don't be shy—display everything!**

When you can't figure out what's happening, display the values and you'll see what's going on.

## Next Steps

Display checks work well, but sometimes you need a different approach.

The next lesson: **Rubber Duck Debugging** teaches you a technique that doesn't require any tools—just you and your code.

## Beginner-friendly resources

- [MDN: Console methods (JavaScript)](https://developer.mozilla.org/en-US/docs/Web/API/console)
- [YouTube: Using print statements to debug Python](https://www.youtube.com/watch?v=ePLfPKI-rIs)
- [Real Python: Debugging with print()](https://realpython.com/python-debugging-pdb/)
- [Codecademy: Debugging with logs](https://www.codecademy.com/resources/blog/debugging-with-javascript-console/)
```
