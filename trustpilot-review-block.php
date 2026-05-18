<?php
/**
 * Plugin Name: Trustpilot Review Block
 * Description: Embed a single hand-picked Trustpilot review using the official TrustBox widget.
 * Version: 1.0.0
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * License: GPL-2.0-or-later
 * Text Domain: trustpilot-review-block
 */

defined( 'ABSPATH' ) || exit;

// ──────────────────────────────────────────────
// Settings page
// ──────────────────────────────────────────────

add_action( 'admin_menu', function () {
	add_options_page(
		'Trustpilot Review Block',
		'Trustpilot Block',
		'manage_options',
		'trustpilot-review-block',
		'trb_settings_page'
	);
} );

add_action( 'admin_init', function () {
	register_setting( 'trb_settings', 'trb_business_unit_id',   [ 'sanitize_callback' => 'sanitize_text_field' ] );
	register_setting( 'trb_settings', 'trb_widget_token',        [ 'sanitize_callback' => 'sanitize_text_field' ] );
	register_setting( 'trb_settings', 'trb_business_domain',     [ 'sanitize_callback' => 'sanitize_text_field' ] );
	register_setting( 'trb_settings', 'trb_locale',              [ 'sanitize_callback' => 'sanitize_text_field', 'default' => 'en-GB' ] );
	register_setting( 'trb_settings', 'trb_template_id',         [ 'sanitize_callback' => 'sanitize_text_field', 'default' => '54d0e1d8764ea9078c79e6ee' ] );
	register_setting( 'trb_settings', 'trb_style_height',        [ 'sanitize_callback' => 'sanitize_text_field', 'default' => '300px' ] );
} );

function trb_settings_page() {
	?>
	<div class="wrap">
		<h1>Trustpilot Review Block — Settings</h1>
		<p>These defaults apply to every Trustpilot Review block on the site. Individual blocks can override them.</p>
		<form method="post" action="options.php">
			<?php settings_fields( 'trb_settings' ); ?>
			<table class="form-table">
				<tr>
					<th><label for="trb_business_unit_id">Business Unit ID</label></th>
					<td>
						<input type="text" id="trb_business_unit_id" name="trb_business_unit_id"
							value="<?php echo esc_attr( get_option( 'trb_business_unit_id' ) ); ?>" class="regular-text" />
						<p class="description">Found in your Trustpilot Business account → Integrations → TrustBox.</p>
					</td>
				</tr>
				<tr>
					<th><label for="trb_widget_token">Widget Token</label></th>
					<td>
						<input type="text" id="trb_widget_token" name="trb_widget_token"
							value="<?php echo esc_attr( get_option( 'trb_widget_token' ) ); ?>" class="regular-text" />
					</td>
				</tr>
				<tr>
					<th><label for="trb_business_domain">Business Domain</label></th>
					<td>
						<input type="text" id="trb_business_domain" name="trb_business_domain"
							value="<?php echo esc_attr( get_option( 'trb_business_domain' ) ); ?>" class="regular-text"
							placeholder="mitchellanddickinson.co.uk" />
						<p class="description">Used for the Trustpilot profile link (e.g. mitchellanddickinson.co.uk).</p>
					</td>
				</tr>
				<tr>
					<th><label for="trb_locale">Locale</label></th>
					<td>
						<input type="text" id="trb_locale" name="trb_locale"
							value="<?php echo esc_attr( get_option( 'trb_locale', 'en-GB' ) ); ?>" class="small-text" />
					</td>
				</tr>
				<tr>
					<th><label for="trb_template_id">Template ID</label></th>
					<td>
						<input type="text" id="trb_template_id" name="trb_template_id"
							value="<?php echo esc_attr( get_option( 'trb_template_id', '54d0e1d8764ea9078c79e6ee' ) ); ?>" class="regular-text" />
						<p class="description">Default: <code>54d0e1d8764ea9078c79e6ee</code> (Quote widget).</p>
					</td>
				</tr>
				<tr>
					<th><label for="trb_style_height">Widget Height</label></th>
					<td>
						<input type="text" id="trb_style_height" name="trb_style_height"
							value="<?php echo esc_attr( get_option( 'trb_style_height', '300px' ) ); ?>" class="small-text" />
					</td>
				</tr>
			</table>
			<?php submit_button(); ?>
		</form>
	</div>
	<?php
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
		: [ 'dependencies' => [], 'version' => '1.0.0' ];

	wp_register_script(
		'trb-editor',
		plugins_url( 'build/index.js', __FILE__ ),
		$asset_file['dependencies'],
		$asset_file['version']
	);

	// Inline the config before the script runs — more reliable than wp_localize_script
	// when block.json also auto-registers the editor script with its own handle.
	wp_add_inline_script(
		'trb-editor',
		'window.trbConfig = ' . wp_json_encode( [
			'businessUnitId' => get_option( 'trb_business_unit_id', '' ),
			'widgetToken'    => get_option( 'trb_widget_token', '' ),
			'businessDomain' => get_option( 'trb_business_domain', '' ),
			'locale'         => get_option( 'trb_locale', 'en-GB' ),
			'templateId'     => get_option( 'trb_template_id', '54d0e1d8764ea9078c79e6ee' ),
			'styleHeight'    => get_option( 'trb_style_height', '300px' ),
			'settingsUrl'    => admin_url( 'options-general.php?page=trustpilot-review-block' ),
		] ) . ';',
		'before'
	);

	register_block_type( __DIR__ . '/block.json', [
		'editor_script'   => 'trb-editor',
		'render_callback' => 'trb_render_block',
	] );
} );

// ──────────────────────────────────────────────
// Server-side render (dynamic block)
// Ensures Trustpilot script is enqueued only when needed
// ──────────────────────────────────────────────

function trb_render_block( $attributes ) {
	$review_id      = sanitize_text_field( $attributes['reviewId'] ?? '' );
	$business_unit  = sanitize_text_field( $attributes['businessUnitId'] ?? get_option( 'trb_business_unit_id', '' ) );
	$token          = sanitize_text_field( $attributes['widgetToken'] ?? get_option( 'trb_widget_token', '' ) );
	$domain         = sanitize_text_field( $attributes['businessDomain'] ?? get_option( 'trb_business_domain', '' ) );
	$locale         = sanitize_text_field( $attributes['locale'] ?? get_option( 'trb_locale', 'en-GB' ) );
	$template_id    = sanitize_text_field( $attributes['templateId'] ?? get_option( 'trb_template_id', '54d0e1d8764ea9078c79e6ee' ) );
	$height         = sanitize_text_field( $attributes['styleHeight'] ?? get_option( 'trb_style_height', '300px' ) );

	if ( ! $review_id || ! $business_unit || ! $token ) {
		return '';
	}

	// Enqueue the Trustpilot bootstrap script
	wp_enqueue_script(
		'trustpilot-bootstrap',
		'//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js',
		[],
		null,
		true
	);

	$profile_href = $domain
		? 'https://www.trustpilot.com/review/' . esc_attr( $domain )
		: 'https://www.trustpilot.com';

	return sprintf(
		'<div class="trustpilot-widget"
			data-locale="%1$s"
			data-template-id="%2$s"
			data-businessunit-id="%3$s"
			data-style-height="%4$s"
			data-style-width="100%%"
			data-token="%5$s"
			data-review-id="%6$s"
			data-review-languages="en">
			<a href="%7$s" target="_blank" rel="noopener">Trustpilot</a>
		</div>',
		esc_attr( $locale ),
		esc_attr( $template_id ),
		esc_attr( $business_unit ),
		esc_attr( $height ),
		esc_attr( $token ),
		esc_attr( $review_id ),
		esc_url( $profile_href )
	);
}
