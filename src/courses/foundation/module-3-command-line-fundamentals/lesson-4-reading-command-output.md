# Reading command output and understanding errors

The command line talks back to you. Sometimes it whispers (success), and sometimes it yells (errors). Learning to read these messages is a key developer skill.

## 1. Silence is golden

In the Unix philosophy (which most terminals follow), **no news is good news**.

If you type:

```bash
mkdir secret-project
```

And the terminal just gives you a new empty line prompt, meant **it worked**. It won't say "Success!". It just does it and waits for the next command.

## 2. Common success output

Some commands do return text.

- `ls` lists files.
- `pwd` prints path.

If you see the output you expected, you are good.

## 3. Common Error Messages

When something goes wrong, the terminal will try to tell you why. Don't panic! read the error.

### "Command not found"

```text
bash: mdkir: command not found
```

**Translation:** "I don't know what `mdkir` is."
**Fix:** You probably made a typo. It should be `mkdir`.

### "No such file or directory"

```text
cp: cat.jpg: No such file or directory
```

**Translation:** "You asked me to copy `cat.jpg`, but I can't find it here."
**Fix:** Check if the file name is spelled correctly or if you are in the right folder (use `ls`).

### "Permission denied"

```text
rm: cannot remove 'system-file': Permission denied
```

**Translation:** "You are not allowed to delete this."
**Fix:** You are trying to modify a system file or a file owned by another user. You might need `sudo` (administrator privileges), but be careful!

### "Is a directory"

```text
rm: my-folder: Is a directory
```

**Translation:** "You tried to use `rm` on a folder, but `rm` is for files."
**Fix:** Use `rm -r` to delete folders.

## How to debug simple errors

1. **Read the error**: It usually points to the specific word it didn't understand.
2. **Check your spelling**: 90% of errors are typos.
3. **Check your location**: Run `pwd` or `ls` to make sure you are where you think you are.

## Helpful resources

- [Debugging bash errors](https://linuxhint.com/bash_command_not_found/)
- [StackOverflow: Common terminal errors](https://stackoverflow.com/questions/tagged/terminal)
