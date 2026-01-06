# Lesson 3: The Debugging Process

## The Big Idea

Debugging is **finding and fixing errors in your code**.

Even the best programmers write bugs. Debugging is not a sign of failure—it's a normal part of programming.

## What is a Bug?

A bug is code that doesn't work the way you intended.

### Types of Bugs

**Type 1: Syntax Errors**

- Your code doesn't follow the language's rules
- The computer can't even run your code
- **Example:** Missing a closing bracket: `if x > 5 {`

**Type 2: Logic Errors**

- Your code runs but produces the wrong result
- The computer doesn't know it's wrong; you do
- **Example:** Checking `if x < 5` when you meant `if x > 5`

**Type 3: Runtime Errors**

- Your code runs for a while, then crashes
- **Example:** Dividing by zero, or accessing a list item that doesn't exist

## The 5-Step Debugging Process

### Step 1: Understand What's Wrong

First, figure out what the problem is.

**Ask yourself:**

- What should the program do?
- What is it actually doing?
- Where is the difference?

**Example:**

- Should do: Add two numbers and show the sum
- Actually does: Shows the numbers together instead of adding them (e.g., 5 + 3 shows "53" instead of 8)

### Step 2: Reproduce the Problem

Make it happen again on purpose.

If you can make a bug happen when you want, it's easier to find.

**How to reproduce:**

- Try the same steps you did when you found the bug
- Write down exactly what you did
- Make sure you can make the bug happen every time

**Example:**

```
1. Start the program
2. Enter 5 as the first number
3. Enter 3 as the second number
4. The result shows "53" instead of "8"
```

Now you know exactly how to see the bug.

### Step 3: Make Your Best Guess About What's Wrong

Look at your code and guess where the problem might be.

**Don't just guess randomly.** Think about:

- What code runs when the problem happens?
- What might be wrong with that code?
- Have I seen this mistake before?

**Example:**
Looking at the code that adds numbers:

```python
result = str(number1) + str(number2)
```

**Guess:** "I'm converting the numbers to text and joining them together instead of adding them mathematically."

### Step 4: Test Your Guess

Use print statements or logs to see if your guess is correct.

Print out the values in your code to see what's really happening.

**Example:**

```python
number1 = 5
number2 = 3

print("number1 is:", number1)
print("number2 is:", number2)

result = str(number1) + str(number2)
print("result is:", result)
```

Output:

```
number1 is: 5
number2 is: 3
result is: 53
```

Now you can see that:

1. The numbers are correct (5 and 3)
2. The result is wrong (53 instead of 8)
3. The code is joining them as text, not adding them

Your guess was correct!

### Step 5: Fix the Bug

Now that you know what's wrong, fix it.

**Before (wrong):**

```python
result = str(number1) + str(number2)
```

**After (correct):**

```python
result = number1 + number2
```

**Or if you need the result as text:**

```python
result = str(number1 + number2)
```

Test that your fix works.

## Debugging Mindset

### ✅ What Helps

**"I'll find this bug step by step."**

- Be patient
- Trust the process
- Think logically

**"The computer is doing exactly what I told it to do. My instructions must be wrong somewhere."**

- The computer isn't broken
- Your code isn't magical
- There's a logical reason for the bug

**"This is a good learning opportunity."**

- Every bug you find teaches you
- You'll recognize the same mistake next time
- Debugging skills improve with practice

### ❌ What Doesn't Help

**"This is impossible!"**

- No, it's not
- Every bug is fixable

**"The computer is being stupid."**

- The computer is doing exactly what you told it
- It's not stupid; you just need to find what you told it to do wrong

**"Let me change a bunch of things and hope something works."**

- This wastes time
- It makes things worse
- You learn nothing

## Common Debugging Mistakes

### ❌ Mistake 1: Guessing Without Testing

You have a guess about what's wrong, but you don't check. You change code randomly.

### ✅ Solution: Always Test Your Guess

Use print statements or a debugger to verify before changing anything.

### ❌ Mistake 2: Changing Too Much at Once

You change five things at the same time and can't tell which change fixed it.

### ✅ Solution: Change One Thing at a Time

Change one line, test, then move to the next.

### ❌ Mistake 3: Not Understanding the Symptoms

You know something is wrong but don't fully understand what.

### ✅ Solution: Study the Problem

Run it several times. Try different inputs. Understand exactly what's happening.

## Quick Reference: The 5 Steps

1. **Understand:** What should happen vs. what is happening?
2. **Reproduce:** Make the bug happen again on purpose
3. **Guess:** Where might the problem be?
4. **Test:** Use print statements to verify your guess
5. **Fix:** Change the code to correct the problem

## Practice Problem

**Scenario:** You're writing a program that calculates the total price of items in a store.

The code should add up the prices, but it's giving wrong answers.

```python
prices = [10, 20, 15]
total = 0

for price in prices:
    total = price

print("Total:", total)
```

**What's wrong?** Follow the debugging process:

1. What should happen? Total should be 45 (10 + 20 + 15)
2. What's actually happening? Total is 15
3. Where's the problem? Look at the loop
4. What's the bug? The code says `total = price` (replace) instead of `total = total + price` (add)
5. The fix:

```python
total = total + price
```

or

```python
total += price
```

## Next Steps

Now you know the debugging process, but you need **tools** to help you see what's happening.

The next lesson: **Using Print Statements and Logs** teaches you the most powerful beginner-friendly debugging tool.

## Beginner-friendly resources

- [Khan Academy: Debugging](https://www.khanacademy.org/computing/computer-science/algorithms/intro-to-algorithms/v/debugging-introduction)
- [YouTube: Debugging for beginners](https://www.youtube.com/watch?v=UKGYx6IdAr4)
- [MDN: Debugging JavaScript](https://developer.mozilla.org/en-US/docs/Learn/Tools_and_testing/Cross_browser_testing/Debugging_JavaScript)
- [FreeCodeCamp: Debugging guide](https://www.freecodecamp.org/news/what-is-debugging/)
