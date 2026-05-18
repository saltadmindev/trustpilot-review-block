import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, Button, Notice } from '@wordpress/components';
import { useState } from '@wordpress/element';

function Stars( { count } ) {
	return (
		<div style={ { display: 'flex', gap: 2, marginBottom: 12 } }>
			{ [ 1, 2, 3, 4, 5 ].map( ( i ) => (
				<svg key={ i } width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
					<path fill={ i <= count ? '#00b67a' : '#dcdce6' }
						d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
				</svg>
			) ) }
		</div>
	);
}

function parseReviewId( value ) {
	value = value.trim();
	try {
		const url  = new URL( value );
		const parts = url.pathname.split( '/' ).filter( Boolean );
		if ( parts[ 0 ] === 'reviews' && parts[ 1 ] ) {
			return parts[ 1 ];
		}
	} catch ( e ) {}
	// Treat raw value as an ID if it looks like one
	if ( /^[a-f0-9]{10,}$/i.test( value ) ) {
		return value;
	}
	return '';
}

export default function Edit( { attributes, setAttributes } ) {
	const { reviewId } = attributes;
	const blockProps   = useBlockProps();
	const cfg          = window.trbConfig || {};

	const [ urlInput, setUrlInput ] = useState( '' );
	const [ error, setError ]       = useState( '' );

	function applyUrl() {
		const id = parseReviewId( urlInput );
		if ( ! id ) {
			setError( __( 'Could not find a review ID in that URL. Use a link like trustpilot.com/reviews/abc123', 'trustpilot-review-block' ) );
			return;
		}
		setAttributes( { reviewId: id } );
		setUrlInput( '' );
		setError( '' );
	}

	const isConfigured = cfg.businessUnitId && cfg.widgetToken;

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Trustpilot Review', 'trustpilot-review-block' ) } initialOpen={ true }>

					{ ! isConfigured && (
						<Notice status="warning" isDismissible={ false }>
							{ __( 'Add your Business Unit ID and Widget Token in ', 'trustpilot-review-block' ) }
							<a href={ cfg.settingsUrl } target="_blank" rel="noopener noreferrer">
								{ __( 'plugin settings', 'trustpilot-review-block' ) }
							</a>.
						</Notice>
					) }

					<TextControl
						label={ __( 'Trustpilot review URL', 'trustpilot-review-block' ) }
						help={ __( 'Paste the URL of the review from Trustpilot', 'trustpilot-review-block' ) }
						value={ urlInput }
						onChange={ ( v ) => { setUrlInput( v ); setError( '' ); } }
						onKeyDown={ ( e ) => e.key === 'Enter' && applyUrl() }
						placeholder="https://www.trustpilot.com/reviews/..."
					/>

					{ error && (
						<Notice status="error" isDismissible={ false } style={ { marginBottom: 8 } }>
							{ error }
						</Notice>
					) }

					<Button variant="primary" onClick={ applyUrl } disabled={ ! urlInput.trim() }>
						{ reviewId ? __( 'Change review', 'trustpilot-review-block' ) : __( 'Set review', 'trustpilot-review-block' ) }
					</Button>

					{ reviewId && (
						<p style={ { marginTop: 12, fontSize: 12, color: '#757575' } }>
							{ __( 'Review ID: ', 'trustpilot-review-block' ) }
							<code>{ reviewId }</code>
						</p>
					) }

				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				{ reviewId ? (
					<div style={ { border: '1px solid #e8e8e8', borderRadius: 6, padding: 24, background: '#fff' } }>
						<Stars count={ 5 } />
						<p style={ { margin: '0 0 16px', color: '#333', fontSize: 15 } }>
							{ __( 'Trustpilot widget will display here on the live site.', 'trustpilot-review-block' ) }
						</p>
						<p style={ { margin: 0, fontSize: 12, color: '#888' } }>
							{ __( 'Review ID: ', 'trustpilot-review-block' ) }<code>{ reviewId }</code>
						</p>
					</div>
				) : (
					<div style={ { border: '2px dashed #00b67a', borderRadius: 6, padding: '32px 24px', textAlign: 'center', background: '#f9fdf9' } }>
						<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" style={ { marginBottom: 8 } }>
							<path fill="#00b67a" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
						</svg>
						<p style={ { margin: 0, color: '#555', fontSize: 14 } }>
							{ __( 'Paste a Trustpilot review URL in the sidebar and click Set review.', 'trustpilot-review-block' ) }
						</p>
					</div>
				) }
			</div>
		</>
	);
}
