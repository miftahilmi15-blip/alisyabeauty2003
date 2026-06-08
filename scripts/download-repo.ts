import fs from 'fs';
import path from 'path';

interface GithubContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  type: 'file' | 'dir';
  content?: string;
  encoding?: string;
}

const OWNER = 'miftahilmi15-blip';
const REPO = 'alisyabeauty-';

async function fetchJson(url: string): Promise<any> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AI-Studio-Agent'
    }
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }
  return response.json();
}

async function fetchRaw(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AI-Studio-Agent'
    }
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch raw ${url}: ${response.statusText}`);
  }
  return response.text();
}

async function downloadDirectory(dirPath: string) {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${dirPath}`;
  console.log(`Fetching directory structure for: ${dirPath}...`);
  const items: GithubContent[] = await fetchJson(url);

  for (const item of items) {
    if (item.type === 'file') {
      if (item.download_url) {
        console.log(`Downloading file: ${item.path}...`);
        const fileContent = await fetchRaw(item.download_url);
        const localPath = path.join(process.cwd(), 'original-repo', item.path);
        fs.mkdirSync(path.dirname(localPath), { recursive: true });
        fs.writeFileSync(localPath, fileContent, 'utf-8');
      }
    } else if (item.type === 'dir') {
      await downloadDirectory(item.path);
    }
  }
}

async function main() {
  try {
    console.log('Starting repository download...');
    // Download index.html and manifest.json first
    const rootUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents`;
    const rootItems: GithubContent[] = await fetchJson(rootUrl);
    
    for (const item of rootItems) {
      if (item.type === 'file') {
        if (item.download_url) {
          console.log(`Downloading root file: ${item.path}...`);
          const fileContent = await fetchRaw(item.download_url);
          const localPath = path.join(process.cwd(), 'original-repo', item.path);
          fs.mkdirSync(path.dirname(localPath), { recursive: true });
          fs.writeFileSync(localPath, fileContent, 'utf-8');
        }
      } else if (item.type === 'dir' && item.name === 'src') {
        await downloadDirectory(item.name);
      }
    }
    console.log('Download complete! All original files are saved in ./original-repo.');
  } catch (error) {
    console.error('Error downloading repo:', error);
  }
}

main();
