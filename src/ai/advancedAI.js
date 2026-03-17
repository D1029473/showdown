import { MOVE_DATA } from "../data/moves";
import { getTypeEff, calcDamage, effectiveSpeed } from "../utils/battleUtils";

export function evaluateState(state) {
  let score = 0;

  state.cpuTeam.forEach((p) => {
    if (p.currentHp > 0) {
      const hpPercent = p.currentHp / p.maxHp;
      score += hpPercent * 100;
      if (hpPercent > 0.8) score += 10;
    } else {
      score -= 50;
    }
  });

  state.playerTeam.forEach((p) => {
    if (p.currentHp > 0) {
      const hpPercent = p.currentHp / p.maxHp;
      score -= hpPercent * 80;
      if (hpPercent > 0.8) score -= 20;
    } else {
      score += 30;
    }
  });

  const player = state.playerTeam[state.playerIdx];
  if (player) {
    if (player.status === "poison") score += 15;
    if (player.status === "burn") score += 10;
    if (player.status === "paralysis") score += 15;
    if (player.status === "sleep") score += 20;
    if (player.status === "freeze") score += 25;
  }

  const cpu = state.cpuTeam[state.cpuIdx];
  if (cpu) {
    if (cpu.status === "poison") score -= 15;
    if (cpu.status === "burn") score -= 10;
    if (cpu.status === "paralysis") score -= 15;
    if (cpu.status === "sleep") score -= 20;
    if (cpu.status === "freeze") score -= 25;
  }

  if (cpu) {
    score += cpu.stages.attack * 8;
    score += cpu.stages.defense * 8;
    score += cpu.stages.specialAttack * 8;
    score += cpu.stages.specialDefense * 8;
    score += cpu.stages.speed * 5;
  }

  if (player) {
    score -= player.stages.attack * 8;
    score -= player.stages.defense * 8;
    score -= player.stages.specialAttack * 8;
    score -= player.stages.specialDefense * 8;
    score -= player.stages.speed * 5;
  }

  if (state.weather) {
    if (state.weather === "sun" && cpu && cpu.types.includes("fire"))
      score += 20;
    if (state.weather === "rain" && cpu && cpu.types.includes("water"))
      score += 20;
    if (
      state.weather === "sand" &&
      cpu &&
      cpu.types.some((t) => ["rock", "ground", "steel"].includes(t))
    )
      score += 20;
    if (state.weather === "hail" && cpu && cpu.types.includes("ice"))
      score += 20;
  }

  return score;
}

export function getPlayerBestMove(attacker, defender, weather) {
  let bestScore = -Infinity;
  let bestMove = null;
  for (const moveName of attacker.battleMoves) {
    const move = MOVE_DATA[moveName];
    if (!move) continue;
    if (move.cat === "status") {
      if (move.eff === "poison" && !defender.status) {
        const score = 30;
        if (score > bestScore) {
          bestScore = score;
          bestMove = moveName;
        }
      } else if (move.eff === "paralysis" && !defender.status) {
        const score = 25;
        if (score > bestScore) {
          bestScore = score;
          bestMove = moveName;
        }
      } else if (move.eff === "burn" && !defender.status) {
        const score = 20;
        if (score > bestScore) {
          bestScore = score;
          bestMove = moveName;
        }
      } else if (move.eff && move.eff.startsWith("lower_")) {
        const score = 15;
        if (score > bestScore) {
          bestScore = score;
          bestMove = moveName;
        }
      } else {
        const score = 5;
        if (score > bestScore) {
          bestScore = score;
          bestMove = moveName;
        }
      }
    } else {
      const te = getTypeEff(move.type, defender.types);
      if (te === 0) continue;
      const dmg = calcDamage(attacker, defender, moveName, weather);
      let score = dmg;
      if (dmg >= defender.currentHp) score += 200;
      if (attacker.types.includes(move.type)) score += 20;
      if (te >= 2) score *= 1.5;
      if (te <= 0.5) score *= 0.5;
      if (score > bestScore) {
        bestScore = score;
        bestMove = moveName;
      }
    }
  }
  return bestMove;
}

export function simulateAction(state, cpuAction) {
  const simState = JSON.parse(JSON.stringify(state));
  if (cpuAction.type === "switch") {
    const newIdx = cpuAction.targetIndex;
    if (simState.cpuTeam[newIdx].currentHp > 0 && newIdx !== simState.cpuIdx) {
      simState.cpuIdx = newIdx;
    }
  }

  const cpu = simState.cpuTeam[simState.cpuIdx];
  const player = simState.playerTeam[simState.playerIdx];
  const playerMove = getPlayerBestMove(player, cpu, simState.weather);

  const playerPrio = playerMove ? MOVE_DATA[playerMove]?.priority ?? 0 : -999;
  const cpuMove = cpuAction.type === "move" ? cpuAction.moveName : null;
  const cpuPrio = cpuMove ? MOVE_DATA[cpuMove]?.priority ?? 0 : -999;

  let playerFirst = false;
  if (playerMove && cpuMove) {
    if (playerPrio !== cpuPrio) {
      playerFirst = playerPrio > cpuPrio;
    } else {
      playerFirst = effectiveSpeed(player) >= effectiveSpeed(cpu);
    }
  } else if (playerMove && !cpuMove) {
    playerFirst = true;
  } else if (!playerMove && cpuMove) {
    playerFirst = false;
  }

  if (playerFirst) {
    if (playerMove) {
      const move = MOVE_DATA[playerMove];
      if (move.cat !== "status") {
        const dmg = calcDamage(player, cpu, playerMove, simState.weather);
        cpu.currentHp = Math.max(0, cpu.currentHp - dmg);
      } else {
        if (move.eff === "poison" && !cpu.status) cpu.status = "poison";
        if (move.eff === "paralysis" && !cpu.status) cpu.status = "paralysis";
        if (move.eff === "burn" && !cpu.status) cpu.status = "burn";
        if (move.eff === "freeze" && !cpu.status) cpu.status = "freeze";
      }
    }
    if (cpuMove && cpu.currentHp > 0) {
      const move = MOVE_DATA[cpuMove];
      if (move.cat !== "status") {
        const dmg = calcDamage(cpu, player, cpuMove, simState.weather);
        player.currentHp = Math.max(0, player.currentHp - dmg);
      } else {
        if (move.eff === "poison" && !player.status) player.status = "poison";
        if (move.eff === "paralysis" && !player.status)
          player.status = "paralysis";
        if (move.eff === "burn" && !player.status) player.status = "burn";
        if (move.eff === "freeze" && !player.status) player.status = "freeze";
      }
    }
  } else {
    if (cpuMove) {
      const move = MOVE_DATA[cpuMove];
      if (move.cat !== "status") {
        const dmg = calcDamage(cpu, player, cpuMove, simState.weather);
        player.currentHp = Math.max(0, player.currentHp - dmg);
      } else {
        if (move.eff === "poison" && !player.status) player.status = "poison";
        if (move.eff === "paralysis" && !player.status)
          player.status = "paralysis";
        if (move.eff === "burn" && !player.status) player.status = "burn";
        if (move.eff === "freeze" && !player.status) player.status = "freeze";
      }
    }
    if (playerMove && player.currentHp > 0) {
      const move = MOVE_DATA[playerMove];
      if (move.cat !== "status") {
        const dmg = calcDamage(player, cpu, playerMove, simState.weather);
        cpu.currentHp = Math.max(0, cpu.currentHp - dmg);
      } else {
        if (move.eff === "poison" && !cpu.status) cpu.status = "poison";
        if (move.eff === "paralysis" && !cpu.status) cpu.status = "paralysis";
        if (move.eff === "burn" && !cpu.status) cpu.status = "burn";
        if (move.eff === "freeze" && !cpu.status) cpu.status = "freeze";
      }
    }
  }

  if (player.currentHp <= 0) {
    const nextIdx = simState.playerTeam.findIndex(
      (p, i) => i !== simState.playerIdx && p.currentHp > 0
    );
    if (nextIdx === -1) {
      simState.winner = "cpu";
    } else {
      simState.playerIdx = nextIdx;
    }
  }
  if (cpu.currentHp <= 0) {
    const nextIdx = simState.cpuTeam.findIndex(
      (p, i) => i !== simState.cpuIdx && p.currentHp > 0
    );
    if (nextIdx === -1) {
      simState.winner = "player";
    } else {
      simState.cpuIdx = nextIdx;
    }
  }

  const score = evaluateState(simState);
  return { simState, score };
}

export function getCpuAction(state) {
  const cpu = state.cpuTeam[state.cpuIdx];
  const possibleActions = [];

  if (cpu.status !== "sleep" && cpu.status !== "freeze") {
    cpu.battleMoves.forEach((moveName) => {
      possibleActions.push({ type: "move", moveName });
    });
  }

  state.cpuTeam.forEach((p, idx) => {
    if (idx !== state.cpuIdx && p.currentHp > 0) {
      possibleActions.push({ type: "switch", targetIndex: idx });
    }
  });

  if (possibleActions.length === 0) {
    return { type: "move", moveName: cpu.battleMoves[0] };
  }

  let bestScore = -Infinity;
  let bestAction = possibleActions[0];
  for (const action of possibleActions) {
    const { score } = simulateAction(state, action);
    if (score > bestScore) {
      bestScore = score;
      bestAction = action;
    }
  }

  return bestAction;
}
