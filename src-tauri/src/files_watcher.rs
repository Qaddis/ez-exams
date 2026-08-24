#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{AppHandle, Emitter};
use notify::{Event, EventKind, RecursiveMode, RecommendedWatcher, Watcher};

use std::collections::HashSet;
use std::ffi::OsStr;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicU64, Ordering};
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use std::fs::{create_dir_all, read_dir, read_to_string};


const APP_SETTINGS_FILE: &str = "app.settings.json";
const GROUPS_DIR: &str = "groups";
const GROUPS_SETTINGS_FILE: &str = "settings.json";

const COOLDOWN_MS: u64 = 500;

static LAST_TRIGGER_1: AtomicU64 = AtomicU64::new(0);
static LAST_TRIGGER_2: AtomicU64 = AtomicU64::new(0);
static LAST_TRIGGER_3: AtomicU64 = AtomicU64::new(0);

pub fn start_file_watcher(app_handle: AppHandle, base_path: PathBuf) -> RecommendedWatcher {
	let base_path_clone = base_path.clone();

	let mut watcher = notify::recommended_watcher(move |res: Result<Event, _>| match res {
		Ok(event) => {
			let mut trigger_1 = false;
			let mut trigger_2 = false;
			let mut trigger_3 = false;

			let mut target_groups: HashSet<String> = HashSet::new();

			let is_create_or_remove = matches!(
				event.kind,
				EventKind::Create(_) | EventKind::Remove(_)
			);
			let is_modify = matches!(
				event.kind,
				EventKind::Modify(_)
			);

			for path in event.paths {
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
					if components.len() == 1 && is_dir && is_create_or_remove {
						trigger_2 = true;
					}

					// создание или удаление группы
					if components.len() == 2 && is_dir && is_create_or_remove {
						trigger_2 = true;
					}

					// изменение настроек группы
					if components.len() == 3 && components.get(2) == Some(&OsStr::new("settings.json")) && (is_create_or_remove || is_modify) {
							trigger_2 = true;
					}

					// WARN: возможно понадобиться проверка на редактирование билетов
					// создание или удаление билетов
					if components.len() == 3
						&& !is_dir && path.extension().map_or(false, |ext| ext == "md")
							&& (is_create_or_remove || is_modify) {
						trigger_3 = true;

						if let Some(group_id) = components.get(1).and_then(|s| s.to_str()) {
							target_groups.insert(group_id.to_string());
						}
					}
				}
			}

			let now = SystemTime::now()
				.duration_since(UNIX_EPOCH)
				.unwrap()
				.as_millis() as u64;

			if trigger_1 && check_cooldown(&LAST_TRIGGER_1, now) {
				app_settings_handler(&app_handle, &base_path_clone);
			}
			
			if trigger_2 && check_cooldown(&LAST_TRIGGER_2, now) {
				groups_handler(&app_handle, &base_path_clone);
			}
			
			if trigger_3 && check_cooldown(&LAST_TRIGGER_3, now) {
				for group_id in target_groups {
					tickets_handler(&app_handle, &base_path_clone, &group_id);
				}
			}
		}
		Err(e) => println!("Ошибка files watcher: {}", e),
	}).expect("Не удалось создать files watcher");

	watcher
		.watch(&base_path, RecursiveMode::Recursive)
		.expect("Не удалось запустить files watcher");

	watcher
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
	// FIXME: лучше переписать весь files_watcher через debouncer
	std::thread::sleep(Duration::from_millis(150));

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

// Проверка и обновления кулдауна
fn check_cooldown(last_trigger: &AtomicU64, now: u64) -> bool {
	let last = last_trigger.load(Ordering::Relaxed);

	if now.saturating_sub(last) > COOLDOWN_MS {
		last_trigger.store(now, Ordering::Relaxed);

		true
	} else {
		false
	}
}

// Извлекает метаданные из .md
fn get_md_metadata(content: &str) -> Option<String> {
	let parts: Vec<&str> = content.split("---").collect();

	if parts.len() >= 2 {
		Some(parts[1].trim().to_string())
	} else {
		None
	}
}
