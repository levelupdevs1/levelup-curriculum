# APIs and data exchange (conceptual overview)

Modern websites are rarely just static pages. They are constantly fetching fresh data. They do this using **APIs**.

## What is an API?

**API** stands for **A**pplication **P**rogramming **I**nterface.

Let's go back to our restaurant:

- **You (the Program)** need food.
- **The Kitchen (the System)** has food.
- **The API (the Waiter)** takes your request and brings back the result.

You don't need to know how the stove works. You just need to know how to order from the menu (the API documentation).

## Examples of APIs

1.  **Weather App**: Your phone doesn't know the weather. It asks the OpenWeather API: "What is the temp in New York?" and gets an answer.
2.  **Login with Google**: A website asks Google's API: "Is this user who they say they are?"
3.  **Payment Processing**: An online store asks the Stripe API to charge your card.

## JSON (The Data Format)

When APIs talk, they don't send pretty HTML. They send raw data. The most common format is **JSON** (JavaScript Object Notation).

It looks like this:

```json
{
  "city": "New York",
  "temperature": 72,
  "condition": "Cloudy"
}
```

It is lightweight, easy for computers to read, and easy for humans to understand.

## Helpful resources

- [FreeCodeCamp: What is an API?](https://www.freecodecamp.org/news/what-is-an-api-in-english-please-b880a3214a82/)
- [JSON.org: Introduction to JSON](https://www.json.org/json-en.html)
