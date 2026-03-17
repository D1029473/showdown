import React, { useState, useRef, useEffect } from "react";
import {
  TYPE_COLORS,
  STATUS_ICON,
  STATUS_COLOR,
  CAT_ICON,
  MOVE_COLORS,
} from "../constants/typeColors";
import { MOVE_DATA } from "../data/moves";
import { POKEMON } from "../data/pokemon";
import { META_TEAMS } from "../data/metaTeams";
import {
  getTypeEff,
  effLabel,
  effectiveSpeed,
  calcDamage,
  initPkm,
  applyStatusMove,
  applySecondaryEff,
} from "../utils/battleUtils";
import { getCpuAction } from "../ai/advancedAI";

// -----------------------------------------------------------------------------
// FUNCIÓN PARA INICIALIZAR EL ESTADO DE LA BATALLA
// -----------------------------------------------------------------------------
function initBattle(playerTeam, cpuTeamMode) {
  const format = playerTeam[0]?.format || "ou";
  let cpuTeam;
  if (cpuTeamMode === "random") {
    const tierOrder = { uber: 5, ou: 4, uu: 3, nu: 2, pu: 1 };
    const availablePokemon = POKEMON.filter(
      (p) => tierOrder[p.tier.toLowerCase()] <= tierOrder[format]
    );
    const shuffled = [...availablePokemon]
      .sort(() => Math.random() - 0.5)
      .slice(0, 6);
    cpuTeam = shuffled.map((p) => initPkm(p));
  } else {
    const teams = META_TEAMS[format];
    if (teams && teams.length > 0) {
      const randomTeam = teams[Math.floor(Math.random() * teams.length)];
      cpuTeam = randomTeam.pokemon.map((p) => {
        const base = POKEMON.find((pkm) => pkm.id === p.id);
        return initPkm(base, p.moves);
      });
    } else {
      const tierOrder = { uber: 5, ou: 4, uu: 3, nu: 2, pu: 1 };
      const availablePokemon = POKEMON.filter(
        (p) => tierOrder[p.tier.toLowerCase()] <= tierOrder[format]
      );
      const shuffled = [...availablePokemon]
        .sort(() => Math.random() - 0.5)
        .slice(0, 6);
      cpuTeam = shuffled.map((p) => initPkm(p));
    }
  }

  return {
    phase: "choosing",
    playerTeam: playerTeam.map((p) => initPkm(p, p.selectedMoves)),
    cpuTeam: cpuTeam,
    playerIdx: 0,
    cpuIdx: 0,
    log: [
      "⚔️ ¡Comienza el combate!",
      `¡${playerTeam[0].name} VS ${cpuTeam[0].name}!`,
    ],
    turn: 1,
    winner: null,
    weather: null,
    weatherTurns: 0,
  };
}

// -----------------------------------------------------------------------------
// COMPONENTES AUXILIARES
// -----------------------------------------------------------------------------
function HpBar({ current, max, size = "normal" }) {
  const pct = max > 0 ? (current / max) * 100 : 0;
  const color = pct > 50 ? "#3EBD5E" : pct > 20 ? "#FFD700" : "#FF4D3B";
  return (
    <div
      style={{
        background: "#0d0d1a",
        borderRadius: 4,
        overflow: "hidden",
        height: size === "big" ? 10 : 6,
        flex: 1,
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: "100%",
          borderRadius: 4,
          background: color,
          transition: "width 0.5s ease",
        }}
      />
    </div>
  );
}

function PartyDots({ team }) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {team.map((p, i) => (
        <div
          key={i}
          style={{
            width: 14,
            height: 14,
            borderRadius: "50%",
            background:
              p.currentHp > 0
                ? p.currentHp / p.maxHp > 0.2
                  ? "#3EBD5E"
                  : "#FF4D3B"
                : "#333",
            border: "1px solid rgba(255,255,255,0.15)",
            flexShrink: 0,
          }}
          title={`${p.name} ${p.currentHp}/${p.maxHp}`}
        />
      ))}
    </div>
  );
}

// -----------------------------------------------------------------------------
// MOTOR DE COMBATE (executeTurn)
// -----------------------------------------------------------------------------
function executeTurn(state, action) {
  const s = JSON.parse(JSON.stringify(state));
  const msgs = [...s.log];
  const addLog = (msg) => msgs.push(msg);

  const cpuAction = getCpuAction(s);

  if (action.type === "switch") {
    const newIdx = action.targetIndex;
    if (s.playerTeam[newIdx].currentHp > 0 && newIdx !== s.playerIdx) {
      s.playerIdx = newIdx;
      addLog(`¡${s.playerTeam[newIdx].name}, adelante!`);
    }
  }

  if (cpuAction.type === "switch") {
    const newIdx = cpuAction.targetIndex;
    if (s.cpuTeam[newIdx].currentHp > 0 && newIdx !== s.cpuIdx) {
      s.cpuIdx = newIdx;
      addLog(`CPU envió a ${s.cpuTeam[newIdx].name}`);
    }
  }

  const playerMove = action.type === "move" ? action.moveName : null;
  const cpuMove = cpuAction.type === "move" ? cpuAction.moveName : null;

  const playerPrio = playerMove ? MOVE_DATA[playerMove]?.priority ?? 0 : -999;
  const cpuPrio = cpuMove ? MOVE_DATA[cpuMove]?.priority ?? 0 : -999;

  let playerFirst = false;
  if (playerMove && cpuMove) {
    if (playerPrio !== cpuPrio) {
      playerFirst = playerPrio > cpuPrio;
    } else {
      playerFirst =
        effectiveSpeed(s.playerTeam[s.playerIdx]) >=
        effectiveSpeed(s.cpuTeam[s.cpuIdx]);
    }
  } else if (playerMove && !cpuMove) {
    playerFirst = true;
  } else if (!playerMove && cpuMove) {
    playerFirst = false;
  }

  const actions = [];
  if (playerFirst) {
    if (playerMove) actions.push(["player", playerMove]);
    if (cpuMove) actions.push(["cpu", cpuMove]);
  } else {
    if (cpuMove) actions.push(["cpu", cpuMove]);
    if (playerMove) actions.push(["player", playerMove]);
  }

  for (const [side, moveName] of actions) {
    const atk =
      side === "player" ? s.playerTeam[s.playerIdx] : s.cpuTeam[s.cpuIdx];
    const def =
      side === "player" ? s.cpuTeam[s.cpuIdx] : s.playerTeam[s.playerIdx];
    if (atk.currentHp <= 0) continue;

    if (atk.status === "sleep") {
      if (--atk.statusTurns <= 0) {
        atk.status = null;
        addLog(`¡${atk.name} se despertó!`);
      } else {
        addLog(`${atk.name} está dormido... ZZZ`);
        continue;
      }
    }
    if (atk.status === "freeze") {
      if (Math.random() < 0.2) {
        atk.status = null;
        addLog(`¡${atk.name} se descongeló!`);
      } else {
        addLog(`${atk.name} está congelado sólidamente.`);
        continue;
      }
    }
    if (atk.status === "paralysis" && Math.random() < 0.25) {
      addLog(`¡${atk.name} está paralizado y no puede moverse!`);
      continue;
    }

    const move = MOVE_DATA[moveName] ?? {
      power: 40,
      acc: 100,
      cat: "physical",
      type: "normal",
    };
    addLog(`${side === "cpu" ? "CPU " : ""}${atk.name} usó ${moveName}`);

    if (Math.random() * 100 > move.acc * stageMult(atk.stages.accuracy)) {
      addLog(`¡${atk.name} falló!`);
      continue;
    }

    if (move.cat === "status") {
      const moveTarget = move.target === "self" ? atk : def;
      applyStatusMove(move.eff, moveTarget, addLog);

      if (move.eff === "weather_sun") {
        s.weather = "sun";
        s.weatherTurns = 5;
        addLog("¡El sol brilla con fuerza!");
      } else if (move.eff === "weather_rain") {
        s.weather = "rain";
        s.weatherTurns = 5;
        addLog("¡Comienza a llover!");
      } else if (move.eff === "weather_sand") {
        s.weather = "sand";
        s.weatherTurns = 5;
        addLog("¡Se levanta una tormenta de arena!");
      } else if (move.eff === "weather_hail") {
        s.weather = "hail";
        s.weatherTurns = 5;
        addLog("¡Comienza a granizar!");
      }
    } else {
      const te = getTypeEff(move.type, def.types);
      if (te === 0) {
        addLog(`¡No tiene ningún efecto sobre ${def.name}!`);
        continue;
      }
      const msg = effLabel(te);
      if (msg) addLog(msg);
      const dmg = calcDamage(atk, def, moveName, s.weather);
      def.currentHp = Math.max(0, def.currentHp - dmg);
      addLog(`${def.name} recibió ${dmg} de daño`);
      if (move.eff === "drain") {
        const h = Math.floor(dmg / 2);
        atk.currentHp = Math.min(atk.maxHp, atk.currentHp + h);
        addLog(`${atk.name} absorbió ${h} PS`);
      } else if (move.eff && def.currentHp > 0) {
        applySecondaryEff(move.eff, def, addLog);
      }
      if (def.currentHp <= 0) {
        addLog(`¡${def.name} se debilitó!`);
        const defTeam = side === "player" ? s.cpuTeam : s.playerTeam;
        const nextIdx = defTeam.findIndex(
          (p, i) =>
            i !== (side === "player" ? s.cpuIdx : s.playerIdx) &&
            p.currentHp > 0
        );
        if (nextIdx === -1) {
          s.winner = side;
          s.phase = "game_over";
          s.log = msgs.slice(-14);
          return s;
        } else {
          if (side === "player") {
            s.cpuIdx = nextIdx;
            addLog(`CPU envió a ${s.cpuTeam[nextIdx].name}`);
          } else {
            s.phase = "switching";
            s.log = msgs.slice(-14);
            return s;
          }
        }
        break;
      }
    }
  }

  // Daño por estado
  if (s.playerTeam[s.playerIdx] && s.playerTeam[s.playerIdx].currentHp > 0) {
    const p = s.playerTeam[s.playerIdx];
    const dot =
      p.status === "poison"
        ? Math.max(1, Math.floor(p.maxHp / 8))
        : p.status === "burn"
        ? Math.max(1, Math.floor(p.maxHp / 16))
        : 0;
    if (dot > 0) {
      p.currentHp = Math.max(0, p.currentHp - dot);
      addLog(
        `${p.name} sufrió ${dot} daño por ${
          p.status === "poison" ? "veneno" : "quemadura"
        }`
      );
      if (p.currentHp <= 0) {
        addLog(`¡${p.name} se debilitó!`);
        const nextIdx = s.playerTeam.findIndex(
          (p2, i) => i !== s.playerIdx && p2.currentHp > 0
        );
        if (nextIdx === -1) {
          s.winner = "cpu";
          s.phase = "game_over";
        } else {
          s.phase = "switching";
        }
      }
    }
  }
  if (s.cpuTeam[s.cpuIdx] && s.cpuTeam[s.cpuIdx].currentHp > 0) {
    const p = s.cpuTeam[s.cpuIdx];
    const dot =
      p.status === "poison"
        ? Math.max(1, Math.floor(p.maxHp / 8))
        : p.status === "burn"
        ? Math.max(1, Math.floor(p.maxHp / 16))
        : 0;
    if (dot > 0) {
      p.currentHp = Math.max(0, p.currentHp - dot);
      addLog(
        `${p.name} sufrió ${dot} daño por ${
          p.status === "poison" ? "veneno" : "quemadura"
        }`
      );
      if (p.currentHp <= 0) {
        addLog(`¡${p.name} se debilitó!`);
        const nextIdx = s.cpuTeam.findIndex(
          (p2, i) => i !== s.cpuIdx && p2.currentHp > 0
        );
        if (nextIdx === -1) {
          s.winner = "player";
          s.phase = "game_over";
        } else {
          s.cpuIdx = nextIdx;
          addLog(`CPU envió a ${s.cpuTeam[nextIdx].name}`);
        }
      }
    }
  }

  // Daño por clima
  if (s.weather && s.weatherTurns > 0) {
    const p = s.playerTeam[s.playerIdx];
    if (p && p.currentHp > 0) {
      let weatherDamage = 0;
      if (
        s.weather === "sand" &&
        !p.types.some((t) => ["rock", "ground", "steel"].includes(t))
      ) {
        weatherDamage = Math.max(1, Math.floor(p.maxHp / 16));
      } else if (s.weather === "hail" && !p.types.includes("ice")) {
        weatherDamage = Math.max(1, Math.floor(p.maxHp / 16));
      }
      if (weatherDamage > 0) {
        p.currentHp = Math.max(0, p.currentHp - weatherDamage);
        addLog(`${p.name} sufre ${weatherDamage} de daño por el clima.`);
        if (p.currentHp <= 0) {
          addLog(`¡${p.name} se debilitó!`);
          const nextIdx = s.playerTeam.findIndex(
            (p2, i) => i !== s.playerIdx && p2.currentHp > 0
          );
          if (nextIdx === -1) {
            s.winner = "cpu";
            s.phase = "game_over";
          } else {
            s.phase = "switching";
          }
        }
      }
    }
    const c = s.cpuTeam[s.cpuIdx];
    if (c && c.currentHp > 0) {
      let weatherDamage = 0;
      if (
        s.weather === "sand" &&
        !c.types.some((t) => ["rock", "ground", "steel"].includes(t))
      ) {
        weatherDamage = Math.max(1, Math.floor(c.maxHp / 16));
      } else if (s.weather === "hail" && !c.types.includes("ice")) {
        weatherDamage = Math.max(1, Math.floor(c.maxHp / 16));
      }
      if (weatherDamage > 0) {
        c.currentHp = Math.max(0, c.currentHp - weatherDamage);
        addLog(`${c.name} sufre ${weatherDamage} de daño por el clima.`);
        if (c.currentHp <= 0) {
          addLog(`¡${c.name} se debilitó!`);
          const nextIdx = s.cpuTeam.findIndex(
            (p2, i) => i !== s.cpuIdx && p2.currentHp > 0
          );
          if (nextIdx === -1) {
            s.winner = "player";
            s.phase = "game_over";
          } else {
            s.cpuIdx = nextIdx;
            addLog(`CPU envió a ${s.cpuTeam[nextIdx].name}`);
          }
        }
      }
    }
    s.weatherTurns--;
    if (s.weatherTurns <= 0) {
      s.weather = null;
      addLog("El clima volvió a la normalidad.");
    }
  }

  if (s.phase !== "game_over" && s.phase !== "switching") {
    s.phase = "choosing";
    s.turn++;
  }

  s.log = msgs.slice(-14);
  return s;
}

// -----------------------------------------------------------------------------
// COMPONENTE PRINCIPAL BattleScreen
// -----------------------------------------------------------------------------
export default function BattleScreen({ playerTeam, cpuTeamMode, onBack, viewMode }) {
  const [bs, setBs] = useState(() => initBattle(playerTeam, cpuTeamMode));
  const logRef = useRef(null);
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [bs.log]);

  const player = bs.playerTeam[bs.playerIdx];
  const cpu = bs.cpuTeam[bs.cpuIdx];

  function handleMove(mn) {
    if (bs.phase !== "choosing") return;
    setBs((prev) => executeTurn(prev, { type: "move", moveName: mn }));
  }

  function handleSwitch(idx, isVoluntary = false) {
    setBs((prev) => {
      if (isVoluntary) {
        return executeTurn(prev, { type: "switch", targetIndex: idx });
      } else {
        const s = JSON.parse(JSON.stringify(prev));
        s.playerIdx = idx;
        s.phase = "choosing";
        s.log = [...s.log, `¡${s.playerTeam[idx].name}, adelante!`].slice(-14);
        return s;
      }
    });
  }

  if (bs.phase === "game_over") {
    const won = bs.winner === "player";
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0d0d1a",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          padding: viewMode === "mobile" ? 16 : 32,
        }}
      >
        <div style={{ fontSize: viewMode === "mobile" ? 60 : 80 }}>
          {won ? "🏆" : "💀"}
        </div>
        <div
          style={{
            fontSize: viewMode === "mobile" ? 32 : 42,
            fontWeight: 900,
            color: won ? "#FFD700" : "#FF4D3B",
            textShadow: "0 0 40px currentColor",
            letterSpacing: 3,
          }}
        >
          {won ? "¡VICTORIA!" : "¡DERROTA!"}
        </div>
        <div
          style={{ fontSize: viewMode === "mobile" ? 14 : 16, color: "#666" }}
        >
          {won ? "¡Has derrotado a la IA!" : "Tu equipo fue derrotado."}
        </div>
        <div
          style={{
            display: "flex",
            gap: viewMode === "mobile" ? 8 : 16,
            marginTop: 8,
          }}
        >
          <button
            onClick={() => setBs(initBattle(playerTeam, cpuTeamMode))}
            style={{
              background: "linear-gradient(135deg,#3EBD5E,#1a8a3a)",
              border: "none",
              color: "white",
              padding: viewMode === "mobile" ? "10px 20px" : "12px 28px",
              borderRadius: 8,
              fontWeight: 800,
              fontSize: viewMode === "mobile" ? 13 : 15,
              cursor: "pointer",
              letterSpacing: 1,
            }}
          >
            🔄 Revancha
          </button>
          <button
            onClick={onBack}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid #2a2a4a",
              color: "#aaa",
              padding: viewMode === "mobile" ? "10px 20px" : "12px 28px",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: viewMode === "mobile" ? 13 : 15,
              cursor: "pointer",
            }}
          >
            ← Volver al equipo
          </button>
        </div>
        <div
          style={{
            marginTop: 16,
            display: "flex",
            gap: viewMode === "mobile" ? 16 : 32,
          }}
        >
          {[
            ["Tu equipo", bs.playerTeam],
            ["Rival CPU", bs.cpuTeam],
          ].map(([label, t]) => (
            <div key={label}>
              <div
                style={{
                  fontSize: viewMode === "mobile" ? 11 : 12,
                  color: "#555",
                  marginBottom: 8,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                {label}
              </div>
              {t.map((p, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 4,
                    opacity: p.currentHp > 0 ? 1 : 0.4,
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: p.currentHp > 0 ? "#3EBD5E" : "#FF4D3B",
                    }}
                  />
                  <span
                    style={{
                      fontSize: viewMode === "mobile" ? 12 : 13,
                      color: p.currentHp > 0 ? "white" : "#555",
                    }}
                  >
                    {p.name}
                  </span>
                  <span
                    style={{
                      fontSize: viewMode === "mobile" ? 10 : 11,
                      color: "#555",
                    }}
                  >
                    {p.currentHp}/{p.maxHp}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (bs.phase === "switching" || bs.phase === "switching_voluntary") {
    const isVoluntary = bs.phase === "switching_voluntary";
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0d0d1a",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: viewMode === "mobile" ? 16 : 20,
          padding: viewMode === "mobile" ? 16 : 32,
        }}
      >
        <div style={{ fontSize: viewMode === "mobile" ? 30 : 36 }}>💫</div>
        <div
          style={{
            fontSize: viewMode === "mobile" ? 18 : 22,
            fontWeight: 800,
            color: "white",
          }}
        >
          {isVoluntary
            ? "Elige tu próximo Pokémon (cambio voluntario)"
            : "¡Elige tu próximo Pokémon!"}
        </div>
        <div
          style={{ fontSize: viewMode === "mobile" ? 12 : 14, color: "#666" }}
        >
          {isVoluntary
            ? "El turno continuará después del cambio."
            : "El equipo CPU espera..."}
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: viewMode === "mobile" ? 8 : 12,
            justifyContent: "center",
            marginTop: 8,
          }}
        >
          {bs.playerTeam.map((p, i) => {
            if (p.currentHp <= 0 || i === bs.playerIdx) return null;
            return (
              <button
                key={i}
                onClick={() => handleSwitch(i, isVoluntary)}
                style={{
                  background: "rgba(22,33,62,0.9)",
                  border: "2px solid #2a2a4a",
                  borderRadius: 16,
                  padding: viewMode === "mobile" ? "12px 16px" : "16px 20px",
                  cursor: "pointer",
                  width: viewMode === "mobile" ? 140 : 160,
                  textAlign: "center",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = "#FF4D3B")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = "#2a2a4a")
                }
              >
                <img
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`}
                  alt={p.name}
                  style={{
                    width: viewMode === "mobile" ? 56 : 64,
                    height: viewMode === "mobile" ? 56 : 64,
                    imageRendering: "pixelated",
                    display: "block",
                    margin: "0 auto",
                  }}
                />
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: viewMode === "mobile" ? 13 : 14,
                    color: "white",
                    marginTop: 4,
                  }}
                >
                  {p.name}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 3,
                    justifyContent: "center",
                    margin: "4px 0",
                  }}
                >
                  {p.types.map((t) => (
                    <span
                      key={t}
                      style={{
                        background: TYPE_COLORS[t],
                        color: "white",
                        fontSize: viewMode === "mobile" ? 8 : 9,
                        padding: "1px 6px",
                        borderRadius: 10,
                        fontWeight: 800,
                        textTransform: "uppercase",
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      fontSize: viewMode === "mobile" ? 10 : 11,
                      color: "#aaa",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {p.currentHp}/{p.maxHp}
                  </span>
                  <HpBar current={p.currentHp} max={p.maxHp} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const moveColors = {
    physical: "#CC3300",
    special: "#4D90FF",
    status: "#9B44B7",
  };

  return (
    <div
      style={{
        height: "100vh",
        background: "#0a0a15",
        display: "flex",
        flexDirection: "column",
        fontFamily: "monospace",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: viewMode === "mobile" ? "6px 12px" : "8px 16px",
          borderBottom: "1px solid #1e1e2e",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#0d0d1a",
          flexShrink: 0,
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "1px solid #2a2a4a",
            color: "#666",
            padding: viewMode === "mobile" ? "3px 8px" : "4px 12px",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: viewMode === "mobile" ? 11 : 12,
          }}
        >
          ← Rendirse
        </button>
        <div
          style={{
            fontSize: viewMode === "mobile" ? 12 : 13,
            fontWeight: 800,
            color: "#FF4D3B",
            letterSpacing: 2,
          }}
        >
          ⚔️ COMBATE — TURNO {bs.turn}
        </div>
        <div
          style={{ fontSize: viewMode === "mobile" ? 10 : 11, color: "#555" }}
        >
          IA vs Jugador
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            flex: "0 0 auto",
            padding: viewMode === "mobile" ? "8px 12px 4px" : "12px 20px 6px",
            background:
              "linear-gradient(180deg,rgba(22,33,62,0.4),transparent)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: 6,
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    fontWeight: 900,
                    fontSize: viewMode === "mobile" ? 14 : 15,
                    color: "white",
                  }}
                >
                  CPU: {cpu.name}
                </span>
                {cpu.status && (
                  <span
                    style={{
                      background: STATUS_COLOR[cpu.status],
                      color: "black",
                      fontSize: viewMode === "mobile" ? 9 : 10,
                      padding: "1px 7px",
                      borderRadius: 10,
                      fontWeight: 800,
                    }}
                  >
                    {STATUS_ICON[cpu.status]} {cpu.status.toUpperCase()}
                  </span>
                )}
              </div>
              <div style={{ display: "flex", gap: 4, marginTop: 2 }}>
                {cpu.types.map((t) => (
                  <span
                    key={t}
                    style={{
                      background: TYPE_COLORS[t],
                      color: "white",
                      fontSize: viewMode === "mobile" ? 8 : 9,
                      padding: "1px 6px",
                      borderRadius: 10,
                      fontWeight: 800,
                      textTransform: "uppercase",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <PartyDots team={bs.cpuTeam} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                fontSize: viewMode === "mobile" ? 10 : 11,
                color: "#aaa",
                whiteSpace: "nowrap",
              }}
            >
              {cpu.currentHp}/{cpu.maxHp} PS
            </span>
            <HpBar current={cpu.currentHp} max={cpu.maxHp} size="big" />
          </div>
          <div style={{ textAlign: "right", marginTop: 4 }}>
            <img
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${cpu.id}.png`}
              alt={cpu.name}
              style={{
                width: viewMode === "mobile" ? 64 : 80,
                height: viewMode === "mobile" ? 64 : 80,
                imageRendering: "pixelated",
                filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.8))",
              }}
            />
          </div>
        </div>

        <div
          ref={logRef}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: viewMode === "mobile" ? "6px 12px" : "8px 20px",
            borderTop: "1px solid #1a1a2e",
            borderBottom: "1px solid #1a1a2e",
            background: "rgba(0,0,0,0.3)",
          }}
        >
          {bs.log.map((msg, i) => {
            const isEff = msg.includes("eficaz") || msg.includes("efecto");
            const isFaint = msg.includes("debilitó");
            const isStatus =
              msg.includes("envenenado") ||
              msg.includes("quemado") ||
              msg.includes("paralizado") ||
              msg.includes("congelado") ||
              msg.includes("dormido");
            const isPrio = msg.includes("prioridad");
            return (
              <div
                key={i}
                style={{
                  fontSize: viewMode === "mobile" ? 11 : 12,
                  padding: "2px 0",
                  color: isFaint
                    ? "#FF4D3B"
                    : isEff
                    ? "#FFD700"
                    : isStatus
                    ? "#9B44B7"
                    : isPrio
                    ? "#5BC8D8"
                    : "#ccc",
                  fontWeight: isFaint || isEff || isPrio ? 700 : 400,
                }}
              >
                {i === bs.log.length - 1 ? "▶ " : "  "}
                {msg}
              </div>
            );
          })}
        </div>

        <div
          style={{
            flex: "0 0 auto",
            padding: viewMode === "mobile" ? "4px 12px 6px" : "6px 20px 8px",
            background: "linear-gradient(0deg,rgba(22,33,62,0.4),transparent)",
          }}
        >
          <div style={{ textAlign: "left", marginBottom: 4 }}>
            <img
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${player.id}.png`}
              alt={player.name}
              style={{
                width: viewMode === "mobile" ? 64 : 80,
                height: viewMode === "mobile" ? 64 : 80,
                imageRendering: "pixelated",
                filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.8))",
                transform: "scaleX(-1)",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: 6,
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    fontWeight: 900,
                    fontSize: viewMode === "mobile" ? 14 : 15,
                    color: "white",
                  }}
                >
                  TÚ: {player.name}
                </span>
                {player.status && (
                  <span
                    style={{
                      background: STATUS_COLOR[player.status],
                      color: "black",
                      fontSize: viewMode === "mobile" ? 9 : 10,
                      padding: "1px 7px",
                      borderRadius: 10,
                      fontWeight: 800,
                    }}
                  >
                    {STATUS_ICON[player.status]} {player.status.toUpperCase()}
                  </span>
                )}
              </div>
              <div style={{ display: "flex", gap: 4, marginTop: 2 }}>
                {player.types.map((t) => (
                  <span
                    key={t}
                    style={{
                      background: TYPE_COLORS[t],
                      color: "white",
                      fontSize: viewMode === "mobile" ? 8 : 9,
                      padding: "1px 6px",
                      borderRadius: 10,
                      fontWeight: 800,
                      textTransform: "uppercase",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <PartyDots team={bs.playerTeam} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                fontSize: viewMode === "mobile" ? 10 : 11,
                color: "#aaa",
                whiteSpace: "nowrap",
              }}
            >
              {player.currentHp}/{player.maxHp} PS
            </span>
            <HpBar current={player.currentHp} max={player.maxHp} size="big" />
          </div>
        </div>

        <div
          style={{
            flexShrink: 0,
            padding: viewMode === "mobile" ? "8px 12px 12px" : "10px 16px 14px",
            borderTop: "2px solid #1e1e2e",
            background: "#0d0d1a",
          }}
        >
          <div
            style={{
              fontSize: viewMode === "mobile" ? 9 : 10,
              color: "#555",
              marginBottom: 8,
              textTransform: "uppercase",
              letterSpacing: 2,
              fontWeight: 700,
            }}
          >
            Elige un movimiento
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: viewMode === "mobile" ? 6 : 8,
            }}
          >
            {player.battleMoves.map((mn) => {
              const mv = MOVE_DATA[mn] ?? {
                power: 40,
                cat: "physical",
                type: "normal",
              };
              const te =
                mv.cat !== "status" ? getTypeEff(mv.type, cpu.types) : null;
              const teColor =
                te === 0
                  ? "#555"
                  : te >= 2
                  ? "#FFD700"
                  : te <= 0.5
                  ? "#FF4D3B"
                  : null;
              const prio = mv.priority ?? 0;
              const isSelf = mv.cat === "status" && mv.target === "self";
              const disabled = bs.phase !== "choosing";
              return (
                <button
                  key={mn}
                  onClick={() => handleMove(mn)}
                  disabled={disabled}
                  style={{
                    background: disabled
                      ? "rgba(13,13,26,0.6)"
                      : "rgba(22,33,62,0.8)",
                    border: `2px solid ${
                      disabled ? "#1a1a2e" : TYPE_COLORS[mv.type] || "#2a2a4a"
                    }`,
                    color: disabled ? "#333" : "white",
                    borderRadius: 10,
                    padding: viewMode === "mobile" ? "6px 8px" : "8px 12px",
                    cursor: disabled ? "default" : "pointer",
                    textAlign: "left",
                    transition: "all 0.12s",
                    display: "flex",
                    flexDirection: "column",
                    gap: 3,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: viewMode === "mobile" ? 12 : 13,
                      }}
                    >
                      {mn}
                    </span>
                    <div
                      style={{ display: "flex", gap: 4, alignItems: "center" }}
                    >
                      {prio > 0 && (
                        <span
                          style={{
                            fontSize: viewMode === "mobile" ? 8 : 9,
                            color: "#FFD700",
                            fontWeight: 900,
                            background: "rgba(255,215,0,0.15)",
                            padding: "0 4px",
                            borderRadius: 4,
                          }}
                        >
                          ⚡+{prio}
                        </span>
                      )}
                      {isSelf && (
                        <span
                          style={{
                            fontSize: viewMode === "mobile" ? 8 : 9,
                            color: "#5BC8D8",
                            fontWeight: 800,
                          }}
                        >
                          ↩self
                        </span>
                      )}
                      {teColor && !isSelf && (
                        <span
                          style={{
                            fontSize: viewMode === "mobile" ? 9 : 10,
                            color: teColor,
                            fontWeight: 800,
                          }}
                        >
                          {te === 0 ? "✗" : te >= 2 ? "▲" : "▼"}
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    style={{ display: "flex", gap: 6, alignItems: "center" }}
                  >
                    <span
                      style={{
                        background: TYPE_COLORS[mv.type] || "#555",
                        color: "white",
                        fontSize: viewMode === "mobile" ? 8 : 9,
                        padding: "1px 6px",
                        borderRadius: 8,
                        fontWeight: 800,
                        textTransform: "uppercase",
                      }}
                    >
                      {mv.type}
                    </span>
                    <span
                      style={{
                        fontSize: viewMode === "mobile" ? 9 : 10,
                        color: moveColors[mv.cat] || "#888",
                      }}
                    >
                      {CAT_ICON[mv.cat]} {mv.cat}
                    </span>
                    {mv.power > 0 && (
                      <span
                        style={{
                          fontSize: viewMode === "mobile" ? 9 : 10,
                          color: "#888",
                        }}
                      >
                        💥{mv.power}
                      </span>
                    )}
                    {mv.cat === "status" && (
                      <span
                        style={{
                          fontSize: viewMode === "mobile" ? 9 : 10,
                          color: "#888",
                        }}
                      >
                        Estado
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
            <button
              onClick={() =>
                setBs((prev) => ({ ...prev, phase: "switching_voluntary" }))
              }
              disabled={bs.phase !== "choosing"}
              style={{
                gridColumn: "span 2",
                background:
                  bs.phase !== "choosing" ? "rgba(13,13,26,0.6)" : "#2a2a4a",
                border: `2px solid ${
                  bs.phase !== "choosing" ? "#1a1a2e" : "#4D90FF"
                }`,
                color: bs.phase !== "choosing" ? "#333" : "white",
                borderRadius: 10,
                padding: viewMode === "mobile" ? "8px" : "10px",
                fontWeight: 700,
                cursor: bs.phase !== "choosing" ? "default" : "pointer",
                fontSize: viewMode === "mobile" ? 13 : 14,
              }}
            >
              🔄 Cambiar Pokémon
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
