import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import fs from 'fs';
import path from 'path';

const dir = process.cwd();

async function walkDir(currentDir, fileList = []) {
  const files = await fs.promises.readdir(currentDir);
  for (const file of files) {
    if (file === 'node_modules' || file === '.next' || file === '.git' || file === '.env.local') {
      continue;
    }
    const fullPath = path.join(currentDir, file);
    const stat = await fs.promises.stat(fullPath);
    if (stat.isDirectory()) {
      await walkDir(fullPath, fileList);
    } else {
      const relPath = path.relative(dir, fullPath).replace(/\\/g, '/');
      fileList.push(relPath);
    }
  }
  return fileList;
}

async function main() {
  const token = process.argv[2] || process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

  if (!token) {
    console.error('\n❌ ERROR: GitHub Personal Access Token is required to push to GitHub.');
    console.error('Usage: node scripts/git-push.mjs <YOUR_GITHUB_TOKEN>\n');
    console.error('To create a token in 30 seconds:');
    console.error('1. Go to https://github.com/settings/tokens/new');
    console.error('2. Give it a name, check "repo" scope, and click "Generate token"');
    console.error('3. Provide the token (starts with ghp_...)\n');
    process.exit(1);
  }

  console.log('🚀 Initializing Git repository in', dir);
  await git.init({ fs, dir, defaultBranch: 'main' });

  console.log('📦 Staging project files...');
  const files = await walkDir(dir);
  console.log(`Found ${files.length} files to commit.`);

  for (const filepath of files) {
    await git.add({ fs, dir, filepath });
  }

  console.log('✍️  Committing changes...');
  const sha = await git.commit({
    fs,
    dir,
    author: {
      name: 'asadaweis05-png',
      email: 'asadaweis05@gmail.com',
    },
    message: 'eFootball digital marketplace in Somali language with Supabase integration',
  });
  console.log('✅ Committed successfully! SHA:', sha);

  console.log('🔗 Setting remote origin to https://github.com/asadaweis05-png/gamers.git ...');
  try {
    await git.deleteRemote({ fs, dir, remote: 'origin' });
  } catch (e) {}

  await git.addRemote({
    fs,
    dir,
    remote: 'origin',
    url: 'https://github.com/asadaweis05-png/gamers.git',
  });

  console.log('🚀 Pushing to GitHub (main branch)...');

  try {
    const pushResult = await git.push({
      fs,
      http,
      dir,
      remote: 'origin',
      ref: 'main',
      force: true,
      onAuth: () => ({
        username: token.trim(),
      }),
    });
    console.log('🎉 SUCCESS: Code has been pushed to https://github.com/asadaweis05-png/gamers.git !');
    console.log('Push details:', pushResult);
  } catch (err) {
    console.error('❌ Push failed:', err.message || err);
    if (err.data) console.error('Details:', err.data);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
