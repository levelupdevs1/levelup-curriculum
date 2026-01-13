# Basic navigation commands (cd, ls/dir, pwd)

Navigating your computer from the terminal is like exploring a building. You need to know where you are, see what is in the room, and move to other rooms.

## 1. Where am I? (`pwd`)

**PWD** stands for **P**rint **W**orking **D**irectory. It tells you exactly where you are in the file system.

```bash
pwd
```

**Output example:**

```text
/Users/developer/projects
```

This means you are inside the `projects` folder, which is inside `developer`, which is inside the `Users` folder.

## 2. What is in here? (`ls` or `dir`)

**LS** stands for **L**i**S**t. It shows you the files and folders in your current location.

- **Mac/Linux:** `ls`
- **Windows (PowerShell):** `ls` or `dir`

```bash
ls
```

**Output example:**

```text
my-website
notes.txt
photos
```

### Common `ls` flags (Optional powers)

- `ls -a` : Shows hidden files (files starting with a dot, like `.git`)
- `ls -l` : Shows details like file size and date modified

## 3. Let's move! (`cd`)

**CD** stands for **C**hange **D**irectory. This is how you move around.

### Moving into a folder

If you see a folder named `photos` in your `ls` list, you can enter it:

```bash
cd photos
```

Now if you run `pwd`, you will see `/Users/developer/projects/photos`.

### Moving back out

To go back "up" one level (to the parent folder), use two dots:

```bash
cd ..
```

### Going home

To go straight to your main user folder (home directory), just type:

```bash
cd ~
```

_(The `~` symbol represents your home directory)_

## Practice Exercise

1. Open your terminal.
2. Type `pwd` to see where you start.
3. Type `ls` to see folders.
4. `cd` into one of them.
5. `pwd` again to confirm you moved.
6. `cd ..` to go back.

## Helpful resources

- [LinuxCommand.org: Learning the shell](http://linuxcommand.org/lc3_lts0020.php)
- [Ubuntu: Basic Linux commands](https://ubuntu.com/tutorials/command-line-for-beginners#3-opening-a-terminal)
