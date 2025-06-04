use tauri::{self, Manager, WebviewUrl, WebviewWindowBuilder, AppHandle, EventTarget, Emitter};

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
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
                    Some(Modifiers::CONTROL | Modifiers::ALT | Modifiers::SHIFT), 
                    Code::KeyD
                );
                let current_task_shortcut = Shortcut::new(
                    Some(Modifiers::CONTROL | Modifiers::ALT | Modifiers::SHIFT), 
                    Code::KeyT
                );
                let flex_shortcut = Shortcut::new(
                    Some(Modifiers::CONTROL | Modifiers::ALT | Modifiers::SHIFT), 
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
                    Ok(_) => println!("✅ Daily Note shortcut registered (Ctrl+Alt+Shift+D)"),
                    Err(e) => println!("❌ Failed to register Daily Note shortcut: {:?}", e),
                }
                
                match app.global_shortcut().register(current_task_shortcut) {
                    Ok(_) => println!("✅ Current Task shortcut registered (Ctrl+Alt+Shift+T)"),
                    Err(e) => println!("❌ Failed to register Current Task shortcut: {:?}", e),
                }
                
                match app.global_shortcut().register(flex_shortcut) {
                    Ok(_) => println!("✅ Flex shortcut registered (Ctrl+Alt+Shift+S)"),
                    Err(e) => println!("❌ Failed to register Flex shortcut: {:?}", e),
                }
                
                println!("🎉 Global shortcuts setup complete!");
                println!("🔥 Try pressing:");
                println!("   - Ctrl+Alt+Shift+D for Daily Note");
                println!("   - Ctrl+Alt+Shift+T for Current Task");
                println!("   - Ctrl+Alt+Shift+S for Flex");
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
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
