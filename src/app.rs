use eframe::egui;
use log::info;

use crate::game::GameState;
use crate::ui::{MainMenuScreen, SquadScreen, TacticsScreen, FinanceScreen, ScheduleScreen, ScoutingScreen};

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum Screen {
    MainMenu,
    Squad,
    Tactics,
    Finance,
    Schedule,
    Scouting,
    Match,
}

pub struct ValorantManagerApp {
    current_screen: Screen,
    game_state: GameState,
    
    // UI Screens
    main_menu: MainMenuScreen,
    squad_screen: SquadScreen,
    tactics_screen: TacticsScreen,
    finance_screen: FinanceScreen,
    schedule_screen: ScheduleScreen,
    scouting_screen: ScoutingScreen,
}

impl ValorantManagerApp {
    pub fn new(cc: &eframe::CreationContext<'_>) -> Self {
        info!("Initializing Valorant Manager App");
        
        // Load persistent data if available
        let game_state = if let Some(storage) = cc.storage {
            eframe::get_value(storage, eframe::APP_KEY).unwrap_or_default()
        } else {
            GameState::new()
        };

        Self {
            current_screen: Screen::MainMenu,
            game_state,
            main_menu: MainMenuScreen::new(),
            squad_screen: SquadScreen::new(),
            tactics_screen: TacticsScreen::new(),
            finance_screen: FinanceScreen::new(),
            schedule_screen: ScheduleScreen::new(),
            scouting_screen: ScoutingScreen::new(),
        }
    }

    fn render_top_bar(&mut self, ctx: &egui::Context) {
        egui::TopBottomPanel::top("top_panel").show(ctx, |ui| {
            egui::menu::bar(ui, |ui| {
                // Game title
                ui.heading("Valorant Manager");
                
                ui.separator();
                
                // Navigation buttons
                if ui.selectable_label(self.current_screen == Screen::Squad, "Squad").clicked() {
                    self.current_screen = Screen::Squad;
                }
                if ui.selectable_label(self.current_screen == Screen::Tactics, "Tactics").clicked() {
                    self.current_screen = Screen::Tactics;
                }
                if ui.selectable_label(self.current_screen == Screen::Finance, "Finance").clicked() {
                    self.current_screen = Screen::Finance;
                }
                if ui.selectable_label(self.current_screen == Screen::Schedule, "Schedule").clicked() {
                    self.current_screen = Screen::Schedule;
                }
                if ui.selectable_label(self.current_screen == Screen::Scouting, "Scouting").clicked() {
                    self.current_screen = Screen::Scouting;
                }
                
                ui.with_layout(egui::Layout::right_to_left(egui::Align::Center), |ui| {
                    // Game info
                    if let Some(team) = &self.game_state.current_team {
                        ui.label(format!("Team: {}", team.name));
                        ui.separator();
                        ui.label(format!("Budget: ${}", self.game_state.budget));
                        ui.separator();
                        ui.label(format!("Season: {}", self.game_state.current_season));
                    }
                });
            });
        });
    }
}

impl eframe::App for ValorantManagerApp {
    fn update(&mut self, ctx: &egui::Context, _frame: &mut eframe::Frame) {
        // Only show top bar if not on main menu
        if self.current_screen != Screen::MainMenu {
            self.render_top_bar(ctx);
        }

        // Render current screen
        match self.current_screen {
            Screen::MainMenu => {
                if self.main_menu.show(ctx, &mut self.game_state) {
                    self.current_screen = Screen::Squad;
                }
            }
            Screen::Squad => {
                self.squad_screen.show(ctx, &mut self.game_state);
            }
            Screen::Tactics => {
                self.tactics_screen.show(ctx, &mut self.game_state);
            }
            Screen::Finance => {
                self.finance_screen.show(ctx, &mut self.game_state);
            }
            Screen::Schedule => {
                self.schedule_screen.show(ctx, &mut self.game_state);
            }
            Screen::Scouting => {
                self.scouting_screen.show(ctx, &mut self.game_state);
            }
            Screen::Match => {
                // TODO: Implement match screen
            }
        }
    }

    fn save(&mut self, storage: &mut dyn eframe::Storage) {
        eframe::set_value(storage, eframe::APP_KEY, &self.game_state);
    }
} 