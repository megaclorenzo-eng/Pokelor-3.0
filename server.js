const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
  pingTimeout: 30000,
  pingInterval: 10000,
  connectTimeout: 20000,
});
app.use(express.static(path.join(__dirname, 'public')));

// ═══ TYPE CHART ═══════════════════════════════════
const EFF = {
  Normal:   {Fighting:2,Ghost:0},
  Fire:     {Water:2,Rock:2,Ground:2,Fire:.5,Grass:.5,Ice:.5,Bug:.5,Steel:.5},
  Water:    {Electric:2,Grass:2,Water:.5,Fire:.5,Ice:.5},
  Electric: {Ground:2,Electric:.5,Flying:.5},
  Grass:    {Fire:2,Ice:2,Poison:2,Flying:2,Bug:2,Water:.5,Electric:.5,Grass:.5,Ground:.5},
  Ice:      {Fire:2,Fighting:2,Rock:2,Steel:2,Ice:.5},
  Fighting: {Flying:2,Psychic:2,Bug:.5,Rock:.5,Dark:.5},
  Poison:   {Ground:2,Psychic:2,Fighting:.5,Poison:.5,Bug:.5,Grass:.5},
  Ground:   {Water:2,Grass:2,Ice:2,Poison:.5,Rock:.5,Electric:0,Flying:0},
  Flying:   {Electric:2,Ice:2,Rock:2,Fighting:.5,Bug:.5,Grass:.5,Ground:0},
  Psychic:  {Bug:2,Ghost:2,Dark:2,Fighting:.5,Psychic:.5},
  Bug:      {Fire:2,Flying:2,Rock:2,Fighting:.5,Ground:.5,Grass:.5},
  Rock:     {Water:2,Grass:2,Fighting:2,Ground:2,Steel:2,Normal:.5,Fire:.5,Poison:.5,Flying:.5},
  Ghost:    {Ghost:2,Dark:2,Normal:0,Fighting:0,Poison:.5,Bug:.5},
  Dragon:   {Ice:2,Dragon:2,Fairy:2,Fire:.5,Water:.5,Electric:.5,Grass:.5},
  Dark:     {Fighting:2,Bug:2,Fairy:2,Ghost:.5,Dark:.5,Psychic:0},
  Steel:    {Fire:2,Fighting:2,Ground:2,Normal:.5,Grass:.5,Ice:.5,Flying:.5,Psychic:.5,Bug:.5,Rock:.5,Dragon:.5,Steel:.5},
  Fairy:    {Poison:2,Steel:2,Fighting:.5,Bug:.5,Dark:.5,Dragon:0},
};
function typeEff(atk,def){ return (EFF[def]||{})[atk]??1; }

// ═══ POKEMON DATABASE ═════════════════════════════
const DB = {
  1:{name:'Bulbasaur',type:'Grass',hp:45,atk:20,def:15,spd:10,rarity:'common',evo:2,evoLv:16,moves:[{name:'Vine Whip',type:'Grass',power:12,maxPp:15},{name:'Razor Leaf',type:'Grass',power:22,maxPp:10},{name:'Sleep Powder',type:'Grass',power:0,maxPp:8,effect:'sleep'},{name:'Solar Beam',type:'Grass',power:38,maxPp:5}]},
  2:{name:'Ivysaur',type:'Grass',hp:60,atk:30,def:22,spd:15,rarity:'uncommon',evo:3,evoLv:32,moves:[{name:'Vine Whip',type:'Grass',power:16,maxPp:15},{name:'Razor Leaf',type:'Grass',power:26,maxPp:10},{name:'Leech Seed',type:'Grass',power:0,maxPp:8,effect:'sleep'},{name:'Solar Beam',type:'Grass',power:44,maxPp:5}]},
  3:{name:'Venusaur',type:'Grass',hp:80,atk:45,def:35,spd:25,rarity:'rare',evo:null,moves:[{name:'Vine Whip',type:'Grass',power:20,maxPp:15},{name:'Razor Leaf',type:'Grass',power:32,maxPp:10},{name:'Body Slam',type:'Normal',power:40,maxPp:8},{name:'Solar Beam',type:'Grass',power:58,maxPp:5}]},
  4:{name:'Charmander',type:'Fire',hp:39,atk:22,def:12,spd:18,rarity:'common',evo:5,evoLv:16,moves:[{name:'Scratch',type:'Normal',power:10,maxPp:15},{name:'Ember',type:'Fire',power:20,maxPp:12},{name:'Smokescreen',type:'Normal',power:0,maxPp:8,effect:'debuff'},{name:'Flamethrower',type:'Fire',power:35,maxPp:5}]},
  5:{name:'Charmeleon',type:'Fire',hp:58,atk:34,def:20,spd:26,rarity:'uncommon',evo:6,evoLv:36,moves:[{name:'Scratch',type:'Normal',power:14,maxPp:15},{name:'Ember',type:'Fire',power:26,maxPp:12},{name:'Rage',type:'Normal',power:22,maxPp:8},{name:'Flamethrower',type:'Fire',power:44,maxPp:5}]},
  6:{name:'Charizard',type:'Fire',hp:78,atk:52,def:32,spd:38,rarity:'rare',evo:null,moves:[{name:'Wing Attack',type:'Flying',power:22,maxPp:15},{name:'Fire Spin',type:'Fire',power:32,maxPp:12},{name:'Slash',type:'Normal',power:42,maxPp:8},{name:'Fire Blast',type:'Fire',power:64,maxPp:5}]},
  7:{name:'Squirtle',type:'Water',hp:44,atk:18,def:20,spd:14,rarity:'common',evo:8,evoLv:16,moves:[{name:'Tackle',type:'Normal',power:10,maxPp:15},{name:'Water Gun',type:'Water',power:20,maxPp:12},{name:'Withdraw',type:'Normal',power:0,maxPp:8,effect:'defend'},{name:'Hydro Pump',type:'Water',power:35,maxPp:5}]},
  8:{name:'Wartortle',type:'Water',hp:59,atk:28,def:30,spd:20,rarity:'uncommon',evo:9,evoLv:36,moves:[{name:'Tackle',type:'Normal',power:14,maxPp:15},{name:'Water Gun',type:'Water',power:26,maxPp:12},{name:'Bite',type:'Dark',power:32,maxPp:8},{name:'Hydro Pump',type:'Water',power:45,maxPp:5}]},
  9:{name:'Blastoise',type:'Water',hp:79,atk:42,def:45,spd:28,rarity:'rare',evo:null,moves:[{name:'Tackle',type:'Normal',power:18,maxPp:15},{name:'Surf',type:'Water',power:34,maxPp:12},{name:'Ice Beam',type:'Ice',power:44,maxPp:8},{name:'Hydro Pump',type:'Water',power:62,maxPp:5}]},
  10:{name:'Caterpie',type:'Bug',hp:45,atk:10,def:8,spd:10,rarity:'common',evo:11,evoLv:7,moves:[{name:'Tackle',type:'Normal',power:8,maxPp:15},{name:'String Shot',type:'Bug',power:5,maxPp:12},{name:'Bug Bite',type:'Bug',power:12,maxPp:10},{name:'Bug Buzz',type:'Bug',power:18,maxPp:5}]},
  11:{name:'Metapod',type:'Bug',hp:50,atk:8,def:18,spd:5,rarity:'common',evo:12,evoLv:10,moves:[{name:'Tackle',type:'Normal',power:8,maxPp:15},{name:'Harden',type:'Normal',power:0,maxPp:12,effect:'defend'},{name:'Bug Bite',type:'Bug',power:14,maxPp:10},{name:'Struggle',type:'Normal',power:16,maxPp:5}]},
  12:{name:'Butterfree',type:'Bug',hp:60,atk:22,def:20,spd:22,rarity:'uncommon',evo:null,moves:[{name:'Gust',type:'Flying',power:18,maxPp:15},{name:'Confusion',type:'Psychic',power:28,maxPp:12},{name:'Sleep Powder',type:'Grass',power:0,maxPp:8,effect:'sleep'},{name:'Psychic',type:'Psychic',power:42,maxPp:5}]},
  13:{name:'Weedle',type:'Poison',hp:40,atk:12,def:8,spd:12,rarity:'common',evo:14,evoLv:7,moves:[{name:'Poison Sting',type:'Poison',power:8,maxPp:15},{name:'String Shot',type:'Bug',power:5,maxPp:12},{name:'Bug Bite',type:'Bug',power:14,maxPp:10},{name:'Venoshock',type:'Poison',power:20,maxPp:5}]},
  14:{name:'Kakuna',type:'Poison',hp:45,atk:10,def:20,spd:7,rarity:'common',evo:15,evoLv:10,moves:[{name:'Poison Sting',type:'Poison',power:8,maxPp:15},{name:'Harden',type:'Normal',power:0,maxPp:12,effect:'defend'},{name:'Bug Bite',type:'Bug',power:14,maxPp:10},{name:'Venoshock',type:'Poison',power:22,maxPp:5}]},
  15:{name:'Beedrill',type:'Poison',hp:65,atk:32,def:18,spd:28,rarity:'uncommon',evo:null,moves:[{name:'Fury Attack',type:'Normal',power:18,maxPp:15},{name:'Poison Jab',type:'Poison',power:28,maxPp:12},{name:'Twineedle',type:'Bug',power:36,maxPp:8},{name:'Pin Missile',type:'Bug',power:50,maxPp:5}]},
  16:{name:'Pidgey',type:'Flying',hp:40,atk:14,def:10,spd:16,rarity:'common',evo:17,evoLv:18,moves:[{name:'Gust',type:'Flying',power:10,maxPp:15},{name:'Sand Attack',type:'Ground',power:0,maxPp:12,effect:'debuff'},{name:'Wing Attack',type:'Flying',power:20,maxPp:10},{name:'Aerial Ace',type:'Flying',power:28,maxPp:5}]},
  17:{name:'Pidgeotto',type:'Flying',hp:63,atk:22,def:17,spd:24,rarity:'uncommon',evo:18,evoLv:36,moves:[{name:'Gust',type:'Flying',power:14,maxPp:15},{name:'Wing Attack',type:'Flying',power:24,maxPp:12},{name:'Agility',type:'Normal',power:0,maxPp:8,effect:'boost'},{name:'Aerial Ace',type:'Flying',power:36,maxPp:5}]},
  18:{name:'Pidgeot',type:'Flying',hp:83,atk:34,def:26,spd:36,rarity:'rare',evo:null,moves:[{name:'Wing Attack',type:'Flying',power:22,maxPp:15},{name:'Air Slash',type:'Flying',power:34,maxPp:12},{name:'Agility',type:'Normal',power:0,maxPp:8,effect:'boost'},{name:'Hurricane',type:'Flying',power:56,maxPp:5}]},
  19:{name:'Rattata',type:'Normal',hp:30,atk:14,def:9,spd:18,rarity:'common',evo:20,evoLv:20,moves:[{name:'Tackle',type:'Normal',power:8,maxPp:15},{name:'Quick Attack',type:'Normal',power:12,maxPp:12},{name:'Bite',type:'Dark',power:18,maxPp:10},{name:'Hyper Fang',type:'Normal',power:28,maxPp:5}]},
  20:{name:'Raticate',type:'Normal',hp:55,atk:24,def:18,spd:28,rarity:'uncommon',evo:null,moves:[{name:'Quick Attack',type:'Normal',power:12,maxPp:15},{name:'Bite',type:'Dark',power:22,maxPp:12},{name:'Hyper Fang',type:'Normal',power:34,maxPp:8},{name:'Super Fang',type:'Normal',power:46,maxPp:5}]},
  23:{name:'Ekans',type:'Poison',hp:35,atk:16,def:12,spd:14,rarity:'common',evo:24,evoLv:22,moves:[{name:'Wrap',type:'Normal',power:8,maxPp:15},{name:'Poison Sting',type:'Poison',power:14,maxPp:12},{name:'Bite',type:'Dark',power:20,maxPp:10},{name:'Acid',type:'Poison',power:30,maxPp:5}]},
  24:{name:'Arbok',type:'Poison',hp:60,atk:30,def:22,spd:24,rarity:'uncommon',evo:null,moves:[{name:'Wrap',type:'Normal',power:12,maxPp:15},{name:'Poison Jab',type:'Poison',power:26,maxPp:12},{name:'Bite',type:'Dark',power:32,maxPp:8},{name:'Gunk Shot',type:'Poison',power:48,maxPp:5}]},
  25:{name:'Pikachu',type:'Electric',hp:35,atk:22,def:12,spd:22,rarity:'uncommon',evo:26,evoLv:22,moves:[{name:'Thunder Shock',type:'Electric',power:10,maxPp:15},{name:'Quick Attack',type:'Normal',power:14,maxPp:12},{name:'Thunderbolt',type:'Electric',power:26,maxPp:8},{name:'Thunder',type:'Electric',power:42,maxPp:5}]},
  26:{name:'Raichu',type:'Electric',hp:60,atk:38,def:22,spd:32,rarity:'rare',evo:null,moves:[{name:'Thunder Shock',type:'Electric',power:14,maxPp:15},{name:'Quick Attack',type:'Normal',power:18,maxPp:12},{name:'Thunderbolt',type:'Electric',power:34,maxPp:8},{name:'Thunder',type:'Electric',power:54,maxPp:5}]},
  27:{name:'Sandshrew',type:'Ground',hp:50,atk:16,def:22,spd:10,rarity:'common',evo:28,evoLv:22,moves:[{name:'Scratch',type:'Normal',power:8,maxPp:15},{name:'Sand Attack',type:'Ground',power:10,maxPp:12},{name:'Slash',type:'Normal',power:20,maxPp:10},{name:'Earthquake',type:'Ground',power:30,maxPp:5}]},
  28:{name:'Sandslash',type:'Ground',hp:75,atk:28,def:35,spd:18,rarity:'uncommon',evo:null,moves:[{name:'Scratch',type:'Normal',power:12,maxPp:15},{name:'Slash',type:'Normal',power:26,maxPp:12},{name:'Sand Tomb',type:'Ground',power:34,maxPp:8},{name:'Earthquake',type:'Ground',power:48,maxPp:5}]},
  39:{name:'Jigglypuff',type:'Normal',hp:115,atk:18,def:10,spd:12,rarity:'common',evo:40,evoLv:30,moves:[{name:'Pound',type:'Normal',power:8,maxPp:15},{name:'Sing',type:'Normal',power:0,maxPp:12,effect:'sleep'},{name:'Body Slam',type:'Normal',power:20,maxPp:10},{name:'Hyper Voice',type:'Normal',power:30,maxPp:5}]},
  40:{name:'Wigglytuff',type:'Normal',hp:140,atk:28,def:18,spd:16,rarity:'uncommon',evo:null,moves:[{name:'Pound',type:'Normal',power:12,maxPp:15},{name:'Body Slam',type:'Normal',power:26,maxPp:12},{name:'Hyper Voice',type:'Normal',power:36,maxPp:8},{name:'Play Rough',type:'Fairy',power:50,maxPp:5}]},
  41:{name:'Zubat',type:'Poison',hp:40,atk:14,def:10,spd:18,rarity:'common',evo:42,evoLv:22,moves:[{name:'Leech Life',type:'Bug',power:8,maxPp:15},{name:'Supersonic',type:'Normal',power:0,maxPp:12,effect:'sleep'},{name:'Wing Attack',type:'Flying',power:20,maxPp:10},{name:'Air Cutter',type:'Flying',power:28,maxPp:5}]},
  42:{name:'Golbat',type:'Poison',hp:75,atk:26,def:20,spd:28,rarity:'uncommon',evo:null,moves:[{name:'Leech Life',type:'Bug',power:12,maxPp:15},{name:'Wing Attack',type:'Flying',power:24,maxPp:12},{name:'Air Cutter',type:'Flying',power:32,maxPp:8},{name:'Cross Poison',type:'Poison',power:46,maxPp:5}]},
  43:{name:'Oddish',type:'Grass',hp:45,atk:14,def:14,spd:8,rarity:'common',evo:44,evoLv:21,moves:[{name:'Absorb',type:'Grass',power:10,maxPp:15},{name:'Sleep Powder',type:'Grass',power:0,maxPp:12,effect:'sleep'},{name:'Mega Drain',type:'Grass',power:20,maxPp:10},{name:'Petal Blizzard',type:'Grass',power:30,maxPp:5}]},
  44:{name:'Gloom',type:'Grass',hp:60,atk:22,def:22,spd:12,rarity:'uncommon',evo:45,evoLv:36,moves:[{name:'Absorb',type:'Grass',power:14,maxPp:15},{name:'Sleep Powder',type:'Grass',power:0,maxPp:12,effect:'sleep'},{name:'Mega Drain',type:'Grass',power:26,maxPp:8},{name:'Petal Dance',type:'Grass',power:42,maxPp:5}]},
  45:{name:'Vileplume',type:'Grass',hp:75,atk:32,def:30,spd:18,rarity:'rare',evo:null,moves:[{name:'Absorb',type:'Grass',power:18,maxPp:15},{name:'Stun Spore',type:'Grass',power:0,maxPp:12,effect:'debuff'},{name:'Giga Drain',type:'Grass',power:36,maxPp:8},{name:'Petal Dance',type:'Grass',power:54,maxPp:5}]},
  50:{name:'Diglett',type:'Ground',hp:10,atk:22,def:5,spd:32,rarity:'common',evo:51,evoLv:26,moves:[{name:'Scratch',type:'Normal',power:8,maxPp:15},{name:'Sand Attack',type:'Ground',power:12,maxPp:12},{name:'Dig',type:'Ground',power:24,maxPp:10},{name:'Earthquake',type:'Ground',power:36,maxPp:5}]},
  51:{name:'Dugtrio',type:'Ground',hp:35,atk:34,def:12,spd:44,rarity:'uncommon',evo:null,moves:[{name:'Scratch',type:'Normal',power:12,maxPp:15},{name:'Dig',type:'Ground',power:28,maxPp:12},{name:'Sand Tomb',type:'Ground',power:36,maxPp:8},{name:'Earthquake',type:'Ground',power:52,maxPp:5}]},
  52:{name:'Meowth',type:'Normal',hp:40,atk:16,def:12,spd:18,rarity:'common',evo:53,evoLv:28,moves:[{name:'Scratch',type:'Normal',power:8,maxPp:15},{name:'Pay Day',type:'Normal',power:12,maxPp:12},{name:'Bite',type:'Dark',power:20,maxPp:10},{name:'Night Slash',type:'Dark',power:30,maxPp:5}]},
  53:{name:'Persian',type:'Normal',hp:65,atk:28,def:22,spd:30,rarity:'uncommon',evo:null,moves:[{name:'Scratch',type:'Normal',power:12,maxPp:15},{name:'Bite',type:'Dark',power:24,maxPp:12},{name:'Swift',type:'Normal',power:32,maxPp:8},{name:'Night Slash',type:'Dark',power:46,maxPp:5}]},
  54:{name:'Psyduck',type:'Water',hp:50,atk:18,def:16,spd:14,rarity:'common',evo:55,evoLv:33,moves:[{name:'Scratch',type:'Normal',power:8,maxPp:15},{name:'Water Gun',type:'Water',power:18,maxPp:12},{name:'Confusion',type:'Psychic',power:24,maxPp:10},{name:'Hydro Pump',type:'Water',power:36,maxPp:5}]},
  55:{name:'Golduck',type:'Water',hp:80,atk:30,def:26,spd:24,rarity:'uncommon',evo:null,moves:[{name:'Scratch',type:'Normal',power:12,maxPp:15},{name:'Surf',type:'Water',power:28,maxPp:12},{name:'Confusion',type:'Psychic',power:34,maxPp:8},{name:'Hydro Pump',type:'Water',power:50,maxPp:5}]},
  58:{name:'Growlithe',type:'Fire',hp:55,atk:22,def:14,spd:18,rarity:'common',evo:59,evoLv:36,moves:[{name:'Bite',type:'Dark',power:8,maxPp:15},{name:'Ember',type:'Fire',power:18,maxPp:12},{name:'Flame Wheel',type:'Fire',power:26,maxPp:10},{name:'Flamethrower',type:'Fire',power:38,maxPp:5}]},
  59:{name:'Arcanine',type:'Fire',hp:90,atk:42,def:28,spd:38,rarity:'rare',evo:null,moves:[{name:'Bite',type:'Dark',power:14,maxPp:15},{name:'Flame Wheel',type:'Fire',power:30,maxPp:12},{name:'Crunch',type:'Dark',power:40,maxPp:8},{name:'Fire Blast',type:'Fire',power:60,maxPp:5}]},
  60:{name:'Poliwag',type:'Water',hp:40,atk:12,def:12,spd:20,rarity:'common',evo:61,evoLv:25,moves:[{name:'Bubble',type:'Water',power:8,maxPp:15},{name:'Water Gun',type:'Water',power:16,maxPp:12},{name:'Hypnosis',type:'Psychic',power:0,maxPp:8,effect:'sleep'},{name:'Hydro Pump',type:'Water',power:30,maxPp:5}]},
  63:{name:'Abra',type:'Psychic',hp:25,atk:8,def:5,spd:20,rarity:'uncommon',evo:64,evoLv:16,moves:[{name:'Teleport',type:'Psychic',power:0,maxPp:15,effect:'flee'},{name:'Confusion',type:'Psychic',power:12,maxPp:12},{name:'Psywave',type:'Psychic',power:20,maxPp:10},{name:'Psychic',type:'Psychic',power:30,maxPp:5}]},
  64:{name:'Kadabra',type:'Psychic',hp:40,atk:18,def:10,spd:28,rarity:'rare',evo:65,evoLv:36,moves:[{name:'Confusion',type:'Psychic',power:16,maxPp:15},{name:'Psywave',type:'Psychic',power:26,maxPp:12},{name:'Future Sight',type:'Psychic',power:34,maxPp:8},{name:'Psychic',type:'Psychic',power:50,maxPp:5}]},
  65:{name:'Alakazam',type:'Psychic',hp:55,atk:28,def:14,spd:38,rarity:'epic',evo:null,moves:[{name:'Confusion',type:'Psychic',power:20,maxPp:15},{name:'Psybeam',type:'Psychic',power:32,maxPp:12},{name:'Future Sight',type:'Psychic',power:44,maxPp:8},{name:'Psychic',type:'Psychic',power:64,maxPp:5}]},
  74:{name:'Geodude',type:'Rock',hp:40,atk:18,def:28,spd:6,rarity:'common',evo:75,evoLv:25,moves:[{name:'Tackle',type:'Normal',power:8,maxPp:15},{name:'Rock Throw',type:'Rock',power:18,maxPp:12},{name:'Rock Slide',type:'Rock',power:26,maxPp:10},{name:'Rock Blast',type:'Rock',power:34,maxPp:5}]},
  75:{name:'Graveler',type:'Rock',hp:55,atk:28,def:40,spd:10,rarity:'uncommon',evo:76,evoLv:36,moves:[{name:'Rock Throw',type:'Rock',power:14,maxPp:15},{name:'Rock Slide',type:'Rock',power:28,maxPp:12},{name:'Earthquake',type:'Ground',power:36,maxPp:8},{name:'Stone Edge',type:'Rock',power:52,maxPp:5}]},
  76:{name:'Golem',type:'Rock',hp:80,atk:44,def:58,spd:16,rarity:'rare',evo:null,moves:[{name:'Rock Slide',type:'Rock',power:22,maxPp:15},{name:'Earthquake',type:'Ground',power:34,maxPp:12},{name:'Stone Edge',type:'Rock',power:48,maxPp:8},{name:'Explosion',type:'Normal',power:72,maxPp:5}]},
  79:{name:'Slowpoke',type:'Water',hp:90,atk:14,def:20,spd:5,rarity:'common',evo:80,evoLv:37,moves:[{name:'Confusion',type:'Psychic',power:8,maxPp:15},{name:'Water Gun',type:'Water',power:16,maxPp:12},{name:'Amnesia',type:'Normal',power:0,maxPp:8,effect:'boost'},{name:'Surf',type:'Water',power:30,maxPp:5}]},
  92:{name:'Gastly',type:'Ghost',hp:30,atk:16,def:5,spd:22,rarity:'uncommon',evo:93,evoLv:25,moves:[{name:'Lick',type:'Ghost',power:10,maxPp:15},{name:'Spite',type:'Ghost',power:14,maxPp:12},{name:'Shadow Ball',type:'Ghost',power:24,maxPp:10},{name:'Hex',type:'Ghost',power:34,maxPp:5}]},
  93:{name:'Haunter',type:'Ghost',hp:45,atk:24,def:10,spd:30,rarity:'rare',evo:94,evoLv:36,moves:[{name:'Lick',type:'Ghost',power:14,maxPp:15},{name:'Shadow Ball',type:'Ghost',power:28,maxPp:12},{name:'Dark Pulse',type:'Dark',power:36,maxPp:8},{name:'Shadow Force',type:'Ghost',power:52,maxPp:5}]},
  94:{name:'Gengar',type:'Ghost',hp:60,atk:34,def:18,spd:38,rarity:'rare',evo:null,moves:[{name:'Shadow Ball',type:'Ghost',power:24,maxPp:15},{name:'Dark Pulse',type:'Dark',power:34,maxPp:12},{name:'Shadow Force',type:'Ghost',power:46,maxPp:8},{name:'Hex',type:'Ghost',power:62,maxPp:5}]},
  100:{name:'Voltorb',type:'Electric',hp:40,atk:14,def:18,spd:28,rarity:'common',evo:101,evoLv:30,moves:[{name:'Thunder Shock',type:'Electric',power:8,maxPp:15},{name:'Spark',type:'Electric',power:16,maxPp:12},{name:'Thunderbolt',type:'Electric',power:24,maxPp:10},{name:'Explosion',type:'Normal',power:38,maxPp:5}]},
  101:{name:'Electrode',type:'Electric',hp:60,atk:22,def:26,spd:40,rarity:'uncommon',evo:null,moves:[{name:'Spark',type:'Electric',power:14,maxPp:15},{name:'Thunderbolt',type:'Electric',power:28,maxPp:12},{name:'Thunder',type:'Electric',power:38,maxPp:8},{name:'Explosion',type:'Normal',power:56,maxPp:5}]},
  129:{name:'Magikarp',type:'Water',hp:20,atk:4,def:8,spd:18,rarity:'common',evo:130,evoLv:20,moves:[{name:'Splash',type:'Normal',power:1,maxPp:15},{name:'Tackle',type:'Normal',power:6,maxPp:12},{name:'Flail',type:'Normal',power:10,maxPp:10},{name:'Bounce',type:'Flying',power:16,maxPp:5}]},
  130:{name:'Gyarados',type:'Water',hp:95,atk:55,def:35,spd:30,rarity:'epic',evo:null,moves:[{name:'Bite',type:'Dark',power:22,maxPp:15},{name:'Dragon Rage',type:'Dragon',power:36,maxPp:12},{name:'Aqua Tail',type:'Water',power:48,maxPp:8},{name:'Hyper Beam',type:'Normal',power:68,maxPp:5}]},
  131:{name:'Lapras',type:'Water',hp:130,atk:36,def:36,spd:22,rarity:'rare',evo:null,moves:[{name:'Water Gun',type:'Water',power:14,maxPp:15},{name:'Ice Beam',type:'Ice',power:30,maxPp:12},{name:'Surf',type:'Water',power:40,maxPp:8},{name:'Blizzard',type:'Ice',power:58,maxPp:5}]},
  143:{name:'Snorlax',type:'Normal',hp:160,atk:46,def:32,spd:8,rarity:'rare',evo:null,moves:[{name:'Tackle',type:'Normal',power:18,maxPp:15},{name:'Body Slam',type:'Normal',power:34,maxPp:12},{name:'Crunch',type:'Dark',power:44,maxPp:8},{name:'Hyper Beam',type:'Normal',power:64,maxPp:5}]},
  147:{name:'Dratini',type:'Dragon',hp:41,atk:24,def:18,spd:18,rarity:'uncommon',evo:148,evoLv:30,moves:[{name:'Wrap',type:'Normal',power:10,maxPp:15},{name:'Dragon Rage',type:'Dragon',power:20,maxPp:12},{name:'Twister',type:'Dragon',power:28,maxPp:10},{name:'Dragon Pulse',type:'Dragon',power:38,maxPp:5}]},
  148:{name:'Dragonair',type:'Dragon',hp:61,atk:36,def:28,spd:26,rarity:'rare',evo:149,evoLv:55,moves:[{name:'Dragon Rage',type:'Dragon',power:16,maxPp:15},{name:'Twister',type:'Dragon',power:28,maxPp:12},{name:'Dragon Pulse',type:'Dragon',power:40,maxPp:8},{name:'Outrage',type:'Dragon',power:60,maxPp:5}]},
  149:{name:'Dragonite',type:'Dragon',hp:91,atk:56,def:40,spd:36,rarity:'epic',evo:null,moves:[{name:'Dragon Rush',type:'Dragon',power:28,maxPp:15},{name:'Dragon Pulse',type:'Dragon',power:40,maxPp:12},{name:'Outrage',type:'Dragon',power:54,maxPp:8},{name:'Hyper Beam',type:'Normal',power:74,maxPp:5}]},
  150:{name:'Mewtwo',type:'Psychic',hp:106,atk:50,def:38,spd:44,rarity:'legendary',evo:null,moves:[{name:'Confusion',type:'Psychic',power:22,maxPp:15},{name:'Psybeam',type:'Psychic',power:36,maxPp:12},{name:'Psychic',type:'Psychic',power:50,maxPp:8},{name:'Psystrike',type:'Psychic',power:72,maxPp:5}]},
  151:{name:'Mew',type:'Psychic',hp:100,atk:40,def:40,spd:40,rarity:'legendary',evo:null,moves:[{name:'Pound',type:'Normal',power:20,maxPp:15},{name:'Psychic',type:'Psychic',power:38,maxPp:12},{name:'Ancient Power',type:'Rock',power:48,maxPp:8},{name:'Transform',type:'Normal',power:62,maxPp:5}]},
};

const WILD_LOW  = [10,13,16,19,23,27,39,41,43,50,52,54,60,74,79,100,129];
const WILD_MID  = [1,4,7,25,40,42,44,54,58,63,75,80,92,101,147];
const WILD_HIGH = [2,5,8,15,18,20,24,28,45,51,55,59,64,76,93,131,148];
const WILD_EPIC = [3,6,9,26,65,94,130,149,150,151];
const STARTERS  = [1,4,7,25];

const SHOP = [
  {id:'pokeball',   name:'Poké Ball',    cost:50,  type:'ball', desc:'Captura básica'},
  {id:'greatball',  name:'Great Ball',   cost:150, type:'ball', desc:'1.5x captura'},
  {id:'ultraball',  name:'Ultra Ball',   cost:300, type:'ball', desc:'2x captura'},
  {id:'potion',     name:'Potion',       cost:80,  type:'heal', desc:'+20 HP'},
  {id:'superpotion',name:'Super Potion', cost:200, type:'heal', desc:'+50 HP'},
  {id:'hyperpotion',name:'Hyper Potion', cost:400, type:'heal', desc:'+100 HP'},
  {id:'fullheal',   name:'Full Heal',    cost:700, type:'heal', desc:'Cura TOTAL de todos'},
  {id:'xpboost',    name:'XP Boost',     cost:200, type:'boost',desc:'+200 XP instantâneo'},
  {id:'elixir',     name:'Elixir',       cost:350, type:'pp',  desc:'Restaura PP de todos golpes'},
];

const rooms={}, players={};

function code(){ return Math.random().toString(36).substr(2,6).toUpperCase(); }

function buildPk(id,lv){
  const b=DB[id]; if(!b) return null;
  const s=1+(lv-1)*0.08;
  const mhp=Math.floor((b.hp+lv*2)*s);
  return {
    id,name:b.name,type:b.type,level:lv,xp:0,
    maxHp:mhp,currentHp:mhp,
    atk:Math.floor(b.atk*s),
    def:Math.floor(b.def*s),
    spd:Math.floor(b.spd*s),
    moves:b.moves.map(m=>({...m,pp:m.maxPp})),
  };
}

function newPlayer(sid,name,sid2){
  return {
    id:sid,name,coins:1000,
    items:{pokeball:5,greatball:0,ultraball:0,potion:5,superpotion:2,hyperpotion:0,fullheal:0,xpboost:1,elixir:1},
    pokemon:[buildPk(sid2,5)],
    activePokemonIndex:0,
    inBattle:false,battleData:null,roomCode:null,
  };
}

function apk(p){ return p.pokemon[p.activePokemonIndex]; }

function spawnWild(plv){
  let pool;
  if(plv<=8)       pool=WILD_LOW;
  else if(plv<=20) pool=[...WILD_LOW,...WILD_MID];
  else if(plv<=35) pool=[...WILD_MID,...WILD_HIGH];
  else             pool=[...WILD_HIGH,...WILD_EPIC];
  const id=pool[Math.floor(Math.random()*pool.length)];
  const b=DB[id]; if(!b) return spawnWild(plv); // retry if missing
  const lv=Math.max(2,plv+Math.floor(Math.random()*5)-2);
  const pk=buildPk(id,lv);
  const nm=plv<=10?0.5:plv<=20?0.6:plv<=35?0.7:0.8;
  pk.atk=Math.max(1,Math.floor(pk.atk*nm));
  pk.def=Math.max(1,Math.floor(pk.def*nm));
  pk.maxHp=Math.max(5,Math.floor(pk.maxHp*nm));
  pk.currentHp=pk.maxHp;
  pk.rarity=b.rarity;
  return pk;
}

function dmg(atk,def,mt,dt,pw){
  if(pw===0) return {d:0,e:1};
  const e=typeEff(mt,dt);
  const r=Math.max(1,Math.floor(pw*(atk/(def+1))*(0.85+Math.random()*0.15)));
  return {d:e===0?0:Math.floor(r*e),e};
}

function xpNeed(lv){ return lv*lv*12; }

function gainXp(p,base){
  const pk=apk(p); if(!pk) return {};
  pk.xp+=base;
  let lv=false,ev=false,nn='';
  while(pk.xp>=xpNeed(pk.level)){
    pk.xp-=xpNeed(pk.level); pk.level++;
    pk.maxHp+=4; pk.currentHp=Math.min(pk.currentHp+4,pk.maxHp);
    pk.atk=Math.floor(pk.atk*1.06); pk.def=Math.floor(pk.def*1.04); pk.spd=Math.floor(pk.spd*1.04);
    lv=true;
    const b=DB[pk.id];
    if(b&&b.evo&&pk.level>=b.evoLv){
      const eb=DB[b.evo];
      if(eb){
        pk.id=b.evo; pk.name=eb.name; pk.type=eb.type;
        const r=pk.currentHp/pk.maxHp;
        pk.maxHp=Math.floor(pk.maxHp*1.25); pk.currentHp=Math.floor(pk.maxHp*r);
        pk.atk=Math.floor(pk.atk*1.2); pk.def=Math.floor(pk.def*1.2);
        pk.moves=eb.moves.map(m=>({...m,pp:m.maxPp}));
        ev=true; nn=pk.name;
      }
    }
  }
  return {lv,ev,nn};
}

function capRate(wild,dfrac,mult){
  const rm={common:.65,uncommon:.45,rare:.25,epic:.1,legendary:.03};
  return Math.min(0.95,((rm[wild.rarity]||.4)+dfrac*.3)*mult);
}

function san(p){
  return {
    id:p.id,name:p.name,coins:p.coins,items:{...p.items},
    pokemon:p.pokemon.map(pk=>({...pk,moves:pk.moves.map(m=>({...m}))})),
    activePokemonIndex:p.activePokemonIndex,inBattle:p.inBattle,
  };
}

function ri(c){
  const r=rooms[c]; if(!r) return null;
  return {
    code:r.code,host:r.host,started:r.started,
    players:r.players.filter(id=>players[id]).map(id=>({
      id,name:players[id].name,pokemon:players[id].pokemon[0]?.name||'?'
    }))
  };
}

function leaveRoom(sock,p){
  const r=rooms[p.roomCode]; if(!r){p.roomCode=null;return;}
  r.players=r.players.filter(id=>id!==sock.id);
  sock.leave(p.roomCode);
  if(r.players.length===0) delete rooms[p.roomCode];
  else{ if(r.host===sock.id) r.host=r.players[0]; if(!r.started) io.to(p.roomCode).emit('roomUpdate',ri(p.roomCode)); }
  p.roomCode=null;
}

io.on('connection',(sock)=>{
  console.log('+',sock.id);

  sock.on('register',({name,starterId})=>{
    if(players[sock.id]) return; // prevent duplicate
    name=(name||'').trim().substring(0,16);
    starterId=Number(starterId);
    if(!name||!STARTERS.includes(starterId)) return;
    players[sock.id]=newPlayer(sock.id,name,starterId);
    sock.emit('registered',{player:san(players[sock.id]),shop:SHOP});
  });

  sock.on('createRoom',()=>{
    const p=players[sock.id]; if(!p) return;
    if(p.roomCode&&rooms[p.roomCode]) leaveRoom(sock,p);
    const c=code();
    rooms[c]={code:c,players:[sock.id],started:false,host:sock.id};
    sock.join(c); p.roomCode=c;
    sock.emit('roomCreated',{code:c});
    io.to(c).emit('roomUpdate',ri(c));
  });

  sock.on('joinRoom',({code:c})=>{
    const p=players[sock.id]; if(!p) return sock.emit('err','Registre-se primeiro');
    c=(c||'').toUpperCase();
    const r=rooms[c];
    if(!r) return sock.emit('err','Sala não encontrada');
    if(r.started) return sock.emit('err','Jogo já iniciado — não é possível entrar');
    if(r.players.length>=8) return sock.emit('err','Sala cheia');
    if(r.players.includes(sock.id)) return;
    if(p.roomCode&&rooms[p.roomCode]) leaveRoom(sock,p);
    r.players.push(sock.id); sock.join(c); p.roomCode=c;
    sock.emit('joinedRoom',{code:c});
    io.to(c).emit('roomUpdate',ri(c));
  });

  sock.on('startGame',()=>{
    const p=players[sock.id]; if(!p||!p.roomCode) return;
    const r=rooms[p.roomCode];
    if(!r||r.host!==sock.id||r.started) return;
    r.started=true; io.to(r.code).emit('gameStarted');
  });

  // ─── WILD ──────────────────────────────────────
  sock.on('requestWild',()=>{
    const p=players[sock.id]; if(!p) return;
    // Reset any stuck battle state
    if(p.inBattle && p.battleData){
      // check if the battle is valid
      if(p.battleData.type==='wild' && !p.battleData.wild){
        p.inBattle=false; p.battleData=null;
      }
    }
    if(p.inBattle) return sock.emit('battleErr','Já está em batalha!');
    const pk=apk(p);
    if(!pk||pk.currentHp<=0) return sock.emit('battleErr','Pokémon ativo desmaiou! Cure ou troque antes.');
    if(!p.pokemon.some(x=>x.currentHp>0)) return sock.emit('battleErr','Todos desmaiaram! Cure na loja.');
    const wild=spawnWild(pk.level);
    p.inBattle=true;
    p.battleData={type:'wild',wild,dfrac:0,lock:false};
    sock.emit('wildEncounter',{wild});
  });

  sock.on('battleAction',({action,item,mi})=>{
    const p=players[sock.id];
    if(!p||!p.inBattle||p.battleData?.type!=='wild'){
      return sock.emit('battleResult',{messages:['Sem batalha ativa. Procure um Pokémon!'],reset:true});
    }
    const bd=p.battleData;
    if(bd.lock) return; // ignore spam
    bd.lock=true;

    const pk=apk(p), wild=bd.wild;
    // Safety: if somehow wild is null
    if(!wild){ p.inBattle=false; p.battleData=null; bd.lock=false; return sock.emit('battleResult',{messages:['Erro: batalha inválida.'],reset:true}); }

    const res={messages:[],player:null,wild:null};

    const wildHits=()=>{
      if(wild.currentHp<=0) return;
      const vm=(wild.moves||[]).filter(m=>m.pp>0&&m.power>0);
      let wd=0,em='';
      if(vm.length>0){
        const wm=vm[Math.floor(Math.random()*vm.length)]; wm.pp--;
        const {d,e}=dmg(wild.atk,pk.def,wm.type,pk.type,wm.power);
        wd=d;
        if(e>1) em=' Super eficaz!'; else if(e<1&&e>0) em=' Pouco eficaz...'; else if(e===0){em=' Sem efeito!';wd=0;}
        res.messages.push(`${wild.name} usou ${wm.name} — ${wd} dano!${em}`);
      } else {
        wd=Math.max(1,Math.floor(wild.atk*0.4));
        res.messages.push(`${wild.name} atacou — ${wd} dano!`);
      }
      pk.currentHp=Math.max(0,pk.currentHp-wd);
    };

    const checkFaint=()=>{
      if(pk.currentHp<=0){
        res.messages.push(`${pk.name} desmaiou!`);
        const alive=p.pokemon.filter(x=>x.currentHp>0);
        if(alive.length===0){ p.inBattle=false; p.battleData=null; res.defeat=true; res.messages.push('Todos seus Pokémon desmaiaram!'); }
        else { res.needSwitch=true; res.messages.push('Escolha outro Pokémon!'); }
        return true;
      }
      return false;
    };

    if(action==='attack'){
      const idx=(mi!==undefined&&mi>=0&&mi<pk.moves.length)?mi:0;
      const mv=pk.moves[idx];
      if(!mv||mv.pp<=0){
        bd.lock=false;
        return sock.emit('battleResult',{messages:[`${mv?.name||'Golpe'} sem PP! Use um Elixir.`],player:san(p),wild});
      }
      mv.pp--;
      const {d,e}=dmg(pk.atk,wild.def,mv.type,wild.type,mv.power);
      let em='';
      if(e>1) em=' Super eficaz!'; else if(e<1&&e>0) em=' Pouco eficaz...'; else if(e===0) em=' Sem efeito!';
      const ad=e===0?0:d;
      wild.currentHp=Math.max(0,wild.currentHp-ad);
      bd.dfrac=Math.min(1,bd.dfrac+ad/wild.maxHp);
      res.messages.push(`${pk.name} usou ${mv.name} — ${ad} dano!${em}`);
      if(wild.currentHp<=0){
        const xp=wild.level*18;
        const {lv,ev,nn}=gainXp(p,xp);
        p.coins+=wild.level*6; p.inBattle=false; p.battleData=null;
        res.victory=true;
        res.messages.push(`${wild.name} desmaiou! +${xp} XP  +${wild.level*6}💰`);
        if(lv) res.messages.push(`${pk.name} subiu para Nv.${pk.level}!`);
        if(ev) res.messages.push(`✨ ${nn} evoluiu!`);
      } else { wildHits(); checkFaint(); }

    } else if(action==='capture'){
      const bk=item||'pokeball';
      if(!p.items[bk]||p.items[bk]<=0){ bd.lock=false; return sock.emit('battleResult',{messages:[`Sem ${bk}!`],player:san(p),wild}); }
      p.items[bk]--;
      const mult=bk==='ultraball'?2:bk==='greatball'?1.5:1;
      if(Math.random()<capRate(wild,bd.dfrac,mult)){
        const caught=buildPk(wild.id,wild.level); caught.currentHp=Math.max(1,wild.currentHp);
        p.pokemon.push(caught); p.inBattle=false; p.battleData=null;
        res.caught=true; res.messages.push(`Gotcha! ${wild.name} capturado!`);
      } else { res.messages.push(`${wild.name} escapou!`); wildHits(); checkFaint(); }

    } else if(action==='flee'){
      p.inBattle=false; p.battleData=null; res.fled=true; res.messages.push('Fugiu com sucesso!');

    } else if(action==='useItem'){
      const ik=item;
      if(!p.items[ik]||p.items[ik]<=0){ bd.lock=false; return sock.emit('battleResult',{messages:['Item esgotado!'],player:san(p),wild}); }
      p.items[ik]--;
      if(ik==='potion'){pk.currentHp=Math.min(pk.maxHp,pk.currentHp+20);res.messages.push('Potion usada! +20 HP');}
      else if(ik==='superpotion'){pk.currentHp=Math.min(pk.maxHp,pk.currentHp+50);res.messages.push('Super Potion! +50 HP');}
      else if(ik==='hyperpotion'){pk.currentHp=Math.min(pk.maxHp,pk.currentHp+100);res.messages.push('Hyper Potion! +100 HP');}
      else if(ik==='fullheal'){p.pokemon.forEach(x=>{x.currentHp=x.maxHp;});res.messages.push('Full Heal! Todos curados!');}
      else if(ik==='elixir'){pk.moves.forEach(m=>{m.pp=m.maxPp;});res.messages.push('Elixir! PP restaurado!');}
      else if(ik==='xpboost'){gainXp(p,200);res.messages.push('+200 XP!');}
      wildHits(); checkFaint();

    } else if(action==='switch'){
      const ni=Number(item);
      if(isNaN(ni)||ni<0||ni>=p.pokemon.length){ bd.lock=false; return sock.emit('battleResult',{messages:['Troca inválida!'],player:san(p),wild}); }
      const npk=p.pokemon[ni];
      if(npk.currentHp<=0){ bd.lock=false; return sock.emit('battleResult',{messages:[`${npk.name} desmaiou! Escolha outro.`],player:san(p),wild}); }
      p.activePokemonIndex=ni;
      res.messages.push(`Vai, ${npk.name}!`);
      wildHits();
      const now=apk(p);
      if(now.currentHp<=0){
        res.messages.push(`${now.name} desmaiou!`);
        const alive=p.pokemon.filter(x=>x.currentHp>0);
        if(alive.length===0){p.inBattle=false;p.battleData=null;res.defeat=true;}
        else res.needSwitch=true;
      }
    }

    res.player=san(p);
    res.wild=p.battleData?.wild||null;
    bd.lock=false;
    sock.emit('battleResult',res);
  });

  // ─── SHOP ──────────────────────────────────────
  sock.on('buyItem',({itemId})=>{
    const p=players[sock.id]; if(!p) return;
    const it=SHOP.find(x=>x.id===itemId);
    if(!it) return sock.emit('shopResult',{error:'Item inválido'});
    if(p.coins<it.cost) return sock.emit('shopResult',{error:'Sem moedas suficientes!'});
    p.coins-=it.cost;
    if(it.type==='ball'||it.type==='heal'||it.type==='pp') p.items[it.id]=(p.items[it.id]||0)+1;
    else if(it.type==='boost'){ const pk=apk(p); if(pk) gainXp(p,200); }
    sock.emit('shopResult',{success:true,player:san(p),msg:`${it.name} comprado!`});
  });

  // ─── PVP ───────────────────────────────────────
  sock.on('challengePlayer',({targetId})=>{
    const ch=players[sock.id],tg=players[targetId];
    if(!ch||!tg) return;
    if(tg.inBattle) return sock.emit('err','Alvo está em batalha');
    io.to(targetId).emit('pvpChallenge',{challengerId:sock.id,challengerName:ch.name});
  });

  sock.on('acceptPvp',({challengerId})=>{
    const p1=players[challengerId],p2=players[sock.id];
    if(!p1||!p2||p1.inBattle||p2.inBattle) return;
    const pk1=apk(p1),pk2=apk(p2);
    if(!pk1||pk1.currentHp<=0||!pk2||pk2.currentHp<=0) return sock.emit('err','Pokémon ativo desmaiado — cure primeiro');
    p1.inBattle=p2.inBattle=true;
    p1.battleData={type:'pvp',opponentId:sock.id,lock:false};
    p2.battleData={type:'pvp',opponentId:challengerId,lock:false};
    io.to(challengerId).emit('pvpStart',{opponent:{id:sock.id,name:p2.name,pokemon:pk2}});
    sock.emit('pvpStart',{opponent:{id:challengerId,name:p1.name,pokemon:pk1}});
  });

  sock.on('pvpAction',({mi})=>{
    const p=players[sock.id];
    if(!p||!p.inBattle||p.battleData?.type!=='pvp') return;
    const bd=p.battleData; if(bd.lock) return;
    const opp=players[bd.opponentId];
    if(!opp){p.inBattle=false;p.battleData=null;return sock.emit('pvpResult',{won:true,messages:['Oponente desconectou!'],player:san(p)});}
    const myPk=apk(p),oppPk=apk(opp);
    if(!myPk||!oppPk) return;
    bd.lock=true;
    const idx=(mi!==undefined&&mi>=0&&mi<myPk.moves.length)?mi:0;
    const mv=myPk.moves[idx];
    if(!mv||mv.pp<=0){bd.lock=false;return sock.emit('pvpUpdate',{myPk,oppPk,message:'Sem PP!'});}
    mv.pp--;
    const {d,e}=dmg(myPk.atk,oppPk.def,mv.type,oppPk.type,mv.power);
    let em=e>1?' Super eficaz!':e<1&&e>0?' Pouco eficaz...':'';
    const ad=e===0?0:d;
    oppPk.currentHp=Math.max(0,oppPk.currentHp-ad);
    const msg=`${myPk.name} usou ${mv.name} — ${ad} dano!${em}`;
    if(oppPk.currentHp<=0){
      p.inBattle=false;opp.inBattle=false;p.battleData=null;opp.battleData=null;
      p.coins+=120;gainXp(p,60);
      sock.emit('pvpResult',{won:true,messages:[msg,`${oppPk.name} desmaiou!`,'Você venceu! +120💰 +60XP'],player:san(p)});
      io.to(opp.id).emit('pvpResult',{won:false,messages:[msg,`${oppPk.name} desmaiou!`,'Você perdeu!'],player:san(opp)});
    } else {
      sock.emit('pvpUpdate',{myPk,oppPk,message:msg});
      io.to(opp.id).emit('pvpUpdate',{myPk:oppPk,oppPk:myPk,message:msg});
      bd.lock=false;
    }
  });

  sock.on('disconnect',()=>{
    const p=players[sock.id];
    if(p&&p.roomCode) leaveRoom(sock,p);
    delete players[sock.id];
    console.log('-',sock.id);
  });
});

const PORT=process.env.PORT||3000;
server.listen(PORT,()=>console.log(`Pokélor on :${PORT}`));
