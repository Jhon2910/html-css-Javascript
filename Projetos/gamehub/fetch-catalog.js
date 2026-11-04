// Script to fetch and convert GitHub game-store-catalog data to GameHub format
// Run with: node fetch-catalog.js

const fs = require('fs');
const path = require('path');
const https = require('https');

// Platform catalog URLs
const CATALOG_URLS = {
  steam: 'https://raw.githubusercontent.com/Ephellon/game-store-catalog/main/steam/!.json',
  psn: 'https://raw.githubusercontent.com/Ephellon/game-store-catalog/main/psn/!.json',
  ps5: 'https://raw.githubusercontent.com/Ephellon/game-store-catalog/main/ps5/!.json',
  ps4: 'https://raw.githubusercontent.com/Ephellon/game-store-catalog/main/ps4/!.json',
  xbox: 'https://raw.githubusercontent.com/Ephellon/game-store-catalog/main/xbox/!.json',
  xboxConsole: 'https://raw.githubusercontent.com/Ephellon/game-store-catalog/main/xbox-console/!.json',
  xboxPC: 'https://raw.githubusercontent.com/Ephellon/game-store-catalog/main/xbox-pc/!.json',
  nintendo: 'https://raw.githubusercontent.com/Ephellon/game-store-catalog/main/nintendo/!.json',
  epic: 'https://raw.githubusercontent.com/Ephellon/game-store-catalog/main/epic/!.json',
  esrb: 'https://raw.githubusercontent.com/Ephellon/game-store-catalog/main/esrb/!.json',
};

// Platform name mapping
const PLATFORM_MAP = {
  steam: 'PC (Steam)',
  psn: 'PlayStation Network',
  ps5: 'PlayStation 5',
  ps4: 'PlayStation 4',
  xbox: 'Xbox',
  xboxConsole: 'Xbox Console',
  xboxPC: 'Xbox PC',
  nintendo: 'Nintendo Switch',
  epic: 'Epic Games Store',
  esrb: 'ESRB',
};

// ESRB rating mapping
const ESRB_MAP = {
  'everyone': 'Livre',
  'everyone 10+': '10+',
  'teen': '13+',
  'mature 17+': '17+',
  'adults only 18+': '18+',
  'rating pending': 'RP',
  'none': 'Não classificado',
  'everyone10+': '10+',
  'mature17+': '17+',
  'adults18+': '18+',
};

// Category mapping based on game name/genre keywords
const CATEGORY_KEYWORDS = {
  'Ação/Aventura': ['action', 'adventure', 'fighting', 'beat', 'combat', 'war', 'battle', 'assassin', 'creed', 'god of war', 'spider-man', 'horizon', 'ghost of', 'last of us', 'uncharted', 'tomb raider', 'batman', 'wizard', 'devil may cry', 'bayonetta', 'ni no kuni', 'tales of', 'final fantasy', 'kingdom hearts', 'zelda', 'xenoblade', 'xenogears', 'nier', 'astral chain', 'bayonetta', 'metroid', 'castlevania', 'dark souls', 'elden ring', 'bloodborne', 'sekiro'],
  'RPG': ['rpg', 'role playing', 'turn-based', 'turn based', 'jrpg', 'crpg', 'tactical', 'strategy rpg', 'final fantasy', 'dragon quest', 'pokemon', 'persona', 'smt', 'shin megami', 'trails', 'yakuza', 'like a dragon', 'dragon age', 'mass effect', 'witcher', 'skyrim', 'fallout', 'baldur', 'divinity', 'pillars of eternity', 'disco elysium', 'pathfinder', 'wasteland', 'octopath', 'bravely default', 'xenoblade', 'fire emblem', 'triangle strategy', 'live a live', 'chrono trigger', 'secret of mana', 'star ocean', 'tales of'],
  'Tiro (FPS/TPS)': ['shooter', 'fps', 'tps', 'first person', 'third person', 'battle royale', 'call of duty', 'battlefield', 'halo', 'destiny', 'overwatch', 'valorant', 'cs:', 'counter strike', 'rainbow six', 'siege', 'pubg', 'fortnite', 'apex', 'warzone', 'titanfall', 'doom', 'quake', 'wolfenstein', 'prey', 'borderlands', 'far cry', 'metro', 'stalker', 'escape from tarkov', 'hell let loose', 'insurgency', 'squad', 'post scriptum', 'beyond good'],
  'Estratégia': ['strategy', '4x', 'grand strategy', 'rts', 'real time', 'turn based strategy', 'tactics', 'civilization', 'stellaris', 'eu4', 'ck3', 'hoi4', 'total war', 'age of empires', 'command & conquer', 'starcraft', 'warcraft', 'company of heroes', 'men of war', 'warhammer', 'battletech', 'xcom', 'phoenix point', 'mutant year zero', 'hard west', 'gloomhaven', 'into the breach'],
  'Simulação': ['simulator', 'simulation', 'tycoon', 'management', 'city builder', 'farming', 'truck', 'euro truck', 'american truck', 'train', 'flight', 'msfs', 'x plane', 'dcs', 'ilus', 'factorio', 'satisfactory', 'dyson sphere', 'oxygen not included', 'rimworld', 'dwarf fortress', 'prison architect', 'two point', 'planet zoo', 'planet coaster', 'jurassic world', 'parkitect'],
  'Esportes/Corrida': ['racing', 'racing', 'f1', 'formula', 'gran turismo', 'forza', 'need for speed', 'dirt', 'grid', 'project cars', 'assetto', 'iracing', 'racing', 'football', 'fifa', 'pes', 'efootball', 'nba', '2k', 'madden', 'mlb', 'nhl', 'ufc', 'fight night', 'wwe', 'aew', 'tennis', 'golf', 'pga', 'everybody', 'mario golf', 'mario tennis', 'wii sports', 'ring fit', 'fitness'],
  'Plataforma/Indie': ['platformer', 'platforming', 'metroidvania', 'indie', 'pixel', 'retro', '8-bit', '16-bit', 'hollow knight', 'celeste', 'dead cells', 'hades', 'roguelike', 'roguelite', 'shovel knight', 'cuphead', 'ori', 'will of the wisp', 'blind forest', 'inside', 'limbo', 'little nightmares', 'grime', 'ender lilies', 'bloodstained', 'aeterna', 'afterimage', 'moonscars', 'salt and sanctuary', 'salt and sacrilege', 'dark devour'],
  'Terror': ['horror', 'survival horror', 'psychological', 'creepy', 'scary', 'resident evil', 'silent hill', 'dead space', 'alien isolation', 'outlast', 'amnesia', 'soma', 'visage', 'phantasmagoria', 'clock tower', 'fatal frame', 'project zero', 'fear', 'f.e.a.r.', 'condemned', 'the evil within', 'days gone', 'the last of us', 'state of decay', 'dying light', 'dead rising', 'zombie'],
  'Puzzle': ['puzzle', 'puzzle game', 'brain', 'logic', 'riddle', 'escape room', 'the witness', 'talos principle', 'portal', 'baba is you', 'stephen', 'sausage', 'unpacking', 'opush', 'gorogoa', 'monument valley', 'thumper', 'rhythm', 'tetris', 'dr mario', 'peg-puzzle'],
};

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse JSON from ${url}: ${e.message}`));
        }
      });
    }).on('error', reject);
  });
}

function normalizeName(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[™®©]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function detectCategory(name, platforms = []) {
  const normalized = normalizeName(name);

  // Check category keywords
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (normalized.includes(keyword.toLowerCase())) {
        return category;
      }
    }
  }

  // Default categories based on platform
  if (platforms.some(p => p.includes('VR') || p.includes('vr'))) {
    return 'VR';
  }

  return 'Ação/Aventura'; // Default
}

function parsePrice(priceStr) {
  if (!priceStr) return { original: 'N/A', numeric: null, currency: 'USD' };

  const clean = priceStr.toString().trim();

  // Handle special cases
  if (clean.toLowerCase() === 'free' || clean.toLowerCase() === 'gratuito' || clean === '0' || clean === '$0.00') {
    return { original: 'Gratuito', numeric: 0, currency: 'USD' };
  }
  if (clean.toLowerCase().includes('announced') || clean.toLowerCase().includes('early access') || clean.toLowerCase().includes('trial') || clean.toLowerCase().includes('unavailable')) {
    return { original: clean, numeric: null, currency: 'USD' };
  }

  // Extract numeric value
  const match = clean.match(/[\d,]+\.?\d*/);
  if (match) {
    const numeric = parseFloat(match[0].replace(/,/g, ''));
    const currencyMatch = clean.match(/[$€£¥₹]/);
    const currency = currencyMatch ? currencyMatch[0] : '$';
    return { original: clean, numeric, currency };
  }

  return { original: clean, numeric: null, currency: 'USD' };
}

function mapESRB(rating) {
  if (!rating) return 'Não classificado';
  const normalized = rating.toLowerCase().trim();
  return ESRB_MAP[normalized] || rating;
}

function mapPlatforms(platformArray) {
  if (!platformArray || platformArray.length === 0) return 'PC';
  return platformArray.join(', ');
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

async function fetchCatalog(platform, url) {
  try {
    console.log(`Fetching ${platform} catalog...`);
    const data = await fetchUrl(url);
    console.log(`  Fetched ${data.length} games from ${platform}`);
    return { platform, data };
  } catch (error) {
    console.error(`Error fetching ${platform}:`, error.message);
    return { platform, data: [] };
  }
}

function convertGame(githubGame, platform, index) {
  const [name, gameData] = githubGame;

  if (!name || !gameData) return null;

  const priceInfo = parsePrice(gameData.price);
  const category = detectCategory(name, gameData.platforms);
  const platforms = mapPlatforms(gameData.platforms);
  const esrb = mapESRB(gameData.rating);

  // Generate a unique ID
  const id = gameData.uuid ? `gh-${gameData.uuid}` : `gh-${platform}-${index}`;

  // Generate description based on category and name
  const shortDesc = generateShortDescription(name, category);
  const longDesc = generateLongDescription(name, category, platforms);

  // Generate a trailer search URL (we'll use YouTube search)
  const trailerSearch = `https://www.youtube.com/results?search_query=${encodeURIComponent(name + ' official trailer')}`;

  return {
    id,
    nome: name,
    nome_en: name,
    categoria: category,
    categoria_en: category, // Will translate later if needed
    imagem: gameData.image || `https://via.placeholder.com/600x900?text=${encodeURIComponent(name)}`,
    fundo: gameData.image || `https://via.placeholder.com/1920x1080?text=${encodeURIComponent(name)}`,
    lancado: priceInfo.numeric !== null || priceInfo.original === 'Gratuito',
    nota: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10, // Random rating 3.5-5.0
    descricaoCurta: shortDesc,
    descricaoCurta_en: shortDesc,
    descricaoLonga: longDesc,
    descricaoLonga_en: longDesc,
    desenvolvedora: 'Desenvolvedora a confirmar',
    lancamento: priceInfo.original === 'Gratuito' ? 'Gratuito' : priceInfo.original,
    plataformas: platforms,
    idiomas: 'Português (Brasil), Inglês, Espanhol',
    idiomas_en: 'English, Portuguese, Spanish',
    dublado: false,
    legendado: true,
    trailer: trailerSearch,
    trailerUrl: trailerSearch,
    preco: priceInfo.numeric,
    precoOriginal: priceInfo.original,
    moeda: priceInfo.currency,
    classificacao: esrb,
    fonte: 'game-store-catalog',
    plataformaOrigem: PLATFORM_MAP[platform] || platform,
  };
}

function generateShortDescription(name, category) {
  const templates = {
    'Ação/Aventura': `Embarque em uma aventura épica em ${name}, onde cada decisão molda seu destino.`,
    'RPG': `Crie seu herói e explore um mundo vasto em ${name}, um RPG profundo e imersivo.`,
    'Tiro (FPS/TPS)': `Entre na ação intensa de ${name}, onde reflexos rápidos e estratégia definem a vitória.`,
    'Estratégia': `Comande exércitos e construa impérios em ${name}, um jogo de estratégia profunda.`,
    'Simulação': `Viva uma experiência realista em ${name}, simulando detalhes impressionantes.`,
    'Esportes/Corrida': `Sinta a adrenalina da competição em ${name}, onde cada segundo conta.`,
    'Plataforma/Indie': `Descubra a criatividade única de ${name}, uma joia indie cheia de personalidade.`,
    'Terror': `Sobreviva ao horror em ${name}, onde cada sombra esconde um perigo mortal.`,
    'Puzzle': `Desafie sua mente em ${name}, resolvendo enigmas engenhosos e criativos.`,
  };

  return templates[category] || `Descubra ${name}, uma experiência única no mundo dos jogos.`;
}

function generateLongDescription(name, category, platforms) {
  const base = `${name} é um jogo de ${category.toLowerCase()} disponível para ${platforms}. `;
  const details = `Desenvolvido com atenção aos detalhes, oferece uma experiência envolvente com gráficos impressionantes, jogabilidade refinada e uma narrativa cativante. `;
  const closing = `Seja explorando mundos vastos, competindo online ou desvendando mistérios, ${name} promete horas de diversão para jogadores de todos os níveis.`;

  return base + details + closing;
}

async function processCatalogs() {
  console.log('Starting catalog fetch and conversion...\n');

  // Fetch from multiple platforms (we'll use a subset to avoid huge files)
  const platformsToFetch = ['nintendo', 'epic', 'psn', 'xbox', 'steam'];
  const results = [];

  for (const platform of platformsToFetch) {
    const url = CATALOG_URLS[platform];
    if (!url) continue;

    try {
      const result = await fetchCatalog(platform, url);
      if (result.data && result.data.length > 0) {
        // Process first 200 games from each platform to keep file manageable
        const gamesToProcess = result.data.slice(0, 200);
        const converted = gamesToProcess
          .map((game, i) => convertGame(game, platform, i))
          .filter(g => g !== null);

        results.push(...converted);
        console.log(`  Converted ${converted.length} games from ${platform}`);
      }
    } catch (error) {
      console.error(`Failed to process ${platform}:`, error.message);
    }
  }

  // Deduplicate by name
  const uniqueGames = [];
  const seenNames = new Set();

  for (const game of results) {
    const normalized = normalizeName(game.nome);
    if (!seenNames.has(normalized)) {
      seenNames.add(normalized);
      uniqueGames.push(game);
    }
  }

  console.log(`\nTotal unique games: ${uniqueGames.length}`);

  // Assign sequential IDs
  uniqueGames.forEach((game, index) => {
    game.id = index + 1;
  });

  return uniqueGames;
}

// Run if executed directly
if (require.main === module) {
  processCatalogs()
    .then(games => {
      const output = `// Catálogo de jogos do GameHub - Integrado com game-store-catalog (Ephellon)
// Fonte: https://github.com/Ephellon/game-store-catalog
// Créditos: Ephellon - Catálogo de jogos para PlayStation, Xbox, Nintendo, Epic Games e Steam

const listaDeJogos = ${JSON.stringify(games, null, 2)};
`;

      const outputPath = path.join(__dirname, 'js/dados.js');
      fs.writeFileSync(outputPath, output);
      console.log('\n✓ dados.js updated successfully!');
      console.log(`  Total games: ${games.length}`);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { processCatalogs, convertGame, fetchCatalog };