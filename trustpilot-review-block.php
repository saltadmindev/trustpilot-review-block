<?php
/**
 * Plugin Name: Trustpilot Review Block
 * Description: Display a single hand-picked Trustpilot review. Paste the review URL in the editor — the plugin fetches the content automatically.
 * Version: 3.0.0
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * License: GPL-2.0-or-later
 * Text Domain: trustpilot-review-block
 */

defined( 'ABSPATH' ) || exit;

// ──────────────────────────────────────────────
// REST endpoint — fetch review data from URL
// Editor-only: requires edit_posts capability
// ──────────────────────────────────────────────

add_action( 'rest_api_init', function () {
	register_rest_route( 'trb/v1', '/fetch-review', [
		'methods'             => 'GET',
		'callback'            => 'trb_rest_fetch_review',
		'permission_callback' => fn() => current_user_can( 'edit_posts' ),
		'args'                => [
			'url' => [
				'required'          => true,
				'sanitize_callback' => 'esc_url_raw',
				'validate_callback' => function ( $url ) {
					return filter_var( $url, FILTER_VALIDATE_URL )
						&& strpos( $url, 'trustpilot.com/reviews/' ) !== false;
				},
			],
		],
	] );
} );

function trb_rest_fetch_review( WP_REST_Request $request ): WP_REST_Response|WP_Error {
	$url = $request->get_param( 'url' );

	$response = wp_remote_get( $url, [
		'timeout'    => 15,
		'user-agent' => 'Mozilla/5.0 (compatible; WordPress/' . get_bloginfo( 'version' ) . '; +' . get_bloginfo( 'url' ) . ')',
		'headers'    => [ 'Accept-Language' => 'en-GB,en;q=0.9' ],
	] );

	if ( is_wp_error( $response ) ) {
		return new WP_Error( 'fetch_failed', 'Could not reach Trustpilot.', [ 'status' => 502 ] );
	}

	$code = wp_remote_retrieve_response_code( $response );
	if ( $code !== 200 ) {
		return new WP_Error( 'bad_response', "Trustpilot returned HTTP $code.", [ 'status' => 502 ] );
	}

	$html = wp_remote_retrieve_body( $response );
	$data = trb_parse_review_html( $html, $url );

	if ( ! $data ) {
		return new WP_Error( 'parse_failed', 'Could not read the review from that page. Make sure the URL is a single review page (trustpilot.com/reviews/…).', [ 'status' => 422 ] );
	}

	return rest_ensure_response( $data );
}

/**
 * Pull review data out of the page HTML.
 * Trustpilot embeds JSON-LD structured data on review pages.
 */
function trb_parse_review_html( string $html, string $url ): ?array {
	// Find all JSON-LD blocks
	preg_match_all( '/<script[^>]+type=["\']application\/ld\+json["\'][^>]*>(.*?)<\/script>/si', $html, $matches );

	foreach ( $matches[1] as $raw ) {
		$json = json_decode( trim( $raw ), true );
		if ( ! $json ) {
			continue;
		}

		// Handle @graph arrays
		$nodes = isset( $json['@graph'] ) ? $json['@graph'] : [ $json ];

		foreach ( $nodes as $node ) {
			$type = $node['@type'] ?? '';

			if ( $type === 'Review' || $type === 'UserReview' ) {
				$rating = $node['reviewRating']['ratingValue']
					?? $node['reviewRating']['ratingValue']
					?? null;

				return [
					'stars'     => $rating ? intval( $rating ) : 5,
					'title'     => $node['name'] ?? $node['headline'] ?? '',
					'text'      => $node['reviewBody'] ?? $node['description'] ?? '',
					'reviewer'  => $node['author']['name'] ?? $node['author'] ?? '',
					'date'      => isset( $node['datePublished'] )
						? date_i18n( get_option( 'date_format' ), strtotime( $node['datePublished'] ) )
						: '',
					'reviewUrl' => $url,
				];
			}
		}
	}

	return null;
}

// ──────────────────────────────────────────────
// Block registration
// ──────────────────────────────────────────────

add_action( 'init', function () {
	if ( ! function_exists( 'register_block_type' ) ) {
		return;
	}

	$asset_file = file_exists( plugin_dir_path( __FILE__ ) . 'build/index.asset.php' )
		? include plugin_dir_path( __FILE__ ) . 'build/index.asset.php'
		: [ 'dependencies' => [], 'version' => '3.0.0' ];

	wp_register_script(
		'trb-editor',
		plugins_url( 'build/index.js', __FILE__ ),
		$asset_file['dependencies'],
		$asset_file['version']
	);

	wp_register_style(
		'trb-style',
		plugins_url( 'style.css', __FILE__ ),
		[],
		'3.0.0'
	);

	register_block_type( __DIR__ . '/block.json', [
		'editor_script'   => 'trb-editor',
		'style'           => 'trb-style',
		'render_callback' => 'trb_render_block',
	] );
} );

// ──────────────────────────────────────────────
// Frontend render
// ──────────────────────────────────────────────

function trb_render_block( array $attributes ): string {
	$text      = sanitize_textarea_field( $attributes['text'] ?? '' );
	$title     = sanitize_text_field( $attributes['title'] ?? '' );
	$reviewer  = sanitize_text_field( $attributes['reviewer'] ?? '' );
	$date      = sanitize_text_field( $attributes['date'] ?? '' );
	$stars     = intval( $attributes['stars'] ?? 5 );
	$review_url = esc_url( $attributes['reviewUrl'] ?? '' );

	if ( ! $text && ! $title ) {
		return '';
	}

	$profile_url = $review_url ?: 'https://www.trustpilot.com';

	return sprintf(
		'<div class="trb-review">
			<div class="trb-review__header">
				<div class="trb-review__stars" aria-label="%1$s">%2$s</div>
				%3$s
			</div>
			%4$s
			%5$s
			<div class="trb-review__footer">
				<span class="trb-review__author">%6$s</span>
				<a class="trb-review__branding" href="%7$s" target="_blank" rel="noopener noreferrer">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path fill="#00b67a" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
					<span>Trustpilot</span>
				</a>
			</div>
		</div>',
		esc_attr( $stars . ' out of 5 stars' ),
		trb_stars_html( $stars ),
		$date ? '<span class="trb-review__date">' . esc_html( $date ) . '</span>' : '',
		$title ? '<h3 class="trb-review__title">' . esc_html( $title ) . '</h3>' : '',
		$text  ? '<p class="trb-review__text">' . nl2br( esc_html( $text ) ) . '</p>' : '',
		esc_html( $reviewer ),
		esc_url( $profile_url )
	);
}

function trb_stars_html( int $filled ): string {
	$out = '';
	for ( $i = 1; $i <= 5; $i++ ) {
		$color = $i <= $filled ? '#00b67a' : '#dcdce6';
		$out  .= '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">'
			. '<path fill="' . $color . '" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>'
			. '</svg>';
	}
	return $out;
}
