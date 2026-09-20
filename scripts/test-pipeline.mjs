/**
 * Test Pipeline: Self-check assertion script for CabeIndex
 * Runs with standard `node cabeindex/scripts/test-pipeline.mjs`
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { scoreArticle, calculateNationalIndex, getTier, TIERS } from './scorer.mjs';
import { runPipeline, FALLBACK_ARTICLES } from './crawler.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');

console.log('🧪 Running CabeIndex Automated Pipeline Self-Checks...');

// 1. Tier boundary tests
assert.strictEqual(getTier(10).id, 'adem');
assert.strictEqual(getTier(30).id, 'anget');
assert.strictEqual(getTier(60).id, 'nampol');
assert.strictEqual(getTier(78).id, 'geprek');
assert.strictEqual(getTier(95).id, 'mampus');
console.log('  ✓ Tier boundaries mapped accurately');

// 2. Article scoring sensitivity test
const negativeArticle = scoreArticle('Skandal korupsi dan suap pejabat pengadaan mencuat');
const positiveArticle = scoreArticle('Pemerintah raih apresiasi reformasi birokrasi bersih dan transparan');

assert(negativeArticle.heatScore > positiveArticle.heatScore, 
  `Expected negative article heat (${negativeArticle.heatScore}) to exceed positive (${positiveArticle.heatScore})`);
console.log(`  ✓ Sentiment sensitivity verified (Korupsi: ${negativeArticle.heatScore} vs Bersih: ${positiveArticle.heatScore})`);

// 3. National index calculation test
const indexResult = calculateNationalIndex(FALLBACK_ARTICLES, 60.0);
assert(indexResult.score >= 0 && indexResult.score <= 100, 'Score must be between 0 and 100');
assert(indexResult.tier && indexResult.tier.label, 'Must contain a valid tier definition');
assert(indexResult.subIndices.institusi.score > 0, 'Institusi subindex must exist');
assert(indexResult.subIndices.ekonomi.score > 0, 'Ekonomi subindex must exist');
assert(indexResult.subIndices.sosial.score > 0, 'Sosial subindex must exist');
assert(Array.isArray(indexResult.topDrivers), 'Top drivers must be an array');
console.log(`  ✓ National Index aggregation calculated: ${indexResult.score} (${indexResult.tier.label})`);

// 4. Live execution and file output test
await runPipeline();
const currentPath = path.join(DATA_DIR, 'current.json');
const historyPath = path.join(DATA_DIR, 'history.json');

assert(fs.existsSync(currentPath), 'data/current.json must be created');
assert(fs.existsSync(historyPath), 'data/history.json must be created');

const currentData = JSON.parse(fs.readFileSync(currentPath, 'utf8'));
assert(typeof currentData.score === 'number', 'Current score must be a number');
assert(currentData.topDrivers.length > 0, 'Top drivers must have entries');

const historyData = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
assert(Array.isArray(historyData) && historyData.length >= 7, 'History must contain at least 7 days of trend');

console.log('  ✓ File persistence and schema validated successfully');
console.log('🎉 ALL PIPELINE TESTS PASSED!');
