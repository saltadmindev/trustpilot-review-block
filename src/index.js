import { registerBlockType } from '@wordpress/blocks';
import metadata from '../block.json';
import Edit from './edit';

registerBlockType( metadata.name, {
	...metadata,
	edit: Edit,
	// Dynamic block — save returns null, PHP renders on the frontend
	save: () => null,
} );
