import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	TextControl,
	Button,
	Spinner,
	Notice,
} from '@wordpress/components';
import { useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

function Stars( { count } ) {
	return (
		<div style={ { display: 'flex', gap: 2, marginBottom: 12 } }>
			{ [ 1, 2, 3, 4, 5 ].map( ( i ) => (
				<svg key={ i } width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
					<path
						fill={ i <= count ? '#00b67a' : '#dcdce6' }
						d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
					/>
				</svg>
			) ) }
		</div>
	);
}

function ReviewPreview( { attributes } ) {
	const { stars, title, text, reviewer, date, reviewUrl } = attributes;
	return (
		<div className="trb-review">
			<div className="trb-review__header">
				<Stars count={ stars } />
				{ date && <span className="trb-review__date">{ date }</span> }
			</div>
			{ title && <h3 className="trb-review__title">{ title }</h3> }
			{ text  && <p className="trb-review__text">{ text }</p> }
			<div className="trb-review__footer">
				<span className="trb-review__author">{ reviewer }</span>
				<span className="trb-review__branding">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
						<path fill="#00b67a" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
					</svg>
					<span>Trustpilot</span>
				</span>
			</div>
		</div>
	);
}

export default function Edit( { attributes, setAttributes } ) {
	const { reviewUrl } = attributes;
	const blockProps = useBlockProps();

	const [ urlInput, setUrlInput ]     = useState( '' );
	const [ loading, setLoading ]       = useState( false );
	const [ error, setError ]           = useState( '' );
	const hasReview = !! attributes.text || !! attributes.title;

	async function fetchReview() {
		const url = urlInput.trim();
		if ( ! url ) return;

		setLoading( true );
		setError( '' );

		try {
			const data = await apiFetch( {
				path: '/trb/v1/fetch-review?url=' + encodeURIComponent( url ),
			} );
			setAttributes( {
				reviewUrl: data.reviewUrl,
				stars:     data.stars,
				title:     data.title,
				text:      data.text,
				reviewer:  data.reviewer,
				date:      data.date,
			} );
			setUrlInput( '' );
		} catch ( err ) {
			setError( err.message || __( 'Could not fetch the review. Check the URL and try again.', 'trustpilot-review-block' ) );
		} finally {
			setLoading( false );
		}
	}

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Trustpilot Review', 'trustpilot-review-block' ) } initialOpen={ true }>
					<TextControl
						label={ __( 'Review URL', 'trustpilot-review-block' ) }
						help={ __( 'Paste the URL of a single Trustpilot review (trustpilot.com/reviews/…)', 'trustpilot-review-block' ) }
						value={ urlInput }
						onChange={ setUrlInput }
						onKeyDown={ ( e ) => e.key === 'Enter' && fetchReview() }
						placeholder="https://www.trustpilot.com/reviews/..."
						type="url"
					/>
					{ error && (
						<Notice status="error" isDismissible={ false } style={ { marginBottom: 8 } }>
							{ error }
						</Notice>
					) }
					<Button
						variant="primary"
						onClick={ fetchReview }
						disabled={ loading || ! urlInput.trim() }
						style={ { marginBottom: hasReview ? 12 : 0 } }
					>
						{ loading
							? <><Spinner />{ __( ' Fetching…', 'trustpilot-review-block' ) }</>
							: hasReview
								? __( 'Change review', 'trustpilot-review-block' )
								: __( 'Fetch review', 'trustpilot-review-block' )
						}
					</Button>

					{ hasReview && (
						<>
							<hr style={ { margin: '8px 0 12px', border: 'none', borderTop: '1px solid #e0e0e0' } } />
							<p style={ { fontSize: 12, color: '#757575', margin: '0 0 4px' } }>
								{ __( 'Current review:', 'trustpilot-review-block' ) }
							</p>
							<p style={ { fontSize: 12, margin: '0 0 4px', fontWeight: 600 } }>
								{ attributes.reviewer }
								{ attributes.stars ? ` — ${'★'.repeat( attributes.stars )}` : '' }
							</p>
							<p style={ { fontSize: 12, color: '#555', margin: 0, wordBreak: 'break-all' } }>
								<a href={ attributes.reviewUrl } target="_blank" rel="noopener noreferrer">
									{ __( 'View on Trustpilot ↗', 'trustpilot-review-block' ) }
								</a>
							</p>
						</>
					) }
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				{ hasReview ? (
					<ReviewPreview attributes={ attributes } />
				) : (
					<div style={ {
						border: '2px dashed #00b67a',
						borderRadius: 6,
						padding: '32px 24px',
						textAlign: 'center',
						background: '#f9fdf9',
					} }>
						<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" style={ { marginBottom: 8 } }>
							<path fill="#00b67a" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
						</svg>
						<p style={ { margin: 0, color: '#555', fontSize: 14 } }>
							{ __( 'Paste a Trustpilot review URL in the sidebar and click Fetch review.', 'trustpilot-review-block' ) }
						</p>
					</div>
				) }
			</div>
		</>
	);
}
