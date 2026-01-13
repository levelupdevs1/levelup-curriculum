# Introduction to the Terminal and Command Line

The terminal, also called the command line, lets you control your computer using text commands. At first it may feel unfamiliar, but it is one of the most powerful tools for developers.

## Why developers use the terminal

- It can be faster than using a mouse  
- Many tools and frameworks are designed to run from the command line  
- It allows you to automate repetitive tasks  
- It gives more control over your environment  
- It is required for Git, Node.js, and most modern development workflows  

## Opening the terminal in VS Code

To open the integrated terminal in VS Code:

- On Windows, press **Ctrl** and the **backtick (`)** key  
- On macOS, press **Command** and the **backtick (`)** key  

You can also open it from the menu by selecting:

- **View → Terminal**  

## Basic commands to learn first

These commands work on macOS and Linux. On Windows, PowerShell has similar behavior, although some commands like `ls` and `pwd` are also supported.

### 1. `pwd` — Print Working Directory

Shows your current folder.

```bash
pwd
````

Example output:

```text
/Users/john/projects
```

### 2. `ls` or `dir` — List files and directories

* `ls` works on macOS/Linux
* `dir` works on Windows

```bash
ls
```

Example output:

```text
my-project
notes.txt
images
```

### 3. `cd` — Change Directory

Used to move between folders.

```bash
cd my-project
cd ..
cd /Users/john/Desktop
```

* `cd my-project` moves into the folder
* `cd ..` goes up one level

### 4. `mkdir` — Make Directory

Creates a new folder.

```bash
mkdir my-first-project
```

### 5. `touch` or new file

On macOS/Linux:

```bash
touch index.html
```

On Windows:

```bash
type nul > index.html
```

### 6. `rm` — Remove file

```bash
rm old.txt
```

⚠️ Be careful: this deletes permanently without sending to Recycle Bin.

### 7. `cp` — Copy a file

```bash
cp file1.txt file2.txt
```

### 8. `mv` — Move or rename a file

```bash
mv oldname.txt newname.txt
```

## Helpful tips for beginners

* Use the **up arrow** to repeat the last command
* Use **Tab** to auto-complete file/folder names
* Start with safe commands like `pwd`, `ls`, and `cd` before using `rm`

## Helpful resources

* [VS Code terminal basics](https://code.visualstudio.com/docs/terminal/basics)
* [W3Schools command line introduction](https://www.w3schools.com/whatis/whatis_cli.asp)
* [YouTube: Command line tutorial for beginners](https://www.youtube.com/watch?v=yz7nYlnXLfE)

## Summary

The terminal is a powerful tool for developers. Once you get comfortable with a few basic commands, you will be able to navigate projects, run tools, and manage files more efficiently.

```