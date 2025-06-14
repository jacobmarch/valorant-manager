use eframe::egui;
use crate::game::GameState;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TeamInfo {
    pub name: String,
    pub nickname: String,
}

#[derive(Debug, Clone, Copy, PartialEq)]
enum NewGameStep {
    LeagueSelection,
    TeamSelection,
}

pub struct MainMenuScreen {
    show_new_game_dialog: bool,
    new_game_step: NewGameStep,
    selected_league: Option<String>,
    selected_team: Option<TeamInfo>,
}

impl MainMenuScreen {
    pub fn new() -> Self {
        Self {
            show_new_game_dialog: false,
            new_game_step: NewGameStep::LeagueSelection,
            selected_league: None,
            selected_team: None,
        }
    }

    fn get_teams_data() -> std::collections::HashMap<String, Vec<TeamInfo>> {
        let mut teams = std::collections::HashMap::new();
        
        teams.insert("Americas".to_string(), vec![
            TeamInfo { name: "100 Thieves".to_string(), nickname: "100T".to_string() },
            TeamInfo { name: "2GAME Esports".to_string(), nickname: "2G".to_string() },
            TeamInfo { name: "Cloud9".to_string(), nickname: "C9".to_string() },
            TeamInfo { name: "Evil Geniuses".to_string(), nickname: "EG".to_string() },
            TeamInfo { name: "FURIA".to_string(), nickname: "FUR".to_string() },
            TeamInfo { name: "G2 Esports".to_string(), nickname: "G2".to_string() },
            TeamInfo { name: "KRÜ Esports".to_string(), nickname: "KRU".to_string() },
            TeamInfo { name: "Leviatán".to_string(), nickname: "LEV".to_string() },
            TeamInfo { name: "LOUD".to_string(), nickname: "LOUD".to_string() },
            TeamInfo { name: "MIBR".to_string(), nickname: "MIBR".to_string() },
            TeamInfo { name: "NRG".to_string(), nickname: "NRG".to_string() },
            TeamInfo { name: "Sentinels".to_string(), nickname: "SEN".to_string() },
        ]);

        teams.insert("EMEA".to_string(), vec![
            TeamInfo { name: "Apeks".to_string(), nickname: "APX".to_string() },
            TeamInfo { name: "BBL Esports".to_string(), nickname: "BBL".to_string() },
            TeamInfo { name: "Fnatic".to_string(), nickname: "FNC".to_string() },
            TeamInfo { name: "FUT Esports".to_string(), nickname: "FUT".to_string() },
            TeamInfo { name: "Gentle Mates".to_string(), nickname: "M8".to_string() },
            TeamInfo { name: "GIANTX".to_string(), nickname: "GIA".to_string() },
            TeamInfo { name: "Karmine Corp".to_string(), nickname: "KC".to_string() },
            TeamInfo { name: "KOI".to_string(), nickname: "KOI".to_string() },
            TeamInfo { name: "Natus Vincere".to_string(), nickname: "NAVI".to_string() },
            TeamInfo { name: "Team Heretics".to_string(), nickname: "TH".to_string() },
            TeamInfo { name: "Team Liquid".to_string(), nickname: "TL".to_string() },
            TeamInfo { name: "Team Vitality".to_string(), nickname: "VIT".to_string() },
        ]);

        teams.insert("Pacific".to_string(), vec![
            TeamInfo { name: "BOOM Esports".to_string(), nickname: "BOOM".to_string() },
            TeamInfo { name: "DetonatioN FocusMe".to_string(), nickname: "DFM".to_string() },
            TeamInfo { name: "DRX".to_string(), nickname: "DRX".to_string() },
            TeamInfo { name: "Gen.G Esports".to_string(), nickname: "GENG".to_string() },
            TeamInfo { name: "Global Esports".to_string(), nickname: "GE".to_string() },
            TeamInfo { name: "Nongshim RedForce".to_string(), nickname: "NS".to_string() },
            TeamInfo { name: "Paper Rex".to_string(), nickname: "PRX".to_string() },
            TeamInfo { name: "Rex Regum Qeon".to_string(), nickname: "RRQ".to_string() },
            TeamInfo { name: "T1".to_string(), nickname: "T1".to_string() },
            TeamInfo { name: "TALON".to_string(), nickname: "TLN".to_string() },
            TeamInfo { name: "Team Secret".to_string(), nickname: "TS".to_string() },
            TeamInfo { name: "ZETA DIVISION".to_string(), nickname: "ZETA".to_string() },
        ]);

        teams.insert("China".to_string(), vec![
            TeamInfo { name: "All Gamers".to_string(), nickname: "AG".to_string() },
            TeamInfo { name: "Bilibili Gaming".to_string(), nickname: "BLG".to_string() },
            TeamInfo { name: "Dragon Ranger Gaming".to_string(), nickname: "DRG".to_string() },
            TeamInfo { name: "EDward Gaming".to_string(), nickname: "EDG".to_string() },
            TeamInfo { name: "FunPlus Phoenix".to_string(), nickname: "FPX".to_string() },
            TeamInfo { name: "JDG Esports".to_string(), nickname: "JDG".to_string() },
            TeamInfo { name: "Nova Esports".to_string(), nickname: "NOVA".to_string() },
            TeamInfo { name: "Titan Esports Club".to_string(), nickname: "TEC".to_string() },
            TeamInfo { name: "Trace Esports".to_string(), nickname: "TE".to_string() },
            TeamInfo { name: "TYLOO".to_string(), nickname: "TYL".to_string() },
            TeamInfo { name: "Wolves Esports".to_string(), nickname: "WOL".to_string() },
            TeamInfo { name: "Xi Lai Gaming".to_string(), nickname: "XLG".to_string() },
        ]);

        teams
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
                    self.new_game_step = NewGameStep::LeagueSelection;
                    self.selected_league = None;
                    self.selected_team = None;
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
            let window_title = match self.new_game_step {
                NewGameStep::LeagueSelection => "Choose League",
                NewGameStep::TeamSelection => "Choose Team",
            };

            egui::Window::new(window_title)
                .collapsible(false)
                .resizable(false)
                .anchor(egui::Align2::CENTER_CENTER, [0.0, 0.0])
                .show(ctx, |ui| {
                    match self.new_game_step {
                        NewGameStep::LeagueSelection => {
                            ui.vertical(|ui| {
                                ui.label("Select a league to manage a team in:");
                                ui.add_space(20.0);
                                
                                let leagues = vec!["Americas", "EMEA", "Pacific", "China"];
                                
                                for league in leagues {
                                    if ui.add_sized([200.0, 40.0], egui::Button::new(league)).clicked() {
                                        self.selected_league = Some(league.to_string());
                                        self.new_game_step = NewGameStep::TeamSelection;
                                    }
                                }
                                
                                ui.add_space(20.0);
                                
                                if ui.button("Cancel").clicked() {
                                    self.show_new_game_dialog = false;
                                    self.new_game_step = NewGameStep::LeagueSelection;
                                    self.selected_league = None;
                                    self.selected_team = None;
                                }
                            });
                        }
                        NewGameStep::TeamSelection => {
                            ui.vertical(|ui| {
                                if let Some(league) = &self.selected_league {
                                    ui.label(format!("Select a team from {}:", league));
                                    ui.add_space(20.0);
                                    
                                    let teams_data = Self::get_teams_data();
                                    if let Some(teams) = teams_data.get(league) {
                                                                            egui::ScrollArea::vertical()
                                        .id_source("team_selection_scroll")
                                        .max_height(300.0)
                                        .show(ui, |ui| {
                                            for team in teams {
                                                ui.horizontal(|ui| {
                                                    if ui.add_sized([200.0, 30.0], egui::Button::new(&team.name)).clicked() {
                                                        self.selected_team = Some(team.clone());
                                                    }
                                                    ui.label(format!("({})", team.nickname));
                                                });
                                            }
                                        });
                                    }
                                    
                                    ui.add_space(20.0);
                                    
                                    let league_clone = league.clone();
                                    ui.horizontal(|ui| {
                                        if let Some(team) = &self.selected_team {
                                            if ui.button("Start Game").clicked() {
                                                game_state.initialize_with_existing_team(
                                                    team.name.clone(),
                                                    team.nickname.clone(),
                                                    league_clone
                                                );
                                                start_game = true;
                                                self.show_new_game_dialog = false;
                                                self.new_game_step = NewGameStep::LeagueSelection;
                                                self.selected_league = None;
                                                self.selected_team = None;
                                            }
                                        }
                                        
                                        if ui.button("Back").clicked() {
                                            self.new_game_step = NewGameStep::LeagueSelection;
                                            self.selected_team = None;
                                        }
                                        
                                        if ui.button("Cancel").clicked() {
                                            self.show_new_game_dialog = false;
                                            self.new_game_step = NewGameStep::LeagueSelection;
                                            self.selected_league = None;
                                            self.selected_team = None;
                                        }
                                    });
                                }
                            });
                        }
                    }
                });
        }

        start_game
    }
} 