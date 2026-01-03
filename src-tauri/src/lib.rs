#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    use tauri_plugin_dialog::DialogExt;
    #[tauri::command]
    async fn show_confirmation_dialog(
        app_handle: tauri::AppHandle,
        title: String,
        message: String,
    ) -> Result<bool, String> {
        let dialog = app_handle.dialog();

        let response = dialog
            .message(&message)
            .title(&title)
            .buttons(tauri_plugin_dialog::MessageDialogButtons::OkCancel)
            .blocking_show();

        Ok(response)
    }

    #[tauri::command]
    async fn show_message_dialog(
        app_handle: tauri::AppHandle,
        title: String,
        message: String,
        dialog_type: String,
    ) -> Result<(), String> {
        let dialog = app_handle.dialog();

        match dialog_type.as_str() {
            "error" => dialog
                .message(&message)
                .title(&title)
                .kind(tauri_plugin_dialog::MessageDialogKind::Error)
                .blocking_show(),
            "warning" => dialog
                .message(&message)
                .title(&title)
                .kind(tauri_plugin_dialog::MessageDialogKind::Warning)
                .blocking_show(),
            "info" => dialog
                .message(&message)
                .title(&title)
                .kind(tauri_plugin_dialog::MessageDialogKind::Info)
                .blocking_show(),
            _ => dialog
                .message(&message)
                .title(&title)
                .kind(tauri_plugin_dialog::MessageDialogKind::Info)
                .blocking_show(),
        };

        Ok(())
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .invoke_handler(tauri::generate_handler![
            show_confirmation_dialog,
            show_message_dialog,
        ])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
