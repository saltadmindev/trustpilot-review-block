<?php
/**
 * Plugin Name: Trustpilot Review Block
 * Description: Display a hand-picked Trustpilot review, styled exactly like Trustpilot, linking to the live review.
 * Version: 5.0.0
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * License: GPL-2.0-or-later
 * Text Domain: trustpilot-review-block
 */

defined( 'ABSPATH' ) || exit;

add_action( 'init', function () {
	if ( ! function_exists( 'register_block_type' ) ) {
		return;
	}

	$asset_file = file_exists( plugin_dir_path( __FILE__ ) . 'build/index.asset.php' )
		? include plugin_dir_path( __FILE__ ) . 'build/index.asset.php'
		: array( 'dependencies' => array(), 'version' => '5.0.0' );

	wp_register_script(
		'trb-editor',
		plugins_url( 'build/index.js', __FILE__ ),
		$asset_file['dependencies'],
		$asset_file['version']
	);

	wp_register_style(
		'trb-style',
		plugins_url( 'style.css', __FILE__ ),
		array(),
		'5.0.0'
	);

	// Output @font-face with absolute URL so it resolves correctly regardless of server config
	$font_url = plugins_url( 'fonts/Trustpilot-Sans.woff2', __FILE__ );
	wp_add_inline_style( 'trb-style',
		'@font-face { font-family: "Trustpilot Sans"; src: url("' . esc_url( $font_url ) . '") format("woff2"); font-weight: 100 900; font-display: swap; }'
	);

	register_block_type( __DIR__ . '/block.json', array(
		'editor_script'   => 'trb-editor',
		'style'           => 'trb-style',
		'render_callback' => 'trb_render_block',
	) );
} );

function trb_render_block( $attributes ) {
	$reviewer     = sanitize_text_field( $attributes['reviewer']    ?? '' );
	$review_count = sanitize_text_field( $attributes['reviewCount'] ?? '' );
	$country      = sanitize_text_field( $attributes['country']     ?? '' );
	$stars        = intval(              $attributes['stars']        ?? 5 );
	$date         = sanitize_text_field( $attributes['date']        ?? '' );
	$title        = sanitize_text_field( $attributes['title']       ?? '' );
	$text         = sanitize_textarea_field( $attributes['text']    ?? '' );
	$review_url   = esc_url(             $attributes['reviewUrl']   ?? '' );

	if ( ! $text && ! $title && ! $reviewer ) {
		return '';
	}

	$avatar    = $reviewer ? esc_html( mb_strtoupper( mb_substr( $reviewer, 0, 1 ) ) ) : '?';
	$link_open  = $review_url ? '<a href="' . $review_url . '" target="_blank" rel="noopener noreferrer" class="trb-review__title-link">' : '';
	$link_close = $review_url ? '</a>' : '';

	return sprintf(
		'<div class="trb-review">

			<div class="trb-review__stars" aria-label="%d out of 5 stars">%s</div>

			%s

			%s

			<div class="trb-review__meta">
				<div class="trb-review__author-block">
					<span class="trb-review__avatar" aria-hidden="true">%s</span>
					<div class="trb-review__author-info">
						<span class="trb-review__author">%s</span>
						%s
					</div>
				</div>
				<div class="trb-review__date-country">
					%s
					%s
				</div>
			</div>

			<div class="trb-review__footer">
				<span class="trb-review__verified">
					<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path fill="#00b67a" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
					Verified
				</span>
				<a class="trb-review__branding" href="https://www.trustpilot.com" target="_blank" rel="noopener noreferrer" aria-label="Read more reviews on Trustpilot">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path fill="#00b67a" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
					<span class="trb-review__branding-text">Trustpilot</span>
				</a>
			</div>

		</div>',
		$stars,
		trb_stars_html( $stars ),
		$title ? '<h3 class="trb-review__title">' . $link_open . esc_html( $title ) . $link_close . '</h3>' : '',
		$text  ? '<p class="trb-review__text">' . nl2br( esc_html( $text ) ) . '</p>' : '',
		$avatar,
		esc_html( $reviewer ),
		$review_count ? '<span class="trb-review__review-count">' . esc_html( $review_count ) . '</span>' : '',
		$country ? '<span class="trb-review__country">' . esc_html( $country ) . '</span>' : '',
		$date    ? '<span class="trb-review__date">Date of experience: ' . esc_html( $date ) . '</span>' : ''
	);
}

function trb_stars_html( $filled ) {
	// Exact paths extracted from Trustpilot's official brand SVG (96×96 viewBox per star)
	$star_path = 'M48,64.7 L62.6,61 L68.7,79.8 L48,64.7 Z M81.6,40.4 L55.9,40.4 L48,16.2 L40.1,40.4 L14.4,40.4 L35.2,55.4 L27.3,79.6 L48.1,64.6 L60.9,55.4 L81.6,40.4 Z';
	$out = '';
	for ( $i = 1; $i <= 5; $i++ ) {
		$bg   = $i <= $filled ? '#00B67A' : '#dcdce6';
		$out .= '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 96 96" aria-hidden="true">'
			. '<rect width="96" height="96" fill="' . $bg . '" fill-rule="nonzero"/>'
			. '<path fill="#FFFFFF" fill-rule="nonzero" d="' . $star_path . '"/>'
			. '</svg>';
	}
	return $out;
}
