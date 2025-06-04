use tauri::{self, Manager, WebviewUrl, WebviewWindowBuilder, AppHandle, EventTarget, Emitter};

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn test_shortcut(app: AppHandle, shortcut_type: String) -> String {
    println!("🧪 Testing shortcut: {}", shortcut_type);
    
    match shortcut_type.as_str() {
        "daily-note" => {
            open_or_focus(&app, "daily-note", "Daily Note");
            "Daily Note window opened/focused".to_string()
        },
        "current-task" => {
            open_or_focus(&app, "current-task", "Current Task");
            "Current Task window opened/focused".to_string()
        },
        "flex" => {
            open_or_focus(&app, "flex", "Flex Window");
            "Flex window opened/focused".to_string()
        },
        _ => "Invalid shortcut type".to_string()
    }
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

fn open_or_focus(app: &AppHandle, label: &str, title: &str) {
    println!("🔍 open_or_focus called for label: '{}', title: '{}'", label, title);
    
    if let Some(win) = app.get_webview_window(label) {
        println!("✅ Found existing window '{}', showing and focusing", label);
        match win.show() {
            Ok(_) => println!("✅ Successfully showed window '{}'", label),
            Err(e) => println!("❌ Failed to show window '{}': {:?}", label, e),
        }
        match win.set_focus() {
            Ok(_) => println!("✅ Successfully focused window '{}'", label),
            Err(e) => println!("❌ Failed to focus window '{}': {:?}", label, e),
        }
    } else {
        println!("🆕 Creating new window '{}' with title '{}'", label, title);
        match WebviewWindowBuilder::new(app, label, WebviewUrl::App("index.html".into()))
            .title(title)
            .build()
        {
            Ok(_) => println!("✅ Successfully created window '{}'", label),
            Err(e) => println!("❌ Failed to create window '{}': {:?}", label, e),
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
                                open_or_focus(&handle, "daily-note", "Daily Note");
                            } else if shortcut == &current_task_shortcut_handler {
                                println!("🎯 MATCHED Current Task shortcut!");
                                open_or_focus(&handle, "current-task", "Current Task");
                            } else if shortcut == &flex_shortcut_handler {
                                println!("🎯 MATCHED Flex shortcut!");
                                if handle.get_webview_window("flex").is_none() {
                                    println!("🆕 Creating new flex window");
                                    open_or_focus(&handle, "flex", "Flex Window");
                                } else if let Some(win) = handle.get_webview_window("flex") {
                                    println!("🔍 Focusing existing flex window");
                                    match win.set_focus() {
                                        Ok(_) => println!("✅ Flex window focused"),
                                        Err(e) => println!("❌ Failed to focus flex window: {:?}", e),
                                    }
                                }
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
                println!("   - Cmd+Alt+Shift+S for Flex");
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
        .invoke_handler(tauri::generate_handler![greet, test_shortcut, check_shortcuts_registered])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
