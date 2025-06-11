use eframe::egui;
use log::info;

mod app;
mod game;
mod ui;

use app::ValorantManagerApp;

fn main() -> Result<(), eframe::Error> {
    // Initialize logging
    env_logger::init();
    info!("Starting Valorant Manager");

    let options = eframe::NativeOptions {
        viewport: egui::ViewportBuilder::default()
            .with_inner_size([1200.0, 800.0])
            .with_min_inner_size([800.0, 600.0])
            .with_title("Valorant Manager")
            .with_icon(eframe::icon_data::from_png_bytes(&[]).unwrap_or_default()),
        ..Default::default()
    };

    eframe::run_native(
        "Valorant Manager",
        options,
        Box::new(|cc| {
            // Configure egui visuals for a modern look
            let mut style = (*cc.egui_ctx.style()).clone();
            style.visuals.window_rounding = egui::Rounding::same(8.0);
            // style.visuals.button_rounding = egui::Rounding::same(4.0); // Not available in this egui version
            style.visuals.menu_rounding = egui::Rounding::same(4.0);
            cc.egui_ctx.set_style(style);

            Ok(Box::new(ValorantManagerApp::new(cc)))
        }),
    )
} 