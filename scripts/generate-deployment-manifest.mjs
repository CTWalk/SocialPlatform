import fs from 'node:fs';
import path from 'node:path';

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) {
      continue;
    }

    const key = token.slice(2);
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) {
      throw new Error(`Missing value for --${key}`);
    }
    options[key] = value;
    index += 1;
  }
  return options;
}

function listFiles(rootDir, currentDir = rootDir) {
  return fs.readdirSync(currentDir, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(currentDir, entry.name);
    if (entry.isDirectory()) {
      return listFiles(rootDir, absolutePath);
    }

    const stats = fs.statSync(absolutePath);
    return [{
      path: path.relative(rootDir, absolutePath),
      bytes: stats.size,
    }];
  });
}

const args = parseArgs(process.argv.slice(2));
const bundlePath = path.resolve(args['bundle-path'] ?? process.env.DELIVERY_BUNDLE_PATH ?? 'dist/company-social-platform');
const outputPath = path.resolve(args.output ?? process.env.DELIVERY_MANIFEST_OUTPUT ?? 'build/delivery/deployment-manifest.json');
const summaryPath = outputPath.replace(/\.json$/, '.md');
const environment = args.environment ?? process.env.DELIVERY_ENVIRONMENT ?? 'local';
const environmentLabel = args['environment-label'] ?? process.env.DELIVERY_ENVIRONMENT_LABEL ?? environment;
const angularConfig = args['angular-config'] ?? process.env.DELIVERY_ANGULAR_CONFIG ?? 'production';
const artifactName = args['artifact-name'] ?? process.env.DELIVERY_ARTIFACT_NAME ?? `release-web-${environment}`;

if (!fs.existsSync(bundlePath)) {
  throw new Error(`Bundle path not found: ${bundlePath}`);
}

const requiredFiles = ['index.html', 'main.js', 'runtime.js', 'styles.css', 'manifest.webmanifest', 'ngsw.json'];
const requiredFileStatus = Object.fromEntries(
  requiredFiles.map((file) => [file, fs.existsSync(path.join(bundlePath, file))]),
);

const files = listFiles(bundlePath).sort((left, right) => left.path.localeCompare(right.path));
const totalBytes = files.reduce((sum, file) => sum + file.bytes, 0);

const manifest = {
  environment,
  environmentLabel,
  angularConfig,
  artifactName,
  bundlePath,
  generatedAt: new Date().toISOString(),
  commitSha: process.env.GITHUB_SHA ?? 'local',
  refName: process.env.GITHUB_REF_NAME ?? 'local',
  workflowRunId: process.env.GITHUB_RUN_ID ?? 'local',
  fileCount: files.length,
  totalBytes,
  requiredFiles: requiredFileStatus,
  files,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`);

const summary = [
  '# Delivery Manifest',
  '',
  `- Environment: \`${environmentLabel}\``,
  `- Angular configuration: \`${angularConfig}\``,
  `- Artifact: \`${artifactName}\``,
  `- Commit: \`${manifest.commitSha}\``,
  `- Files: \`${manifest.fileCount}\``,
  `- Total size: \`${manifest.totalBytes}\` bytes`,
  '',
  '## Required Files',
  '',
  ...requiredFiles.map((file) => `- \`${file}\`: ${requiredFileStatus[file] ? 'present' : 'missing'}`),
].join('\n');

fs.writeFileSync(summaryPath, `${summary}\n`);
