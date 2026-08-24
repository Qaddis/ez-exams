// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

use std::fs::create_dir_all;
use tauri::Manager;

mod files_watcher;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
	tauri::Builder::default()
		.setup(|app| {
			let app_handle = app.app_handle().clone();

			let app_data_dir = app
				.path()
				.app_data_dir()
				.expect("Не удалось определить путь до рабочей директории");

			if !app_data_dir.exists() {
				create_dir_all(&app_data_dir).unwrap();
			}

			println!("Запуск отслеживания рабочей папки {:?}", app_data_dir);

			let watcher = files_watcher::start_file_watcher(app_handle, app_data_dir);

			tauri::async_runtime::spawn(async move {
				let _keep_alive = watcher;
				std::future::pending::<()>().await;
			});

			Ok(())
		})
		.plugin(tauri_plugin_fs::init())
		.plugin(tauri_plugin_opener::init())
		.run(tauri::generate_context!())
		.expect("error while running tauri application");
}
