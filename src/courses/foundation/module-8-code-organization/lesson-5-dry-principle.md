# The DRY Principle (Don't Repeat Yourself)

**DRY** stands for **Don't Repeat Yourself**.
Its opposite is **WET**: **Write Everything Twice** (or We Enjoy Typing).

The DRY principle states that every piece of knowledge or logic should have a single, unambiguous representation within a system.

## The Cost of Duplication

Imagine you are building an app that sends emails. You need to format the user's name (Capitalize first letter) in three different places:

1. The welcome email.
2. The user profile page.
3. The invoice PDF.

**The WET Approach:**
You write the capitalization logic in all three places.
_Problem:_ One day, you decide to change the logic (maybe you want to capitalize the LAST name too). You have to remember to update it in all particular 3 places. If you forget one, your app is broken/inconsistent.

**The DRY Approach:**
You write a `formatName()` function ONCE.
In the welcome email, profile, and invoice, you just call `formatName()`.
_Benefit:_ If you need to change the logic, you change it in one place, and it updates everywhere.

## How to Apply DRY

Whenever you find yourself copying and pasting a block of code, stop. Ask yourself:

> "Can I extract this into a function or a variable?"

### Conceptual Example

**Without DRY:**

```text
PRINT "Welcome user!"
PRINT "Current time: 12:00 PM"
...
PRINT "Goodbye user!"
PRINT "Current time: 12:00 PM"
```

**With DRY:**

```text
FUNCTION printTime() {
    PRINT "Current time: 12:00 PM"
}

PRINT "Welcome user!"
printTime()
...
PRINT "Goodbye user!"
printTime()
```

## A Warning: DRY vs. AHA

Sometimes, beginners take DRY too far. They try to combine things that look similar but act differently.
There is a newer principle called **AHA** (Avoid Hasty Abstractions).

- If two pieces of code _look_ the same but _do_ different things, do not combine them just to be "clean." You might make the code harder to read.

## Helpful Resources

- [The DRY Principle (Wikipedia)](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) - Technical definition and history.
- [AHA Programming](https://kentcdodds.com/blog/aha-programming) - An advanced concept on why you shouldn't DRY too early.
