# 🔧 Vercel Dashboard Configuration Guide

## Step-by-Step Vercel Setup

### 1. Access Vercel Dashboard

1. Go to: **https://vercel.com/dashboard**
2. Log in with your account
3. Find and click on your **eassylife** project

---

### 2. Configure Git Settings

#### Navigate to Git Settings:
- Click on **Settings** (top navigation)
- Click on **Git** (left sidebar)

#### Verify Production Branch:
- **Production Branch**: Should be set to `main`
- If not, change it to `main`

#### Enable Preview Deployments:
- ✅ Enable **"Automatically create Preview Deployments"**
- This ensures every branch gets its own preview URL

---

### 3. Set Up Environment Variables

#### Navigate to Environment Variables:
- Click on **Settings** (top navigation)
- Click on **Environment Variables** (left sidebar)

#### Add Variables for Each Environment:

##### For Production (main branch):

Click **Add New** and create these variables:

| Key | Value | Environment |
|-----|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://your-production-api.com` | Production |
| `NEXT_PUBLIC_ENV` | `production` | Production |

##### For Preview/Development (development branch):

Click **Add New** and create these variables:

| Key | Value | Environment |
|-----|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://your-dev-api.com` | Preview |
| `NEXT_PUBLIC_ENV` | `development` | Preview |

**Important**: When adding each variable, select the appropriate environment:
- **Production** = Only for `main` branch
- **Preview** = For all other branches (including `development`)

---

### 4. Deployment Settings (Optional but Recommended)

#### Navigate to Deployment Settings:
- Click on **Settings**
- Click on **General** (left sidebar)

#### Configure Build Settings:

```
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

#### Node.js Version:
- Set to **18.x** or **20.x** (recommended)

---

### 5. Find Your Deployment URLs

#### After Pushing to Development:

1. Go to **Deployments** tab in Vercel
2. Look for the latest deployment from `development` branch
3. Click on it to see the preview URL

**Your URLs will look like:**
- **Production**: `https://eassylife.com` (or your custom domain)
- **Development**: `https://eassylife-git-development-[your-team].vercel.app`
- **Feature branches**: `https://eassylife-git-[branch-name]-[your-team].vercel.app`

---

### 6. Set Up Notifications (Optional)

#### Navigate to Notifications:
- Click on **Settings**
- Click on **Notifications** (left sidebar)

#### Enable:
- ✅ **Deployment Started**
- ✅ **Deployment Ready**
- ✅ **Deployment Failed**

This will notify you via email when deployments complete.

---

### 7. Branch Protection on GitHub (Highly Recommended)

#### Navigate to GitHub:
1. Go to your GitHub repository
2. Click **Settings**
3. Click **Branches** (left sidebar)
4. Click **Add branch protection rule**

#### Configure Protection for `main`:

**Branch name pattern**: `main`

Enable these rules:
- ✅ **Require a pull request before merging**
  - ✅ Require approvals: 1
- ✅ **Require status checks to pass before merging**
  - ✅ Require branches to be up to date before merging
- ✅ **Do not allow bypassing the above settings**

**This prevents accidental direct pushes to production!**

---

## 🎯 Verification Checklist

After configuration, verify:

- [ ] Production branch is set to `main`
- [ ] Preview deployments are enabled
- [ ] Environment variables are set for Production and Preview
- [ ] Latest push to `development` created a preview deployment
- [ ] Preview URL is accessible and working
- [ ] (Optional) Branch protection is enabled on GitHub

---

## 🧪 Test Your Setup

### 1. Make a Test Change

```bash
cd d:\eassylife\React
git checkout development

# Make a small change (e.g., add a comment to a file)
echo "// Test change" >> src/app/page.tsx

git add .
git commit -m "Test: Verify development deployment"
git push origin development
```

### 2. Check Vercel Dashboard

1. Go to **Deployments** tab
2. You should see a new deployment starting
3. Wait for it to complete (1-2 minutes)
4. Click on the deployment
5. Click **Visit** to see your preview URL

### 3. Verify Environment Variables

In your preview deployment, check that:
- API calls go to your development API
- Environment is set to "development"

---

## 📊 Understanding Vercel Deployments

### Deployment Types:

| Type | Trigger | URL | Purpose |
|------|---------|-----|---------|
| **Production** | Push to `main` | Your custom domain | Live site |
| **Preview** | Push to any other branch | Auto-generated URL | Testing |
| **PR Preview** | Open Pull Request | Auto-generated URL | Code review |

### Deployment Status:

- 🟡 **Building** - Vercel is building your app
- 🟢 **Ready** - Deployment successful and live
- 🔴 **Error** - Build failed (check logs)
- ⚪ **Canceled** - Deployment was canceled

---

## 🔍 Monitoring Deployments

### View Deployment Logs:

1. Go to **Deployments** tab
2. Click on any deployment
3. Click **Building** or **View Function Logs**
4. See real-time build output

### Common Build Errors:

| Error | Cause | Solution |
|-------|-------|----------|
| `Module not found` | Missing dependency | Run `npm install` locally |
| `Build failed` | TypeScript/ESLint errors | Fix errors in code |
| `Environment variable missing` | Missing env var | Add in Vercel settings |

---

## 🎓 Best Practices

1. **Always check deployment status** before merging to main
2. **Test preview URLs thoroughly** before promoting to production
3. **Use meaningful commit messages** to track deployments
4. **Monitor build times** - optimize if builds take too long
5. **Set up alerts** for failed deployments

---

## 🆘 Troubleshooting

### "My preview deployment isn't showing changes"

1. Check if deployment completed successfully
2. Hard refresh browser (Ctrl + Shift + R)
3. Check if correct branch was deployed
4. Verify build logs for errors

### "Environment variables not working"

1. Verify variables are set for correct environment (Preview vs Production)
2. Redeploy after adding new variables
3. Check variable names match exactly in code

### "Deployment failed"

1. Check build logs in Vercel dashboard
2. Run `npm run build` locally to reproduce error
3. Fix errors and push again

---

## 📞 Next Steps After Configuration

1. ✅ Configure Vercel dashboard (follow steps above)
2. ✅ Test deployment to development branch
3. ✅ Verify preview URL works
4. ✅ Set up environment variables
5. ✅ (Optional) Enable branch protection on GitHub

---

## 🎉 You're All Set!

Once configured, your workflow is:

```
Make changes → Push to development → Test preview URL → Merge to main → Production deploy
```

**No more accidental production deployments!** 🎊
