# ⚡ Pokélor MMO

Jogo multiplayer online inspirado no Pokémon Fire Red — batalhas por turnos, capturas, PvP e progressão de nível.

---

## 🚀 Deploy no Replit (grátis, URL pública em 2 minutos)

1. Acesse https://replit.com e crie uma conta
2. Clique **"+ Create Repl"** → escolha **Node.js**
3. Apague os arquivos padrão e faça upload desta pasta
4. Estrutura correta:
   ```
   server.js
   package.json
   public/
     index.html
   ```
5. Clique **Run** — o Replit instala as dependências e sobe o servidor
6. A URL pública aparece no topo: `https://pokelor.seuusuario.repl.co`
7. Compartilhe com amigos — todos abrem no browser!

## 🚀 Outras opções de deploy

**Railway:** railway.app → New Project → Deploy from GitHub → URL automática  
**Render:** render.com → New Web Service → Build: `npm install` → Start: `node server.js`  
**Glitch:** glitch.com → Import from GitHub → URL instantânea

## 🖥 Rodar local

```bash
npm install
node server.js
# Abra http://localhost:3000
```

---

## 🎮 Como Jogar

### Solo
1. Digite seu nome de Trainer
2. Escolha um Starter (Bulbasaur, Charmander, Squirtle, Pikachu)
3. Clique **"JOGAR SOLO"**

### Multiplayer
1. **Jogador 1:** Registre → **CRIAR SALA** → compartilhe o código de 6 letras
2. **Jogadores 2-8:** Registre → cole o código → **ENTRAR**
3. O host clica **INICIAR JOGO**
4. ⚠️ Após o host iniciar, a sala fica fechada para novos jogadores

### Batalha Selvagem (aba MUNDO)
- Clique **PROCURAR POKÉMON**
- Escolha a ação no painel de batalha:
  - **⚔️ ATACAR** → escolha um dos 4 golpes com PP
  - **⚪ CAPTURAR** → use Poké Ball, Great Ball ou Ultra Ball
  - **🎒 ITENS** → use Poções ou Elixir durante a batalha
  - **🔄 TROCAR** → troque de Pokémon (inimigo ataca depois)
  - **🏃 FUGIR** → foge da batalha

### Sistema de Tipos (Fire Red)
- Água > Fogo, Fogo > Grama, Grama > Água
- Super eficaz (2x), Não muito eficaz (0.5x), Sem efeito (0x)
- Mostrado no log de batalha

### Golpes (TM System)
- Cada Pokémon tem **4 golpes** únicos
- Cada golpe tem **PP limitado** (ex: Raio 8/8)
- Quando o PP acaba, use um **Elixir** (restaura todo PP)
- Compre Elixir na loja por 350💰

### Progressão
- Derrotar Pokémon selvagens → XP e moedas
- Level up automático → stats sobem
- Evolução automática no nível correto (ex: Charmander Lv.16 → Charmeleon)
- Pokémon mais fracos no início para facilitar o começo

### Loja (aba LOJA)
| Item | Preço | Efeito |
|------|-------|--------|
| Poké Ball | 50💰 | Captura básica |
| Great Ball | 150💰 | 1.5x captura |
| Ultra Ball | 300💰 | 2x captura |
| Potion | 80💰 | +20 HP |
| Super Potion | 200💰 | +50 HP |
| Hyper Potion | 400💰 | +100 HP |
| Full Heal | 700💰 | Cura todos os Pokémon |
| XP Boost | 200💰 | +200 XP instantâneo |
| Elixir (TM) | 350💰 | Restaura todo PP dos golpes |

### Itens Iniciais
- 💰 1.000 moedas
- 5x Potion, 2x Super Potion, 1x XP Boost, 1x Elixir, 5x Poké Ball

---

## ➕ Como Adicionar Pokémon Customizados

Abra `server.js` e localize o objeto `const DB = {`. Adicione uma nova entrada seguindo este template:

```javascript
// ID do seu Pokémon (escolha um número não usado, ex: 200)
200: {
  name: 'MeuPokemon',        // Nome
  type: 'Fire',              // Tipo: Fire, Water, Grass, Electric, Psychic,
                             //       Normal, Ghost, Dragon, Fighting, Poison,
                             //       Ground, Flying, Rock, Bug, Ice, Dark, Steel, Fairy
  hp: 60,                    // HP base (será escalado com level)
  atk: 30,                   // Ataque base
  def: 25,                   // Defesa base
  spd: 20,                   // Velocidade base
  rarity: 'uncommon',        // common | uncommon | rare | epic | legendary
  evo: 201,                  // ID da evolução (ou null se não evolui)
  evoLv: 30,                 // Level para evoluir (omita se evo: null)
  moves: [
    // Golpe 1 — fraco, PP alto (ataque rápido)
    {name: 'Arranhão',    type: 'Normal', power: 10, maxPp: 15},
    // Golpe 2 — médio-fraco
    {name: 'Chama Leve',  type: 'Fire',   power: 18, maxPp: 12},
    // Golpe 3 — médio-forte
    {name: 'Explosão',    type: 'Fire',   power: 30, maxPp: 8},
    // Golpe 4 — forte, PP baixo (golpe especial/TM)
    {name: 'Mega Chama',  type: 'Fire',   power: 48, maxPp: 5},
  ]
},

// Evolução (se tiver)
201: {
  name: 'MegaPokemon',
  type: 'Fire',
  hp: 90, atk: 50, def: 40, spd: 35,
  rarity: 'rare',
  evo: null,
  moves: [
    {name: 'Golpe Rápido', type: 'Normal', power: 14, maxPp: 15},
    {name: 'Chama Forte',  type: 'Fire',   power: 28, maxPp: 12},
    {name: 'Explosão X',   type: 'Fire',   power: 42, maxPp: 8},
    {name: 'Inferno',      type: 'Fire',   power: 65, maxPp: 5},
  ]
},
```

### Para que o Pokémon apareça no wild:
Adicione o ID nos pools de spawn em `server.js`:
```javascript
const WILD_LOW  = [..., 200]; // aparece para trainers novatos (lv 1-8)
const WILD_MID  = [..., 200]; // aparece para trainers médios (lv 9-20)
const WILD_HIGH = [..., 201]; // aparece para trainers avançados (lv 21-35)
const WILD_EPIC = [..., 201]; // aparece para trainers experientes (lv 36+)
```

### Para que seja um Starter:
Adicione o ID em `const STARTER_IDS` e no cliente em `const STARTERS`.

### Efeitos especiais nos golpes (opcional):
- `effect: 'sleep'` → narrativa de sonolência
- `effect: 'debuff'` → narrativa de debuff de ataque  
- `effect: 'defend'` → narrativa de defesa
- `effect: 'boost'` → narrativa de buff
- `effect: 'heal'` → narrativa de cura
- `effect: 'flee'` → narrativa de fuga

---

## 🐛 Bugs Corrigidos (v2.0)

- ✅ Pokémon ativo não troca sozinho durante batalha
- ✅ Botões de ação travados após batalha longa (timeout fix)
- ✅ Dupla instância do host na sala (prevenção de duplicate register)
- ✅ Sala fecha para novos jogadores após host iniciar
- ✅ Batalha não fica infinita (turnLock server-side)
- ✅ Evolução funcionando corretamente em todas as gerações
- ✅ Sistema de fraquezas de tipos completo (Fire Red)
- ✅ Pokémon morto bloqueia busca de wild com mensagem clara
- ✅ Troca de Pokémon dentro da batalha (painel Switch)
- ✅ Botão de Itens na batalha (Poções + Elixir)
- ✅ PP dos golpes com restauração via Elixir
- ✅ Pokémon selvagens mais fracos no início do jogo
- ✅ Sprite do jogador à esquerda, inimigo à direita
- ✅ Começar com 1.000 moedas
- ✅ Múltiplos golpes por Pokémon (4 moves com PP individual)
- ✅ Elixir restaura PP (sistema de TM)
- ✅ Mensagem quando todos os Pokémon desmaiarem

---

## 📁 Estrutura

```
pokelor/
├── server.js        # Servidor Node.js + Socket.io
├── package.json     # Dependências npm
├── README.md        # Este arquivo
└── public/
    └── index.html   # Cliente completo (tudo em um arquivo)
```
