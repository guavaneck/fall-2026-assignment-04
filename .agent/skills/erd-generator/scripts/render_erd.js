#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { access, mkdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, '../../../..');
const inputPath = path.resolve(
  process.cwd(),
  process.argv[2] ?? 'docs/architecture/schema.mmd',
);
const outputPath = path.join(repositoryRoot, 'docs/architecture/erd.svg');

async function render() {
  try {
    await access(inputPath);
    await mkdir(path.dirname(outputPath), { recursive: true });

    const executable = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    const child = spawn(
      executable,
      ['--no-install', 'mmdc', '-i', inputPath, '-o', outputPath],
      { cwd: repositoryRoot, stdio: ['ignore', 'pipe', 'pipe'] },
    );

    let stderr = '';
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.stdout.on('data', (chunk) => {
      process.stdout.write(chunk);
    });

    child.on('error', (error) => {
      console.error(`SYNTAX_ERROR: ${error.message}`);
      process.exitCode = 1;
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log('SUCCESS');
        return;
      }

      console.error(`SYNTAX_ERROR: ${stderr.trim() || `mmdc exited with code ${code}`}`);
      process.exitCode = 1;
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`SYNTAX_ERROR: ${message}`);
    process.exitCode = 1;
  }
}

await render();
