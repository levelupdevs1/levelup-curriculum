# HTTP/HTTPS basics

We know Clients and Servers talk. But what language do they speak? They speak **HTTP** (HyperText Transfer Protocol).

## 1. The Protocol

A protocol is just a set of rules. In English, we agree that "Hello" is a greeting. In HTTP, computers agree on how to exchange documents.

## 2. Request Methods (The Verbs)

When a client talks to a server, it uses a "verb" to say what it wants to do.

- **GET**: "Can I have this?" (Reading a page, viewing an image).
- **POST**: "Here is some new info." (Signing up form, posting a tweet).
- **PUT/PATCH**: "Change this info." (Editing your profile).
- **DELETE**: "Remove this." (Deleting a photo).

## 3. Status Codes (The Numbers)

The server always replies with a 3-digit number code to indicate the result.

- **200 OK**: "Success! Here is what you asked for."
- **301 Redirect**: "That moved somewhere else."
- **404 Not Found**: "I can't find that page." (We've all seen this!)
- **500 Internal Server Error**: "I broke something in the kitchen. My bad."

## 4. HTTP vs HTTPS (The S stands for Secure)

- **HTTP**: The conversation is like passing a note in class. Anyone in the middle can read it.
- **HTTPS**: The note is written in a secret code (Encryption). even if someone steals it, they can't read it.

**Never** enter passwords or credit card numbers on a site that is only HTTP. Look for the padlock icon in your browser 🔒.

## Helpful resources

- [MDN: HTTP Overview](https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview)
- [HTTP Cats (Learn status codes with memes)](https://http.cat/)
