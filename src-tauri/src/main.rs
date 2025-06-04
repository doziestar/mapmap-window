// Prevents additional console window on Windows in release, DO NOT REMOVE!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{self, AppHandle, Manager, WebviewUrl, WebviewWindowBuilder};

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

/// Create the window if it doesn't exist or focus the existing one.
fn open_or_focus(app: &AppHandle, label: &str, title: &str) -> tauri::Result<()> {
    if let Some(win) = app.get_webview_window(label) {
        win.show()?;
        win.set_focus()?;
    } else {
        WebviewWindowBuilder::new(app, label, WebviewUrl::App("index.html".into()))
            .title(title)
            .build()?;
    }
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let handle = app.handle();
            app.global_shortcut()
                .register("CmdOrCtrl+Alt+Shift+D", move || {
                    let _ = open_or_focus(&handle, "daily-note", "Daily Note");
                })?;

            let handle = app.handle();
            app.global_shortcut()
                .register("CmdOrCtrl+Alt+Shift+T", move || {
                    let _ = open_or_focus(&handle, "current-task", "Current Task");
                })?;

            let handle = app.handle();
            app.global_shortcut()
                .register("CmdOrCtrl+Alt+Shift+S", move || {
                    if handle.get_webview_window("flex").is_none() {
                        let _ = open_or_focus(&handle, "flex", "Flex Window");
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
