# Lesson 5: Crafting a Good Question - MCVE

## The Big Idea

The difference between a question that gets answered and one that doesn't?

**A Minimal Reproducible Example (MCVE).**

An MCVE is the smallest, simplest code that shows your problem. It lets someone copy, paste, and instantly see the issue.

## What is an MCVE?

MCVE = Minimal Reproducible Example

It's code that:

1. **Minimal** - Only includes code necessary to show the problem
2. **Reproducible** - Someone can copy and paste it and see the same problem
3. **Example** - It's an example, not your entire project

### Why This Matters

With an MCVE, someone can:

- Copy your code into their editor
- Run it immediately
- See the exact problem you're describing
- Fix it without asking many follow-up questions

Without an MCVE:

- People have to guess what your code does
- They ask follow-up questions
- The discussion gets long and confusing
- Answers take much longer to get

## Example: Good MCVE vs Bad

### Bad Approach (No MCVE)

"My code isn't working. I have a form with a button. When you click the button, it should show an alert. But it doesn't. My project has like 500 lines of code and multiple files. Can someone debug it for me?"

Problems:

- No actual code shown
- Just describing instead of showing the problem
- Asking others to search through 500 lines of code

### Good Approach (With MCVE)

"Here's my situation: I have a button with an id of 'myButton'. When clicked, it should show an alert saying 'You clicked the button!'.

Expected: Alert appears when I click the button
Actual: Nothing happens when I click

I've tried: Adding debug checks to verify the button exists (it does)

Here's my code [simplified code shown]"

Advantages:

- Shows only the relevant parts (not 500 lines)
- Someone can test it immediately
- Problem is clear and reproducible
- Easy to debug

## How to Create an MCVE

### Step 1: Start With Your Broken Code

Write the code that doesn't work.

### Step 2: Remove Everything Unnecessary

Delete:

- Comments explaining your life story
- CSS styling (unless the problem is about styling)
- Extra HTML that's not related
- Database connections (mock the data instead)
- API calls (hardcode test data instead)

Keep ONLY the code that shows the problem.

### Step 3: Make It Testable

Someone should be able to copy, paste, and run it immediately.

**Include:**

- All variables that need to exist
- Sample data they can use
- Exact steps to reproduce the problem

### Step 4: Test It Yourself

Copy your MCVE into a NEW file.
Run it.
Confirm you still see the problem.

If it doesn't show the problem, your MCVE isn't minimal enough.

### Example 1: Data Processing Bug

**Bad Approach (No MCVE):**

"My function doesn't work. Can you help? I'm processing data from a file and something is wrong with my loop. The data is from a real database so I can't share it."

**Good Approach (With MCVE):**

"Here's my situation: I have a simple program that processes a list of people. For each person, it should print their name.

I have this data:

- Person 1: name is Alice, age is 25
- Person 2: name is Bob, age is 30

When I run my program, I get this error: The program can't find the 'name' field

Expected: It should print 'Alice' then 'Bob'
Actual: It crashes with an error

I've already tried: [what you tried]"

Better because:

- Uses test data that's simple and easy to understand (not a real database)
- Shows the exact error message
- Someone can follow along and test it immediately

### Example 2: Interactive Component Bug

**Bad Approach (No MCVE):**

"My interactive component isn't working. It's complex with lots of different parts. The code is in multiple files."

**Good Approach (With MCVE):**

"Here's my situation: I have a simple counter interface. It should:

1. Display a number starting at 0
2. Have a button that increases the number by 1 when clicked

Expected behavior: When I click the button, the number goes from 0 to 1
Actual behavior: I click the button but nothing happens
Error message: None - there's just no response

I've already tried: [what you tried]"

Better because:

- Describes exactly what should happen and what's wrong
- Uses a simple, focused example
- Anyone can understand it without reading complicated code

## Tools for Creating MCVEs

### For Web Development (HTML/CSS/JavaScript)

- **CodePen** (codepen.io) - Create live examples
- **JSFiddle** (jsfiddle.net) - Share interactive code
- **Repl.it** (replit.com) - Run code online

Just create your MCVE and paste the link in your question!

### For Python

- **Python.org's Online IDE**
- **Repl.it**
- Paste directly into your question

### For Other Languages

- **GitHub Gist** - Share code snippets
- **Repl.it** - Supports many languages
- Official Online IDE for that language

## What NOT to Include in an MCVE

Don't include:

- Your entire project
- Unrelated code
- Comments explaining your life story
- Database queries (mock the data)
- API calls (use test data)
- Sensitive information (change variable names)
- A novel explaining your frustration

## Complete MCVE Checklist

Before posting your question, verify your MCVE:

- [ ] Can someone copy-paste it immediately?
- [ ] Does it show the problem clearly?
- [ ] Is it less than 30 lines of code?
- [ ] Does it include test data?
- [ ] Does it include the error message or unexpected behavior?
- [ ] Have you tested it to confirm it shows the problem?
- [ ] Is it written clearly?
- [ ] Does someone need context from your project to understand?

If you answered NO to any of these, your MCVE needs work.

## The Magic of a Good MCVE

When you provide a good MCVE:

- Experts can help you in minutes
- They don't need clarifying questions
- You might get multiple answers
- You learn more from the explanation
- Your question becomes searchable for others

## Key Takeaway

**A great question is 50% MCVE, 50% explanation.**

Master creating MCVEs and you'll never wait long for answers.

## Beginner-friendly resources

- [What is a Minimal Reproducible Example?](https://stackoverflow.com/help/minimal-reproducible-example)
- [YouTube: Creating a minimal reproducible example](https://www.youtube.com/watch?v=jVzP-UJkDJA)
- [Dev.to: The power of MCVE](https://dev.to/peterwitham/minimal-reproducible-example-221e)
- [Debugging with reduced test cases](https://css-tricks.com/reduced-test-cases/)

## Next Steps

You've learned how to ask great questions. But where should you ask them?

The next lesson: **Community Forums, Discord, and Slack** shows you where different communities are.

## Beginner-friendly resources

- [Stack Overflow: Minimal reproducible example](https://stackoverflow.com/help/minimal-reproducible-example)
- [YouTube: Creating good minimal examples](https://www.youtube.com/watch?v=gSvzrRz_yEs)
- [Dev.to: The power of reproducible examples](https://dev.to/peterwitham/minimal-reproducible-example-221e)
- [CodePen: Creating live examples](https://codepen.io/)
