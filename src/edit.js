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
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1132.8 278.2" height="22" aria-label="Trustpilot">
						<path fill="#191919" d="M297.7,98.6h114.7V120h-45.1v120.3h-24.8V120h-44.9V98.6z M407.5,137.7h21.2v19.8h0.4c0.7-2.8,2-5.5,3.9-8.1c1.9-2.6,4.2-5.1,6.9-7.2c2.7-2.2,5.7-3.9,9-5.3c3.3-1.3,6.7-2,10.1-2c2.6,0,4.5,0.1,5.5,0.2c1,0.1,2,0.3,3.1,0.4v21.8c-1.6-0.3-3.2-0.5-4.9-0.7c-1.7-0.2-3.3-0.3-4.9-0.3c-3.8,0-7.4,0.8-10.8,2.3c-3.4,1.5-6.3,3.8-8.8,6.7c-2.5,3-4.5,6.6-6,11c-1.5,4.4-2.2,9.4-2.2,15.1v48.8h-22.6V137.7z M571.5,240.3h-22.2V226h-0.4c-2.8,5.2-6.9,9.3-12.4,12.4c-5.5,3.1-11.1,4.7-16.8,4.7c-13.5,0-23.3-3.3-29.3-10c-6-6.7-9-16.8-9-30.3v-65.1H504v62.9c0,9,1.7,15.4,5.2,19.1c3.4,3.7,8.3,5.6,14.5,5.6c4.8,0,8.7-0.7,11.9-2.2c3.2-1.5,5.8-3.4,7.7-5.9c2-2.4,3.4-5.4,4.3-8.8c0.9-3.4,1.3-7.1,1.3-11.1v-59.5h22.6V240.3z M610,207.4c0.7,6.6,3.2,11.2,7.5,13.9c4.4,2.6,9.6,4,15.7,4c2.1,0,4.5-0.2,7.2-0.5c2.7-0.3,5.3-1,7.6-1.9c2.4-0.9,4.3-2.3,5.9-4.1c1.5-1.8,2.2-4.1,2.1-7c-0.1-2.9-1.2-5.3-3.2-7.1c-2-1.9-4.5-3.3-7.6-4.5c-3.1-1.1-6.6-2.1-10.6-2.9c-4-0.8-8-1.7-12.1-2.6c-4.2-0.9-8.3-2.1-12.2-3.4c-3.9-1.3-7.4-3.1-10.5-5.4c-3.1-2.2-5.6-5.1-7.4-8.6c-1.9-3.5-2.8-7.8-2.8-13c0-5.6,1.4-10.2,4.1-14c2.7-3.8,6.2-6.8,10.3-9.1c4.2-2.3,8.8-3.9,13.9-4.9c5.1-0.9,10-1.4,14.6-1.4c5.3,0,10.4,0.6,15.2,1.7c4.8,1.1,9.2,2.9,13.1,5.5c3.9,2.5,7.1,5.8,9.7,9.8c2.6,4,4.2,8.9,4.9,14.6h-23.6c-1.1-5.4-3.5-9.1-7.4-10.9c-3.9-1.9-8.4-2.8-13.4-2.8c-1.6,0-3.5,0.1-5.7,0.4c-2.2,0.3-4.2,0.8-6.2,1.5c-1.9,0.7-3.5,1.8-4.9,3.2c-1.3,1.4-2,3.2-2,5.5c0,2.8,1,5,2.9,6.7c1.9,1.7,4.4,3.1,7.5,4.3c3.1,1.1,6.6,2.1,10.6,2.9c4,0.8,8.1,1.7,12.3,2.6c4.1,0.9,8.1,2.1,12.1,3.4c4,1.3,7.5,3.1,10.6,5.4c3.1,2.3,5.6,5.1,7.5,8.5c1.9,3.4,2.9,7.7,2.9,12.7c0,6.1-1.4,11.2-4.2,15.5c-2.8,4.2-6.4,7.7-10.8,10.3c-4.4,2.6-9.4,4.6-14.8,5.8c-5.4,1.2-10.8,1.8-16.1,1.8c-6.5,0-12.5-0.7-18-2.2c-5.5-1.5-10.3-3.7-14.3-6.6c-4-3-7.2-6.7-9.5-11.1c-2.3-4.4-3.5-9.7-3.7-15.8H610z M684.6,137.7h17.1v-30.8h22.6v30.8h20.4v16.9h-20.4v54.8c0,2.4,0.1,4.4,0.3,6.2c0.2,1.7,0.7,3.2,1.4,4.4c0.7,1.2,1.8,2.1,3.3,2.7c1.5,0.6,3.4,0.9,6,0.9c1.6,0,3.2,0,4.8-0.1c1.6-0.1,3.2-0.3,4.8-0.7v17.5c-2.5,0.3-5,0.5-7.3,0.8c-2.4,0.3-4.8,0.4-7.3,0.4c-6,0-10.8-0.6-14.4-1.7c-3.6-1.1-6.5-2.8-8.5-5c-2.1-2.2-3.4-4.9-4.2-8.2c-0.7-3.3-1.2-7.1-1.3-11.3v-60.5h-17.1V137.7z M760.7,137.7h21.4v13.9h0.4c3.2-6,7.6-10.2,13.3-12.8c5.7-2.6,11.8-3.9,18.5-3.9c8.1,0,15.1,1.4,21.1,4.3c6,2.8,11,6.7,15,11.7c4,5,6.9,10.8,8.9,17.4c2,6.6,3,13.7,3,21.2c0,6.9-0.9,13.6-2.7,20c-1.8,6.5-4.5,12.2-8.1,17.2c-3.6,5-8.2,8.9-13.8,11.9c-5.6,3-12.1,4.5-19.7,4.5c-3.3,0-6.6-0.3-9.9-0.9c-3.3-0.6-6.5-1.6-9.5-2.9c-3-1.3-5.9-3-8.4-5.1c-2.6-2.1-4.7-4.5-6.5-7.2h-0.4v51.2h-22.6V137.7z M839.7,189.1c0-4.6-0.6-9.1-1.8-13.5c-1.2-4.4-3-8.2-5.4-11.6c-2.4-3.4-5.4-6.1-8.9-8.1c-3.6-2-7.7-3.1-12.3-3.1c-9.5,0-16.7,3.3-21.5,9.9c-4.8,6.6-7.2,15.4-7.2,26.4c0,5.2,0.6,10,1.9,14.4c1.3,4.4,3.1,8.2,5.7,11.4c2.5,3.2,5.5,5.7,9,7.5c3.5,1.9,7.6,2.8,12.2,2.8c5.2,0,9.5-1.1,13.1-3.2c3.6-2.1,6.5-4.9,8.8-8.2c2.3-3.4,4-7.2,5-11.5C839.2,198,839.7,193.6,839.7,189.1z M879.6,98.6h22.6V120h-22.6V98.6z M879.6,137.7h22.6v102.6h-22.6V137.7z M922.4,98.6H945v141.7h-22.6V98.6z M1014.3,243.1c-8.2,0-15.5-1.4-21.9-4.1c-6.4-2.7-11.8-6.5-16.3-11.2c-4.4-4.8-7.8-10.5-10.1-17.1c-2.3-6.6-3.5-13.9-3.5-21.8c0-7.8,1.2-15,3.5-21.6c2.3-6.6,5.7-12.3,10.1-17.1c4.4-4.8,9.9-8.5,16.3-11.2c6.4-2.7,13.7-4.1,21.9-4.1c8.2,0,15.5,1.4,21.9,4.1c6.4,2.7,11.8,6.5,16.3,11.2c4.4,4.8,7.8,10.5,10.1,17.1c2.3,6.6,3.5,13.8,3.5,21.6c0,7.9-1.2,15.2-3.5,21.8c-2.3,6.6-5.7,12.3-10.1,17.1c-4.4,4.8-9.9,8.5-16.3,11.2C1029.8,241.7,1022.5,243.1,1014.3,243.1z M1014.3,225.2c5,0,9.4-1.1,13.1-3.2c3.7-2.1,6.7-4.9,9.1-8.3c2.4-3.4,4.1-7.3,5.3-11.6c1.1-4.3,1.7-8.7,1.7-13.2c0-4.4-0.6-8.7-1.7-13.1c-1.1-4.4-2.9-8.2-5.3-11.6c-2.4-3.4-5.4-6.1-9.1-8.2c-3.7-2.1-8.1-3.2-13.1-3.2c-5,0-9.4,1.1-13.1,3.2c-3.7,2.1-6.7,4.9-9.1,8.2c-2.4,3.4-4.1,7.2-5.3,11.6c-1.1,4.4-1.7,8.7-1.7,13.1c0,4.5,0.6,8.9,1.7,13.2c1.1,4.3,2.9,8.2,5.3,11.6c2.4,3.4,5.4,6.2,9.1,8.3C1004.9,224.2,1009.3,225.2,1014.3,225.2z M1072.7,137.7h17.1v-30.8h22.6v30.8h20.4v16.9h-20.4v54.8c0,2.4,0.1,4.4,0.3,6.2c0.2,1.7,0.7,3.2,1.4,4.4c0.7,1.2,1.8,2.1,3.3,2.7c1.5,0.6,3.4,0.9,6,0.9c1.6,0,3.2,0,4.8-0.1c1.6-0.1,3.2-0.3,4.8-0.7v17.5c-2.5,0.3-5,0.5-7.3,0.8c-2.4,0.3-4.8,0.4-7.3,0.4c-6,0-10.8-0.6-14.4-1.7c-3.6-1.1-6.5-2.8-8.5-5c-2.1-2.2-3.4-4.9-4.2-8.2c-0.7-3.3-1.2-7.1-1.3-11.3v-60.5h-17.1V137.7z"/>
						<polygon fill="#00B67A" points="271.3,98.6 167.7,98.6 135.7,0 103.6,98.6 0,98.5 83.9,159.5 51.8,258 135.7,197.1 219.5,258 187.5,159.5 271.3,98.6 271.3,98.6 271.3,98.6"/>
						<polygon fill="#005128" points="194.7,181.8 187.5,159.5 135.7,197.1"/>
					</svg>
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
