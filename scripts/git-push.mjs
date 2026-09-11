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
  console.log('Initializing Git repository in', dir);
  await git.init({ fs, dir, defaultBranch: 'main' });

  console.log('Collecting files...');
  const files = await walkDir(dir);
  console.log(`Found ${files.length} files to commit.`);

  for (const filepath of files) {
    await git.add({ fs, dir, filepath });
  }

  console.log('Committing changes...');
  const sha = await git.commit({
    fs,
    dir,
    author: {
      name: 'Asad Aweis',
      email: 'asadaweis05@gmail.com',
    },
    message: 'eFootball digital marketplace in Somali language with Supabase integration',
  });
  console.log('Committed successfully. SHA:', sha);

  console.log('Setting remote origin...');
  try {
    await git.deleteRemote({ fs, dir, remote: 'origin' });
  } catch (e) {}

  await git.addRemote({
    fs,
    dir,
    remote: 'origin',
    url: 'https://github.com/asadaweis05-png/gamers.git',
  });

  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  console.log('Pushing to https://github.com/asadaweis05-png/gamers.git ...');

  try {
    const pushResult = await git.push({
      fs,
      http,
      dir,
      remote: 'origin',
      ref: 'main',
      force: true,
      onAuth: () => {
        if (token) {
          return { username: token };
        }
        return { username: 'asadaweis05-png' };
      },
    });
    console.log('Push result:', pushResult);
    console.log('Successfully pushed to GitHub!');
  } catch (err) {
    console.error('Push error:', err.message || err);
    if (err.data) console.error('Error details:', err.data);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
