# What happens when you visit a website?

You type `google.com` and hit Enter. Less than a second later, the page appears. What just happened? It is a journey of thousands of miles.

## The Journey of a Request

Here is the step-by-step process:

### 1. You type the URL

You enter `https://www.example.com` in your browser bar.

### 2. The Lookup (DNS)

Your browser doesn't know where "google.com" is. It needs an address.
It asks a **DNS Server**: "Where is google.com?"
The DNS Server replies: "It is at `142.250.190.46`."

_(We will cover this more in the next lesson!)_

### 3. The Connection

Now your browser knows the address. It sends a "Hello" signal to that address to open a connection. (This is often called a "Handshake").

### 4. The Request

Your browser sends a message:

> "GET /index.html HTTP/1.1"
> "Host: www.google.com"

### 5. The Server Process

The server receives this message. It looks for `index.html`. It might also calculate some data (like your search results).

### 6. The Response

The server sends the data back:

> "200 GM OK"
> (Here is the HTML code...)

### 7. The Rendering

Your browser receives the code.

- It reads the **HTML** to build the structure.
- It asks for **CSS** to make it look good.
- It runs **JavaScript** to make it interactive.

And voila! The page appears.

## Helpful resources

- [MDN: How the web works](https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/How_the_Web_works)
- [freeCodeCamp: What happens when you hit URL in your browser?](https://www.freecodecamp.org/news/what-happens-when-you-hit-url-in-your-browser/)
