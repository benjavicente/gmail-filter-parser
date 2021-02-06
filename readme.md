# GMail search/filter parser

A simple _(and bad)_ parser of a small subset of
[GMail's search operators], using [chevrotain].

## Diagram

```bash
deno run --allow-write util/gen_diagram.js
```

## GH-Pages Branch

```bash
# Run them one-by-one
git worktree add --detach temp
cd temp
git branch -D gh-pages
git checkout --orphan gh-pages -f
git rm -rf .
cp ../src/* .
cp ../docs . -r
git add .
git commit -m "update"
cd ..
git worktree remove temp
```

<!-- Links -->

[GMail's search operators]: https://support.google.com/mail/answer/7190
[chevrotain]: https://sap.github.io/chevrotain
