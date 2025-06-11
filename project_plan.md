# **Valorant Manager: MVP Requirements Document**

## **Executive Summary**

This document details the Minimum Viable Product (MVP) requirements for "Valorant Manager," a strategic simulation game designed to emulate the profound managerial depth of "Football Manager" within the dynamic and tactical framework of the "Valorant" esports scene. The game will position players as team managers, tasked with nurturing player talent, crafting intricate tactical strategies, maintaining financial stability, and navigating the competitive landscape of a full Valorant Champions Tour (VCT) season. The MVP is conceived as a fully functional and playable experience, prioritizing the essential management decisions and their direct influence on simulated match outcomes, while reserving more intricate features for subsequent development phases.

## **Introduction: The Vision for Valorant Manager**

### **Game Concept: A Strategic Esports Management Simulation**

"Valorant Manager" is envisioned as a sophisticated strategic simulation that translates the proven depth of Football Manager into the high-stakes world of Valorant esports. In Football Manager, success is predicated on astute managerial decisions, player development, and tactical acumen, featuring an updated user interface, a refined game engine, and comprehensive pre- and post-match information.1 The franchise emphasizes crucial elements such as team talks, simplified training, and in-game assistance.1 A cornerstone of Football Manager's appeal lies in its ability to simulate the building and maintenance of robust team dynamics, navigating complex player relationships, and sustaining high morale.3 This intricate management loop will be meticulously adapted to Valorant's fast-paced, ability-driven, and round-based tactical gameplay. Players will immerse themselves in the challenge of assembling and guiding a championship-contending team, grappling with the complexities of agent compositions, map-specific strategies, and the critical in-game economy, all within the authentic structure of a professional esports season.

### **Target Audience: Fans of Management Sims and Valorant Esports**

The primary demographic for "Valorant Manager" comprises dedicated enthusiasts of sports and esports management simulation games. This audience typically seeks deep strategic gameplay, long-term progression, and the satisfaction of overseeing a team's journey to success. A significant secondary audience includes active Valorant players and esports followers who possess an inherent understanding of the game's mechanics, agent roles, and competitive ecosystem. These individuals are expected to be eager to engage with Valorant from a novel, managerial perspective, applying their existing knowledge to strategic decision-making.

### **Core Gameplay Loop: Managing a Team Through a Competitive Season**

The central gameplay experience of "Valorant Manager" will revolve around guiding a Valorant team through a complete competitive season, mirroring the established structure of the Valorant Champions Tour (VCT).4 This involves a continuous cycle of daily management decisions, rigorous match preparation, strategic execution during simulated games, and reactive adjustments to in-game events. Concurrently, managers must meticulously oversee player morale and financial resources to ensure sustained competitive excellence. The MVP will deliver a complete, repeatable seasonal experience, allowing players to progress from initial regional Kickoff events to prestigious global Masters tournaments, culminating in the ultimate challenge of the Champions event.4 This progression system provides a clear and compelling objective for the player, as the accumulation of Championship Points and qualification for higher-tier events creates a natural narrative arc for the managerial journey.4 This structure inherently aligns with core game design principles of providing clear objectives and meaningful rewards 6, fostering intrinsic motivation as players strive for each successive milestone.

## **Core Gameplay Systems**

### **Team Roster & Player Management**

#### **Player Attributes & Development**

A fundamental requirement for "Valorant Manager" is the implementation of a comprehensive player attribute system that directly reflects Valorant-specific skills. This system will draw conceptual inspiration from Football Manager's established technical, mental, and physical attributes, directly influencing simulated match performance.

**Technical Attributes (Valorant Specific):** These attributes will govern a player's raw mechanical skill and execution within the Valorant game.

* **Aim (Accuracy, Reflexes, First Shot Accuracy):** This attribute will directly influence the probability of hitting targets, the potential for headshots, and a player's reaction time, conceptually aligning with Football Manager's Finishing and Reflexes attributes.7 Valorant places a strong emphasis on headshots and precise first-shot accuracy, though it also incorporates an element of inherent randomness in its shooting mechanics.9 The game's design, where even perfectly aimed shots can sometimes miss due to variable first-shot accuracy and randomized spray patterns 9, means that a player's "Aim" attribute should not guarantee a hit. Instead, it should increase the *probability* of a successful shot, reflecting the source game's design. This necessitates that the match simulation incorporates a degree of inherent variability in outcomes, even for highly skilled players, to accurately reflect Valorant's core shooting design. This also implies that tactical choices and utility usage become even more critical, as they can help mitigate the impact of this inherent unpredictability.9  
* **Utility Usage (Tactical Awareness, Ability Execution, Timing):** This governs the effectiveness and opportune deployment of agent abilities, reflecting Football Manager's Technique, Anticipation, and Decisions attributes.7 This is particularly crucial given Valorant's heavy reliance on the strategic interplay of agent abilities.10  
* **Movement (Positioning, Strafe Control, Peeking):** This affects how adeptly a player utilizes cover, engages in gunfights, and navigates the various maps, similar to Football Manager's Agility, Balance, and Pace attributes.11  
* **Clutch Potential (Composure under pressure, One-on-Ones):** This determines a player's ability to win unfavorable situations, drawing from Football Manager's Composure and One-on-Ones attributes.8

**Mental Attributes:** These attributes will reflect a player's psychological and strategic capabilities.

* **Game Sense (Anticipation, Decisions, Vision):** This attribute gauges how effectively a player reads the flow of the game, anticipates enemy movements, and makes sound strategic choices. This aligns with Valorant's emphasis on strategic depth beyond mere raw aim.8  
* **Communication (Teamwork, Leadership):** This affects overall team cohesion and the effectiveness of coordinated plays, which are vital for high-level Valorant competition.8  
* **Composure (Pressure, Temperament):** This represents a player's ability to maintain peak performance under stress, especially during critical rounds or high-stakes matches.11  
* **Aggression (Initiation, Entry Fragging):** This reflects a player's propensity to seek engagements and create space for their team.11  
* **Adaptability (Versatility, Map Pool):** This indicates how quickly a player can adjust to new agents, roles, or map changes, a key factor in Valorant's evolving meta.8

**Physical Attributes (Simplified for Valorant):** While less prominent than in traditional sports, these attributes still contribute to player consistency.

* **Stamina (Endurance):** This influences a player's consistency over long matches or extended seasons, mitigating performance degradation due to fatigue.11  
* **Natural Fitness (Injury Proneness, Recovery):** This affects how quickly players recover from minor injuries or general fatigue, and contributes to their overall health and availability.8

Player attributes will dynamically improve or decline based on factors such as training regimens, simulated match performance, age, and inherent potential. The concept of "hidden attributes" from Football Manager 8 is highly relevant for Valorant players, particularly for traits like "Adaptability," "Pressure," and "Loyalty." These underlying characteristics can significantly influence player morale, development, and consistency, especially in the high-pressure environment of esports. For instance, a player with a low "Pressure" attribute might falter in a crucial round, even if their "Aim" is otherwise high. Similarly, a player with low "Loyalty" might demand a transfer, potentially disrupting team dynamics.3 High "Adaptability," conversely, would enable a player to more easily learn new agents or adjust to shifts in the game's meta. Incorporating these hidden attributes adds considerable depth to player management beyond raw mechanical skill, allowing for more realistic player personalities, transfer dynamics, and morale challenges, all of which directly impact team performance and necessitate nuanced managerial decisions.

**Table 1: Valorant Player Attributes & Impact**

| Attribute Category | Specific Valorant Attribute | Description | Corresponding FM Attribute | Impact on Gameplay |
| :---- | :---- | :---- | :---- | :---- |
| Technical | Aim | Player's accuracy, reflexes, and first shot consistency. | Finishing, Reflexes | Increases headshot probability, improves reaction time, influences hit probability (probabilistic) |
| Technical | Utility Usage | Effectiveness and timing of agent ability deployment. | Technique, Anticipation, Decisions | Improves ability impact, reduces wasted utility, enhances tactical execution |
| Technical | Movement | Player's ability to position, strafe, and peek effectively. | Agility, Balance, Pace | Improves survivability, enhances map traversal, creates advantageous angles |
| Technical | Clutch Potential | Player's ability to perform under pressure in critical, unfavorable situations. | Composure, One-on-Ones | Increases success rate in isolated engagements, reduces errors in high-stress moments |
| Mental | Game Sense | Player's understanding of game flow, enemy prediction, and strategic decision-making. | Anticipation, Decisions, Vision | Improves tactical positioning, better rotation calls, enhances overall team strategy |
| Mental | Communication | Player's ability to convey information and coordinate with teammates. | Teamwork, Leadership | Enhances coordinated ability usage, improves team cohesion, reduces misplays |
| Mental | Composure | Player's ability to maintain performance under stress and pressure. | Composure, Pressure, Temperament | Reduces performance drop-off in critical rounds, maintains focus during adversity |
| Mental | Aggression | Player's tendency to initiate engagements and create space. | Aggression | Increases likelihood of entry frags, creates opportunities for teammates |
| Mental | Adaptability | Player's capacity to adjust to new agents, roles, or meta shifts. | Adaptability | Faster learning of new agents, smoother transition between roles, less morale impact from meta changes |
| Physical | Stamina | Player's endurance for sustained high-level performance. | Stamina | Reduces performance degradation over long matches/seasons, maintains consistency |
| Physical | Natural Fitness | Player's overall health, injury proneness, and recovery rate. | Natural Fitness, Injury Proneness | Faster recovery from fatigue/injuries, maintains physical attributes over time |

#### **Agent Roles & Specialization**

The game will integrate Valorant's four distinct agent roles—Duelist, Initiator, Controller, and Sentinel—along with their associated abilities. Players within the game will possess varying levels of proficiency in specific roles and mastery over individual agents, which will directly impact their effectiveness within different team compositions.

Players will have a rating for their proficiency in each of the four roles (Duelist, Initiator, Controller, Sentinel). For instance, a player might be naturally inclined as a "Duelist" but only "Competent" as an "Initiator," influencing their optimal placement within the team. Beyond general role proficiency, players will also exhibit individual mastery levels for specific agents. A player might be highly proficient with Jett (a Duelist) but only average with Raze (another Duelist), despite both falling under the same role.13 Each agent's unique abilities, such as Jett's Cloudburst, Updraft, Tailwind, and Blade Storm, or Sage's Resurrection, Barrier Orb, Slow Orb, and Healing Orb, and Brimstone's Stim Beacon, Incendiary, Sky Smoke, and Orbital Strike 16, must be accurately represented within the simulation. A player's "Utility Usage" attribute will determine how effectively these abilities are deployed during simulated matches. The game will simulate the impact of both balanced and unconventional team compositions. For example, a common setup often includes 1-2 Duelists, 1 Initiator, 1 Sentinel, and 1 Controller.13 Unconventional setups can offer a surprise factor 13 but may also carry higher strategic risks.

The concept of a constantly "evolving meta" (Most Effective Tactics Available) in Valorant 17 holds significant implications for gameplay. This dynamic environment suggests that a player's "Adaptability" and the manager's capacity to identify and leverage these meta shifts (e.g., by training players on new agents or adjusting compositions) will form a crucial strategic layer. As the game is a "games as a service" model with "consistent updates" and an "ever-evolving 'meta'" 12, and player morale is affected by how settled they are and their training happiness 14, a clear causal link emerges. If the meta shifts—for example, if a certain agent becomes significantly stronger or weaker due to game updates, or a new team composition gains dominance—a team that is slow to adapt or whose players lack sufficient "Adaptability" will inevitably experience a decline in performance. Conversely, a manager who can proactively identify these shifts and invest in training their players or scouting for new talent will gain a tangible competitive advantage. This introduces a dynamic strategic element where the manager is not merely selecting the "best" agents in a static sense, but rather the "best *for the current meta*," and must continually consider player versatility. This approach enhances replayability and strategic depth beyond static player statistics, directly influencing the design of the training system to allow for focused development on specific agents or roles.

Furthermore, the paramount importance of "team coordination" and "synergy" in Valorant 10 indicates that simply having five individually skilled players is insufficient for success. The game must simulate how effectively agents' abilities *interact* and how players *communicate* to execute complex plays, rather than merely summing individual attribute scores. As high-level Valorant play relies heavily on "team coordination" 10 and the ability to "synergize within diverse and multifaceted teams" 12, and Football Manager already models "team cohesion" and "relationships" 3, a clear connection can be established. If a team possesses players with high "Communication" attributes and exhibits strong "Team Cohesion," their "coordinated utility usage" 10 will be more effective, leading to superior outcomes in simulated rounds. For example, the precise timing required for a Breach flash followed by a Neon entry 18 demands effective communication and synergy to succeed. Therefore, the match simulation engine must account for synergistic effects between agents and players. This implies that the aggregate of individual player attributes is not the sole determinant of success; the *interplay* between players and their chosen agents is equally crucial. This can be modeled by applying a "Team Synergy" modifier to certain tactical outcomes, or by implementing specific "combo" plays that achieve higher success rates when the involved players possess high "Communication" or "Teamwork" attributes.

**Table 2: Valorant Agent Roles, Functions & Key Abilities**

| Role | Primary Function | Example Agents | Key Abilities (Examples) |
| :---- | :---- | :---- | :---- |
| Duelist | Entry fragging, creating space, taking aggressive duels | Jett, Raze, Neon, Reyna, Yoru | Jett: Tailwind (dash), Blade Storm (knives); Raze: Paint Shells (grenades), Boom Bot (recon); Reyna: Devour (heal), Dismiss (intangibility) 16 |
| Initiator | Challenging angles, providing intel, supporting team entry | Breach, Fade, Sova, Skye, KAY/O | Sova: Recon Bolt (reveal), Owl Drone (scout); Breach: Flash Point (flash), Fault Line (daze); Fade: Prowler (hunt), Haunt (reveal) 16 |
| Controller | Blocking sightlines, controlling space, enabling team movements | Astra, Brimstone, Omen, Viper | Brimstone: Sky Smoke (smokes), Incendiary (molly); Viper: Toxic Screen (wall), Snake Bite (molly); Omen: Dark Cover (smokes), Paranoia (blind) 16 |
| Sentinel | Locking down sites, watching flanks, providing defensive utility | Chamber, Cypher, Killjoy, Sage | Killjoy: Nanoswarm (molly), Turret (alert); Cypher: Trapwire (tether), Cyber Cage (block vision); Sage: Barrier Orb (wall), Slow Orb (slow) 16 |

#### **Player Morale & Team Dynamics**

The game will implement a comprehensive morale and team dynamics system, drawing heavily from Football Manager's established mechanics, where individual player happiness and overall team cohesion directly impact performance.

Individual player morale will be influenced by factors such as their playtime relative to expectations, training happiness, how settled they are at the club and in the city/country, their relationships with teammates and the manager, and their recent match performance.14 Morale will be represented on a spectrum, ranging from "Abysmal" to "Superb".14 Team cohesion, a critical element, will be built gradually over time through fostering trust and maintaining consistent tactical setups.3 High team cohesion directly enhances match performances and indirectly contributes to positive morale.14

The manager's influence on morale will be multifaceted, encompassing team talks, private conversations with players, appropriate praising or criticizing of performance, strategic management of playtime, and the establishment of a clear code of conduct.3 Team meetings can provide a short-term boost to morale when utilized effectively.3 The system will also include a basic representation of team leaders and social groups, where upsetting key influencers can propagate negative morale throughout the wider squad.3 Social groups are primarily formed based on how long players have been at the club.3

The "games as a service" model of Valorant 12, characterized by constant updates and an evolving meta 17, means that player "Adaptability" 8 and "Temperament" 11 will be critical for maintaining morale. Players who struggle to adapt to patch changes or new meta strategies might become unhappy, which could then negatively impact team cohesion. Given that Valorant is a "games as a service" with "consistent updates" and an "ever-evolving 'meta'" 12, and player morale is affected by their settlement at the club and training happiness 14, a clear link emerges. When the meta shifts, players may need to learn new agents or adjust their playstyle. If a player possesses low "Adaptability" or a "Temperamental" personality, they might resist these changes, leading to poor training performance, reduced playtime, and consequently, diminished morale. This negative morale can then spread through social groups 3, impacting overall team cohesion and match performance.14 This necessitates that the game simulates the impact of game updates (meta shifts) on player morale and training, requiring managers to proactively address player concerns related to meta changes and ensure their players are adapting, potentially through specific training regimens or individual conversations.

Furthermore, the strong emphasis on "communication" and "trust" in Valorant esports 10 suggests that team talks and individual player interactions 3 should have a more pronounced and immediate impact on in-match performance than in traditional sports. This is due to the real-time, high-stakes nature of tactical FPS rounds. As "communication becomes your lifeline" in Valorant, building "trust and synergy" with teammates is paramount.10 While Football Manager details the importance of team talks for morale and cohesion 14, the specific context of a tactical FPS means a single miscommunication or lack of trust can instantly result in a lost round. Unlike football, where a tactical instruction might unfold over several minutes, in Valorant, a critical callout or a coordinated execute happens in mere seconds. Therefore, the "Team Talk" system 1 should not merely be a morale booster. It should also offer immediate, short-term buffs or debuffs to in-match attributes (such as Composure, Communication, or Utility Usage) for the subsequent few rounds, directly reflecting the immediate psychological impact of effective or ineffective communication. This approach makes the manager's "man management" decisions during a match more tactically significant and impactful.

#### **Training System**

A simplified training system will be implemented, focusing on improving player attributes, agent mastery, and role proficiency. Managers will set weekly training schedules, allocating time to general physical conditioning, tactical drills, and agent-specific practice.2 Training will allow managers to focus on specific attributes, such as "Aim Drills" to improve Aim or "Utility Practice" to enhance Utility Usage. Dedicated training for specific agents or roles will be available to improve mastery and proficiency. Players will provide feedback on training intensity and satisfaction, which will directly affect their morale.14 For the MVP, the focus will be on the existing roster, with detailed youth development being considered for future iterations.

Given Valorant's evolving meta 17 and the critical importance of agent compositions 13, the training system must be flexible enough to allow for rapid adaptation. This implies the ability to quickly shift training focus to new agents or counter-strategies. The dynamic nature of the Valorant meta 17 and the constant need for teams to adapt to new agents and strategies 10 creates a clear requirement. If a new agent becomes dominant, or a specific map strategy necessitates a different agent composition, the manager must be able to swiftly train their players on these new requirements. A rigid training system would significantly hinder this essential adaptation. Therefore, the training system should allow for "intensive" or "focused" training periods on specific agents or roles. This could come with a trade-off, such as increased fatigue, a higher risk of minor injuries, or reduced improvement in other areas. This design enables the manager to effectively react to meta shifts and prepare their team for specific opponents or upcoming tournaments.

### **Tactical & Strategic Depth**

#### **Match Simulation & Decision Making**

A robust match simulation engine will be developed to facilitate pre-match tactical planning, in-match adjustments, and comprehensive post-match analysis, accurately reflecting Valorant's round-based gameplay.

Pre-Match Planning:  
Managers will select five agents for their team, considering the specific map, the opposing team's tendencies, and their own players' proficiencies.13 High-level strategies for attacking and defending on chosen maps will be defined, such as "A-site push," "Mid control," "Slow default," or "Retake focus".10 Players will be assigned to specific roles within the team, such as Entry Fragger, In-Game Leader (IGL), or OPer.13  
In-Match Adjustments:  
During simulated matches, the manager will be able to make real-time decisions. These include calling for specific economic rounds like "Eco Round," "Force Buy," or "Full Buy" 23, or issuing tactical adjustments such as "Rotate B," "Push Mid," or "Save for next round." General directives on ability usage can also be given, such as "Conserve utility," "Aggressive utility," or "Default utility." Quick "Team Talks" can be delivered during matches to boost morale or refocus players.1  
Post-Match Analysis:  
Following each match, detailed statistics on player performance will be provided. This includes Kills Per Round (KPR), Deaths Per Round (DPR), Assists Per Round (APR), Damage Per Round, Average Combat Score (ACS), Headshot percentage, First Kills, Clutch statistics, and economic efficiency (Credits per kill).25 Team economy and round outcomes will also be thoroughly analyzed.  
Valorant's emphasis on "map control & economy" 10 and its distinct "buy phases" 23 mean that economic decision-making is as crucial as tactical decisions. A manager's ability to accurately assess the opponent's economy and make optimal buy calls will be a significant test of their strategic skill. As "economy management adds another layer of strategy" 10 and the game details "Full Buy," "Half Buy," "Eco Round," and "Force Buy" strategies, including how credits are earned and lost 23, it becomes clear that economic decisions are interwoven with tactical success. The importance of being aware of the "Enemy Team economy" is also highlighted.24 A poor economic decision, such as a "Force Buy" that fails, can severely cripple a team's ability to execute a "Full Buy" in subsequent rounds, potentially leading to a cascading series of losses. Conversely, a well-executed "Eco Round" that manages to secure a spike plant 23 can generate crucial credits, allowing the team to recover their economy. Therefore, the match simulation must heavily factor in economic decisions. The manager should be presented with clear economic information regarding both their team and the opponent's 24 to enable informed buy-phase decisions. The success rate of "Eco" or "Force" buys should be influenced by player attributes (e.g., "Clutch Potential," "Aim") and the overall tactical execution of the round. This elevates economic management from a simple financial overview to a core, real-time tactical element during matches.

The "inconsistent" and "unreliable" shooting mechanics in Valorant 9 suggest that the match simulation should not be purely deterministic based on player attributes. Instead, it should incorporate a degree of probabilistic outcomes, where tactical execution and utility usage can influence the odds of success more significantly than raw aim alone. Valorant's shooting is described as "highly unreliable and inconsistent," with "RNG, uncertainty and unreliability" being inherent to its design, and this "randomness transfers skill away from mechanics and onto tactics".9 While Football Manager's 2D match engine simulates outcomes based on player attributes and tactics 1, a purely deterministic simulation based on "Aim" attributes would contradict Valorant's core design. Therefore, the match engine should utilize probabilistic models for engagements. For example, a player with high "Aim" and "Composure" will have a higher *chance* of hitting a headshot, but it will not be guaranteed. Crucially, the *context* of the engagement—such as an enemy being flashed by an Initiator's ability or slowed by a Controller's utility—should significantly modify these probabilities. This reflects Valorant's emphasis on ability interplay over raw gun skill 10, meaning a well-executed tactical play can effectively overcome a slight mechanical disadvantage.

#### **Map Strategy & Agent Compositions**

The game will incorporate Valorant's diverse map pool and the strategic implications of map layouts on agent selection and team compositions. The current competitive map pool, including Ascent, Icebox, Fracture, Haven, Lotus, Pearl, and Split 21, will be included, with an understanding that the map pool rotates over time.21 Each map will possess unique characteristics that influence optimal agent compositions and strategies. For instance, Bind features one-way teleporters, Haven is notable for its three bomb sites, Split is characterized by its verticality, and Breeze by its wide-open spaces conducive to long-range engagements.21 Ascent, for example, is identified as a defender-sided map with a prominent mid lane.22 The game will provide guidance or "meta" suggestions for agent compositions on each map, reflecting competitive play trends.18 For example, Fracture is highlighted as a map favoring aggressive plays, with recommended agents including Neon, Astra, Chamber, Breach, and Fade.18 Managers will be required to analyze opponent tendencies and the strengths and weaknesses of specific maps to select the most effective map-agent strategy.

The dynamic nature of the Valorant map pool (with maps being removed and added periodically) 21 and the constant evolution of "best" team compositions 18 underscore the critical importance of a manager's "Adaptability" 8 and "Game Sense".8 The game must simulate the impact of these map changes on team performance and necessitate that managers adjust their strategies and even their player roster accordingly. As Valorant has a "seven-map competitive pool" that changes, with maps being "removed" 21, and "best team compositions for every Valorant map" are not static 18, a clear strategic challenge emerges. If a map on which a team's star player excels is removed, or if the current roster cannot effectively execute a newly dominant meta composition, the manager faces a significant hurdle. This situation compels the manager to either invest in training existing players (assuming they possess high "Adaptability") or to seek new players in the transfer market. This introduces a layer of dynamic strategic depth and replayability, preventing the game from becoming stagnant with static optimal strategies. It could be simulated through periodic "patch updates" within the game that alter agent strengths or map characteristics, forcing the manager to continuously re-evaluate their roster and tactical approach.

**Table 3: Valorant Competitive Maps & Strategic Implications**

| Map Name | Key Characteristics | Strategic Impact | Example Agent Compositions (from research) |
| :---- | :---- | :---- | :---- |
| Ascent | Prominent open mid area, toggle-able doors on sites | Mid control crucial, strong defender side, easy fights at A/B main, good for OP users 21 | Jett, Sova, Omen, Killjoy, KAY/O 20 |
| Bind | No middle area, two one-way teleporters | Fast rotations, mind games, tight corners, abilities and timing matter 21 | Jett, Sova, Viper, Sage, Killjoy 20 |
| Breeze | Wide open spaces, one-way drop, switchable door | Long-range engagements, good for snipers, mid control important, fast rotation 21 | Jett, Sova, Omen, Cypher, Breach 20 |
| Haven | First map with three bomb sites (A, B, C) | Defense harder, requires smart rotation and communication, many paths for attackers 21 | Raze, Breach, Omen, Killjoy, Sova 22 |
| Icebox | Arctic base, many high grounds and tight corners, ziplines | Vertical fights common, good aim and quick thinking needed, fast movement with ziplines 21 | Jett, Sova, Viper, Sage, Killjoy 20 |
| Fracture | "H" shaped, attackers from both sides, unique layout | Needs quick thinking and strong communication, aggressive plays, unique angles 18 | Neon, Astra, Chamber, Breach, Fade 18 |
| Lotus | Three sites, spinning stone doors, tight hallways, destructible wall | Fast flanks, quick moves, smart teamwork, requires utility and control 21 | Raze, Omen, Killjoy, Fade, Gekko 18 |
| Split | Verticality, high ground, ropes, many corners | Rewards mid control, use of upper angles, fast rotation, defender-sided 21 | Raze, Skye, Omen, Cypher, Sage 20 |

#### **In-Game Economy Management**

The game will simulate Valorant's crucial round-based credit system, encompassing credit earning, spending, and the strategic implementation of various buy phases.

Players will commence each match with 800 credits.23 Credits are earned through various actions: 3,000 credits for winning a round, 1,900 to 2,900 credits for losing a round (with increasing amounts for consecutive losses), 200 credits per kill, and an additional 300 credits for the entire attacking team if the spike is planted, regardless of the round outcome.23 A maximum of 9,000 credits can be accumulated, and credits reset at half-time.23

The game will implement the four primary buy phase strategies: Full Buy, Half Buy, Eco Round, and Force Buy.23

* **Full Buy:** The team is fully equipped with primary rifles (Phantom or Vandal), full shields, and all available utility.23  
* **Half Buy:** Players purchase intermediate weapons such as the Spectre or Bulldog, along with light shields and some utility.23  
* **Eco Round:** Minimal purchases (typically pistols and light utility) are made to conserve credits for a stronger buy in subsequent rounds.23 The strategic objective is often to secure a spike plant or achieve kills to damage the enemy's economy.24  
* **Force Buy:** All available credits are spent on the best possible gear, often representing a high-risk, high-reward gamble to turn the tide of a critical round.23

Managers must also consider their teammates' economies and facilitate sharing credits, adhering to the principle that a team should "win as it buys together".23 The ability to infer or view the enemy team's economic state 24 will be crucial for informing buy decisions and exploiting opponent weaknesses. A simplified "Econ Rating" could be incorporated to track efficiency (damage dealt per 1,000 credits spent).24

**Table 4: Valorant In-Game Economy Mechanics**

| Credit Source/Cost | Amount | Description/Impact |
| :---- | :---- | :---- |
| **Starting Credits** | 800 | Available at the start of each half/match (45s buy phase for first round, 30s thereafter) 23 |
| **Round Win** | 3,000 (per player) | Enables a "Full Buy" for the next round 23 |
| **Round Loss** | 1,900 (1st loss), 2,400 (2nd consecutive loss), 2,900 (3rd+ consecutive loss) (per player) | Provides a baseline to recover economy, encourages strategic "Eco Rounds" 23 |
| **Kill** | 200 (per kill) | Individual credit bonus, encourages aggressive plays 23 |
| **Spike Plant** | 300 (for entire attacking team) | Team credit bonus regardless of round outcome, crucial for "Eco Rounds" 23 |
| **Max Credits** | 9,000 | Upper limit for accumulated credits 23 |
| **Credits Reset** | N/A | Credits reset to 800 at the end of each half 24 |
| **Phantom/Vandal** | 2,900 | Primary rifles, core of "Full Buy" 23 |
| **Spectre/Bulldog** | \~1,600-2,100 | Intermediate weapons for "Half Buy" 23 |
| **Full Shields** | 1,000 | Provides 50 armor, essential for engagements 23 |
| **Light Shields** | 400 | Provides 25 armor, used in "Half Buy" or "Eco" 23 |
| **Abilities** | 100-300 (per charge/ability) | Crucial utility, must be balanced with weapon buys 23 |

| Buy Round Type | Typical Loadout | Strategic Goal |
| :---- | :---- | :---- |
| **Full Buy** | Primary rifle, full shields, full utility | Maximize combat effectiveness, win the round 23 |
| **Half Buy** | SMG/shotgun/cheaper rifle, light shields, some utility | Compromise between saving and fighting, disrupt enemy economy 23 |
| **Eco Round** | Pistols, minimal shields/utility | Save credits for a strong "Full Buy" in a future round, aim for spike plant/kills 23 |
| **Force Buy** | Best possible gear with all available credits | High-risk gamble to win a critical round (e.g., match point) 23 |

### **Scouting & Transfers**

#### **Player Acquisition**

The game will implement basic scouting mechanics to enable managers to identify and acquire new talent, thereby expanding their roster. A simplified scouting system will allow managers to assign scouts to specific regions or to focus on particular player archetypes (e.g., Duelists, IGLs) to discover potential recruits. A comprehensive database of simulated Valorant players will be maintained, featuring varying attributes, potentials, and personalities. Scouting reports will be generated, providing simplified overviews of potential players, including key attributes, role proficiency, estimated market value, and recent performance metrics.25

Given the "franchising model" prevalent in Valorant esports 5 and the focus on "Tier 1" teams, the scouting system should reflect the reality that top-tier talent is both scarce and expensive. This implies that identifying "hidden gems" or developing youth talent (a feature for future iterations) will be crucial for long-term success, rather than simply acquiring all the best players through direct purchases. The Valorant Champions Tour (VCT) involves "Riot Games hand-picks teams for VCT participation, combining performance-based selection with a franchising model".5 This indicates a closed, elite ecosystem at the highest level, where team slots are highly valuable and talent is concentrated. Similar to Football Manager, where top players are expensive and difficult to acquire, necessitating effective scouting and youth development, the Valorant Manager game should simulate the challenge of acquiring elite talent. This could manifest through high transfer fees, demanding salary expectations, or intense competition from other AI-controlled teams. This design encourages strategic long-term planning for player development and talent identification, mirroring the complex challenges faced by real-world esports organizations. The "Player Leaderboards" and "Key Metrics for Players" 25 can serve as a foundational basis for generating realistic scoutable player profiles, making the scouting reports more meaningful and impactful for the manager's decisions.

#### **Contract Management**

Basic contract management and transfer negotiation mechanics will be implemented. Players will have contracts with varying lengths and associated salaries. A basic negotiation system will be in place for player contract renewals and for the buying and selling of players. This will include options for mutual contract termination.1 Players may also initiate demands for transfers or new contracts based on their morale, performance, or interest expressed by other clubs.1

The "games as a service" model 12 and the continuously evolving meta 17 in Valorant imply that a player's value and suitability can change rapidly. This necessitates that contract management be dynamic, allowing managers to strategically offload players who no longer fit the current meta or acquire players whose value has suddenly increased. The Valorant meta evolves, and agent strengths and weaknesses can shift with game updates.17 Player morale is also affected by consistent playtime and being utilized in an effective role.14 This creates a direct causal link: a player who was a star on a specific agent might become less effective if that agent is nerfed or falls out of the meta. This could lead to reduced playtime, lower morale 14, and a desire to leave the team. Conversely, a previously undervalued player might suddenly become a highly sought-after asset if their preferred agent or playstyle becomes dominant in the meta. Therefore, the transfer and contract system should allow for dynamic valuation of players based on their performance within the current meta, their adaptability, and their current contract situation. This adds a crucial layer of strategic financial and roster management, requiring managers to anticipate meta shifts and manage player assets accordingly, potentially selling players whose value is declining or acquiring those whose value is on the rise due to changes in the game's competitive landscape.

### **Competitive Structure & Progression**

#### **League & Tournament System**

A simplified version of the Valorant Champions Tour (VCT) structure will be implemented for a single season. The game will simulate one full VCT season, such as the 2025 season. This will include regional events (Kickoff, Stage 1, Stage 2\) and global events (Masters Bangkok, Masters Toronto, Champions Paris).4 Teams will progress to global events and the ultimate Champions tournament based on their placement in regional events and the accumulation of Championship Points.4 For example, the 1st and 2nd place finishers in the Kickoff event qualify for Masters Bangkok, and 1 Championship Point is awarded for each match win during the regular season of the stages.4 For the MVP, the focus will be on managing a team within one regional league (e.g., VCT Americas), with simulated results for other regions influencing the matchups in global events. A realistic match schedule for the season will be generated, reflecting the VCT timeline.4

The VCT structure, with its distinct regional and global events and the system of Championship Points 4, inherently creates a compelling narrative arc for a management game. The accumulation of points and the pursuit of qualification for higher-tier events provide clear short-term and long-term objectives for the player. As the VCT 2025 season is meticulously detailed, including Kickoff, Masters (Bangkok, Toronto), Stage 1 & 2, and Champions Paris, with clear qualification paths via placement and Championship Points 4, it provides a natural framework for game progression. This structure naturally aligns with core game design principles of providing clear "Objectives" and "Reward".6 The VCT structure intrinsically offers these elements, as players are constantly working towards qualifying for the next, more prestigious event. Therefore, the game's progression system should prominently display Championship Points, upcoming events, and current qualification standings. This provides intrinsic motivation for the player, as they are continuously striving for the next milestone—qualifying for Masters, then ultimately Champions. The reward for successful management is not just winning individual matches but progressing through the established esports hierarchy, making each managerial decision feel impactful towards a larger, overarching goal.

**Table 5: VCT Event Structure & Progression (Simplified for MVP)**

| Event Name | Type | When (Approx. Month Range) | Qualification Criteria | Progression/Points Awarded |
| :---- | :---- | :---- | :---- | :---- |
| **Kickoff** | Regional | January – February | N/A (Season Start) | Top 2 qualify for Masters Bangkok. Championship Points to top 4 4 |
| **Masters Bangkok** | Global | February – March | Top 2 from each regional Kickoff (8 teams total) | Championship Points to top 4 4 |
| **Stage 1** | Regional | March – May | N/A (League Play) | Top 3 qualify for Masters Toronto. 1 CP/match win, additional CP to top 4 in playoffs 4 |
| **Masters Toronto** | Global | June | Top 3 from each regional Stage 1 Playoffs (12 teams total) | Championship Points to top 6 4 |
| **Stage 2** | Regional | July – August | N/A (League Play) | Winner & Runner-up qualify for Champions Paris. 1 CP/match win, additional CP to top 4 in playoffs 4 |
| **Champions Paris** | Global | September – October | Top 2 from Stage 2 Playoffs \+ Top 2 CP leaders from each territory | Winner crowned World Champion 4 |

#### **Ranking & Progression**

Systems for tracking team and player rankings within the simulated league will be implemented. Team standings will be displayed through league tables and tournament brackets, showing overall team performance and accumulated Championship Points. Individual player statistics will be tracked comprehensively, including Kills Per Round (KPR), Deaths Per Round (DPR), Assists Per Round (APR), Damage Per Round, Average Combat Score (ACS), Headshot percentage, First Kills, Clutch statistics, and economic efficiency (Credits per kill).25 These detailed statistics will influence player value, morale, and their potential for growth and development within the game. The manager's performance will also be tracked through metrics such as win-loss record, Championship Points earned, and overall team value.

### **User Interface & Experience (MVP Focus)**

#### **Key Management Screens**

The MVP will feature essential user interface screens designed for efficient team management. This includes a comprehensive squad overview displaying player attributes, morale, and contracts. A dedicated tactics screen will allow for agent selection, map strategy planning, and player role assignments. A finance screen will provide a clear overview of the team's budget, income, expenses, and transfer funds. A schedule screen will display upcoming matches, training sessions, and key VCT events. Finally, a scouting screen will enable basic talent identification and report viewing. The user interface will be streamlined and contemporary, drawing inspiration from Football Manager's refined interface.1

#### **Match Day Experience**

The match day experience for the MVP will be streamlined. It will feature a 2D match engine or a text-based commentary system that provides key highlights and critical decision points. This will allow the manager to observe the simulated match flow and make timely in-match adjustments, such as tactical changes or economic calls. The focus will be on conveying the strategic narrative of each round and match, rather than detailed visual fidelity.

## **MVP Scope & Future Considerations**

### **Defining the "Fully Functioning" MVP**

The "Valorant Manager" MVP is defined as a fully functioning game that allows a player to:

* Select or create a Valorant esports team.  
* Manage a roster of simulated players with dynamic attributes and morale.  
* Set basic training schedules to develop players.  
* Make strategic decisions including agent picks, map strategies, and in-match economic calls.  
* Simulate matches with outcomes influenced by player attributes, team dynamics, and managerial decisions.  
* Navigate a simplified Valorant Champions Tour (VCT) season, including regional and global events.  
* Engage in basic scouting and transfer market activities.  
* Track team and player progression through rankings and statistics.

The core gameplay loop will be complete and repeatable, providing a cohesive managerial experience from season start to finish.