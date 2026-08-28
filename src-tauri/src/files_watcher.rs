#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{AppHandle, Emitter};
use notify::{ RecursiveMode, RecommendedWatcher};
use notify_debouncer_mini::{new_debouncer, Debouncer, DebouncedEvent};

use std::collections::HashSet;
use std::ffi::OsStr;
use std::path::{Path, PathBuf};
use std::fs::{create_dir_all, read_dir, read_to_string};


const APP_SETTINGS_FILE: &str = "app.settings.json";
const GROUPS_DIR: &str = "groups";
const GROUPS_SETTINGS_FILE: &str = "settings.json";

const COOLDOWN_MS: u64 = 250;

pub fn start_file_watcher(app_handle: AppHandle, base_path: PathBuf) -> Debouncer<RecommendedWatcher> {
	let base_path_clone = base_path.clone();

	let mut debouncer = new_debouncer(
		std::time::Duration::from_millis(COOLDOWN_MS),
		move |res: Result<Vec<DebouncedEvent>, _>| {
			let events = match res {
					Ok(events) => events,
					Err(e) => {
						println!("Ошибка files watcher: {}", e);
						return;
					}
			};

			let mut trigger_1 = false;
			let mut trigger_2 = false;
			let mut trigger_3 = false;

			let mut target_groups: HashSet<String> = HashSet::new();

			for event in events {
				let path = event.path;

				let rel_path = match path.strip_prefix(&base_path_clone) {
					Ok(p) => p,
					Err(_) => continue,
				};

				let is_dir = if path.exists() {
					path.is_dir()
				} else {
					path.extension().is_none()
				};

				let components: Vec<_> = rel_path.components().map(|c| c.as_os_str()).collect();

				// --- Сценарий 1 ---
				if rel_path == Path::new(APP_SETTINGS_FILE) {
					trigger_1 = true;
				}

				// --- Сценарии 2 и 3 ---
				if components.get(0) == Some(&OsStr::new(GROUPS_DIR)) {
					
					// создание или удаление groups/
					if components.len() == 1 && is_dir {
						trigger_2 = true;
					}

					// создание или удаление группы
					if components.len() == 2 && is_dir {
						trigger_2 = true;
					}

					// изменение настроек группы
					if components.len() == 3 && components.get(2) == Some(&OsStr::new("settings.json")) {
							trigger_2 = true;
					}

					// создание или удаление билетов
					if components.len() == 3
						&& !is_dir
						&& path.extension().map_or(false, |ext| ext == "md") {
						trigger_3 = true;

						if let Some(group_id) = components.get(1).and_then(|s| s.to_str()) {
							target_groups.insert(group_id.to_string());
						}
					}
				}
			}

			if trigger_1 {
				app_settings_handler(&app_handle, &base_path_clone);
			}
			
			if trigger_2 {
				groups_handler(&app_handle, &base_path_clone);
			}
			
			if trigger_3 {
				for group_id in target_groups {
					tickets_handler(&app_handle, &base_path_clone, &group_id);
				}
			}
	}).expect("Не удалось создать files watcher");

	debouncer
		.watcher()
		.watch(&base_path, RecursiveMode::Recursive)
		.expect("Не удалось запустить files watcher");

	debouncer
}

// --- Сценарии ---

fn app_settings_handler(app_handle: &AppHandle, base_path: &Path) {
	let settings_path = base_path.join(APP_SETTINGS_FILE);

	if !settings_path.exists() {
		let _ = app_handle.emit("watcher:no-app-settings", ());
	} else if let Ok(content) = read_to_string(&settings_path) {
		if let Ok(json) = serde_json::from_str::<serde_json::Value>(&content) {
			let _ = app_handle.emit("watcher:load-app-settings", json);
		}
	}
}

fn groups_handler(app_handle: &AppHandle, base_path: &Path) {
	let groups_dir = base_path.join(GROUPS_DIR);
	let mut groups_data: Vec<serde_json::Value> = Vec::new();

	if !groups_dir.exists() {
		let _ = create_dir_all(&groups_dir);
	} else if let Ok(entries) = read_dir(&groups_dir) {
		for entry in entries.flatten() {
			if entry.path().is_dir() {
				let settings_file = entry.path().join(GROUPS_SETTINGS_FILE);

				if settings_file.exists() {
					if let Ok(content) = read_to_string(&settings_file) {
						if let Ok(json) = serde_json::from_str::<serde_json::Value>(&content) {
							groups_data.push(json);
						}
					}
				}
			}
		}
	}

	let _ = app_handle.emit("watcher:load-groups", groups_data);
}

fn tickets_handler(app_handle: &AppHandle, base_path: &Path, group_id: &str) {
	let group_dir = base_path.join(GROUPS_DIR).join(group_id);
	let mut tickets_metadata: Vec<serde_json::Value> = Vec::new();

	if let Ok(files) = read_dir(&group_dir) {
		for file in files.flatten() {
			let path = file.path();

			if path.is_file() &&
				path.extension().map_or(false, |ext| ext == "md") {
					if let Ok(content) = read_to_string(&path) {
						if let Some(metadata) = get_md_metadata(&content) {
							if let Ok(json) = serde_json::from_str::<serde_json::Value>(&metadata) {
								tickets_metadata.push(json);
							}
						}
					}
			}
		}
	}

	let _ = app_handle.emit(
		"watcher:load-tickets",
		serde_json::json!({
			"groupId": group_id,
			"tickets": tickets_metadata
		}));
}

// --- Хэлперы ---

// Извлекает метаданные из .md
fn get_md_metadata(content: &str) -> Option<String> {
	let parts: Vec<&str> = content.split("---").collect();

	if parts.len() >= 2 {
		Some(parts[1].trim().to_string())
	} else {
		None
	}
}
