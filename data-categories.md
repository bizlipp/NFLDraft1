# NFL Player Data Categories & Usage Guide

## Core Player Information
| Category | Description | Usage |
|----------|-------------|-------|
| `playerId` | Unique identifier | Primary key for player lookups and database relations |
| `name` | Player's full name | Display and search functionality |
| `team` | NFL team abbreviation | Team filtering, grouping players by team |
| `number` | Jersey number | Display on player cards, identification |
| `position` | Player position (QB, RB, WR, etc.) | Position filtering, draft strategy analysis |
| `college` | Player's college | College filtering, rookie analysis |

## Physical Attributes
| Category | Description | Usage |
|----------|-------------|-------|
| `current_age_years` | Player's age | Age analysis, career trajectory prediction |
| `physical_height_str` | Height (appears inconsistent in sample) | Physical attribute comparison |
| `physical_weight_lbs` | Weight (appears inconsistent in sample) | Physical attribute comparison |
| `height` | Height in inches | Size analysis for position matchups |
| `weight` | Weight in pounds | Size/speed ratio analysis |

## Identifiers & Media
| Category | Description | Usage |
|----------|-------------|-------|
| `profileUrl` | Link to player profile | External reference |
| `headshot` | Player image URL | Visual display on cards and profiles |
| `hashtag` | Social media reference | Social integration features |
| `search_full_name`, `search_first_name`, `search_last_name` | Search-optimized name variations | Enhanced search functionality |
| `espn_id`, `yahoo_id`, `rotowire_id`, etc. | Cross-platform IDs | Data integration with other services |

## Draft & Career Information  
| Category | Description | Usage |
|----------|-------------|-------|
| `draft.year`, `draft.round`, `draft.pick`, `draft.team` | Draft details | Draft history, value analysis |
| `years_exp` | NFL experience | Veteran vs rookie analysis |
| `rookie_year` | First year in NFL | Experience timeline |
| `depth_chart_order` | Position on team depth chart | Playing time projection, fantasy value |
| `depth_chart_position` | Position on depth chart | Role analysis |

## Fantasy & Performance
| Category | Description | Usage |
|----------|-------------|-------|
| `fantasyPoints2024` | Projected fantasy points | Fantasy draft rankings |
| `fantasyRank2024` | Fantasy ranking | Draft position planning |
| `fantasyNotes` | Notes about fantasy outlook | Player analysis |
| `fantasy_positions` | Eligible fantasy positions | Position eligibility |
| `stats` | Performance statistics | Historical performance analysis |

## Status & Health
| Category | Description | Usage |
|----------|-------------|-------|
| `active` | Activity status | Filter active players |
| `status` | Current status (Active, etc.) | Availability tracking |
| `injury_status`, `injury_body_part`, `injury_notes` | Injury information | Injury tracking, risk assessment |
| `practice_participation`, `practice_description` | Practice status | Weekly lineup decisions |

## AI & Analytics
| Category | Description | Usage |
|----------|-------------|-------|
| `flags` | Notable attributes (e.g., "rookie") | Quick player categorization |
| `aiCommentary` | AI-generated insights | Player analysis |
| `aiScouted` | Whether AI has analyzed the player | Data completeness tracking |
| `search_rank` | Relevance ranking | Search result prioritization |

## Biographical Data
| Category | Description | Usage |
|----------|-------------|-------|
| `birthdate`, `birth_date` | Date of birth | Age calculations, milestone tracking |
| `birth_city`, `birth_state`, `birth_country` | Place of birth | Player background information |
| `high_school` | High school attended | Player development tracking |

## Integration Keys
| Category | Description | Usage |
|----------|-------------|-------|
| `sleeper_id`, `swish_id`, `stats_id`, etc. | IDs for other platforms | Cross-platform data integration |
| `sportradar_id`, `gsis_id` | IDs for stats services | Stats integration |

## Timestamps & Metadata
| Category | Description | Usage |
|----------|-------------|-------|
| `news_updated` | Last news update timestamp | Content freshness tracking |
| `team_changed_at` | When player changed teams | Transaction tracking |
| `metadata.channel_id` | Related data channel | Integration mapping |

## Application Use Cases

### Player Comparison Tool
- Combine physical attributes with performance stats to create meaningful position-specific comparisons
- Use `college` + `draft` data to compare players from the same school or draft class

### Fantasy Draft Helper
- Combine `depth_chart_position`, `injury_status`, and `fantasyPoints2024` to identify sleeper picks
- Use `flags` and `aiCommentary` to highlight potential breakout players

### Team Builder
- Use `position` and `fantasy_positions` to ensure balanced team construction
- Apply `age` and `years_exp` to balance veterans with high-upside young players

### Player Development Tracker
- Combine `birth_date`, `draft.year`, and performance stats to track player development against age curves
- Use `college` and `high_school` data to identify valuable development pipelines

### Injury Risk Assessment
- Combine historical `injury_notes` with `age` and `position` to estimate injury risk
- Use `practice_participation` patterns to predict game readiness

### Advanced Search Features
- Implement filtering by multiple categories (position, team, age range, experience level)
- Allow sorting by fantasy projections, draft position, or physical attributes

## Data Quality Notes
- Some fields appear inconsistently formatted (e.g., height/weight)
- Multiple ID systems present (playerId, player_id, espn_id, etc.) requiring mapping
- Some player names appear to have numbers appended (e.g., "Kyler Murray1")
- Consider data normalization for fields like birthdate which appears in multiple formats 