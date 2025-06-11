# Valorant Manager

A strategic esports management simulation game built with Rust and egui, inspired by Football Manager but set in the world of Valorant esports.

## Overview

Valorant Manager allows you to take control of a Valorant esports team and guide them through a complete VCT (Valorant Champions Tour) season. Make strategic decisions about player recruitment, team tactics, financial management, and tournament progression.

## Features

### Core Gameplay Systems

- **Team Management**: Manage a roster of players with detailed attributes and morale systems
- **Player Development**: Train players to improve their skills and adapt to meta changes
- **Tactical Depth**: Plan strategies for different maps and agent compositions
- **Financial Management**: Balance budgets, player salaries, and transfer spending
- **Tournament Progression**: Navigate through the VCT season structure (Kickoff → Masters → Champions)
- **Scouting System**: Discover and recruit new talent from around the world

### Player Attributes

Players have comprehensive attribute systems based on Valorant-specific skills:

**Technical Attributes:**
- Aim (accuracy, reflexes, first shot accuracy)
- Utility Usage (tactical awareness, ability execution)
- Movement (positioning, strafe control, peeking)
- Clutch Potential (composure under pressure)

**Mental Attributes:**
- Game Sense (anticipation, decision-making)
- Communication (teamwork, leadership)
- Composure (pressure handling)
- Aggression (entry fragging tendency)
- Adaptability (meta adjustment ability)

**Physical Attributes:**
- Stamina (endurance for long matches)
- Natural Fitness (injury resistance, recovery)

### Agent Roles & Specialization

- **Duelist**: Entry fraggers who create space and take aggressive duels
- **Initiator**: Support players who challenge angles and provide intel
- **Controller**: Space controllers who block sightlines and enable team movements
- **Sentinel**: Defensive specialists who lock down sites and watch flanks

## Getting Started

### Prerequisites

- Rust (latest stable version)
- Cargo (comes with Rust)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/valorant-manager.git
cd valorant-manager
```

2. Build and run the project:
```bash
cargo run
```

### First Steps

1. **Create Your Team**: Start by creating a new team with your chosen name
2. **Review Your Squad**: Check your starting roster of 5 players in the Squad screen
3. **Plan Your Tactics**: Set up strategies for different maps in the Tactics screen
4. **Manage Finances**: Monitor your budget and player salaries in the Finance screen
5. **Scout New Talent**: Discover and recruit players in the Scouting screen
6. **Progress Through Season**: Advance weeks and compete in tournaments via the Schedule screen

## Game Screens

### Main Menu
- Create new teams or load existing saves
- Access game settings

### Squad Management
- View detailed player information and attributes
- Manage starting lineup and bench players
- Monitor player morale and contracts

### Tactics & Strategy
- Select strategies for each map in the competitive pool
- Plan agent compositions and tactical approaches
- Set economic strategies and buy phase preferences

### Financial Management
- Track team budget and monthly cash flow
- Monitor player salaries and contract details
- Plan transfer spending and facility investments

### Schedule & Tournament
- View current VCT event and tournament standings
- Track championship points and qualification status
- Advance through the season and simulate matches

### Scouting & Transfers
- Scout new players from different regions
- View detailed scouting reports
- Sign players within your budget constraints

## VCT Season Structure

The game follows the official VCT 2025 structure:

1. **Kickoff** (January-February): Season opener, top 2 qualify for Masters Bangkok
2. **Masters Bangkok** (February-March): First international event
3. **Stage 1** (March-May): Regional league play, top 3 qualify for Masters Toronto
4. **Masters Toronto** (June): Second international event
5. **Stage 2** (July-August): Final regional stage, determines Champions qualification
6. **Champions Paris** (September-October): World championship

## Technical Details

### Architecture

- **Frontend**: egui for immediate mode GUI
- **Backend**: Pure Rust with serde for serialization
- **Data Management**: UUID-based entity system
- **Persistence**: JSON-based save/load system

### Key Dependencies

- `egui` & `eframe`: GUI framework
- `serde`: Serialization/deserialization
- `chrono`: Date/time handling
- `uuid`: Unique identifier generation
- `rand`: Random number generation

## Development Status

This is an MVP (Minimum Viable Product) implementation that includes:

✅ **Implemented:**
- Complete UI framework with all major screens
- Player attribute and morale systems
- Basic team management
- Tournament structure and progression
- Scouting and transfer system
- Financial management basics

🚧 **Planned for Future Versions:**
- Match simulation engine
- Advanced training systems
- Youth development
- Detailed match statistics
- Save/load functionality
- Enhanced AI for opponent teams
- More detailed economic simulation

## Contributing

This project is in early development. Contributions are welcome! Please feel free to:

- Report bugs or suggest features via GitHub issues
- Submit pull requests for improvements
- Provide feedback on game balance and mechanics

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This is an unofficial fan project and is not affiliated with Riot Games or Valorant. All game concepts and terminology are used for educational and entertainment purposes only.

---

**Note**: This is an MVP implementation focused on core functionality. Many advanced features are planned for future development iterations.