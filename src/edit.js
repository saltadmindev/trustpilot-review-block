import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, TextareaControl, RangeControl } from '@wordpress/components';

const TP_STAR = 'M48,64.7 L62.6,61 L68.7,79.8 L48,64.7 Z M81.6,40.4 L55.9,40.4 L48,16.2 L40.1,40.4 L14.4,40.4 L35.2,55.4 L27.3,79.6 L48.1,64.6 L60.9,55.4 L81.6,40.4 Z';

function Stars( { count } ) {
	return (
		<div style={ { display: 'flex', gap: 2 } }>
			{ [ 1, 2, 3, 4, 5 ].map( ( i ) => (
				<svg key={ i } width="24" height="24" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
					<rect width="96" height="96" fill={ i <= count ? '#00B67A' : '#dcdce6' } fillRule="nonzero" />
					<path fill="#FFFFFF" fillRule="nonzero" d={ TP_STAR } />
				</svg>
			) ) }
		</div>
	);
}

function ReviewPreview( { a } ) {
	return (
		<div className="trb-review">
			<div className="trb-review__stars"><Stars count={ a.stars } /></div>
			{ a.title && <h3 className="trb-review__title">{ a.title }</h3> }
			{ a.text  && <p className="trb-review__text">{ a.text }</p> }
			<div className="trb-review__meta">
				<div className="trb-review__author-block">
					<span className="trb-review__avatar">{ a.reviewer ? a.reviewer.charAt( 0 ).toUpperCase() : '?' }</span>
					<div>
						<span className="trb-review__author">{ a.reviewer || __( 'Reviewer name', 'trustpilot-review-block' ) }</span>
						<span className="trb-review__review-count">{ a.reviewCount }</span>
					</div>
				</div>
				<div className="trb-review__date-country">
					{ a.country && <span className="trb-review__country">{ a.country }</span> }
					{ a.date    && <span className="trb-review__date">{ a.date }</span> }
				</div>
			</div>
			<div className="trb-review__footer">
				<span className="trb-review__verified">✓ Verified</span>
				<span className="trb-review__branding">
					<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24">
						<path fill="#00b67a" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
					</svg>
					<span>Trustpilot</span>
				</span>
			</div>
		</div>
	);
}

export default function Edit( { attributes: a, setAttributes } ) {
	const set        = ( key ) => ( val ) => setAttributes( { [ key ]: val } );
	const blockProps = useBlockProps();
	const hasContent = a.text || a.title || a.reviewer;

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Reviewer', 'trustpilot-review-block' ) } initialOpen={ true }>
					<TextControl label={ __( 'Name', 'trustpilot-review-block' ) }
						value={ a.reviewer } onChange={ set( 'reviewer' ) } placeholder="Jacqueline Leng" />
					<TextControl label={ __( 'Number of reviews', 'trustpilot-review-block' ) }
						value={ a.reviewCount } onChange={ set( 'reviewCount' ) } placeholder="1 review" />
					<TextControl label={ __( 'Country code', 'trustpilot-review-block' ) }
						value={ a.country } onChange={ set( 'country' ) } placeholder="GB" />
				</PanelBody>

				<PanelBody title={ __( 'Review', 'trustpilot-review-block' ) } initialOpen={ true }>
					<RangeControl label={ __( 'Star rating', 'trustpilot-review-block' ) }
						value={ a.stars } onChange={ set( 'stars' ) } min={ 1 } max={ 5 } />
					<TextControl label={ __( 'Date', 'trustpilot-review-block' ) }
						value={ a.date } onChange={ set( 'date' ) } placeholder="Mar 9, 2026" />
					<TextControl label={ __( 'Review title', 'trustpilot-review-block' ) }
						value={ a.title } onChange={ set( 'title' ) } placeholder="Well organised" />
					<TextareaControl label={ __( 'Review text', 'trustpilot-review-block' ) }
						value={ a.text } onChange={ set( 'text' ) } rows={ 6 }
						placeholder="Paste the full review text here…" />
				</PanelBody>

				<PanelBody title={ __( 'Link', 'trustpilot-review-block' ) } initialOpen={ false }>
					<TextControl label={ __( 'Trustpilot review URL', 'trustpilot-review-block' ) }
						help={ __( 'Link to the live review on Trustpilot', 'trustpilot-review-block' ) }
						value={ a.reviewUrl } onChange={ set( 'reviewUrl' ) }
						placeholder="https://www.trustpilot.com/reviews/..." type="url" />
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				{ hasContent ? (
					<ReviewPreview a={ a } />
				) : (
					<div style={ { border: '2px dashed #00b67a', borderRadius: 6, padding: '32px 24px', textAlign: 'center', background: '#f9fdf9' } }>
						<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" style={ { marginBottom: 8 } }>
							<path fill="#00b67a" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
						</svg>
						<p style={ { margin: 0, color: '#555', fontSize: 14 } }>
							{ __( 'Fill in the review details in the sidebar →', 'trustpilot-review-block' ) }
						</p>
					</div>
				) }
			</div>
		</>
	);
}
