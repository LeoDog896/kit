import path from 'path';
import create_manifest_data from './create_manifest_data/index.js';
import { write_client_manifest } from './write_client_manifest.js';
import { write_root } from './write_root.js';
import { write_tsconfig } from './write_tsconfig.js';
import { write_types, write_all_types } from './write_types/index.js';
import { write_ambient } from './write_ambient.js';
import { write_server } from './write_server.js';

/**
 * Initialize SvelteKit's generated files.
 * @param {import('types').ValidatedConfig} config
 * @param {string} mode
 */
export function init(config, mode) {
	write_tsconfig(config.kit);
	write_ambient(config.kit, mode);
}

/**
 * Update SvelteKit's generated files
 * @param {import('types').ValidatedConfig} config
 */
export async function create(config) {
	const manifest_data = create_manifest_data({ config });

	const output = path.join(config.kit.outDir, 'generated');

	write_client_manifest(config.kit, manifest_data, `${output}/client`);
	write_server(config, output);
	write_root(manifest_data, output);
	await write_all_types(config, manifest_data);

	return { manifest_data };
}

/**
 * Update SvelteKit's generated files in response to a single file content update.
 * Do not call this when the file in question was created/deleted.
 *
 * @param {import('types').ValidatedConfig} config
 * @param {import('types').ManifestData} manifest_data
 * @param {string} file
 */
export async function update(config, manifest_data, file) {
	await write_types(config, manifest_data, file);

	return { manifest_data };
}

/**
 * Run sync.init and sync.create in series, returning the result from sync.create.
 * @param {import('types').ValidatedConfig} config
 * @param {string} mode The Vite mode
 */
export async function all(config, mode) {
	init(config, mode);
	return await create(config);
}

/**
 * Run sync.init and then generate all type files.
 * @param {import('types').ValidatedConfig} config
 * @param {string} mode The Vite mode
 */
export async function all_types(config, mode) {
	init(config, mode);
	const manifest_data = create_manifest_data({ config });
	await write_all_types(config, manifest_data);
}

/**
 * Regenerate __SERVER__/internal.js in response to src/{app.html,error.html,service-worker.js} changing
 * @param {import('types').ValidatedConfig} config
 */
export function server(config) {
	write_server(config, path.join(config.kit.outDir, 'generated'));
}
