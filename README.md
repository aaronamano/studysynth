# About
[StudySynth](https://studysynth.vercel.app) is a fullstack tool using Perplexity AI to generate user-tailored study guides with online resources and study plans.

# Setup and Testing
run these commmands in order:
```bash
git clone https://github.com/aaronamano/studysynth
cd studysynth
pnpm install
pnpm run dev
```
afterwards click on `http://localhost:3000`

**make sure to create a** `.env` **file under the root directory with these variables:**
```text
MONGODB_URI=<your-mongodb-uri>
SECRET_KEY=<your-secret-key>
JWT_SECRET=<your-jwt-secret>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
```

# Contributing
**make sure to create your own branch before comitting**
1. run `git checkout -b <branch-name>`
2. run `git push -u origin <branch-name>`
3. write your commit messages as so:

```text
<issue-number>/<commit-type>: <issue-description>
<commit-description>
```

for example:

```text
#30/feat: chatbot interface
created a chatbot with Perplexity API
```
*you can refer to [GitHub Commit Types](https://github.com/pvdlg/conventional-commit-types)*

4. create a pull request on GitHub
