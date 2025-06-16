use tauri::{self, Manager, WebviewUrl, WebviewWindowBuilder, AppHandle, EventTarget, Emitter, Position, PhysicalPosition, PhysicalSize};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Deserialize, Serialize, Clone)]
struct WindowPosition {
    x: i32,
    y: i32,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
struct WindowConfig {
    theme: Option<String>,
    #[serde(rename = "defaultTab")]
    default_tab: Option<String>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
struct WindowDefinition {
    id: String,
    title: String,
    description: String,
    emoji: String,
    category: String,
    width: u32,
    height: u32,
    position: WindowPosition,
    shortcut: Option<String>,
    component: String,
    config: Option<WindowConfig>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
struct WindowCategory {
    id: String,
    name: String,
    color: String,
    description: String,
}

#[derive(Debug, Deserialize, Serialize)]
struct WindowsConfig {
    windows: Vec<WindowDefinition>,
    categories: Vec<WindowCategory>,
}

fn load_windows_config() -> Result<WindowsConfig, Box<dyn std::error::Error>> {
    let config_str = include_str!("../windows.json");
    let config: WindowsConfig = serde_json::from_str(config_str)?;
    Ok(config)
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn get_available_windows() -> Result<WindowsConfig, String> {
    match load_windows_config() {
        Ok(config) => Ok(config),
        Err(e) => Err(format!("Failed to load windows config: {}", e)),
    }
}

#[tauri::command]
fn test_shortcut(app: AppHandle, shortcut_type: String) -> String {
    println!("🧪 Testing shortcut: {}", shortcut_type);
    
    // Map old shortcut types to new window IDs for backward compatibility
    let window_id = match shortcut_type.as_str() {
        "daily-note" => "daily-note",
        "current-task" => "current-task", 
        "flex" => "flex-workspace",
        _ => &shortcut_type,
    };
    
    open_or_focus(&app, window_id);
    format!("Window '{}' opened/focused", window_id)
}

#[tauri::command]
fn check_shortcuts_registered(app: AppHandle) -> String {
    #[cfg(desktop)]
    {
        use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut};
        
        let daily_note_shortcut = Shortcut::new(
            Some(Modifiers::META | Modifiers::ALT | Modifiers::SHIFT), 
            Code::KeyD
        );
        let current_task_shortcut = Shortcut::new(
            Some(Modifiers::META | Modifiers::ALT | Modifiers::SHIFT), 
            Code::KeyT
        );
        let flex_shortcut = Shortcut::new(
            Some(Modifiers::META | Modifiers::ALT | Modifiers::SHIFT), 
            Code::KeyS
        );

        let daily_registered = app.global_shortcut().is_registered(daily_note_shortcut);
        let task_registered = app.global_shortcut().is_registered(current_task_shortcut);
        let flex_registered = app.global_shortcut().is_registered(flex_shortcut);

        format!("Daily Note: {}, Current Task: {}, Flex: {}", daily_registered, task_registered, flex_registered)
    }
    #[cfg(not(desktop))]
    {
        "Not available on mobile".to_string()
    }
}

#[tauri::command]
fn create_window(app: AppHandle, window_id: String) -> String {
    println!("🆕 Creating window with ID: {}", window_id);
    open_or_focus(&app, &window_id);
    format!("Window '{}' created/focused", window_id)
}

#[tauri::command] 
fn close_window(app: AppHandle, window_label: String) -> String {
    println!("🗑️ Closing window: {}", window_label);
    
    if let Some(window) = app.get_webview_window(&window_label) {
        match window.close() {
            Ok(_) => {
                println!("✅ Successfully closed window '{}'", window_label);
                format!("Window '{}' closed", window_label)
            },
            Err(e) => {
                println!("❌ Failed to close window '{}': {:?}", window_label, e);
                format!("Failed to close window '{}': {:?}", window_label, e)
            }
        }
    } else {
        println!("❌ Window '{}' not found", window_label);
        format!("Window '{}' not found", window_label)
    }
}

#[tauri::command]
fn get_open_windows(app: AppHandle) -> Vec<String> {
    let windows: Vec<String> = app.webview_windows()
        .iter()
        .map(|(label, _)| label.clone())
        .collect();
    println!("📋 Open windows: {:?}", windows);
    windows
}

fn find_window_definition(window_id: &str) -> Option<WindowDefinition> {
    match load_windows_config() {
        Ok(config) => {
            config.windows.into_iter().find(|w| w.id == window_id)
        },
        Err(e) => {
            println!("❌ Failed to load windows config: {}", e);
            None
        }
    }
}

fn get_window_config_from_json(window_id: &str) -> (String, PhysicalSize<u32>, Option<PhysicalPosition<i32>>) {
    if let Some(window_def) = find_window_definition(window_id) {
        (
            window_def.title,
            PhysicalSize::new(window_def.width, window_def.height),
            Some(PhysicalPosition::new(window_def.position.x, window_def.position.y))
        )
    } else {
        // Fallback for unknown window types
        println!("⚠️ Window definition not found for '{}', using fallback", window_id);
        (
            format!("Window ({})", window_id),
            PhysicalSize::new(500, 500),
            Some(PhysicalPosition::new(250, 250))
        )
    }
}

fn open_or_focus(app: &AppHandle, window_id: &str) {
    println!("🔍 open_or_focus called for window ID: '{}'", window_id);
    
    if let Some(win) = app.get_webview_window(window_id) {
        println!("✅ Found existing window '{}', showing and focusing", window_id);
        match win.show() {
            Ok(_) => println!("✅ Successfully showed window '{}'", window_id),
            Err(e) => println!("❌ Failed to show window '{}': {:?}", window_id, e),
        }
        match win.set_focus() {
            Ok(_) => println!("✅ Successfully focused window '{}'", window_id),
            Err(e) => println!("❌ Failed to focus window '{}': {:?}", window_id, e),
        }
    } else {
        let (title, size, position) = get_window_config_from_json(window_id);
        println!("🆕 Creating new window '{}' with title '{}', size: {:?}", window_id, title, size);
        
        // Build the URL with window configuration
        let mut url = "index.html".to_string();
        if let Some(window_def) = find_window_definition(window_id) {
            if let Some(config) = window_def.config {
                let mut query_params = Vec::new();
                if let Some(theme) = config.theme {
                    query_params.push(format!("theme={}", theme));
                }
                if let Some(default_tab) = config.default_tab {
                    query_params.push(format!("defaultTab={}", default_tab));
                }
                if !query_params.is_empty() {
                    url = format!("{}?{}", url, query_params.join("&"));
                }
            }
        }
        
        let mut builder = WebviewWindowBuilder::new(app, window_id, WebviewUrl::App(url.into()))
            .title(&title)
            .inner_size(size.width as f64, size.height as f64)
            .resizable(true)
            .focused(true)
            .center();

        if let Some(pos) = position {
            builder = builder.position(pos.x as f64, pos.y as f64);
        }
        
        match builder.build() {
            Ok(window) => {
                println!("✅ Successfully created window '{}'", window_id);
                // Auto-focus the new window
                if let Err(e) = window.set_focus() {
                    println!("⚠️ Warning: Failed to focus new window '{}': {:?}", window_id, e);
                }
            },
            Err(e) => println!("❌ Failed to create window '{}': {:?}", window_id, e),
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            #[cfg(desktop)]
            {
                use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut};
                
                println!("🚀 Setting up global shortcuts...");
                
                // Define shortcuts once
                let daily_note_shortcut = Shortcut::new(
                    Some(Modifiers::META | Modifiers::ALT | Modifiers::SHIFT), 
                    Code::KeyD
                );
                let current_task_shortcut = Shortcut::new(
                    Some(Modifiers::META | Modifiers::ALT | Modifiers::SHIFT), 
                    Code::KeyT
                );
                let flex_shortcut = Shortcut::new(
                    Some(Modifiers::META | Modifiers::ALT | Modifiers::SHIFT), 
                    Code::KeyS
                );

                println!("📋 Shortcuts defined:");
                println!("  - Daily Note: {:?}", daily_note_shortcut);
                println!("  - Current Task: {:?}", current_task_shortcut);
                println!("  - Flex: {:?}", flex_shortcut);

                let handle = app.handle().clone();
                
                // Clone shortcuts for the handler since they need to be moved
                let daily_note_shortcut_handler = daily_note_shortcut.clone();
                let current_task_shortcut_handler = current_task_shortcut.clone();
                let flex_shortcut_handler = flex_shortcut.clone();
                
                println!("🔌 Installing global shortcut plugin...");
                match app.handle().plugin(
                    tauri_plugin_global_shortcut::Builder::new()
                        .with_handler(move |_app, shortcut, event| {
                            println!("🎯 SHORTCUT HANDLER TRIGGERED!");
                            println!("   Received shortcut: {:?}", shortcut);
                            println!("   Event: {:?}", event);
                            
                            if shortcut == &daily_note_shortcut_handler {
                                println!("🎯 MATCHED Daily Note shortcut!");
                                open_or_focus(&handle, "daily-note");
                            } else if shortcut == &current_task_shortcut_handler {
                                println!("🎯 MATCHED Current Task shortcut!");
                                open_or_focus(&handle, "current-task");
                            } else if shortcut == &flex_shortcut_handler {
                                println!("🎯 MATCHED Flex shortcut!");
                                open_or_focus(&handle, "flex-workspace");
                            } else {
                                println!("❌ NO MATCH for shortcut: {:?}", shortcut);
                                println!("   Expected daily note: {:?}", daily_note_shortcut_handler);
                                println!("   Expected current task: {:?}", current_task_shortcut_handler);
                                println!("   Expected flex: {:?}", flex_shortcut_handler);
                            }
                        })
                        .build(),
                ) {
                    Ok(_) => println!("✅ Global shortcut plugin installed successfully"),
                    Err(e) => {
                        println!("❌ Failed to install global shortcut plugin: {:?}", e);
                        return Ok(()); // Continue without global shortcuts
                    }
                }

                // Register the shortcuts
                println!("📝 Registering global shortcuts...");
                
                match app.global_shortcut().register(daily_note_shortcut) {
                    Ok(_) => println!("✅ Daily Note shortcut registered (Cmd+Alt+Shift+D)"),
                    Err(e) => println!("❌ Failed to register Daily Note shortcut: {:?}", e),
                }
                
                match app.global_shortcut().register(current_task_shortcut) {
                    Ok(_) => println!("✅ Current Task shortcut registered (Cmd+Alt+Shift+T)"),
                    Err(e) => println!("❌ Failed to register Current Task shortcut: {:?}", e),
                }
                
                match app.global_shortcut().register(flex_shortcut) {
                    Ok(_) => println!("✅ Flex shortcut registered (Cmd+Alt+Shift+S)"),
                    Err(e) => println!("❌ Failed to register Flex shortcut: {:?}", e),
                }
                
                println!("🎉 Global shortcuts setup complete!");
                println!("🔥 Try pressing:");
                println!("   - Cmd+Alt+Shift+D for Daily Note");
                println!("   - Cmd+Alt+Shift+T for Current Task");
                println!("   - Cmd+Alt+Shift+S for Flex Workspace");
            }
            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::Destroyed = event {
                let label = window.label().to_string();
                println!("🗑️  Window '{}' destroyed, emitting event", label);
                let _ = window.app_handle().emit_to(EventTarget::Any, "window-closed", label);
            }
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet, 
            test_shortcut, 
            check_shortcuts_registered,
            create_window,
            close_window,
            get_open_windows,
            get_available_windows
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
