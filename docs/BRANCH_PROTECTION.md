# Branch Protection Rules

The `main` and `develop` branches are protected to ensure stable releases.

## 1. Required status checks

Pull requests must pass these checks before merging:

- `build`
- `lint`
- `type-check`
- `test:unit`

You can view them in the **Checks** tab of the PR.

## 2. Required approvals

At least **one** reviewer must approve before merging. Use **Review changes → Approve** in the PR UI.

## 3. Up-to-date with main

The pull request must be up-to-date with `main`. If `main` changes, click **Update branch** or merge/rebase `main` into your branch and push again.
