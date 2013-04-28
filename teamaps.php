<?php

/*
Plugin Name: TEA Map Locations
Plugin URI: http://www.newenglandgivecamp.org
Description: Creates a Map Location custom post type, a Map Category custom taxonomy, and admin tweaks to support same.
Version: 0.1
Author: Nate Bates, Will Klien, Bryan Phillips, Doug Vanderweide
Author URI: http://www.newenglandgivecamp.org
License: None
*/

	function register_tea_location_post_type() {
		register_post_type(
			'tea_map_location',
			array(
				'labels' => array(
					'name' => 'Map Locations',
					'singular_name' => 'Map Location',
					'menu_name' => 'Map Locations',
					'add_new' => 'Add New Map Location',
					'edit_item' => 'Edit Map Location',
					'new_item' => 'New Map Location',
					'view_item' => 'View Map Location',
					'search_items' => 'Search Map Locations',
					'not_found' => 'No Map Locations found.',
					'not_found-in_trash' => 'No Map Locations found in Trash'
				),
				'description' => 'This post type allows you to add, edit or remove locations from the interactive map.',
				'public' => true,
				'publicly_queryable' => false,
				'show_ui' => true,
				'show_in_nav_menus' => false,
				'show_in_menu' => true,
				'show_in_admin_bar' => false,
				'menu_position' => 5,
				'capability_type' => 'post',
				'supports' => array(
					'title', 
					'editor', 
					'author', 
					'thumbnail', 
					'excerpt', 
					'custom_fields', 
					'comments', 
					'revisions', 
					'post-formats'
				),
				'has_archive' => true,
				'can_export' => true,
				'menu_icon' => plugin_dir_url(__FILE__) .'img/icon.png', // 16px16
			)
		);
	}
	
	function register_tea_location_taxonomy() {
		register_taxonomy(
			'tea_map_location_taxonomy', 
			'tea_map_location', 
			array(
				'labels' => array(
					'name' => 'Map Categories',
					'singular_name' => 'Map Category',
					'all_items' => 'All Map Categories',
					'edit_item' => 'Edit Map Category',
					'view_item' => 'View Map Category',
					'update_item' => 'Update Map Category',
					'add_new_item' => 'Add New Map Category',
					'new_item_name' => 'New Map Category',
					'search_items' => 'Search Map Categories',
					'popular_items' => 'Popular Map Categories',
					'separate_items_with_commas' => 'Separate Map Categories with commas',
					'add_or_remove_items' => 'Add or remove Map Catergories',
					'choose_from_most_used' => 'Choose from most used Map Categories',
					'not_found' => 'No Map Categories found'
				),
				'show_ui' => true,
				'show_admin_column' => true,
				'show_in_nav_menus' => false,
				'show_tagcloud' => false,
				'capabilities' => array(
					'manage_terms',
					'edit_terms',
					'delete_terms',
					'assign_terms'
				)
			)
		);
	}
	
	function add_tea_map_helper($hook) {
		global $post;
		
		$lat = get_post_meta($post->ID, 'tea-map-location-lat', true);
		$lng = get_post_meta($post->ID, 'tea-map-location-lng', true);

		if ($hook == 'post-new.php' || $hook == 'post.php') {
			if ('tea_map_location' === $post->post_type) {     
				wp_enqueue_script('tea_map_helper_library', 'https://maps.googleapis.com/maps/api/js?key=AIzaSyC0F9ge9P1HeIksvv2ME8zluFkZU7Iqs0c&sensor=false');
				wp_enqueue_script('tea_map_helper', plugin_dir_url(__FILE__) . 'js/tea-map-helper.js', 'tea_map_helper_library');
				wp_localize_script('tea_map_helper', 'teastart', array('lat' => $lat, 'lng' => $lng));
			}
		}
	}
	
	function draw_tea_map_helper_metabox($post) {
		$lat = get_post_meta($post->ID, 'tea-map-location-lat', true);
		$lng = get_post_meta($post->ID, 'tea-map-location-lng', true);
		echo '<div id="tea-map-helper" style="width: 100%; height:450px;"></div>';
		echo '<br />';
		echo '<label>Latitude: <input type="text" readonly name="tea-map-location-lat" id="tea-map-location-lat" size="20" value="'. $lat . '" /></label>&nbsp;<label>Longitude: <input type="text" readonly name="tea-map-location-lng" id="tea-map-location-lng" size="20" value="' .$lng . '" /></label>';
	}
	
	function add_tea_map_helper_metabox() {
		add_meta_box('tea-map-helper-metabox', 
			'Location Point', 
			'draw_tea_map_helper_metabox', 
			'tea_map_location', 
			'advanced', 
			'high'
		);
	}

	function draw_tea_map_hyperlink_metabox($post) {
		$htext = get_post_meta($post->ID, 'tea-map-hyperlink-text', true);
		$hurl = get_post_meta($post->ID, 'tea-map-hyperlink-url', true);
		echo '<label>Link text: <input type="text" name="tea-map-hyperlink-text" id="tea-map-hyperlink-text" size="40" value="'. $htext. '" /></label><br /><label>URL: <input type="text" name="tea-map-hyperlink-url" id="tea-map-hyperlink-url" size="40" value="' .$hurl . '" /></label>';
	}
	
	function add_tea_map_hyperlink_metabox() {
		add_meta_box('tea-map-link-metabox', 
			'Link', 
			'draw_tea_map_hyperlink_metabox', 
			'tea_map_location', 
			'side'
		);
	}
	
	function save_geocodes() {
		global $post;
		update_post_meta($post->ID, 'tea-map-location-lat', $_POST['tea-map-location-lat']);
		update_post_meta($post->ID, 'tea-map-location-lng', $_POST['tea-map-location-lng']);
	}
	
	function save_map_url() {
		global $post;
		update_post_meta($post->ID, 'tea-map-hyperlink-text', $_POST['tea-map-hyperlink-text']);
		update_post_meta($post->ID, 'tea-map-hyperlink-url', $_POST['tea-map-hyperlink-url']);
	}
	
	function tea_map_export_tax_2_json() {
		$out = "\t" . '"categories": [' . "\n";
		if($terms = get_terms('tea_map_location_taxonomy')) {
			if(count($terms) > 0) {
				$count = count($terms);
				$x = 0;
				foreach($terms as $term) {
					$out .= "\t\t{\n";
					$out .= "\t\t\t" . '"id" : "' . $term->term_id . '",' . "\n";
					$out .= "\t\t\t" . '"title" : "' . str_replace('"', '\"', $term->name) . '",' . "\n";
					$out .= "\t\t\t" . '"icon" : "' . plugin_dir_url(__FILE__) . 'img/' . $term->term_id . '.png"' . "\n";
					$out .= "\t\t}";
					$x++;
					if($x != $count) {
						$out .= ", \n";
					}
				}
			}
		}
		$out .= "\t],\n";
		
		$fp = fopen(plugin_dir_path(__FILE__) . 'json/categories.json', 'w');
		fwrite($fp, $out);
		fclose($fp);
	}
	
	function tea_map_export_places_2_json() {
		$out = "\t" . '"places" : [' . "\n";
		if($myposts = get_posts(array(
			'post_type' => 'tea_map_location',
			'orderby' => 'ID',
			'posts_per_page' => -1
		))) {
			if($myposts) {
				$count = count($myposts);
				$x = 0;
				foreach($myposts as $post) {
					$out .= "\t\t{\n";
					$out .= "\t\t\t" . '"id" : "' . $post->ID . '",' . "\n";
					$d = str_replace('"', '\"', $post->post_title) ;
					$d = str_replace("\n", '', $d);
					$out .= "\t\t\t" . '"name" : "' . $d . '",' . "\n";
					$d = str_replace('"', '\"', $post->post_excerpt);
					$d = str_replace("\n", '', $d);
					$out .= "\t\t\t" . '"excerpt" : "' . $d . '",' . "\n";
					$out .= "\t\t\t" . '"categories" : [ ';
					$cats = get_the_terms($post->ID, 'tea_map_location_taxonomy');
					if($cats) {
						$t = 0;
						$ccats = count($cats);
						foreach($cats as $cat) {
							$out .= '"' . $cat->term_id . '"';
							$t++;
							if($t != $ccats) {
								$out .= ', ';
							}
						}
					}
					$out .= " ],\n";
					$out .= "\t\t\t" . '"lat" : "' . get_post_meta($post->ID, 'tea-map-location-lat', true) . '", ' . "\n";
					$out .= "\t\t\t" . '"lng" : "' . get_post_meta($post->ID, 'tea-map-location-lng', true) . '" , ' . "\n";
					$d = str_replace('"', '\"', get_post_meta($post->ID, 'tea-map-hyperlink-text', true));
					$d = str_replace("\n", '', $d);
					$out .= "\t\t\t" . '"linkText" : "' . $d . '", ' . "\n";
					$d = str_replace('"', '\"', get_post_meta($post->ID, 'tea-map-hyperlink-url', true));
					$d = str_replace("\n", '', $d);
					$out .= "\t\t\t" . '"linkUrl" : "' . $d . '", ' . "\n";
					$d = str_replace('"', '\"', get_the_post_thumbnail($post->ID, 'medium'));
					$d = str_replace("\n", '', $d);
					$out .= "\t\t\t" . '"imageUrl" : "' . $d . '"' . "\n";
					$out .= "\t\t}";
					$x++;
					if($x != $count) {
						$out .= ", ";
					}
					$out .= "\n";
				}
			}
		}
		$out .= "\t]\n";
		
		$fp = fopen(plugin_dir_path(__FILE__) . 'json/places.json', 'w');
		fwrite($fp, $out);
		fclose($fp);
	}
	
	function tea_make_json_file() {
		$out = "{\n";
		$cats = plugin_dir_path(__FILE__) . 'json/categories.json';
		$places = plugin_dir_path(__FILE__) . 'json/places.json';
		$out .= file_get_contents($cats);
		$out .= file_get_contents($places);
		$out .= "}";
		
		$fp = fopen(plugin_dir_path(__FILE__) . 'json/map.json', 'w');
		fwrite($fp, $out);
		fclose($fp);
	}
	
	function rewrite_json_on_category_change() {
		tea_map_export_tax_2_json();
		tea_make_json_file();
	}
	
	function rewrite_json_on_places_change() {
		tea_map_export_places_2_json();
		tea_make_json_file();
	}
	
	function enqueue_map_javascript() {
		if(is_page('3897')) {
			wp_enqueue_script('tea_map_leaf_trunk', 'http://cdn.leafletjs.com/leaflet-0.5/leaflet.js');
			wp_enqueue_script('tea_map_leaf_providers', plugin_dir_url(__FILE__) . 'js/leaflet-providers.js', array('jquery', 'tea_map_leaf_trunk'));
			wp_enqueue_script('tea_map_leaf_handlebars', plugin_dir_url(__FILE__) . 'js/handlebars.js', array('jquery', 'tea_map_leaf_trunk', 'tea_map_leaf_providers'));
			wp_enqueue_script('tea_map_leaf_map', plugin_dir_url(__FILE__) . 'js/map.js', array('jquery', 'tea_map_leaf_trunk', 'tea_map_leaf_providers', 'tea_map_leaf_handlebars'));
		}
	}
	
	function enqueue_map_css() {
		if(is_page('3897')) {
			wp_enqueue_style('tea_map_css', 'http://cdn.leafletjs.com/leaflet-0.5/leaflet.css');
			wp_enqueue_style('tea_map_css_ie7', 'http://cdn.leafletjs.com/leaflet-0.5/leaflet.ie.css', 'tea_map_css');
			global $wp_styles;
			$wp_styles->add_data('tea_map_css_ie7', 'conditional', 'lte IE 8');
		}
	}
	
	add_action('wp_enqueue_scripts', 'enqueue_map_javascript');
	add_action('wp_enqueue_scripts', 'enqueue_map_css');
	
	add_action('init', 'register_tea_location_post_type');
	add_action('init', 'register_tea_location_taxonomy');
	
	add_action('admin_enqueue_scripts', 'add_tea_map_helper');
	add_action('add_meta_boxes', 'add_tea_map_helper_metabox');
	add_action('add_meta_boxes', 'add_tea_map_hyperlink_metabox');
	
	add_action('save_post', 'save_geocodes');
	add_action('save_post', 'save_map_url');
	
	add_action('save_post', 'rewrite_json_on_places_change');
	add_action('deleted_post', 'rewrite_json_on_places_change');
	add_action('edited_tea_map_location_taxonomy', 'rewrite_json_on_category_change');
	add_action('create_tea_map_location_taxonomy', 'rewrite_json_on_category_change');
	add_action('delete_tea_map_location_taxonomy', 'rewrite_json_on_category_change');
?>