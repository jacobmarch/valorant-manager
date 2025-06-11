use eframe::egui;
use crate::game::GameState;

pub struct MainMenuScreen {
    team_name_input: String,
    show_new_game_dialog: bool,
}

impl MainMenuScreen {
    pub fn new() -> Self {
        Self {
            team_name_input: String::new(),
            show_new_game_dialog: false,
        }
    }

    pub fn show(&mut self, ctx: &egui::Context, game_state: &mut GameState) -> bool {
        let mut start_game = false;

        egui::CentralPanel::default().show(ctx, |ui| {
            ui.vertical_centered(|ui| {
                ui.add_space(100.0);
                
                // Game title
                ui.heading(egui::RichText::new("VALORANT MANAGER").size(48.0));
                ui.add_space(20.0);
                ui.label(egui::RichText::new("Strategic Esports Management Simulation").size(18.0));
                
                ui.add_space(80.0);
                
                // Menu buttons
                if ui.add_sized([200.0, 50.0], egui::Button::new("New Game")).clicked() {
                    self.show_new_game_dialog = true;
                }
                
                ui.add_space(10.0);
                
                if ui.add_sized([200.0, 50.0], egui::Button::new("Load Game")).clicked() {
                    // TODO: Implement load game functionality
                }
                
                ui.add_space(10.0);
                
                if ui.add_sized([200.0, 50.0], egui::Button::new("Settings")).clicked() {
                    // TODO: Implement settings
                }
                
                ui.add_space(10.0);
                
                if ui.add_sized([200.0, 50.0], egui::Button::new("Exit")).clicked() {
                    ctx.send_viewport_cmd(egui::ViewportCommand::Close);
                }
            });
        });

        // New game dialog
        if self.show_new_game_dialog {
            egui::Window::new("Create New Team")
                .collapsible(false)
                .resizable(false)
                .anchor(egui::Align2::CENTER_CENTER, [0.0, 0.0])
                .show(ctx, |ui| {
                    ui.vertical(|ui| {
                        ui.label("Enter your team name:");
                        ui.text_edit_singleline(&mut self.team_name_input);
                        
                        ui.add_space(20.0);
                        
                        ui.horizontal(|ui| {
                            if ui.button("Create Team").clicked() && !self.team_name_input.trim().is_empty() {
                                game_state.initialize_with_team(self.team_name_input.clone());
                                start_game = true;
                                self.show_new_game_dialog = false;
                            }
                            
                            if ui.button("Cancel").clicked() {
                                self.show_new_game_dialog = false;
                                self.team_name_input.clear();
                            }
                        });
                    });
                });
        }

        start_game
    }
} 