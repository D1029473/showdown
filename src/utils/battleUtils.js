import { TYPE_CHART } from "../constants/typeColors";
import { MOVE_DATA } from "../data/moves";

export function calcHP(base) {
  return Math.floor((2 * base + 31) / 2) + 60;
}
export function calcOtherStat(base) {
  return Math.floor((2 * base + 31) / 2) + 5;
}
export function getBaseStat(pmon, name) {
  return pmon.stats.find((s) => s.name === name)?.value ?? 50;
}
export function stageMult(s) {
  s = Math.max(-6, Math.min(6, s));
  if (s < 0) return 2 / (2 - s);
  if (s > 0) return (2 + s) / 2;
  return 1;
}
export function getTypeEff(atkType, defTypes) {
  return defTypes.reduce((m, dt) => m * (TYPE_CHART[atkType]?.[dt] ?? 1), 1);
}
export function effLabel(te) {
  if (te === 0) return "¡No tiene ningún efecto!";
  if (te >= 4) return "¡Es muy eficaz!!! (x4)";
  if (te >= 2) return "¡Es muy eficaz!";
  if (te <= 0.25) return "No es muy eficaz... (x0.25)";
  if (te <= 0.5) return "No es muy eficaz...";
  return null;
}
export function effectiveSpeed(p) {
  const spd = calcOtherStat(getBaseStat(p, "speed"));
  return spd * stageMult(p.stages.speed) * (p.status === "paralysis" ? 0.5 : 1);
}
export function calcDamage(atk, def, moveName, weather = null) {
  const move = MOVE_DATA[moveName];
  if (!move || move.power === 0 || move.cat === "status") return 0;
  const isPhys = move.cat === "physical";
  let atkVal =
    calcOtherStat(getBaseStat(atk, isPhys ? "attack" : "special-attack")) *
    stageMult(isPhys ? atk.stages.attack : atk.stages.specialAttack);
  let defVal =
    calcOtherStat(getBaseStat(def, isPhys ? "defense" : "special-defense")) *
    stageMult(isPhys ? def.stages.defense : def.stages.specialDefense);
  if (isPhys && atk.status === "burn") atkVal = Math.floor(atkVal / 2);
  const stab = atk.types.includes(move.type) ? 1.5 : 1;
  const te = getTypeEff(move.type, def.types);
  const rand = (Math.floor(Math.random() * 16) + 85) / 100;

  let power = move.power;
  if (weather === "sun") {
    if (move.type === "fire") power = Math.floor(power * 1.5);
    if (move.type === "water") power = Math.floor(power * 0.5);
  } else if (weather === "rain") {
    if (move.type === "water") power = Math.floor(power * 1.5);
    if (move.type === "fire") power = Math.floor(power * 0.5);
  }

  const base = Math.floor(Math.floor((22 * power * atkVal) / defVal / 50) + 2);
  return Math.max(1, Math.floor(base * stab * te * rand));
}
export function initPkm(pmon, selectedMoves) {
  const hp = calcHP(getBaseStat(pmon, "hp"));
  return {
    ...pmon,
    maxHp: hp,
    currentHp: hp,
    status: null,
    statusTurns: 0,
    stages: {
      attack: 0,
      defense: 0,
      specialAttack: 0,
      specialDefense: 0,
      speed: 0,
      accuracy: 0,
    },
    battleMoves: selectedMoves ?? pmon.moves.slice(0, 4),
  };
}
export function applyStatusMove(eff, target, addLog) {
  switch (eff) {
    case "heal_self": {
      const h = Math.floor(target.maxHp / 2);
      target.currentHp = Math.min(target.maxHp, target.currentHp + h);
      addLog(`${target.name} recuperó ${h} PS`);
      break;
    }
    case "rest": {
      target.currentHp = target.maxHp;
      target.status = "sleep";
      target.statusTurns = 2;
      addLog(`${target.name} se quedó dormido y recuperó todos sus PS`);
      break;
    }
    case "raise_def2": {
      target.stages.defense = Math.min(6, target.stages.defense + 2);
      addLog(`¡La Defensa de ${target.name} subió mucho!`);
      break;
    }
    case "raise_spdef2": {
      target.stages.specialDefense = Math.min(
        6,
        target.stages.specialDefense + 2
      );
      addLog(`¡La Def.Especial de ${target.name} subió mucho!`);
      break;
    }
    case "raise_def": {
      target.stages.defense = Math.min(6, target.stages.defense + 1);
      addLog(`¡La Defensa de ${target.name} subió!`);
      break;
    }
    case "raise_spdef": {
      target.stages.specialDefense = Math.min(
        6,
        target.stages.specialDefense + 1
      );
      addLog(`¡La Def.Especial de ${target.name} subió!`);
      break;
    }
    case "raise_spa_spdef": {
      target.stages.specialAttack = Math.min(
        6,
        target.stages.specialAttack + 1
      );
      target.stages.specialDefense = Math.min(
        6,
        target.stages.specialDefense + 1
      );
      addLog(`¡Los stats especiales de ${target.name} subieron!`);
      break;
    }
    case "raise_atk_spd": {
      target.stages.attack = Math.min(6, target.stages.attack + 1);
      target.stages.speed = Math.min(6, target.stages.speed + 1);
      addLog(`¡Ataque y Velocidad de ${target.name} subieron!`);
      break;
    }
    case "poison": {
      if (!target.status) {
        target.status = "poison";
        addLog(`¡${target.name} fue envenenado!`);
      } else addLog(`¡${target.name} ya tiene un estado alterado!`);
      break;
    }
    case "lower_atk": {
      target.stages.attack = Math.max(-6, target.stages.attack - 1);
      addLog(`¡El Ataque de ${target.name} bajó!`);
      break;
    }
    case "lower_atk2": {
      target.stages.attack = Math.max(-6, target.stages.attack - 2);
      addLog(`¡El Ataque de ${target.name} bajó mucho!`);
      break;
    }
    case "lower_def": {
      target.stages.defense = Math.max(-6, target.stages.defense - 1);
      addLog(`¡La Defensa de ${target.name} bajó!`);
      break;
    }
    case "lower_spa": {
      target.stages.specialAttack = Math.max(
        -6,
        target.stages.specialAttack - 1
      );
      addLog(`¡El At.Especial de ${target.name} bajó!`);
      break;
    }
    case "lower_spdef": {
      target.stages.specialDefense = Math.max(
        -6,
        target.stages.specialDefense - 1
      );
      addLog(`¡La Def.Especial de ${target.name} bajó!`);
      break;
    }
    case "lower_spd": {
      target.stages.speed = Math.max(-6, target.stages.speed - 1);
      addLog(`¡La Velocidad de ${target.name} bajó!`);
      break;
    }
    case "lower_acc": {
      target.stages.accuracy = Math.max(-6, target.stages.accuracy - 1);
      addLog(`¡La Precisión de ${target.name} bajó!`);
      break;
    }
    case "lower_atk_def": {
      target.stages.attack = Math.max(-6, target.stages.attack - 1);
      target.stages.defense = Math.max(-6, target.stages.defense - 1);
      addLog(`¡El Ataque y la Defensa de ${target.name} bajaron!`);
      break;
    }
    case "mirror_coat":
    case "magic_coat":
      addLog(
        `${target.name} usó ${
          eff === "mirror_coat" ? "Manto Espejo" : "Capa Mágica"
        } pero aún no está implementado.`
      );
      break;
    case "weather_rain":
    case "weather_sun":
    case "weather_sand":
    case "weather_hail":
      addLog(`¡${target.name} usó un movimiento de clima!`);
      break;
    default:
      break;
  }
}
export function applySecondaryEff(eff, target, addLog) {
  if (eff === "drain") return;
  const p = eff.endsWith("_30")
    ? 0.3
    : eff.endsWith("_20")
    ? 0.2
    : eff.endsWith("_10")
    ? 0.1
    : 1.0;
  if (Math.random() > p) return;

  if (eff.startsWith("burn") && !target.status) {
    target.status = "burn";
    addLog(`¡${target.name} quedó quemado!`);
  } else if (eff.startsWith("para") && !target.status) {
    target.status = "paralysis";
    addLog(`¡${target.name} quedó paralizado!`);
  } else if (
    eff.startsWith("freeze") &&
    !target.status &&
    !target.types.includes("ice")
  ) {
    target.status = "freeze";
    addLog(`¡${target.name} quedó congelado!`);
  } else if (eff.startsWith("poison") && !target.status) {
    target.status = "poison";
    addLog(`¡${target.name} quedó envenenado!`);
  } else if (eff === "lower_spd") applyStatusMove("lower_spd", target, addLog);
  else if (eff === "lower_def") applyStatusMove("lower_def", target, addLog);
  else if (eff === "lower_atk_10") applyStatusMove("lower_atk", target, addLog);
  else if (eff === "lower_atk_20") applyStatusMove("lower_atk", target, addLog);
  else if (eff === "lower_atk_30") applyStatusMove("lower_atk", target, addLog);
  else if (eff === "lower_def_30") applyStatusMove("lower_def", target, addLog);
}
