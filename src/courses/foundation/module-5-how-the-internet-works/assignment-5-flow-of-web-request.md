# Assessment: Diagram the flow of a web request

To truly understand how the web works, you need to visualize the invisible journey of data.

## The Goal

Create a diagram (digital or hand-drawn) that explains what happens when a user visits `www.example.com`.

## Instructions

Your diagram must include the following actors and steps:

1.  **The Client (User/Browser)**
2.  **The DNS Server** (Lookup)
3.  **The Web Server** (Processing)
4.  **The Database** (Optional, but good to show)

### Specific Steps to Show:

1.  **DNS Lookup:** Browser asks "Where is example.com?" -> DNS answers with IP.
2.  **Request:** Browser sends "GET /index.html" to the Server IP.
3.  **Processing:** Server receives request (and maybe checks Database).
4.  **Response:** Server replies with "200 OK" and the HTML code.
5.  **Rendering:** Browser turns the code into a visual page.

## Submission

- If you draw it on paper, take a photo.
- If you use a tool (like Excalidraw, Figma, or Paint), save the image.
- Upload the image or paste a link to it in your submission.

## Checklist

- [ ] Diagram clearly shows Client, DNS, and Server
- [ ] Service interactions are labeled (Request/Response)
- [ ] IP address lookup is shown
- [ ] HTTP verb (GET) is mentioned
