import React, { useState } from "react";
import { TYPE_COLORS, MOVE_COLORS, STAT_ABBR } from "./constants/typeColors";
import { MOVE_DATA } from "./data/moves";
import { POKEMON } from "./data/pokemon";
import BattleScreen from "./components/BattleScreen";

const TypeBadge = ({ type }) => (
  <span
    style={{
      background: TYPE_COLORS[type] || "#888",
      color: "white",
      padding: "2px 10px",
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 800,
      letterSpacing: 1,
      textTransform: "uppercase",
      textShadow: "0 1px 2px rgba(0,0,0,0.4)",
    }}
  >
    {type}
  </span>
);

const StatBar = ({ name, value }) => (
  <div
    style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}
  >
    <span
      style={{
        width: 36,
        fontSize: 11,
        color: "#FF6B6B",
        fontWeight: 700,
        textAlign: "right",
      }}
    >
      {STAT_ABBR[name]}
    </span>
    <span
      style={{ width: 28, fontSize: 11, color: "#ccc", textAlign: "right" }}
    >
      {value}
    </span>
    <div
      style={{
        flex: 1,
        background: "#0d0d1a",
        borderRadius: 4,
        overflow: "hidden",
        height: 6,
      }}
    >
      <div
        style={{
          width: `${Math.min(100, (value / 255) * 100)}%`,
          height: "100%",
          borderRadius: 4,
          background:
            value >= 100 ? "#3EBD5E" : value >= 60 ? "#FFD700" : "#FF4D3B",
          transition: "width 0.4s ease",
        }}
      />
    </div>
  </div>
);

const sprite = (id) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

export default function App() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [preview, setPreview] = useState(null);
  const [team, setTeam] = useState([]);
  const [notification, setNotification] = useState(null);
  const [inBattle, setInBattle] = useState(false);
  const [cpuMode, setCpuMode] = useState("random");
  const [format, setFormat] = useState("ou");
  const [viewMode, setViewMode] = useState("desktop");
  const PAGE_SIZE = 30;

  const tierOrder = { uber: 5, ou: 4, uu: 3, nu: 2, pu: 1 };
  const filteredByTier = POKEMON.filter(
    (p) => tierOrder[p.tier.toLowerCase()] <= tierOrder[format]
  );

  const tierPriority = { uber: 1, ou: 2, uu: 3, nu: 4, pu: 5 };
  const sortedByTier = [...filteredByTier].sort((a, b) => {
    const tierA = a.tier.toLowerCase();
    const tierB = b.tier.toLowerCase();
    if (tierPriority[tierA] !== tierPriority[tierB]) {
      return tierPriority[tierA] - tierPriority[tierB];
    }
    return a.name.localeCompare(b.name);
  });

  const filtered = sortedByTier.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const notify = (msg, type = "info") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 2500);
  };

  const toggleMove = (moveName) => {
    setPreview((prev) => {
      if (!prev) return prev;
      const sel = prev.selectedMoves || [];
      if (sel.includes(moveName))
        return { ...prev, selectedMoves: sel.filter((m) => m !== moveName) };
      if (sel.length >= 4) {
        notify("Máximo 4 movimientos", "warning");
        return prev;
      }
      return { ...prev, selectedMoves: [...sel, moveName] };
    });
  };

  const inTeam = (id) => team.some((p) => p.id === id);
  const addToTeam = () => {
    if (!preview) return;
    if (!preview.selectedMoves || preview.selectedMoves.length === 0) {
      notify("Selecciona al menos 1 movimiento", "warning");
      return;
    }
    if (inTeam(preview.id)) {
      notify(`${preview.name} ya está en el equipo`, "warning");
      return;
    }
    if (team.length >= 6) {
      notify("Equipo lleno (máx. 6)", "warning");
      return;
    }
    setTeam((prev) => [...prev, { ...preview, format }]);
    notify(`✓ ${preview.name} añadido al equipo`, "success");
  };

  if (inBattle) {
    const teamWithFormat = team.map((p) => ({ ...p, format }));
    return (
      <BattleScreen
        playerTeam={teamWithFormat}
        cpuTeamMode={cpuMode}
        onBack={() => setInBattle(false)}
        viewMode={viewMode}
      />
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0d0d1a",
        color: "white",
        fontFamily: "'Segoe UI',system-ui,sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {notification && (
        <div
          style={{
            position: "fixed",
            top: 20,
            left: "50%",
            transform: "translateX(-50%)",
            background:
              notification.type === "success"
                ? "#1a3a1a"
                : notification.type === "warning"
                ? "#3a2a0a"
                : "#0a1a3a",
            border: `1px solid ${
              notification.type === "success"
                ? "#3EBD5E"
                : notification.type === "warning"
                ? "#FFD700"
                : "#4D90FF"
            }`,
            borderRadius: 8,
            padding: viewMode === "mobile" ? "8px 16px" : "10px 20px",
            fontSize: viewMode === "mobile" ? 12 : 13,
            fontWeight: 600,
            zIndex: 9999,
            whiteSpace: "nowrap",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          }}
        >
          {notification.msg}
        </div>
      )}

      <div
        style={{
          padding: viewMode === "mobile" ? "10px 16px" : "14px 24px",
          borderBottom: "1px solid #1e1e2e",
          display: "flex",
          alignItems: "center",
          gap: viewMode === "mobile" ? 8 : 16,
          background: "#0a0a15",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontSize: viewMode === "mobile" ? 18 : 22,
            fontWeight: 900,
            background: "linear-gradient(135deg,#FF4D3B,#FF8C42)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          ⚔️ Pokémon Showdown
        </div>
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          placeholder="Buscar Pokémon..."
          style={{
            flex: 1,
            maxWidth: viewMode === "mobile" ? 200 : 300,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid #2a2a4a",
            borderRadius: 8,
            padding: viewMode === "mobile" ? "6px 10px" : "7px 14px",
            color: "white",
            fontSize: viewMode === "mobile" ? 12 : 13,
            outline: "none",
          }}
        />
        <button
          onClick={() =>
            setViewMode((v) => (v === "desktop" ? "mobile" : "desktop"))
          }
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid #2a2a4a",
            borderRadius: 6,
            padding: viewMode === "mobile" ? "4px 8px" : "5px 10px",
            fontSize: viewMode === "mobile" ? 16 : 18,
            cursor: "pointer",
            color: "#ccc",
          }}
        >
          {viewMode === "desktop" ? "📱" : "💻"}
        </button>
        <div
          style={{
            marginLeft: "auto",
            fontSize: viewMode === "mobile" ? 11 : 12,
            color: "#555",
          }}
        >
          {POKEMON.length} Pokémon
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          overflow: "hidden",
          flexDirection: viewMode === "mobile" ? "column" : "row",
        }}
      >
        {/* Columna izquierda: lista de Pokémon */}
        <div
          style={{
            width: viewMode === "mobile" ? "100%" : 320,
            borderRight: viewMode === "mobile" ? "none" : "1px solid #1e1e2e",
            borderBottom: viewMode === "mobile" ? "1px solid #1e1e2e" : "none",
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
            maxHeight: viewMode === "mobile" ? "30vh" : "none",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: viewMode === "mobile" ? "6px 10px" : "8px 12px",
              borderBottom: "1px solid #1e1e2e",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                style={{
                  background: "none",
                  border: "1px solid #2a2a4a",
                  color: page === 0 ? "#333" : "#888",
                  padding: viewMode === "mobile" ? "2px 8px" : "3px 10px",
                  borderRadius: 6,
                  cursor: page === 0 ? "default" : "pointer",
                  fontSize: viewMode === "mobile" ? 11 : 12,
                }}
              >
                ◀
              </button>
              <span
                style={{
                  fontSize: viewMode === "mobile" ? 11 : 12,
                  color: "#555",
                }}
              >
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                style={{
                  background: "none",
                  border: "1px solid #2a2a4a",
                  color: page >= totalPages - 1 ? "#333" : "#888",
                  padding: viewMode === "mobile" ? "2px 8px" : "3px 10px",
                  borderRadius: 6,
                  cursor: page >= totalPages - 1 ? "default" : "pointer",
                  fontSize: viewMode === "mobile" ? 11 : 12,
                }}
              >
                ▶
              </button>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span
                style={{
                  fontSize: viewMode === "mobile" ? 11 : 12,
                  color: "#888",
                }}
              >
                Formato:
              </span>
              <select
                value={format}
                onChange={(e) => {
                  setFormat(e.target.value);
                  setPage(0);
                }}
                style={{
                  background: "#1a1a2e",
                  color: "white",
                  border: "1px solid #2a2a4a",
                  borderRadius: 4,
                  padding: viewMode === "mobile" ? "2px" : "4px",
                  fontSize: viewMode === "mobile" ? 11 : 12,
                }}
              >
                <option value="uber">Uber</option>
                <option value="ou">OU</option>
                <option value="uu">UU</option>
                <option value="nu">NU</option>
                <option value="pu">PU</option>
              </select>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {paged.map((p) => (
              <div
                key={p.id}
                onClick={() =>
                  setPreview(
                    team.find((t) => t.id === p.id) || {
                      ...p,
                      selectedMoves: [],
                    }
                  )
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: viewMode === "mobile" ? "6px 10px" : "8px 12px",
                  borderBottom: "1px solid #111",
                  cursor: "pointer",
                  background:
                    preview?.id === p.id
                      ? "rgba(255,77,59,0.08)"
                      : inTeam(p.id)
                      ? "rgba(62,189,94,0.04)"
                      : "transparent",
                  transition: "background 0.1s",
                }}
              >
                <img
                  src={sprite(p.id)}
                  alt={p.name}
                  style={{
                    width: viewMode === "mobile" ? 32 : 40,
                    height: viewMode === "mobile" ? 32 : 40,
                    imageRendering: "pixelated",
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{ display: "flex", alignItems: "baseline", gap: 6 }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: viewMode === "mobile" ? 12 : 13,
                      }}
                    >
                      {p.name}
                    </span>
                    <span
                      style={{
                        fontSize: viewMode === "mobile" ? 9 : 10,
                        color: "#444",
                      }}
                    >
                      #{String(p.id).padStart(3, "0")}
                    </span>
                    {inTeam(p.id) && (
                      <span
                        style={{
                          fontSize: viewMode === "mobile" ? 9 : 10,
                          color: "#3EBD5E",
                          fontWeight: 700,
                        }}
                      >
                        ✓
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 4, marginTop: 2 }}>
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
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Columna central: previsualización */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {preview ? (
            <div
              style={{ padding: viewMode === "mobile" ? "16px" : "24px 28px" }}
            >
              <div
                style={{
                  display: "flex",
                  gap: viewMode === "mobile" ? 12 : 24,
                  marginBottom: 28,
                  background:
                    "linear-gradient(135deg,rgba(22,33,62,0.8),rgba(13,13,26,0.8))",
                  borderRadius: 16,
                  padding: viewMode === "mobile" ? "12px" : 20,
                  border: "1px solid #1e1e2e",
                  flexDirection: viewMode === "mobile" ? "column" : "row",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <img
                    src={sprite(preview.id)}
                    alt={preview.name}
                    style={{
                      width: viewMode === "mobile" ? 80 : 120,
                      height: viewMode === "mobile" ? 80 : 120,
                      imageRendering: "pixelated",
                      display: "block",
                      margin: viewMode === "mobile" ? "0 auto" : "0",
                    }}
                  />
                  <div
                    style={{
                      fontSize: viewMode === "mobile" ? 11 : 12,
                      color: "#555",
                      marginTop: 4,
                    }}
                  >
                    BST:{" "}
                    <span style={{ color: "#FFD700", fontWeight: 700 }}>
                      {preview.stats.reduce((s, x) => s + x.value, 0)}
                    </span>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{ display: "flex", alignItems: "baseline", gap: 12 }}
                  >
                    <h2
                      style={{
                        margin: 0,
                        fontSize: viewMode === "mobile" ? 20 : 26,
                        fontWeight: 900,
                      }}
                    >
                      {preview.name}
                    </h2>
                    <span
                      style={{
                        color: "#555",
                        fontSize: viewMode === "mobile" ? 12 : 14,
                      }}
                    >
                      #{String(preview.id).padStart(3, "0")}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      marginTop: 8,
                      marginBottom: 16,
                    }}
                  >
                    {preview.types.map((t) => (
                      <TypeBadge key={t} type={t} />
                    ))}
                  </div>
                  {preview.stats.map((s) => (
                    <StatBar key={s.name} name={s.name} value={s.value} />
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: viewMode === "mobile" ? 13 : 14,
                      color: "#FF6B6B",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Movimientos seleccionados
                  </h3>
                  <span
                    style={{
                      fontSize: viewMode === "mobile" ? 11 : 12,
                      color: "#555",
                    }}
                  >
                    {(preview.selectedMoves || []).length}/4
                  </span>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      viewMode === "mobile" ? "1fr" : "1fr 1fr",
                    gap: 8,
                    marginBottom: 16,
                  }}
                >
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      style={{
                        background: "rgba(13,13,26,0.8)",
                        border: `1px solid ${
                          (preview.selectedMoves || [])[i]
                            ? MOVE_COLORS[i]
                            : "#1e1e2e"
                        }`,
                        borderRadius: 8,
                        padding:
                          viewMode === "mobile" ? "8px 10px" : "10px 14px",
                        minHeight: viewMode === "mobile" ? 32 : 40,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: MOVE_COLORS[i],
                          marginRight: 10,
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: viewMode === "mobile" ? 12 : 13,
                          color: (preview.selectedMoves || [])[i]
                            ? "white"
                            : "#444",
                          flex: 1,
                        }}
                      >
                        {(preview.selectedMoves || [])[i] ||
                          `Movimiento ${i + 1}`}
                      </span>
                      {(preview.selectedMoves || [])[i] && (
                        <button
                          onClick={() =>
                            toggleMove((preview.selectedMoves || [])[i])
                          }
                          style={{
                            background: "none",
                            border: "none",
                            color: "#FF4D3B",
                            cursor: "pointer",
                            fontSize: viewMode === "mobile" ? 13 : 14,
                            padding: 0,
                          }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <h3
                  style={{
                    margin: "0 0 12px",
                    fontSize: viewMode === "mobile" ? 13 : 14,
                    color: "#888",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  Movimientos disponibles
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {preview.moves.map((m) => {
                    const idx = (preview.selectedMoves || []).indexOf(m);
                    const sel = idx !== -1;
                    const mv = MOVE_DATA[m];
                    const prio = mv?.priority ?? 0;
                    const isSelf =
                      mv?.cat === "status" && mv?.target === "self";
                    return (
                      <button
                        key={m}
                        onClick={() => toggleMove(m)}
                        title={
                          mv
                            ? `Tipo: ${mv.type} | Potencia: ${
                                mv.power || "—"
                              } | ${mv.cat}${
                                prio > 0 ? ` | ⚡ Prioridad +${prio}` : ""
                              }${isSelf ? " | ↩ Afecta al usuario" : ""}`
                            : ""
                        }
                        style={{
                          background: sel
                            ? "rgba(255,255,255,0.06)"
                            : "rgba(22,33,62,0.6)",
                          border: `1px solid ${
                            sel ? MOVE_COLORS[idx] : "#2a2a4a"
                          }`,
                          color: sel ? MOVE_COLORS[idx] : "#aaa",
                          padding:
                            viewMode === "mobile" ? "4px 10px" : "5px 12px",
                          borderRadius: 20,
                          fontSize: viewMode === "mobile" ? 11 : 12,
                          cursor: "pointer",
                          fontWeight: sel ? 700 : 400,
                          transition: "all 0.12s",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        {m}
                        {prio > 0 && (
                          <span
                            style={{
                              fontSize: viewMode === "mobile" ? 8 : 9,
                              color: "#FFD700",
                              fontWeight: 900,
                            }}
                          >
                            ⚡
                          </span>
                        )}
                        {isSelf && (
                          <span
                            style={{
                              fontSize: viewMode === "mobile" ? 8 : 9,
                              color: "#5BC8D8",
                            }}
                          >
                            ↩
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <div
                  style={{
                    fontSize: viewMode === "mobile" ? 9 : 10,
                    color: "#444",
                    marginTop: 8,
                  }}
                >
                  ⚡ = prioridad alta · ↩ = afecta al propio Pokémon
                </div>
              </div>

              <button
                onClick={addToTeam}
                style={{
                  background: inTeam(preview.id)
                    ? "#1a3a1a"
                    : (preview.selectedMoves || []).length === 0
                    ? "#1a1a2e"
                    : "linear-gradient(135deg,#FF4D3B,#cc2211)",
                  border: `2px solid ${
                    inTeam(preview.id)
                      ? "#3EBD5E"
                      : (preview.selectedMoves || []).length === 0
                      ? "#2a2a4a"
                      : "#FF4D3B"
                  }`,
                  color: inTeam(preview.id) ? "#3EBD5E" : "white",
                  padding: viewMode === "mobile" ? "10px 24px" : "12px 32px",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: 800,
                  fontSize: viewMode === "mobile" ? 13 : 15,
                  letterSpacing: 1,
                  transition: "all 0.2s",
                  width: viewMode === "mobile" ? "100%" : "auto",
                }}
              >
                {inTeam(preview.id)
                  ? "✓ Ya está en el equipo"
                  : (preview.selectedMoves || []).length === 0
                  ? "Selecciona al menos 1 movimiento"
                  : `+ Añadir ${preview.name} al equipo`}
              </button>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: "#2a2a4a",
                textAlign: "center",
                padding: viewMode === "mobile" ? 16 : 0,
              }}
            >
              <div
                style={{
                  fontSize: viewMode === "mobile" ? 48 : 72,
                  marginBottom: 16,
                  opacity: 0.3,
                }}
              >
                🎮
              </div>
              <div
                style={{
                  fontSize: viewMode === "mobile" ? 16 : 18,
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                Elige un Pokémon
              </div>
              <div style={{ fontSize: viewMode === "mobile" ? 12 : 13 }}>
                Haz clic en cualquier Pokémon para ver sus stats y movimientos
              </div>
            </div>
          )}
        </div>

        {/* Columna derecha: equipo */}
        <div
          style={{
            width: viewMode === "mobile" ? "100%" : 280,
            borderLeft: viewMode === "mobile" ? "none" : "1px solid #1e1e2e",
            borderTop: viewMode === "mobile" ? "1px solid #1e1e2e" : "none",
            background: "#0a0a15",
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
            maxHeight: viewMode === "mobile" ? "35vh" : "none",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: viewMode === "mobile" ? "10px 12px" : "14px 16px",
              borderBottom: "1px solid #1e1e2e",
              display: "flex",
              flexDirection: "column",
              gap: 8,
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
                  fontSize: viewMode === "mobile" ? 12 : 13,
                  fontWeight: 800,
                  color: "#FF4D3B",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Tu equipo
              </span>
              <span
                style={{
                  fontSize: viewMode === "mobile" ? 11 : 12,
                  color: "#555",
                }}
              >
                {team.length}/6
              </span>
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontSize: viewMode === "mobile" ? 11 : 12,
                  color: "#888",
                }}
              >
                CPU:
              </span>
              <label
                style={{
                  fontSize: viewMode === "mobile" ? 11 : 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <input
                  type="radio"
                  name="cpuMode"
                  value="random"
                  checked={cpuMode === "random"}
                  onChange={() => setCpuMode("random")}
                />
                Aleatorio
              </label>
              <label
                style={{
                  fontSize: viewMode === "mobile" ? 11 : 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <input
                  type="radio"
                  name="cpuMode"
                  value="meta"
                  checked={cpuMode === "meta"}
                  onChange={() => setCpuMode("meta")}
                />
                Meta-equipo
              </label>
            </div>
          </div>
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: viewMode === "mobile" ? 8 : 12,
            }}
          >
            {[...Array(6)].map((_, i) => {
              const p = team[i];
              return (
                <div
                  key={i}
                  style={{
                    background: p ? "rgba(22,33,62,0.8)" : "rgba(13,13,26,0.4)",
                    border: `1px solid ${p ? "#2a2a4a" : "#141420"}`,
                    borderRadius: 12,
                    padding: viewMode === "mobile" ? "8px 10px" : "10px 12px",
                    marginBottom: 8,
                    minHeight: viewMode === "mobile" ? 64 : 72,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  {p ? (
                    <>
                      <img
                        src={sprite(p.id)}
                        alt={p.name}
                        style={{
                          width: viewMode === "mobile" ? 48 : 54,
                          height: viewMode === "mobile" ? 48 : 54,
                          imageRendering: "pixelated",
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: viewMode === "mobile" ? 12 : 13,
                            marginBottom: 3,
                          }}
                        >
                          {p.name}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: 3,
                            marginBottom: 4,
                            flexWrap: "wrap",
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
                        <div
                          style={{
                            fontSize: viewMode === "mobile" ? 9 : 10,
                            color: "#555",
                            lineHeight: 1.6,
                          }}
                        >
                          {(p.selectedMoves || []).map((m, mi) => (
                            <span key={m}>
                              <span
                                style={{
                                  color: MOVE_COLORS[mi],
                                  fontWeight: 600,
                                }}
                              >
                                {m}
                              </span>
                              {mi < (p.selectedMoves || []).length - 1 && (
                                <span style={{ color: "#2a2a4a" }}> · </span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setTeam((prev) => prev.filter((t) => t.id !== p.id))
                        }
                        style={{
                          background: "none",
                          border: "none",
                          color: "#333",
                          cursor: "pointer",
                          fontSize: viewMode === "mobile" ? 14 : 16,
                          padding: 4,
                          borderRadius: 4,
                          flexShrink: 0,
                        }}
                        onMouseEnter={(e) => (e.target.style.color = "#FF4D3B")}
                        onMouseLeave={(e) => (e.target.style.color = "#333")}
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    <div
                      style={{
                        flex: 1,
                        textAlign: "center",
                        color: "#1e1e2e",
                        fontSize: viewMode === "mobile" ? 11 : 12,
                      }}
                    >
                      Slot {i + 1} vacío
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {team.length > 0 && (
            <div
              style={{
                padding: viewMode === "mobile" ? 10 : 12,
                borderTop: "1px solid #1e1e2e",
              }}
            >
              <button
                onClick={() => setInBattle(true)}
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg,#FF4D3B,#cc2211)",
                  border: "none",
                  color: "white",
                  padding: viewMode === "mobile" ? 9 : 11,
                  borderRadius: 8,
                  fontWeight: 800,
                  fontSize: viewMode === "mobile" ? 13 : 14,
                  cursor: "pointer",
                  letterSpacing: 1,
                  boxShadow: "0 4px 16px rgba(255,77,59,0.3)",
                }}
              >
                ⚔️ ¡COMBATIR!
              </button>
              <div
                style={{
                  fontSize: viewMode === "mobile" ? 9 : 10,
                  color: "#333",
                  textAlign: "center",
                  marginTop: 8,
                }}
              >
                La IA usará{" "}
                {cpuMode === "random" ? "equipo aleatorio" : "un meta-equipo"}{" "}
                de formato {format.toUpperCase()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
