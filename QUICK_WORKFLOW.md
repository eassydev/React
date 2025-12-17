# ⚡ Quick Workflow Reference

## 🎯 Your Daily Workflow (Copy & Paste)

### Option 1: Work on Development Branch (Quick Changes)

```bash
# Switch to development
cd d:\eassylife\React
git checkout development
git pull origin development

# Make your changes...

# Commit and push to development (SAFE - won't go to production)
git add .
git commit -m "Your change description"
git push origin development

# ✅ This deploys to DEVELOPMENT URL only
# Test at: https://eassylife-git-development-[your-team].vercel.app

# When ready for production:
git checkout main
git pull origin main
git merge development
git push origin main

# ✅ Now it goes to PRODUCTION
```

### Option 2: Work on Feature Branch (Larger Changes)

```bash
# Start from development
cd d:\eassylife\React
git checkout development
git pull origin development

# Create feature branch
git checkout -b feature/backend-integration

# Make your changes...

# Commit and push feature
git add .
git commit -m "Add backend integration"
git push -u origin feature/backend-integration

# Merge to development for testing
git checkout development
git merge feature/backend-integration
git push origin development

# Test on development URL...

# When ready, merge to production
git checkout main
git pull origin main
git merge development
git push origin main
```

---

## 🚦 Simple Rules

1. **NEVER push directly to `main`** ❌
2. **ALWAYS push to `development` first** ✅
3. **TEST on development URL** 🧪
4. **THEN merge to `main` for production** 🚀

---

## 🔍 Quick Commands

```bash
# Where am I?
git branch --show-current

# What changed?
git status

# Switch to development
git checkout development

# Switch to main
git checkout main

# Get latest changes
git pull origin development

# Undo uncommitted changes
git checkout -- .
```

---

## 📍 Current Status

- ✅ You're on: `development` branch
- ✅ Safe to push: YES (won't affect production)
- 🎯 Next step: Configure Vercel dashboard

---

## 🎯 Immediate Next Steps

### 1. Commit Your Current Work
```bash
cd d:\eassylife\React
git add .
git commit -m "WIP: Backend integration changes"
git push origin development
```

### 2. Configure Vercel
1. Go to: https://vercel.com/dashboard
2. Select your project
3. Settings → Git
4. Verify `main` is production branch
5. Enable automatic deployments for all branches

### 3. Find Your Development URL
- Go to Vercel dashboard
- Click on your latest deployment from `development` branch
- Copy the preview URL
- This is your testing URL!

### 4. Test Your Changes
- Visit the development URL
- Test your backend integration
- Make sure everything works

### 5. Deploy to Production (When Ready)
```bash
git checkout main
git pull origin main
git merge development
git push origin main
```

---

## 🆘 Emergency: "I Pushed to Main by Accident!"

**If you haven't pushed yet:**
```bash
git reset --soft HEAD~1  # Undo commit, keep changes
git checkout development
git add .
git commit -m "Your message"
git push origin development
```

**If you already pushed:**
- Don't panic! 
- Your changes are live
- Fix forward: make corrections on development, then merge to main
- Or contact your team lead for help with git revert

---

## 📞 Remember

- `development` = Testing ground (SAFE) ✅
- `main` = Production (LIVE) ⚠️
- Always test before merging to main!
