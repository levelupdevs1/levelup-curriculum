# Lesson 4: Using Print Statements and Logs

## The Big Idea

The simplest debugging tool is **printing the values in your code**.

This shows you what's actually happening, which helps you find bugs.

## What is a Print Statement?

A print statement displays information on your screen.

Different languages have different names:

- **Python:** `print()`
- **JavaScript:** `console.log()`
- **Java:** `System.out.println()`

They all do the same thing: show you what's in your code.

## Why Print Statements Are Powerful

Print statements let you see:

- What values do your variables have?
- Does code reach a certain line?
- What happens inside a loop?
- Why is the result wrong?

## How to Use Print Statements for Debugging

### Step 1: Identify Where to Check

Based on where you think the bug is, add print statements to see the values.

**Example:** A program that's supposed to double a number

```python
number = 5
result = number + number  # Should be 10

print(result)  # Shows: 10
```

But what if you got the wrong answer? You might print the variable right before it's used:

```python
number = 5
print("number is:", number)  # Check 1: Is the input correct?

result = number + number
print("result is:", result)  # Check 2: Did the calculation work?
```

### Step 2: Look at the Output

Read what you printed and compare it to what you expected.

**Expected:**

- number should be 5
- result should be 10

**Actual:**

- number is 5 ✓
- result is 10 ✓

If everything matches, the bug is elsewhere.

### Step 3: Add More Print Statements

If the first prints didn't reveal the problem, add more.

Print **inside loops, inside if statements, everywhere the code gets interesting.**

```python
scores = [85, 92, 78, 95, 88]
total = 0

print("Starting total:", total)

for score in scores:
    print("Current score:", score)
    total = total + score
    print("Total after adding:", total)

average = total / len(scores)
print("Final total:", total)
print("Average:", average)
```

Output:

```
Starting total: 0
Current score: 85
Total after adding: 85
Current score: 92
Total after adding: 177
Current score: 78
Total after adding: 255
Current score: 95
Total after adding: 350
Current score: 88
Total after adding: 438
Final total: 438
Average: 87.6
```

Now you can see exactly what happens in each loop.

## Examples of Good Debug Print Statements

### ❌ Bad Print Statement

```python
print(x)
```

Why? You don't know what `x` is supposed to be. Is it the input? The result? A counter?

### ✅ Good Print Statement

```python
print("The user entered:", x)
```

Now you know exactly what this print statement shows.

### ❌ Bad

```python
print(result)
```

### ✅ Good

```python
print("Calculation result before rounding:", result)
```

### ❌ Bad

```python
print("Error!")
```

### ✅ Good

```python
print("Error! The password must be at least 8 characters. User entered:", len(password), "characters")
```

## Print Statements in Different Situations

### Situation 1: Checking If Code Runs

Sometimes you need to know if a line of code even runs.

```python
if age > 18:
    print("This person is an adult")
    can_vote = True
else:
    print("This person is not an adult")
    can_vote = False
```

If you never see "This person is an adult," you know the `if` statement isn't working as expected.

### Situation 2: Finding Where a Loop Gets Stuck

```python
for i in range(100):
    print("Loop iteration:", i)
    result = 100 / i  # This will crash when i = 0
```

The print statements will show you exactly which iteration caused the crash.

### Situation 3: Checking Function Input and Output

```python
def add_numbers(a, b):
    print("Function input - a:", a, "b:", b)
    result = a + b
    print("Function output - result:", result)
    return result

answer = add_numbers(5, 3)
```

You can see what goes into the function and what comes out.

## Real-World Debugging Example

**Problem:** A program that calculates age is giving wrong results.

**Code:**

```python
birth_year = 1990
current_year = 2024
age = current_year - birth_year

print(age)  # Shows: 34
```

But you expected 33 (maybe you're born late in the year).

**Add more print statements:**

```python
birth_year = 1990
print("Birth year:", birth_year)

current_year = 2024
print("Current year:", current_year)

age = current_year - birth_year
print("Calculated age:", age)

# Wait, the current year should be 2025!
```

The print statements revealed the real bug: the current_year was wrong, not the calculation.

## Cleaning Up Your Code

Once you find the bug and fix it, **remove the print statements** (or comment them out).

```python
# Before (with debugging prints)
number = 5
print("number is:", number)
result = number + number
print("result is:", result)
print(result)

# After (clean)
number = 5
result = number + number
print(result)
```

Or keep them commented out in case you need them later:

```python
number = 5
# print("number is:", number)
result = number + number
# print("result is:", result)
print(result)
```

## Advanced: Logging

In larger programs, print statements can get messy. Professional developers use **logging** instead.

Logging is like print statements but better because you can:

- Save messages to a file
- Filter messages by importance
- Turn debugging on/off without changing code

**Basic JavaScript logging example:**

```javascript
console.log("User logged in"); // Regular info
console.warn("Low disk space"); // Warning
console.error("Login failed"); // Error
```

Different tools (like browsers and Node.js) show these in different colors so you can spot errors quickly.

But for now, **simple print statements are enough.**

## Key Takeaway

Print statements are your best friend when debugging.

**Don't be shy—print everything!**

When you can't figure out what's happening, print the values and you'll see what's going on.

## Next Steps

Print statements work well, but sometimes you need a different approach.

The next lesson: **Rubber Duck Debugging** teaches you a technique that doesn't require any tools—just you and your code.

## Beginner-friendly resources

- [MDN: Console methods (JavaScript)](https://developer.mozilla.org/en-US/docs/Web/API/console)
- [YouTube: Using print statements to debug Python](https://www.youtube.com/watch?v=ePLfPKI-rIs)
- [Real Python: Debugging with print()](https://realpython.com/python-debugging-pdb/)
- [Codecademy: Debugging with logs](https://www.codecademy.com/resources/blog/debugging-with-javascript-console/)
