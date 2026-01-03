# File operations (mkdir, touch, rm, cp, mv)

Now that you can move around, it is time to learn how to create and destroy things. This is where you have real power.

## 1. Creating folders (`mkdir`)

**MKDIR** stands for **M**a**k**e **Dir**ectory.

```bash
mkdir my-project
```

This creates a new folder named `my-project`. You can make multiple at once too:

```bash
mkdir images styles scripts
```

## 2. Creating files (`touch`)

**Touch** is a command used to create empty files (or update the timestamp of existing ones).

```bash
touch index.html
```

_Note: On Windows PowerShell, `touch` might not exist by default. You can use `ni index.html` or `type nul > index.html`._

## 3. Deleting (`rm`) - THE DANGER ZONE

**RM** stands for **R**e**m**ove.

> [!WARNING]
> Files deleted with `rm` do NOT go to the Trash/Recycle Bin. They are gone forever immediately. Be very careful.

### To remove a file:

```bash
rm bad-photo.jpg
```

### To remove a folder:

You need the `-r` flag (recursive) to delete a folder and everything inside it.

```bash
rm -r old-project
```

## 4. Copying (`cp`)

**CP** stands for **C**o**p**y. It needs two things: _what_ to copy, and _where_ to copy it.

```bash
cp source.txt destination.txt
```

To copy a folder, use `-r` (recursive) just like with delete:

```bash
cp -r my-site backup-site
```

## 5. Moving and Renaming (`mv`)

**MV** stands for **M**o**v**e. Interestingly, we use the move command to **rename** files too.

### To move a file to a folder:

```bash
mv index.html ./old-stuff/
```

### To rename a file:

Think of renaming as "moving" a file from one name to another name.

```bash
mv old-name.txt new-name.txt
```

## Helpful resources

- [Explained: rm vs rmdir](https://www.geeksforgeeks.org/linux-unix/rmdir-command-in-linux-with-examples/)
- [SS64: Command line reference](https://ss64.com/)
