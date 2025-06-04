use tauri::{self, Manager, WebviewUrl, WebviewWindowBuilder, AppHandle};

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn open_or_focus(app: &AppHandle, label: &str, title: &str) {
    if let Some(win) = app.get_webview_window(label) {
        let _ = win.show();
        let _ = win.set_focus();
    } else {
        WebviewWindowBuilder::new(app, label, WebviewUrl::App("index.html".into()))
            .title(title)
            .build()
            .expect("failed to create window");
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let handle = app.handle();
            app.global_shortcut().register("CmdOrCtrl+Alt+Shift+D", move || {
                open_or_focus(&handle, "daily-note", "Daily Note");
            })?;

            let handle = app.handle();
            app.global_shortcut().register("CmdOrCtrl+Alt+Shift+T", move || {
                open_or_focus(&handle, "current-task", "Current Task");
            })?;

            let handle = app.handle();
            app.global_shortcut().register("CmdOrCtrl+Alt+Shift+S", move || {
                if handle.get_webview_window("flex").is_none() {
                    open_or_focus(&handle, "flex", "Flex Window");
                } else if let Some(win) = handle.get_webview_window("flex") {
                    let _ = win.set_focus();
                }
            })?;
            Ok(())
        })
        .on_window_event(|event| {
            if let tauri::WindowEvent::Destroyed = event.event() {
                let label = event.window().label().to_string();
                let _ = event.window().app_handle().emit_all("window-closed", label);
            }
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
