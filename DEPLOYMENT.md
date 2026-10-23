# Bếp Mơ frontend: PowerShell deployment guide

The app is a React + TypeScript + Vite static frontend. Create a GitHub repository, push this folder from PowerShell, then connect that repository to Cloudflare Pages. After the initial connection, each push to the production branch triggers a new deployment.

## 1. Open the project and check the tools

In PowerShell:

```powershell
Set-Location "C:\Users\hans2\Documents\Codex\2026-10-23\skill-creator-c-users-hans2-codex-3\outputs\bep-mo-frontend"
node --version
npm --version
Get-Command git -ErrorAction SilentlyContinue
git --version
```

Vite currently requires Node.js 20.19+ or 22.12+; Node 24 also meets that requirement. If PowerShell cannot find `node` or `git`, install the official Windows version, open a new PowerShell window, and check again. GitHub CLI (`gh`) is optional for this workflow; the repository can be created in GitHub's website.

## 2. Install dependencies and build locally

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite and review the page. Stop the local server with `Ctrl+C`, then create the production build:

```powershell
npm run build
```

The expected build output is `dist`. The build command also runs TypeScript's project build check.

## 3. Create a GitHub repository and push

Create a new repository in [GitHub](https://github.com/new) (for example, `bep-mo-frontend`). Choose **Private** unless you explicitly want the source code to be public. Leave the new repository empty; do not initialize it with a README, license, or `.gitignore`, because those files are already in this project.

Back in PowerShell, confirm you are in the project folder, then run:

```powershell
git status --short --branch
```

If this folder is not already a Git repository, initialize it and make the first commit:

```powershell
git init
git add .
git commit -m "Initial Bep Mo frontend"
git branch -M main
```

Connect the URL GitHub shows for your new repository (replace `YOUR_USERNAME` with your GitHub account name):

```powershell
git remote add origin "https://github.com/YOUR_USERNAME/bep-mo-frontend.git"
git remote -v
git push --set-upstream origin main
```

If `git remote -v` already shows a remote, inspect it before adding or changing anything. If Git asks you to authenticate, complete the official browser/credential-manager sign-in. Do not paste a password or token into chat or a command.

## 4. Connect GitHub to Cloudflare Pages

Cloudflare's Git integration is configured in the Cloudflare dashboard. This is a one-time browser step; after it is connected, future code pushes can deploy automatically.

1. In Cloudflare, open **Workers & Pages** and choose to create a **Pages** project connected to Git.
2. Connect GitHub and grant the Pages integration access to the `bep-mo-frontend` repository.
3. Select the repository and configure:

   | Setting | Value |
   | --- | --- |
   | Production branch | `main` |
   | Root directory | Leave at the repository root |
   | Build command | `npm run build` |
   | Build output directory | `dist` |

4. Start the first deployment. When it succeeds, open the `*.pages.dev` URL Cloudflare provides and check the page, recipe filters, recipe detail dialog, contact section, and demo form.

Cloudflare's React/Vite guidance uses `npm run build` and `dist`; its Git integration can deploy from GitHub on each push. Confirm the displayed settings during project creation because provider UI labels can change.

## 5. Publish later changes

After editing the app, from the project folder run:

```powershell
npm run build
git status --short
git add .
git commit -m "Describe the change"
git push
```

Then check the new deployment in Cloudflare. A successful Git push confirms that the code reached GitHub; check Cloudflare's deployment result and open the live URL to confirm that the site updated.

## Troubleshooting checkpoints

- **`git` is not recognized:** Git is missing from `PATH` or the current shell was opened before installation. Check with `Get-Command git`, open a new PowerShell window, and retry `git --version`.
- **`gh` is not recognized:** This guide does not require `gh`; create the repository in GitHub's website instead.
- **Authentication or permission denied:** Confirm the signed-in GitHub account can access the selected repository. Do not create or paste a personal access token into a command.
- **`remote origin already exists`:** Run `git remote -v` and verify the URL. Do not replace an existing remote until you know what it points to.
- **Cloudflare build fails:** Open that deployment's build log and address the first actual error. Confirm the root directory, `npm run build`, and `dist` settings.
- **The deployment succeeds but the page is missing or blank:** Check the build log and verify Cloudflare published the `dist` folder from this project.

## References

- [Cloudflare Pages: React](https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/)
- [Cloudflare Pages: build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/)
- [Cloudflare Pages: Git integration](https://developers.cloudflare.com/pages/configuration/git-integration/)
- [Vite: getting started and Node.js requirements](https://vite.dev/guide/)
