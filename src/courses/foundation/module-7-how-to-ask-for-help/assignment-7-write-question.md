# Assessment: Writing a Well-Formatted Question

## Overview

In this assessment, you'll demonstrate that you can write a professional, well-formatted question that other developers would actually want to help with.

You're not solving a coding problem. You're ASKING about a coding problem.

## Instructions

You will be given a scenario where someone is stuck. Your job is to write the question they should ask.

Your question must include:

1. **Clear title** - Specific problem in 5-10 words
2. **Context** - What are you trying to do?
3. **The code** - Minimal reproducible example
4. **Expected vs actual** - What should happen vs what does
5. **What you've tried** - Show your effort
6. **Your environment** - Language/tool versions
7. **Proper formatting** - Clean, readable

## Scenario 1: The Button That Doesn't Work

### The Situation

You're building a website. You have a button that should show a popup dialog when clicked. You've triple-checked your code, and the button HTML is there. But when you click it, nothing happens. No errors in the console, no popup. It's driving you crazy.

The HTML looks right. The JavaScript is imported correctly. But it just... doesn't work.

### What You've Tried

- Added console.log to verify the button element exists (it does)
- Tried both getElementById and querySelector (both find the button)
- Tried addEventListener and also onclick attribute (both do nothing)
- Checked that your JavaScript runs after the HTML loads
- Verified the button has an id attribute

### Your Task

Write the complete question you would post to Stack Overflow.

Include:

- Your HTML (just the button)
- Your JavaScript code
- Expected vs actual behavior
- What you've already tried
- A clear title

---

## Scenario 2: The Data That Disappeared

### The Situation

You're building a Python script that reads data from a CSV file, processes it, and saves the results.

Your script:

1. Opens a CSV file
2. Reads rows one by one
3. Does some calculations
4. Appends results to a list
5. Saves the list to a new file

It works fine when you test with 10 rows. But when you run it on 1,000 rows, something goes wrong. The output file is empty. No errors, just... empty results.

### What You've Tried

- Checked that the input file has 1,000 rows (it does)
- Added print statements throughout (they print correctly)
- Verified the calculations are correct
- Tried saving to a different file
- Checked disk space (plenty available)
- It works with 10 rows but fails with 1,000 rows

### Your Task

Write the complete question you would post to Stack Overflow.

Include:

- Your code (simplified to show the structure)
- Sample input data (hardcoded, not reading from CSV)
- Expected vs actual behavior
- The pattern you've noticed (works with small data, fails with large)
- What you've already tried
- A clear title

---

## Scenario 3: The Function That Returns Wrong Values

### The Situation

You're working with React. You have a function that fetches user data from an API, stores it in state, and displays it.

The function gets called, the API returns data, but the component displays undefined or null instead of the data.

You can see the data in the network tab of your browser's dev tools. The API is working. But your component shows nothing.

### What You've Tried

- Checked the network tab (API returns correct data)
- Added console.log in the fetch callback (data is there)
- Verified useState is initialized (it is)
- Tried both .then() and async/await syntax
- Set an initial state of empty array (tried with null too)
- The component renders but shows "undefined"

### Your Task

Write the complete question you would post to Stack Overflow.

Include:

- Your React component code (simplified)
- The API call
- What's being displayed vs what should be displayed
- Console logs showing the data exists
- What you've already tried
- A clear title

---

## Submission Checklist

Before submitting your questions, verify:

### For Each Question:

- [ ] **Title is specific** (not "React not working" but "React component displays undefined after API fetch")
- [ ] **Code is minimal** (not your entire app, just the relevant parts)
- [ ] **Code can be copied and pasted** (it's complete and runnable)
- [ ] **Expected vs actual is clear** ("Should show user data, shows undefined instead")
- [ ] **Your effort is shown** ("I've tried [this] and [that]")
- [ ] **Environment is specified** (Python 3.9, React 18.2, JavaScript ES6, etc.)
- [ ] **Formatting is clean** (proper indentation, readable)
- [ ] **Professional tone** (respectful, clear, not frustrated)

### Question Quality Checklist

For each question, ask yourself:

- [ ] Would I help someone with this question?
- [ ] Is it specific enough to understand the problem?
- [ ] Is there enough code to see what's happening?
- [ ] Would I know what to try next if I read this?
- [ ] Does it show the person tried before asking?

## Evaluation Criteria

Your questions will be evaluated on:

| Criteria            | Weight | Details                                    |
| ------------------- | ------ | ------------------------------------------ |
| **Clarity**         | 25%    | Is the problem clear and specific?         |
| **Completeness**    | 25%    | Does it include all necessary information? |
| **MCVE Quality**    | 25%    | Is the code minimal and reproducible?      |
| **Effort**          | 15%    | Does it show you tried before asking?      |
| **Professionalism** | 10%    | Is the tone respectful and well-formatted? |

## Example of an Excellent Answer

### Title

"React component displays undefined after API fetch, but network shows data is returned"

### Content

```
I'm building a React component that fetches user data from an API and displays it on the page.

Here's my component:

import React, { useState, useEffect } from 'react';

function UserProfile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('https://api.example.com/user/1')
      .then(response => response.json())
      .then(data => {
        console.log('Data from API:', data);
        setUser(data);
      });
  }, []);

  return (
    <div>
      <h1>{user.name}</h1>
      <p>Email: {user.email}</p>
    </div>
  );
}

export default UserProfile;

---

Expected Behavior:
The page should display the user's name and email from the API.

Actual Behavior:
The page is blank. The browser console shows:
"TypeError: Cannot read property 'name' of undefined"

However, in the Network tab of DevTools, I can see the API returned:
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com"
}

---

What I've Tried:
- Added console.log after setUser() - it shows the correct data
- Checked the network tab - data is definitely being returned
- Tried initializing useState with an empty object {} instead of null - same error
- Added a loading check with if (!user) return <div>Loading...</div> - shows "Loading" forever

What's going wrong?
```

Why this is excellent:

- Title is specific
- Full component code shown
- Expected vs actual very clear
- Multiple approaches tried shown
- Network evidence provided
- Error message included
- Professional, clear tone

---

## Beginner-friendly resources

- [Stack Overflow: How to ask a good question](https://stackoverflow.com/help/how-to-ask)
- [YouTube: Writing better Stack Overflow questions](https://www.youtube.com/watch?v=QV6r1TFqFm4)
- [Dev.to: The anatomy of a good tech question](https://dev.to/ben/the-anatomy-of-a-good-coding-question-1d5l)
- [Medium: Asking better questions as a developer](https://medium.com/swlh/how-to-ask-good-questions-in-tech-5db2f15b5ee)

---

## Final Tips

### Before You Hit "Post"

1. Read your question out loud
2. Put yourself in the answerer's shoes - do YOU understand?
3. Check for typos and formatting
4. Make sure your code is correctly formatted
5. Verify you've answered "Why?" for what you tried

### Remember

A great question is an investment. Spending 5 extra minutes writing a clear question saves 5 hours waiting for an answer.

Good luck! You're learning a skill that professionals use every single day.

## Beginner-friendly resources

- [Stack Overflow: How to ask questions](https://stackoverflow.com/help/how-to-ask)
- [YouTube: Writing excellent questions](https://www.youtube.com/watch?v=QV6r1TFqFm4)
- [Dev.to: The anatomy of a good question](https://dev.to/ben/the-anatomy-of-a-good-coding-question-1d5l)
- [Medium: Asking better technical questions](https://medium.com/swlh/how-to-ask-good-questions-in-tech-5db2f15b5ee)
