# Git Workflow Guide — CineMate

> This document covers everything the team needs to work together using Git and GitHub.
> Applies to all members: **Lead (repo owner)** and **Contributors**.

---

## Table of Contents

1. [Branch Structure](#branch-structure)
2. [Branch Management](#branch-management)
   - [Create a Branch](#create-a-branch)
   - [Switch Between Branches](#switch-between-branches)
   - [Rename a Branch](#rename-a-branch)
   - [Delete a Branch](#delete-a-branch)
   - [List All Branches](#list-all-branches)
3. [Daily Workflow](#daily-workflow)
   - [Starting Your Day](#starting-your-day)
   - [Working on a Feature](#working-on-a-feature)
   - [Saving Your Work](#saving-your-work)
   - [Pushing Your Work](#pushing-your-work)
4. [Pull Request (PR)](#pull-request-pr)
   - [Opening a PR](#opening-a-pr)
   - [Reviewing a PR (Lead)](#reviewing-a-pr-lead)
5. [Merging Process](#merging-process)
   - [Merging Feature → dev](#merging-feature--dev)
   - [Merging dev → master](#merging-dev--master)
   - [Handling Merge Conflicts](#handling-merge-conflicts)
6. [Commit Message Convention](#commit-message-convention)
7. [Golden Rules](#golden-rules)

---

## Branch Structure

```
master                  ← stable, production-ready code only
└── dev                 ← integration branch, all features merge here first
    ├── feat/login
    ├── feat/movie-list
    └── feat/navbar
```

| Branch | Purpose | Who pushes? |
|--------|---------|-------------|
| `master` | Stable, deployable code | Lead only (via PR from dev) |
| `dev` | Latest integrated work | Lead only (via PR from feature branches) |
| `feat/*` | Individual features | Contributors |
| `fix/*` | Bug fixes | Anyone |
| `chore/*` | Non-feature tasks (configs, docs) | Anyone |

---

## Branch Management

### Create a Branch

Always branch off from `dev`, not `master`.

```bash
# Step 1: switch to dev and sync it first
git checkout dev
git pull origin dev

# Step 2: create and switch to your new branch
git checkout -b feat/your-feature-name
```

**Branch naming examples:**
```
feat/user-authentication
feat/movie-search
feat/review-form
fix/login-redirect-bug
chore/update-env-example
```

---

### Switch Between Branches

```bash
# Switch to an existing branch
git checkout branch-name

# Example
git checkout dev
git checkout feat/movie-list
```

---

### Rename a Branch

```bash
# Rename current branch
git branch -m new-branch-name

# Rename a specific branch (while on a different branch)
git branch -m old-name new-name

# If already pushed, update remote too
git push origin --delete old-name
git push origin new-name
git push --set-upstream origin new-name
```

---

### Delete a Branch

```bash
# Delete local branch (safe — only works if fully merged)
git branch -d feat/your-feature-name

# Force delete local branch (use with caution)
git branch -D feat/your-feature-name

# Delete remote branch
git push origin --delete feat/your-feature-name
```

> **When to delete?** After your PR has been merged, clean up your feature branch both locally and on remote.

---

### List All Branches

```bash
# List local branches
git branch

# List all branches including remote
git branch -a

# List remote branches only
git branch -r
```

---

## Daily Workflow

### Starting Your Day

Before doing anything, always sync your local `dev` with the remote.

```bash
# 1. Switch to dev
git checkout dev

# 2. Pull the latest changes
git pull origin dev

# 3. Switch to your feature branch
git checkout feat/your-feature-name

# 4. Merge latest dev into your branch to stay up to date
git merge dev
```

> Do this every morning or before starting new work to avoid large conflicts later.

---

### Working on a Feature

```bash
# Make sure you're on your feature branch
git branch   # check current branch (has * on active)

# Do your coding work...
# Then check what changed
git status
git diff
```

---

### Saving Your Work

Commit often — small focused commits are better than one giant commit.

```bash
# Stage all changed files
git add .

# Or stage specific files
git add client/src/components/Login.tsx

# Commit with a message (see convention below)
git commit -m "feat: add login form UI"
```

---

### Pushing Your Work

```bash
# First time pushing this branch to remote
git push -u origin feat/your-feature-name

# Subsequent pushes
git push
```

---

## Pull Request (PR)

### Opening a PR

Once your feature is complete and pushed:

1. Go to the repository on **GitHub**
2. Click **"Compare & pull request"** (appears after pushing a branch)
3. Set the base branch to **`dev`** (NOT `master`)
4. Fill in the PR form:

```
Title: feat: add login form UI

Description:
## What does this PR do?
- Added login form with email and password fields
- Connected to auth endpoint
- Added form validation

## How to test?
1. Run the client
2. Navigate to /login
3. Try submitting with empty fields
4. Try submitting with valid credentials

## Related issues / notes
- None
```

5. Assign the **Lead as reviewer**
6. Click **"Create pull request"**

> **Never merge your own PR.** Wait for the lead to review and merge it.

---

### Reviewing a PR (Lead)

1. Go to the PR on GitHub
2. Click **"Files changed"** to review the code
3. Leave inline comments if needed
4. If changes are required → click **"Request changes"**
5. If everything looks good → click **"Approve"**
6. Merge the PR using **"Squash and merge"** or **"Merge pull request"**
7. Delete the feature branch after merging (GitHub will show a button for this)

---

## Merging Process

### Merging Feature → dev

This is done via **Pull Request on GitHub** (described above). The lead reviews and merges.

After the merge, contributors should clean up:

```bash
# Switch back to dev and sync
git checkout dev
git pull origin dev

# Delete the merged feature branch locally
git branch -d feat/your-feature-name
```

---

### Merging dev → master

Only the **lead** does this, and only when a milestone or stable version is ready.

```bash
# Step 1: sync dev
git checkout dev
git pull origin dev

# Step 2: switch to master
git checkout master
git pull origin master

# Step 3: merge dev into master
git merge dev

# Step 4: push to remote
git push origin master
```

> Alternatively, open a PR from `dev` → `master` on GitHub for a clean audit trail.

---

### Handling Merge Conflicts

Conflicts happen when two people edit the same part of the same file. Here's how to resolve:

```bash
# When merging dev into your branch and conflict appears:
git checkout feat/your-feature-name
git merge dev

# Git will list conflicted files
# Open the conflicted file — look for conflict markers:

<<<<<<< HEAD
  your changes
=======
  incoming changes from dev
>>>>>>> dev

# Edit the file manually to keep the correct code
# Remove all conflict markers (<<<<, ====, >>>>)

# Then stage the resolved file
git add path/to/conflicted-file.ts

# Complete the merge
git commit -m "chore: resolve merge conflict with dev"

# Push your branch
git push
```

> **Tip:** Use VS Code's built-in merge conflict editor — it shows "Accept Current", "Accept Incoming", and "Accept Both" buttons to make this easier.

---

## Commit Message Convention

Use this format for all commits:

```
<type>: <short description>
```

| Type | When to use |
|------|-------------|
| `feat` | Adding a new feature |
| `fix` | Fixing a bug |
| `chore` | Config, tooling, or maintenance tasks |
| `docs` | Documentation changes |
| `style` | Formatting, no logic change |
| `refactor` | Code restructure, no behavior change |
| `test` | Adding or updating tests |

**Examples:**
```
feat: add movie search bar
fix: correct auth token expiry handling
chore: update .env.example
docs: update API endpoints in docs.md
refactor: simplify movie list component
```

---

## Golden Rules

```
✅ Always branch off from dev
✅ Always pull dev before starting work
✅ Commit small and often
✅ Write clear commit messages
✅ Open PRs to dev, not master
✅ Wait for lead review before merging
✅ Delete branches after merging
✅ Communicate with the team when working on shared files

❌ Never push directly to master
❌ Never push directly to dev
❌ Never merge your own PR
❌ Never force push to shared branches (master, dev)
```

---

*Last updated: April 2026 — CineMate Project*