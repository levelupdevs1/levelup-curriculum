# IP addresses, domains, and DNS

How do computers find each other in a network of billions?

## 1. IP Addresses (The Phone Number)

Every device connected to the internet has a unique address called an **IP Address** (Internet Protocol).

It usually looks like this:

- **IPv4:** `192.168.1.1` (Old style, running out of numbers)
- **IPv6:** `2001:0db8:85a3:0000:0000...` (New style, almost infinite)

If you knew Google's IP address, you could type it directly into your browser and it would work! But humans are bad at remembering numbers.

## 2. Domain Names (The Contact Name)

We prefer names like `google.com`, `facebook.com`, or `mysite.org`. These are **Domain Names**. They are just easy-to-remember masks for IP addresses.

## 3. DNS (The Phonebook)

**DNS** stands for **D**omain **N**ame **S**ystem.

It acts exactly like the contacts app on your phone.

- **You want to call:** "Mom" (Domain Name)
- **Phone searches contacts:** "Mom" is `555-123-4567` (IP Address)
- **Phone dials:** `555-123-4567`

Without DNS, we would have to carry notebooks full of IP addresses to surf the web.

## Try it yourself (The `ping` command)

Open your terminal (Module 3 skills!) and type:

```bash
ping google.com
```

You will see something like:
`PING google.com (142.250.72.14): 56 data bytes`

That number in parentheses? That is the actual IP address of the server responding to you.

## Helpful resources

- [Cloudflare: What is DNS?](https://www.cloudflare.com/learning/dns/what-is-dns/)
- [How DNS Works (Comic)](https://howdns.works/)
