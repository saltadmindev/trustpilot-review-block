import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	PanelRow,
	TextControl,
	Button,
	Notice,
	ExternalLink,
	__experimentalText as Text,
} from '@wordpress/components';
import { useState } from '@wordpress/element';

const cfg = () => window.trbConfig || {};

/**
 * Extract a review ID from a full Trustpilot review URL or return the raw value
 * if the user pastes just the ID.
 * URLs look like: https://www.trustpilot.com/reviews/507f1f77bcf86cd799439011
 */
function parseReviewId( value ) {
	try {
		const url = new URL( value );
		if ( url.hostname.includes( 'trustpilot.com' ) ) {
			const parts = url.pathname.split( '/' ).filter( Boolean );
			// pathname: /reviews/<id>
			if ( parts[ 0 ] === 'reviews' && parts[ 1 ] ) {
				return parts[ 1 ];
			}
		}
	} catch {
		// Not a URL — treat value as a raw ID
	}
	return value.trim();
}

function StarRow( { rating } ) {
	const filled = Math.round( rating );
	return (
		<span style={ { display: 'flex', gap: 2 } }>
			{ [ 1, 2, 3, 4, 5 ].map( ( i ) => (
				<svg
					key={ i }
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill={ i <= filled ? '#00b67a' : '#dcdce6' }
					xmlns="http://www.w3.org/2000/svg"
				>
					<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
				</svg>
			) ) }
		</span>
	);
}

function Placeholder( { isConfigured } ) {
	return (
		<div
			style={ {
				border: '1px dashed #00b67a',
				borderRadius: 4,
				padding: '32px 24px',
				textAlign: 'center',
				background: '#f9fdf9',
			} }
		>
			<svg
				width="32"
				height="32"
				viewBox="0 0 24 24"
				fill="#00b67a"
				style={ { marginBottom: 8 } }
			>
				<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
			</svg>
			<p style={ { margin: 0, color: '#555', fontSize: 14 } }>
				{ isConfigured
					? __( 'Paste a Trustpilot review URL in the sidebar to display a review.', 'trustpilot-review-block' )
					: __( 'Configure the plugin settings first, then paste a review URL in the sidebar.', 'trustpilot-review-block' ) }
			</p>
			{ ! isConfigured && (
				<Button
					variant="link"
					href={ cfg().settingsUrl }
					target="_blank"
					style={ { marginTop: 8 } }
				>
					{ __( 'Open plugin settings', 'trustpilot-review-block' ) }
				</Button>
			) }
		</div>
	);
}

function ReviewPreview( { reviewId, height } ) {
	const c = cfg();
	const previewHeight = height || c.styleHeight || '300px';
	return (
		<div style={ { border: '1px solid #e8e8e8', borderRadius: 4, overflow: 'hidden' } }>
			<div
				style={ {
					background: '#f7f7f7',
					borderBottom: '1px solid #e8e8e8',
					padding: '6px 12px',
					display: 'flex',
					alignItems: 'center',
					gap: 8,
				} }
			>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="#00b67a">
					<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
				</svg>
				<span style={ { fontSize: 12, color: '#555' } }>
					{ __( 'Trustpilot review widget — ID:', 'trustpilot-review-block' ) }{ ' ' }
					<code style={ { fontSize: 11 } }>{ reviewId }</code>
				</span>
			</div>
			<div
				style={ {
					height: previewHeight,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					flexDirection: 'column',
					gap: 12,
					background: '#fff',
					padding: 24,
				} }
			>
				<StarRow rating={ 5 } />
				<p style={ { margin: 0, fontSize: 13, color: '#888', textAlign: 'center' } }>
					{ __( 'The Trustpilot widget will render here on the live site.', 'trustpilot-review-block' ) }
				</p>
				<ExternalLink
					href={ `https://www.trustpilot.com/reviews/${ reviewId }` }
					style={ { fontSize: 12 } }
				>
					{ __( 'View review on Trustpilot', 'trustpilot-review-block' ) }
				</ExternalLink>
			</div>
		</div>
	);
}

export default function Edit( { attributes, setAttributes } ) {
	const { reviewId, styleHeight } = attributes;
	const blockProps = useBlockProps();
	const c = cfg();

	const [ urlInput, setUrlInput ] = useState( '' );
	const [ inputError, setInputError ] = useState( '' );

	const isConfigured =
		( attributes.businessUnitId || c.businessUnitId ) &&
		( attributes.widgetToken || c.widgetToken );

	function applyReviewUrl() {
		if ( ! urlInput.trim() ) {
			setInputError( __( 'Please enter a Trustpilot review URL or review ID.', 'trustpilot-review-block' ) );
			return;
		}
		const id = parseReviewId( urlInput );
		if ( ! id ) {
			setInputError( __( 'Could not extract a review ID from that URL.', 'trustpilot-review-block' ) );
			return;
		}
		setAttributes( { reviewId: id } );
		setUrlInput( '' );
		setInputError( '' );
	}

	function clearReview() {
		setAttributes( { reviewId: '' } );
	}

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Review Selection', 'trustpilot-review-block' ) }
					initialOpen={ true }
				>
					{ ! isConfigured && (
						<Notice status="warning" isDismissible={ false }>
							{ __( 'Business Unit ID and Widget Token are not set. ', 'trustpilot-review-block' ) }
							<ExternalLink href={ c.settingsUrl }>
								{ __( 'Open settings', 'trustpilot-review-block' ) }
							</ExternalLink>
						</Notice>
					) }

					<PanelRow>
						<div style={ { width: '100%' } }>
							<TextControl
								label={ __( 'Trustpilot review URL', 'trustpilot-review-block' ) }
								help={ __( 'Paste a URL like: trustpilot.com/reviews/abc123', 'trustpilot-review-block' ) }
								value={ urlInput }
								onChange={ ( v ) => {
									setUrlInput( v );
									setInputError( '' );
								} }
								onKeyDown={ ( e ) => e.key === 'Enter' && applyReviewUrl() }
								placeholder="https://www.trustpilot.com/reviews/..."
							/>
							{ inputError && (
								<p style={ { color: '#cc0000', fontSize: 12, margin: '-8px 0 8px' } }>
									{ inputError }
								</p>
							) }
							<Button
								variant="primary"
								onClick={ applyReviewUrl }
								style={ { marginBottom: 8 } }
							>
								{ reviewId
									? __( 'Change review', 'trustpilot-review-block' )
									: __( 'Set review', 'trustpilot-review-block' ) }
							</Button>
						</div>
					</PanelRow>

					{ reviewId && (
						<PanelRow>
							<div style={ { width: '100%' } }>
								<Text
									as="p"
									size="small"
									style={ { marginBottom: 4 } }
								>
									{ __( 'Current review ID:', 'trustpilot-review-block' ) }
								</Text>
								<code style={ { fontSize: 11, wordBreak: 'break-all', display: 'block', marginBottom: 8 } }>
									{ reviewId }
								</code>
								<Button
									variant="link"
									isDestructive
									onClick={ clearReview }
								>
									{ __( 'Remove review', 'trustpilot-review-block' ) }
								</Button>
							</div>
						</PanelRow>
					) }
				</PanelBody>

				<PanelBody
					title={ __( 'Widget Options', 'trustpilot-review-block' ) }
					initialOpen={ false }
				>
					<TextControl
						label={ __( 'Widget height', 'trustpilot-review-block' ) }
						value={ styleHeight || c.styleHeight || '300px' }
						onChange={ ( v ) => setAttributes( { styleHeight: v } ) }
						help={ __( 'e.g. 300px or 20em', 'trustpilot-review-block' ) }
					/>
					<TextControl
						label={ __( 'Business Unit ID', 'trustpilot-review-block' ) }
						value={ attributes.businessUnitId || c.businessUnitId || '' }
						onChange={ ( v ) => setAttributes( { businessUnitId: v } ) }
						help={ __( 'Leave blank to use the value from plugin settings.', 'trustpilot-review-block' ) }
					/>
					<TextControl
						label={ __( 'Widget Token', 'trustpilot-review-block' ) }
						value={ attributes.widgetToken || c.widgetToken || '' }
						onChange={ ( v ) => setAttributes( { widgetToken: v } ) }
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				{ reviewId ? (
					<ReviewPreview
						reviewId={ reviewId }
						height={ styleHeight || c.styleHeight }
					/>
				) : (
					<Placeholder isConfigured={ isConfigured } />
				) }
			</div>
		</>
	);
}
