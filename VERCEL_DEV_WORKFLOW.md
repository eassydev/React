# 🚀 Vercel Development & Production Workflow Guide

## Overview
This guide explains how to safely develop and test changes before deploying to production using separate Git branches and Vercel deployments.

## Branch Structure

```
main (Production)     ← Live website, auto-deploys to production
  ↑
  └── development     ← Testing branch, auto-deploys to preview URL
        ↑
        └── feature/* ← Individual feature branches
```

## Current Setup Status

✅ **Production Branch**: `main` (deploys to production URL)
✅ **Development Branch**: `development` (will deploy to preview URL)

---

## 📋 Vercel Configuration Steps

### 1. Configure Vercel Project Settings

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project** (eassylife React app)
3. **Go to Settings → Git**

### 2. Set Up Branch Deployments

In the **Git** section:

#### Production Branch
- **Production Branch**: `main`
- This will automatically deploy to your production domain

#### Preview Deployments
- Enable **"Automatic Deployments"** for all branches
- The `development` branch will get its own preview URL like:
  - `https://eassylife-git-development-yourteam.vercel.app`

### 3. Environment Variables (Important!)

Go to **Settings → Environment Variables**

#### For Production (main branch):
```env
NEXT_PUBLIC_API_URL=https://api.yourproduction.com
NEXT_PUBLIC_ENV=production
```

#### For Preview/Development (development branch):
```env
NEXT_PUBLIC_API_URL=https://api-dev.yourproduction.com
NEXT_PUBLIC_ENV=development
```

**Note**: You can set different values for different branches in Vercel!

---

## 🔄 Daily Development Workflow

### Scenario 1: Working on New Features (Recommended)

```bash
# 1. Start from development branch
git checkout development
git pull origin development

# 2. Create a feature branch
git checkout -b feature/your-feature-name

# 3. Make your changes
# ... edit files ...

# 4. Commit changes
git add .
git commit -m "Add: your feature description"

# 5. Push feature branch
git push -u origin feature/your-feature-name

# 6. Merge to development for testing
git checkout development
git merge feature/your-feature-name
git push origin development

# 7. Test on Vercel preview URL
# Visit: https://eassylife-git-development-yourteam.vercel.app

# 8. If tests pass, merge to main (production)
git checkout main
git pull origin main
git merge development
git push origin main
```

### Scenario 2: Quick Changes on Development

```bash
# 1. Switch to development
git checkout development
git pull origin development

# 2. Make changes directly
# ... edit files ...

# 3. Commit and push
git add .
git commit -m "Fix: your change description"
git push origin development

# 4. Vercel automatically deploys to preview URL
# Test at: https://eassylife-git-development-yourteam.vercel.app

# 5. When ready for production
git checkout main
git pull origin main
git merge development
git push origin main
```

---

## 🎯 Your Current Situation Solution

### Problem:
- You have backend changes that need testing
- Pushing to `main` immediately goes live
- You want to test on development first

### Solution:

```bash
# You're already on development branch! ✅

# 1. Commit your current changes
git add .
git commit -m "Add: backend integration changes"

# 2. Push to development
git push origin development

# 3. Wait for Vercel to deploy (1-2 minutes)
# Check deployment at: https://vercel.com/dashboard

# 4. Test your changes on the development URL
# Vercel will show you the preview URL in the dashboard

# 5. Once tested and working, merge to production
git checkout main
git pull origin main
git merge development
git push origin main
```

---

## 🔒 Safety Features

### Branch Protection (Recommended)

Set up branch protection on GitHub to prevent accidental pushes to `main`:

1. Go to GitHub repository
2. **Settings → Branches → Add rule**
3. Branch name pattern: `main`
4. Enable:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging

This forces you to create Pull Requests, giving you a final review before production.

---

## 📊 Vercel Deployment URLs

After setup, you'll have:

| Branch | Type | URL Example |
|--------|------|-------------|
| `main` | Production | `https://eassylife.com` |
| `development` | Preview | `https://eassylife-git-development-yourteam.vercel.app` |
| `feature/*` | Preview | `https://eassylife-git-feature-name-yourteam.vercel.app` |

---

## 🚨 Common Commands Quick Reference

```bash
# Check current branch
git branch --show-current

# Switch to development
git checkout development

# Switch to main
git checkout main

# Pull latest changes
git pull origin development

# See what changed
git status

# Undo uncommitted changes
git checkout -- .

# Create new feature branch
git checkout -b feature/new-feature

# Delete local branch
git branch -d feature/old-feature

# See all branches
git branch -a
```

---

## ⚡ Quick Start for Today

Since you just created the `development` branch:

```bash
# 1. You're already on development ✅

# 2. Commit your current changes
git add .
git commit -m "WIP: Backend integration for testing"

# 3. Push to development
git push origin development

# 4. Go to Vercel dashboard and find your preview URL

# 5. Test your changes

# 6. When ready, merge to main for production
```

---

## 🎓 Best Practices

1. **Never commit directly to `main`** - Always go through `development` first
2. **Use descriptive commit messages** - Help your future self understand changes
3. **Test on development URL** - Always verify before merging to main
4. **Pull before push** - Avoid merge conflicts by staying up to date
5. **Use feature branches** - Keep development clean for larger features
6. **Review before merging** - Use GitHub Pull Requests for code review

---

## 🆘 Troubleshooting

### "I accidentally committed to main!"

```bash
# Don't push! Move changes to development
git reset --soft HEAD~1  # Undo last commit, keep changes
git stash                # Save changes temporarily
git checkout development
git stash pop           # Apply changes to development
git add .
git commit -m "Your message"
git push origin development
```

### "I need to switch branches but have uncommitted changes"

```bash
# Option 1: Commit them
git add .
git commit -m "WIP: work in progress"

# Option 2: Stash them
git stash
git checkout other-branch
git stash pop  # When you come back
```

### "Merge conflict!"

```bash
# 1. Open conflicted files
# 2. Look for <<<<<<< HEAD markers
# 3. Resolve conflicts manually
# 4. Remove conflict markers
# 5. Commit the resolution
git add .
git commit -m "Resolve merge conflict"
```

---

## 📞 Next Steps

1. ✅ Development branch created
2. ⏳ Configure Vercel dashboard (see section above)
3. ⏳ Set up environment variables for each branch
4. ⏳ Test deployment to development URL
5. ⏳ (Optional) Set up branch protection on GitHub

---

## 🎉 Summary

You now have:
- ✅ A `development` branch for testing
- ✅ A `main` branch for production
- ✅ A clear workflow to prevent accidental production deployments
- ✅ The ability to test changes before going live

**Remember**: Always push to `development` first, test, then merge to `main`!
