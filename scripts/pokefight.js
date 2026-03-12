const pokemon1Input = document.getElementById("pokemon1Input");
const pokemon2Input = document.getElementById("pokemon2Input");
const loadPokemon1Btn = document.getElementById("loadPokemon1");
const loadPokemon2Btn = document.getElementById("loadPokemon2");
const startBattleBtn = document.getElementById("startBattle");

const pokemon1Card = document.getElementById("pokemon1Card");
const pokemon2Card = document.getElementById("pokemon2Card");

const initialHpInput = document.getElementById("initialHp");
const maxTurnsInput = document.getElementById("maxTurns");

const arenaP1Name = document.getElementById("arenaP1Name");
const arenaP1Img = document.getElementById("arenaP1Img");
const arenaP1HpText = document.getElementById("arenaP1HpText");
const arenaP1HpBar = document.getElementById("arenaP1HpBar");

const arenaP2Name = document.getElementById("arenaP2Name");
const arenaP2Img = document.getElementById("arenaP2Img");
const arenaP2HpText = document.getElementById("arenaP2HpText");
const arenaP2HpBar = document.getElementById("arenaP2HpBar");

const battleStatus = document.getElementById("battleStatus");
const battleLog = document.getElementById("battleLog");

const winnerBox = document.getElementById("winnerBox");
const winnerImg = document.getElementById("winnerImg");
const winnerName = document.getElementById("winnerName");

let fighter1Base = null;
let fighter2Base = null;
let fighter1 = null;
let fighter2 = null;

DEFENSE_BOOST = 20;
SPECIAL_DEFENSE_BOOST = 20;

BASE_ATTACK_DAMAGE = 5;
BASE_SPECIAL_ATTACK_DAMAGE = 10;


async function fetchPokemon(nameOrId) {
    const value = nameOrId.trim().toLowerCase();
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${value}`);

    if (!response.ok) {
        throw new Error("No se encontró el Pokémon");
    }

    return await response.json();
}

function getStat(pokemon, statName) {
    const stat = pokemon.stats.find(s => s.stat.name === statName);
    return stat ? stat.base_stat : 50;
}

function normalizePokemon(pokemon) {
    return {
        name: pokemon.name,
        img: pokemon.sprites.front_default,
        attack: getStat(pokemon, "attack"),
        defense: getStat(pokemon, "defense"),
        specialAttack: getStat(pokemon, "special-attack"),
        specialDefense: getStat(pokemon, "special-defense"),
        speed: getStat(pokemon, "speed")
    };
}

function createFighter(baseData, hp) {
    return {
        name: baseData.name,
        img: baseData.img,
        hp: hp,
        maxHp: hp,
        attack: baseData.attack,
        defense: baseData.defense,
        specialAttack: baseData.specialAttack,
        specialDefense: baseData.specialDefense,
        speed: baseData.speed,
        tempDefenseBoost: 0,
        tempSpecialDefenseBoost: 0,
        turnsPlayed: 0
    };
}

function renderCard(card, fighter) {
    card.innerHTML = `
        <img src="${fighter.img}" alt="${fighter.name}">
        <h4 style="margin-bottom: 0.5rem;">${fighter.name}</h4>
        <p><strong>Ataque:</strong> ${fighter.attack}</p>
        <p><strong>Defensa:</strong> ${fighter.defense}</p>
        <p><strong>Ataque Especial:</strong> ${fighter.specialAttack}</p>
        <p><strong>Defensa Especial:</strong> ${fighter.specialDefense}</p>
        <p><strong>Velocidad:</strong> ${fighter.speed}</p>
    `;
}

function updateArena() {
    if (fighter1) {
        arenaP1Name.textContent = fighter1.name;
        arenaP1Img.src = fighter1.img;
        arenaP1Img.alt = fighter1.name;
        arenaP1HpText.textContent = `${fighter1.hp} / ${fighter1.maxHp}`;
        arenaP1HpBar.style.width = `${(fighter1.hp / fighter1.maxHp) * 100}%`;
    }

    if (fighter2) {
        arenaP2Name.textContent = fighter2.name;
        arenaP2Img.src = fighter2.img;
        arenaP2Img.alt = fighter2.name;
        arenaP2HpText.textContent = `${fighter2.hp} / ${fighter2.maxHp}`;
        arenaP2HpBar.style.width = `${(fighter2.hp / fighter2.maxHp) * 100}%`;
    }
}

function addLog(text) {
    const div = document.createElement("div");
    div.className = "log-item";
    div.innerHTML = `<p>${text}</p>`;
    battleLog.appendChild(div);
}

function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function chooseAction(attacker) {
    let actions = ["attack", "defense"];

    if (attacker.turnsPlayed % 2 === 0) {
        actions.push("special-defense");
    }

    if (attacker.turnsPlayed % 3 === 0) {
        actions.push("special-attack");
    }

    return actions[randomNumber(0, actions.length - 1)];
}

function doTurn(attacker, defender, globalTurn) {
    attacker.turnsPlayed++;

    const action = chooseAction(attacker);

    if (action === "defense") {
        const fail = Math.random() < 0.2;
        const actionName = "Defensa";

        if (fail) {
            addLog(
                `Turno ${globalTurn}: ${attacker.name} intentó usar ${actionName}, pero falló.`
            );
            return;
        }

        const boost = DEFENSE_BOOST;
        attacker.tempDefenseBoost += boost;

        addLog(
            `Turno ${globalTurn}: ${attacker.name} usó ${actionName}. ` +
            `Su defensa aumentó en ${boost} para el próximo ataque recibido.`
        );
        return;
    }

    if (action === "special-defense") {
        const actionName = "Defensa Especial";

        if (attacker.turnsPlayed < 2) {
            addLog(
                `Turno ${globalTurn}: ${attacker.name} no puede usar ${actionName} todavía. ` +
                `Necesita haber jugado al menos 2 turnos propios y solo lleva ${attacker.turnsPlayed}.`
            );
            return;
        }

        const fail = Math.random() < 0.3;

        if (fail) {
            addLog(
                `Turno ${globalTurn}: ${attacker.name} intentó usar ${actionName}, pero falló.`
            );
            return;
        }

        const boost = SPECIAL_DEFENSE_BOOST;
        attacker.tempSpecialDefenseBoost += boost;

        addLog(
            `Turno ${globalTurn}: ${attacker.name} usó ${actionName}. ` +
            `Su defensa especial aumentó en ${boost} para el próximo ataque especial recibido.`
        );
        return;
    }

    if (action === "attack") {
        const actionName = "Ataque";
        const fail = Math.random() < 0.2;

        if (fail) {
            addLog(
                `Turno ${globalTurn}: ${attacker.name} usó ${actionName}, pero falló. ` +
                `${defender.name} mantuvo su vida en ${defender.hp} / ${defender.maxHp}.`
            );
            return;
        }

        const totalDefense = defender.defense + defender.tempDefenseBoost;
        const defenseBoostUsed = defender.tempDefenseBoost;
        const hpBefore = defender.hp;

        let damage = attacker.attack - Math.floor(totalDefense / 2);
        damage = Math.max(BASE_ATTACK_DAMAGE, damage);

        defender.hp -= damage;
        if (defender.hp < 0) defender.hp = 0;

        defender.tempDefenseBoost = 0;

        const hpAfter = defender.hp;
        const realDamage = hpBefore - hpAfter;
        const remainingPercent = ((defender.hp / defender.maxHp) * 100).toFixed(1);

        addLog(
            `Turno ${globalTurn}: ${attacker.name} usó ${actionName}. ` +
            `Su ataque fue ${attacker.attack}. ` +
            `${defender.name} tenía una defensa base de ${defender.defense}` +
            (defenseBoostUsed > 0 ? ` y un aumento temporal de ${defenseBoostUsed}` : "") +
            `. La defensa total fue ${totalDefense}. ` +
            `La vida de ${defender.name} bajó de ${hpBefore} a ${hpAfter}. ` +
            `Perdió ${realDamage} puntos de vida y le queda ${remainingPercent}% (${hpAfter} / ${defender.maxHp}).`
        );
        return;
    }

    if (action === "special-attack") {
        const actionName = "Ataque Especial";

        if (attacker.turnsPlayed < 3) {
            addLog(
                `Turno ${globalTurn}: ${attacker.name} no puede usar ${actionName} todavía. ` +
                `Necesita haber jugado al menos 3 turnos propios y solo lleva ${attacker.turnsPlayed}.`
            );
            return;
        }

        const fail = Math.random() < 0.3;

        if (fail) {
            addLog(
                `Turno ${globalTurn}: ${attacker.name} usó ${actionName}, pero falló. ` +
                `${defender.name} mantuvo su vida en ${defender.hp} / ${defender.maxHp}.`
            );
            return;
        }

        const totalSpecialDefense = defender.specialDefense + defender.tempSpecialDefenseBoost;
        const specialDefenseBoostUsed = defender.tempSpecialDefenseBoost;
        const hpBefore = defender.hp;

        let damage = attacker.specialAttack - Math.floor(totalSpecialDefense / 2) + 10;
        damage = Math.max(BASE_SPECIAL_ATTACK_DAMAGE, damage);

        defender.hp -= damage;
        if (defender.hp < 0) defender.hp = 0;

        defender.tempSpecialDefenseBoost = 0;

        const hpAfter = defender.hp;
        const realDamage = hpBefore - hpAfter;
        const remainingPercent = ((defender.hp / defender.maxHp) * 100).toFixed(1);

        addLog(
            `Turno ${globalTurn}: ${attacker.name} usó ${actionName}. ` +
            `Su ataque especial fue ${attacker.specialAttack}. ` +
            `${defender.name} tenía una defensa especial base de ${defender.specialDefense}` +
            (specialDefenseBoostUsed > 0
                ? ` y un aumento temporal de ${specialDefenseBoostUsed}`
                : "") +
            `. La defensa especial total fue ${totalSpecialDefense}. ` +
            `La vida de ${defender.name} bajó de ${hpBefore} a ${hpAfter}. ` +
            `Perdió ${realDamage} puntos de vida y le queda ${remainingPercent}% (${hpAfter} / ${defender.maxHp}).`
        );
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function loadPokemon(slot) {
    try {
        const input = slot === 1 ? pokemon1Input.value : pokemon2Input.value;
        const pokemon = await fetchPokemon(input);
        const baseData = normalizePokemon(pokemon);
        const hp = Number(initialHpInput.value) || 100;
        const fighter = createFighter(baseData, hp);

        if (slot === 1) {
            fighter1Base = baseData;
            fighter1 = fighter;
            renderCard(pokemon1Card, fighter1);
        } else {
            fighter2Base = baseData;
            fighter2 = fighter;
            renderCard(pokemon2Card, fighter2);
        }

        updateArena();
    } catch (error) {
        alert(error.message);
    }
}

async function startBattle() {
    if (!fighter1Base || !fighter2Base) {
        battleStatus.textContent = "Debes cargar los dos Pokémon.";
        return;
    }

    battleLog.innerHTML = "";
    winnerBox.classList.add("winner-box--hidden");

    const hp = Number(initialHpInput.value) || 100;
    const maxTurns = Number(maxTurnsInput.value) || 6;

    fighter1 = createFighter(fighter1Base, hp);
    fighter2 = createFighter(fighter2Base, hp);

    renderCard(pokemon1Card, fighter1);
    renderCard(pokemon2Card, fighter2);
    updateArena();

    let first = fighter1.speed >= fighter2.speed ? fighter1 : fighter2;
    let second = first === fighter1 ? fighter2 : fighter1;

    for (let turn = 1; turn <= maxTurns; turn++) {
        const attacker = turn % 2 !== 0 ? first : second;
        const defender = attacker === fighter1 ? fighter2 : fighter1;

        battleStatus.textContent = `Turno ${turn}: ataca ${attacker.name}`;
        doTurn(attacker, defender, turn);
        updateArena();

        if (fighter1.hp <= 0 || fighter2.hp <= 0) {
            break;
        }

        await delay(1000);
    }

    let winner = null;

    if (fighter1.hp > fighter2.hp) winner = fighter1;
    if (fighter2.hp > fighter1.hp) winner = fighter2;

    if (winner) {
        battleStatus.textContent = `Ganó ${winner.name}`;
        winnerName.textContent = winner.name;
        winnerImg.src = winner.img;
        winnerImg.alt = winner.name;
    } else {
        battleStatus.textContent = "Empate";
        winnerName.textContent = "Empate";
        winnerImg.src = "";
        winnerImg.alt = "";
    }

    winnerBox.classList.remove("winner-box--hidden");
}

loadPokemon1Btn.addEventListener("click", () => loadPokemon(1));
loadPokemon2Btn.addEventListener("click", () => loadPokemon(2));
startBattleBtn.addEventListener("click", startBattle);