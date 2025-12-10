# Understanding File Systems and Directories

Before you start building projects, you need a clear mental model of how files and folders are organized on your computer. This will help you stay organized and avoid getting lost.

## What is a file system

A file system is the structure your operating system uses to store and organize data. Think of it like a tree:

- At the top is the root  
- Under the root are folders  
- Inside those folders are more folders and files  

## Important terms

### Files

Files store data. A file can contain:

- Code  
- Text  
- Images  
- Audio  
- Configuration settings  

**Examples of code files:**

- `index.html`  
- `style.css`  
- `app.js`  

### Directories, also called folders

Folders are containers for files and other folders. Developers use folders to organize projects by feature, type, or purpose.

**Example project structure:**

```text
my-project/
  index.html
  styles/
    main.css
  scripts/
    app.js
````

### Paths

A path is the address of a file or folder on your computer.

**Examples:**

* Windows: `C:\Users\John\Documents\projects\my-project`
* macOS: `/Users/john/Documents/projects/my-project`
* Linux: `/home/john/projects/my-project`

### Root directory

The root directory is the topmost folder in a file system.

**Examples:**

* On Windows, each drive has a root, such as `C:\`
* On macOS and Linux, the root is `/`

### Working directory

The working directory is the folder you are currently in when using the terminal.

When you open a project in VS Code and open the terminal, the working directory is usually the root folder of that project.

## Why this matters for developers

* Your code often needs to reference other files
* Assets like images and stylesheets use file paths
* Build tools and scripts run in specific directories
* Git tracks changes based on your folder structure

Understanding the file system helps you avoid errors like **"file not found"**.

## How VS Code uses folders

When you choose **"Open Folder"** in VS Code and select a folder, that folder becomes your workspace. Everything inside that folder is part of your project.

You will see the structure in the **Explorer** panel on the left:

* All files
* All subfolders
* New files you create

## Helpful resources

* [Overview of file systems on Wikipedia](https://en.wikipedia.org/wiki/File_system)
* [Basic explanation of directories and paths](https://www.w3schools.com/whatis/whatis_cli.asp)

## Summary

Understanding files, folders, and paths is essential for working with code. Once you are comfortable with these concepts, navigating projects and using tools will feel much easier.

```


