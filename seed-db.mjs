import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const db = await mysql.createConnection(process.env.DATABASE_URL);

async function run(sql, params = []) {
  const [result] = await db.execute(sql, params);
  return result;
}

console.log('🗑️  Clearing old data...');
await run('SET FOREIGN_KEY_CHECKS = 0');
for (const t of ['chatMessages','chatConversations','alertReads','safetyAlerts','materialPrices','toolPrices','savedItems','tools','toolCategories','materials','stores','categories','knowledgeBaseArticles','calculators']) {
  await run(`DELETE FROM \`${t}\``);
  await run(`ALTER TABLE \`${t}\` AUTO_INCREMENT = 1`);
}
await run('SET FOREIGN_KEY_CHECKS = 1');

// ──────────────────────────────────────────────────────────────────────────────
// CATEGORIES
// ──────────────────────────────────────────────────────────────────────────────
console.log('📂 Seeding categories...');
const catData = [
  { slug:'eletrica',      namePortuguese:'Elétrica',       nameEnglish:'Electrical',    icon:'Zap',      color:'#F59E0B', sortOrder:1 },
  { slug:'estrutural',    namePortuguese:'Estrutural',      nameEnglish:'Structural',    icon:'Building', color:'#6B7280', sortOrder:2 },
  { slug:'hidraulica',    namePortuguese:'Hidráulica',      nameEnglish:'Plumbing',      icon:'Droplets', color:'#3B82F6', sortOrder:3 },
  { slug:'fundacoes',     namePortuguese:'Fundações',       nameEnglish:'Foundations',   icon:'Layers',   color:'#92400E', sortOrder:4 },
  { slug:'acabamentos',   namePortuguese:'Acabamentos',     nameEnglish:'Finishes',      icon:'PaintBucket',color:'#10B981',sortOrder:5 },
  { slug:'cobertura',     namePortuguese:'Cobertura',       nameEnglish:'Roofing',       icon:'Home',     color:'#8B5CF6', sortOrder:6 },
  { slug:'isolamento',    namePortuguese:'Isolamento',      nameEnglish:'Insulation',    icon:'Shield',   color:'#EC4899', sortOrder:7 },
  { slug:'fixacao',       namePortuguese:'Fixação e Ancoragem', nameEnglish:'Fasteners', icon:'Anchor',  color:'#F97316', sortOrder:8 },
];
const catIds = {};
for (const c of catData) {
  const r = await run(
    'INSERT INTO categories (slug,namePortuguese,nameEnglish,icon,color,sortOrder) VALUES (?,?,?,?,?,?)',
    [c.slug,c.namePortuguese,c.nameEnglish,c.icon,c.color,c.sortOrder]
  );
  catIds[c.slug] = r.insertId;
}

// ──────────────────────────────────────────────────────────────────────────────
// STORES
// ──────────────────────────────────────────────────────────────────────────────
console.log('🏪 Seeding stores...');
const storeData = [
  { slug:'leroy-merlin', namePortuguese:'Leroy Merlin', nameEnglish:'Leroy Merlin', website:'https://www.leroymerlin.com.br', country:'BR', rating:'4.2', deliveryDays:3 },
  { slug:'sodimac-homecenter', namePortuguese:'Sodimac Homecenter', nameEnglish:'Sodimac Homecenter', website:'https://www.homecenter.com.br', country:'BR', rating:'4.0', deliveryDays:5 },
  { slug:'construcenter', namePortuguese:'Construcenter', nameEnglish:'Construcenter', website:'https://www.construcenter.com.br', country:'BR', rating:'3.8', deliveryDays:7 },
  { slug:'telhanorte', namePortuguese:'Telhanorte', nameEnglish:'Telhanorte', website:'https://www.telhanorte.com.br', country:'BR', rating:'4.1', deliveryDays:4 },
  { slug:'c-e-materiais', namePortuguese:'C&E Materiais de Construção', nameEnglish:'C&E Building Materials', country:'BR', rating:'3.5', deliveryDays:10 },
];
const storeIds = {};
for (const s of storeData) {
  const r = await run(
    'INSERT INTO stores (slug,namePortuguese,nameEnglish,website,country,rating,deliveryDays) VALUES (?,?,?,?,?,?,?)',
    [s.slug,s.namePortuguese,s.nameEnglish,s.website||null,s.country,s.rating,s.deliveryDays]
  );
  storeIds[s.slug] = r.insertId;
}

// ──────────────────────────────────────────────────────────────────────────────
// MATERIALS
// ──────────────────────────────────────────────────────────────────────────────
console.log('🧱 Seeding materials...');

const materials = [
  // ── ELÉTRICA ────────────────────────────────────────────────────────────────
  {
    slug:'fio-eletrico-750v-2-5mm', categorySlug:'eletrica', featured:1,
    namePortuguese:'Fio Elétrico 750V 2,5mm²', nameEnglish:'750V Electrical Wire 2.5mm²',
    descriptionPortuguese:'Condutor de cobre flexível, classe 5, isolação em PVC 70°C — o mais utilizado em circuitos de tomadas residenciais. Atende à NBR 6812.',
    descriptionEnglish:'Flexible copper conductor, class 5, PVC 70°C insulation — most commonly used in residential outlet circuits. Meets NBR 6812.',
    riskLevel:'RISCO_ALTO',
    safetyWarningsPortuguese:'NUNCA trabalhe com a instalação energizada. Sempre desligue o disjuntor e verifique com voltímetro. Condutor 2,5mm² suporta máx. 21A — superdimensionar o disjuntor é causa comum de incêndio.',
    safetyWarningsEnglish:'NEVER work with live circuits. Always turn off the breaker and verify with a voltmeter. 2.5mm² conductor handles max 21A — oversizing the breaker is a common fire cause.',
    antiScamPortuguese:'Golpe frequente: fios com seção abaixo do declarado. Exija laudo do INMETRO e meça o diâmetro com paquímetro. Marcas suspeitas vendem "2,5mm²" com apenas 1,5mm² real.',
    antiScamEnglish:'Common scam: wires with cross-section below declared size. Demand INMETRO certificate and measure diameter with calipers.',
    technicalSpecsPortuguese:'Seção nominal: 2,5 mm² | Temperatura máx: 70°C | Tensão: 0,6/1kV | Norma: NBR 6812 | Bitola AWG equivalente: 14',
    standards:'NBR 6812', basePrice:'4.50', priceUnit:'metro', riskLevel_:'RISCO_ALTO',
  },
  {
    slug:'fio-eletrico-750v-4mm', categorySlug:'eletrica', featured:0,
    namePortuguese:'Fio Elétrico 750V 4mm²', nameEnglish:'750V Electrical Wire 4mm²',
    descriptionPortuguese:'Condutor de cobre para circuitos de chuveiro, torneira elétrica e ar-condicionado. Capacidade de 28A.',
    descriptionEnglish:'Copper conductor for shower, electric faucet and AC circuits. 28A capacity.',
    riskLevel:'RISCO_ALTO',
    safetyWarningsPortuguese:'Uso obrigatório para chuveiro elétrico. Disjuntor máx 25A. Nunca use fio 2,5mm² para chuveiro.',
    basePrice:'7.20', priceUnit:'metro',
  },
  {
    slug:'disjuntor-monopolar-25a', categorySlug:'eletrica', featured:1,
    namePortuguese:'Disjuntor Monopolar 25A', nameEnglish:'Single-Pole Circuit Breaker 25A',
    descriptionPortuguese:'Proteção obrigatória contra sobrecarga e curto-circuito. Curva C, tensão 220/127V, poder de corte 3kA. Norma NBR IEC 60898-1.',
    descriptionEnglish:'Mandatory protection against overload and short-circuit. Curve C, 220/127V, 3kA breaking capacity. Meets NBR IEC 60898-1.',
    riskLevel:'RISCO_ALTO',
    safetyWarningsPortuguese:'Nunca instale disjuntor de capacidade maior que a suportada pelo fio. Disjuntor 25A exige fio mínimo 4mm². Instalação deve ser feita por eletricista habilitado.',
    antiScamPortuguese:'Falsificações de disjuntores Schneider, WEG e Siemens são comuns no mercado. Compre apenas em revendas autorizadas e verifique o selo INMETRO.',
    basePrice:'18.90', priceUnit:'unidade',
  },
  {
    slug:'tomada-2p-t-20a', categorySlug:'eletrica', featured:0,
    namePortuguese:'Tomada 2P+T 20A (padrão NBR 14136)', nameEnglish:'20A Outlet (NBR 14136 standard)',
    descriptionPortuguese:'Tomada no padrão brasileiro obrigatório desde 2010. 20A para cozinha, lavanderia e banheiro. Com aterramento (T).',
    descriptionEnglish:'Brazilian standard outlet mandatory since 2010. 20A for kitchen, laundry, bathroom. With ground (T).',
    riskLevel:'ATENCAO',
    safetyWarningsPortuguese:'Tomadas de 20A são obrigatórias em cozinha e banheiro pela NBR 5410. Não adapte tomadas de padrão antigo — risco de aquecimento e incêndio.',
    basePrice:'12.50', priceUnit:'unidade',
  },
  {
    slug:'condulete-pvc-3-4', categorySlug:'eletrica', featured:0,
    namePortuguese:'Condulete PVC 3/4" Tipo LL', nameEnglish:'PVC Conduit Box 3/4" Type LL',
    descriptionPortuguese:'Caixa de passagem para mudança de direção em eletrodutos rígidos. Material: PVC resistente a impacto.',
    descriptionEnglish:'Junction box for direction change in rigid conduits. Material: impact-resistant PVC.',
    riskLevel:'NORMAL', basePrice:'3.80', priceUnit:'unidade',
  },
  {
    slug:'eletroduto-pvc-rigido-3-4', categorySlug:'eletrica', featured:0,
    namePortuguese:'Eletroduto PVC Rígido 3/4" (3m)', nameEnglish:'Rigid PVC Conduit 3/4" (3m)',
    descriptionPortuguese:'Proteção mecânica para fiação elétrica. Rosqueável, para uso em paredes e lajes. NBR 15465.',
    riskLevel:'NORMAL', basePrice:'8.90', priceUnit:'barra 3m',
  },
  {
    slug:'quadro-distribuicao-12-disjuntores', categorySlug:'eletrica', featured:0,
    namePortuguese:'Quadro de Distribuição 12 Disjuntores', nameEnglish:'12-Circuit Distribution Panel',
    descriptionPortuguese:'QD embutir em alvenaria, barramento trifásico/monofásico, capacidade 12 circuitos. NBR IEC 61439.',
    riskLevel:'RISCO_ALTO',
    safetyWarningsPortuguese:'Instalação exclusiva para eletricista credenciado. Manter porta sempre fechada após instalação. Aterramento obrigatório.',
    basePrice:'189.00', priceUnit:'unidade',
  },

  // ── ESTRUTURAL ───────────────────────────────────────────────────────────────
  {
    slug:'cimento-cp-ii-50kg', categorySlug:'estrutural', featured:1,
    namePortuguese:'Cimento CP II-E-32 (saco 50kg)', nameEnglish:'Cement CP II-E-32 (50kg bag)',
    descriptionPortuguese:'Cimento Portland composto com escória. O mais usado em obras residenciais brasileiras — argamassas, concreto simples e armado, assentamento de alvenaria.',
    descriptionEnglish:'Portland cement with slag. Most used in Brazilian residential construction — mortars, plain and reinforced concrete, masonry laying.',
    riskLevel:'ATENCAO',
    safetyWarningsPortuguese:'Material alcalino que causa queimaduras na pele e olhos. Use EPI: luvas, óculos e máscara PFF2 ao manusear. Não inhale o pó.',
    usageTipsPortuguese:'Relação água/cimento ideal: 0,45 a 0,55. Cura mínima de 28 dias para resistência total. Proteger de umidade antes do uso.',
    antiScamPortuguese:'Verifique a data de fabricação no saco — cimento com mais de 3 meses perde resistência. Desconfie de preços muito abaixo do mercado (cimento adulterado com areia ou cal).',
    technicalSpecsPortuguese:'Resistência característica: 32 MPa | Tempo de pega inicial: 60 min | Norma: NBR 11578',
    standards:'NBR 11578', basePrice:'45.00', priceUnit:'saco 50kg',
  },
  {
    slug:'areia-media-lavada', categorySlug:'estrutural', featured:1,
    namePortuguese:'Areia Média Lavada', nameEnglish:'Medium Washed Sand',
    descriptionPortuguese:'Agregado miúdo para argamassas e concreto. Granulometria 0,3 a 1,2mm, teor de argilas <3%. Norma NBR 7211.',
    descriptionEnglish:'Fine aggregate for mortars and concrete. Granulometry 0.3 to 1.2mm, clay content <3%. NBR 7211.',
    riskLevel:'NORMAL',
    usageTipsPortuguese:'Traço argamassa de assentamento: 1:6 (cimento:areia). Traço concreto fck 20MPa: 1:2,8:4 (cimento:areia:brita). Areia suja (com argila) reduz resistência em até 40%.',
    antiScamPortuguese:'Areia com excesso de argila ou matéria orgânica prejudica resistência. Exija laudo de granulometria do fornecedor.',
    basePrice:'280.00', priceUnit:'m³',
  },
  {
    slug:'brita-1', categorySlug:'estrutural', featured:0,
    namePortuguese:'Brita nº 1 (9,5 a 19mm)', nameEnglish:'Crushed Stone #1 (9.5 to 19mm)',
    descriptionPortuguese:'Agregado graúdo granito/gnaisse para concreto estrutural. Granulometria 9,5 a 19mm. NBR 7211.',
    riskLevel:'NORMAL', basePrice:'240.00', priceUnit:'m³',
  },
  {
    slug:'ferro-ca-50-10mm', categorySlug:'estrutural', featured:1,
    namePortuguese:'Vergalhão CA-50 Ø10mm (barra 12m)', nameEnglish:'Rebar CA-50 Ø10mm (12m bar)',
    descriptionPortuguese:'Aço nervurado para armação de estruturas de concreto armado. Limite de escoamento 500 MPa. Norma NBR 7480.',
    descriptionEnglish:'Deformed steel rebar for reinforced concrete structures. Yield limit 500 MPa. NBR 7480.',
    riskLevel:'ATENCAO',
    safetyWarningsPortuguese:'Extremidades cortadas são extremamente cortantes — use luvas grossas. Barras de 12m representam risco de acidentes em transporte. Nunca use vergalhão como condutor elétrico.',
    usageTipsPortuguese:'Peso linear: 0,617 kg/m. Cobrimento mínimo: 2,5cm para estruturas internas, 3cm para externas. Emenda por transpasse: 50Ø mínimo.',
    technicalSpecsPortuguese:'Diâmetro: 10mm | Seção: 78,5mm² | Peso/m: 0,617kg | Escoamento: 500MPa | Ruptura: 570MPa',
    standards:'NBR 7480', basePrice:'52.00', priceUnit:'barra 12m',
  },
  {
    slug:'ferro-ca-50-8mm', categorySlug:'estrutural', featured:0,
    namePortuguese:'Vergalhão CA-50 Ø8mm (barra 12m)', nameEnglish:'Rebar CA-50 Ø8mm (12m bar)',
    descriptionPortuguese:'Aço nervurado para estribos e armação secundária. Peso: 0,395 kg/m.',
    riskLevel:'ATENCAO', basePrice:'38.00', priceUnit:'barra 12m',
  },
  {
    slug:'tijolo-6-furos', categorySlug:'estrutural', featured:1,
    namePortuguese:'Tijolo Cerâmico 6 Furos (9×14×19cm)', nameEnglish:'6-Hole Ceramic Brick (9×14×19cm)',
    descriptionPortuguese:'Tijolo mais usado em alvenaria de vedação no Brasil. ~70 peças/m². Resistência à compressão mínima 1,5 MPa. NBR 15270.',
    descriptionEnglish:'Most used brick in Brazilian infill masonry. ~70 pieces/m². Minimum compressive strength 1.5 MPa. NBR 15270.',
    riskLevel:'NORMAL',
    usageTipsPortuguese:'Argamassa de assentamento: traço 1:6 (cimento:areia). Rendimento médio: 70 tijolos/m². Molhar os tijolos antes do assentamento em dias quentes.',
    antiScamPortuguese:'Tijolos com dimensões fora do padrão aumentam o consumo de argamassa e comprometem o acabamento. Verifique a bitola com régua.',
    basePrice:'0.85', priceUnit:'unidade',
  },
  {
    slug:'bloco-concreto-14x19x39', categorySlug:'estrutural', featured:0,
    namePortuguese:'Bloco de Concreto Estrutural 14×19×39cm', nameEnglish:'Structural Concrete Block 14×19×39cm',
    descriptionPortuguese:'Bloco para alvenaria estrutural ou de vedação. Resistência min 4 MPa (estrutural). NBR 6136.',
    riskLevel:'NORMAL', basePrice:'4.20', priceUnit:'unidade',
  },
  {
    slug:'arame-recozido-no-18', categorySlug:'estrutural', featured:0,
    namePortuguese:'Arame Recozido nº18', nameEnglish:'Annealed Wire #18',
    descriptionPortuguese:'Arame macio para amarração de vergalhões. Rolo com ~1kg (~50m). Essencial em obras de concreto armado.',
    riskLevel:'NORMAL', basePrice:'18.00', priceUnit:'rolo 1kg',
  },

  // ── HIDRÁULICA ───────────────────────────────────────────────────────────────
  {
    slug:'tubo-pvc-soldavel-25mm', categorySlug:'hidraulica', featured:0,
    namePortuguese:'Tubo PVC Soldável Branco 25mm (6m)', nameEnglish:'White Solvent PVC Pipe 25mm (6m)',
    descriptionPortuguese:'Tubo para distribuição de água fria. Pressão de trabalho 7,5kgf/cm² (75mca). Norma NBR 5648.',
    descriptionEnglish:'Cold water distribution pipe. Working pressure 7.5kgf/cm² (75mca). NBR 5648.',
    riskLevel:'NORMAL',
    usageTipsPortuguese:'Limpe e aplique primer antes da cola PVC. Aguarde 30min para pressurizar após a colagem. Espaçamento máximo entre suportes: 1,5m.',
    basePrice:'32.00', priceUnit:'barra 6m',
  },
  {
    slug:'tubo-pvc-soldavel-32mm', categorySlug:'hidraulica', featured:0,
    namePortuguese:'Tubo PVC Soldável Branco 32mm (6m)', nameEnglish:'White Solvent PVC Pipe 32mm (6m)',
    descriptionPortuguese:'Tubo para barrilete e sub-ramal de água. NBR 5648. Pressão 7,5kgf/cm².',
    riskLevel:'NORMAL', basePrice:'44.00', priceUnit:'barra 6m',
  },
  {
    slug:'tubo-pvc-esgoto-100mm', categorySlug:'hidraulica', featured:1,
    namePortuguese:'Tubo PVC Esgoto Série Normal 100mm (6m)', nameEnglish:'100mm PVC Sewer Pipe Series N (6m)',
    descriptionPortuguese:'Tubo para esgoto doméstico primário e secundário. Cor laranja. Inclui bolsa para vedação por anel. NBR 5688.',
    riskLevel:'NORMAL',
    usageTipsPortuguese:'Declividade mínima obrigatória: 2% (2cm/m). Ramais secundários: 1%. Nunca misture ramais de água e esgoto no mesmo espaço sem separação.',
    antiScamPortuguese:'Cuidado com tubos vendidos como "esgoto" mas sem espessura adequada (série leve vs série normal). Verifique marcação NBR impressa no tubo.',
    basePrice:'78.00', priceUnit:'barra 6m',
  },
  {
    slug:'registro-gaveta-3-4', categorySlug:'hidraulica', featured:0,
    namePortuguese:'Registro de Gaveta 3/4" (latão)', nameEnglish:'Gate Valve 3/4" (brass)',
    descriptionPortuguese:'Válvula de bloqueio para ramais de água. Corpo em latão, vedação por gaveta. NBR 8816.',
    riskLevel:'NORMAL', basePrice:'28.00', priceUnit:'unidade',
  },
  {
    slug:'caixa-dagua-1000l', categorySlug:'hidraulica', featured:1,
    namePortuguese:'Caixa d\'Água Polietileno 1000L', nameEnglish:'1000L Polyethylene Water Tank',
    descriptionPortuguese:'Reservatório superior para abastecimento residencial. Tampa com vedação, saída com bucha e rosca. NBR 7198.',
    riskLevel:'NORMAL',
    usageTipsPortuguese:'Volume mínimo recomendado: 200L/morador. Limpeza obrigatória a cada 6 meses (Portaria MS 888/2021). Instalar com cinta metálica de fixação.',
    antiScamPortuguese:'Verifique o selo INMETRO e a marcação de capacidade real. Caixas sem marca ou de reprocessado não garantem qualidade da água.',
    technicalSpecsPortuguese:'Capacidade: 1000L | Material: PEAD virgem | Espessura mínima: 5mm | Norma: NBR 7198 | UV estabilizado',
    basePrice:'680.00', priceUnit:'unidade',
  },
  {
    slug:'cola-pvc-frasco-175g', categorySlug:'hidraulica', featured:0,
    namePortuguese:'Cola PVC Frasco 175g', nameEnglish:'PVC Cement 175g',
    descriptionPortuguese:'Adesivo solúvel para junções de tubos PVC soldável. Com pincel. NBR 6531.',
    riskLevel:'ATENCAO',
    safetyWarningsPortuguese:'Inflamável e tóxico. Usar em local ventilado. Evitar contato com pele e olhos. Não fumar durante aplicação.',
    basePrice:'22.00', priceUnit:'frasco',
  },

  // ── FUNDAÇÕES ────────────────────────────────────────────────────────────────
  {
    slug:'concreto-fck-20-usinado', categorySlug:'fundacoes', featured:1,
    namePortuguese:'Concreto Usinado fck 20 MPa', nameEnglish:'Ready-Mix Concrete fck 20 MPa',
    descriptionPortuguese:'Concreto dosado em central para fundações superficiais, radiers e lajes. Slump 10±2cm. NBR 12655.',
    riskLevel:'ATENCAO',
    safetyWarningsPortuguese:'pH altamente alcalino causa queimaduras. Use luvas e botas de borracha. Não misture com água adicional na obra — prejudica a resistência.',
    usageTipsPortuguese:'Lançar em até 90 min após saída da usina. Adensamento com vibrador de imersão obrigatório. Cura úmida mínima 7 dias.',
    technicalSpecsPortuguese:'fck: 20 MPa | Slump: 100±20mm | Brita: nº1 | Cimento: CP II | Consumo estimado: 350kg cimento/m³',
    basePrice:'380.00', priceUnit:'m³',
  },
  {
    slug:'impermeabilizante-manta-asfaltica', categorySlug:'fundacoes', featured:0,
    namePortuguese:'Manta Asfáltica 3mm Alumínio (10m²)', nameEnglish:'Asphalt Membrane 3mm Aluminum (10m²)',
    descriptionPortuguese:'Impermeabilização de lajes, calhas e jardineiras. Aplicação a maçarico. Norma NBR 9952.',
    riskLevel:'RISCO_ALTO',
    safetyWarningsPortuguese:'Aplicação envolve maçarico — risco de incêndio e queimaduras. Use EPI completo. Nunca aplique próximo a materiais inflamáveis.',
    basePrice:'180.00', priceUnit:'rolo 10m²',
  },
  {
    slug:'estaca-raiz-escavada', categorySlug:'fundacoes', featured:0,
    namePortuguese:'Estaca Escavada (fundação profunda)', nameEnglish:'Drilled Pile (deep foundation)',
    descriptionPortuguese:'Elemento de fundação profunda executado por trado contínuo. Diâmetro 20 a 40cm. Projeto de engenheiro obrigatório. NBR 6122.',
    riskLevel:'RISCO_ALTO',
    safetyWarningsPortuguese:'Execução exclusiva por empresa especializada com ART de engenheiro geotécnico. Não improvisne — recalques diferencias causam colapso estrutural.',
    antiScamPortuguese:'Nunca aceite fundação sem sondagem SPT prévia do solo. Empresas que não exigem laudo do solo estão praticando má-fé técnica.',
    standards:'NBR 6122', basePrice:'0.00', priceUnit:'por m executado',
  },

  // ── ACABAMENTOS ───────────────────────────────────────────────────────────────
  {
    slug:'argamassa-accolante-ac-ii', categorySlug:'acabamentos', featured:1,
    namePortuguese:'Argamassa Colante ACII (saco 20kg)', nameEnglish:'Tile Mortar ACII (20kg bag)',
    descriptionPortuguese:'Argamassa de cimento modificada para assentamento de porcelanato e cerâmica até 60×60cm, em pisos e paredes internas. NBR 14081.',
    descriptionEnglish:'Modified cement mortar for porcelain and ceramic tile up to 60×60cm, floors and interior walls. NBR 14081.',
    riskLevel:'NORMAL',
    usageTipsPortuguese:'Relação água/pó: ~4,5L para saco 20kg. Abrir juntas de dilatação a cada 4m ou mudança de plano. Trabalhar em bancadas com espátula dentada 8mm para porcelanato.',
    antiScamPortuguese:'AC I serve apenas para paredes com cerâmica leve. Usar AC I em pisos ou porcelanato pesado resulta em descolamento garantido.',
    basePrice:'32.00', priceUnit:'saco 20kg',
  },
  {
    slug:'porcelanato-60x60-polido', categorySlug:'acabamentos', featured:1,
    namePortuguese:'Porcelanato Polido 60×60cm', nameEnglish:'Polished Porcelain Tile 60×60cm',
    descriptionPortuguese:'Revestimento cerâmico de alta dureza (dureza Mohs 7), baixa absorção de água (<0,5%). Acabamento polido espelhado. NBR 13816.',
    riskLevel:'NORMAL',
    usageTipsPortuguese:'Usar argamassa ACII ou ACIII. Niveladores de porcelanato obrigatórios em peças acima de 60cm. Proteger superfície com filme plástico após assentamento.',
    antiScamPortuguese:'Verifique o PEI (resistência ao desgaste): PEI 0 apenas para paredes, PEI 3 mínimo para pisos. Porcelanatos sem certificação INMETRO podem descascar.',
    basePrice:'89.00', priceUnit:'m²',
  },
  {
    slug:'tinta-acrilica-premium-18l', categorySlug:'acabamentos', featured:1,
    namePortuguese:'Tinta Acrílica Premium Fosca 18L', nameEnglish:'Premium Matte Acrylic Paint 18L',
    descriptionPortuguese:'Tinta látex premium para interiores e exteriores. Rendimento ~400m²/demão. Lavável classe 2 (NBR 15079). Alto poder de cobertura.',
    riskLevel:'NORMAL',
    usageTipsPortuguese:'Preparar superfície: 2 demãos de selador antes. Diluição máxima 20% água. Intervalo entre demãos: 4 horas. Aplicar com rolo de lã 23mm.',
    antiScamPortuguese:'Tintas de marcas desconhecidas frequentemente têm baixo teor de sólidos e péssima cobertura. Verifique a gramatura no laudo técnico.',
    basePrice:'189.00', priceUnit:'lata 18L',
  },
  {
    slug:'rejunte-flexivel-kg', categorySlug:'acabamentos', featured:0,
    namePortuguese:'Rejunte Flexível (embalagem 1kg)', nameEnglish:'Flexible Grout (1kg)',
    descriptionPortuguese:'Rejunte à base de cimento branco com polímero para juntas de 2 a 12mm. Resistente a fungos. NBR 14992.',
    riskLevel:'NORMAL',
    usageTipsPortuguese:'Aguardar mínimo 24h após assentamento para aplicar. Limpar com esponja úmida antes de secar completamente. Impermeabilizante de juntas recomendado em áreas molhadas.',
    basePrice:'28.00', priceUnit:'embalagem 1kg',
  },
  {
    slug:'gesso-placa-drywall-st', categorySlug:'acabamentos', featured:0,
    namePortuguese:'Placa de Gesso Drywall ST 1,2×1,8m', nameEnglish:'Standard Drywall Gypsum Board 1.2×1.8m',
    descriptionPortuguese:'Chapa de gesso para divisórias e forros interiores. Tipo ST (Standard), espessura 12,5mm. Leve, fácil instalação, isolamento acústico 42dB. NBR 14715.',
    riskLevel:'NORMAL',
    usageTipsPortuguese:'Não usar em ambientes úmidos (usar drywall RU verde). Parafusos para metal a cada 30cm. Fita telada nas juntas antes de masspor.',
    basePrice:'45.00', priceUnit:'chapa',
  },
  {
    slug:'massa-corrida-pva-25kg', categorySlug:'acabamentos', featured:0,
    namePortuguese:'Massa Corrida PVA (balde 25kg)', nameEnglish:'PVA Finishing Putty (25kg bucket)',
    descriptionPortuguese:'Massa de nivelamento para paredes internas antes de pintura. Base PVA, secagem rápida. Rendimento ~40m²/balde.',
    riskLevel:'NORMAL',
    usageTipsPortuguese:'Não usar em áreas externas ou úmidas. Aplicar 2 demãos finas com desempenadeira. Lixar com lixa 120 entre demãos.',
    basePrice:'89.00', priceUnit:'balde 25kg',
  },

  // ── COBERTURA ─────────────────────────────────────────────────────────────────
  {
    slug:'telha-ceramica-colonial', categorySlug:'cobertura', featured:1,
    namePortuguese:'Telha Cerâmica Colonial (cento)', nameEnglish:'Colonial Ceramic Roof Tile (hundred)',
    descriptionPortuguese:'Telha de barro prensada para coberturas com declividade mínima 30%. ~25 peças/m². Absorção de água ≤20%. NBR 15310.',
    riskLevel:'ATENCAO',
    safetyWarningsPortuguese:'Trabalho em telhado é atividade de alto risco. Obrigatório uso de cinto de segurança tipo paraquedista, capacete e linha de vida. Solicite treinamento NR-35.',
    antiScamPortuguese:'Telhas sem certificação INMETRO frequentemente quebram por terem argila inadequada ou queima incorreta. Compare peso: telha boa pesa ~1,5kg.',
    basePrice:'145.00', priceUnit:'cento',
  },
  {
    slug:'telha-fibrocimento-6mm', categorySlug:'cobertura', featured:0,
    namePortuguese:'Telha Fibrocimento Ondulada 6mm 2,44m', nameEnglish:'6mm Fiber Cement Corrugated Tile 2.44m',
    descriptionPortuguese:'Cobertura industrial e residencial econômica. Declividade mínima 10%. Sem amianto (produto antigo). NBR 7196.',
    riskLevel:'NORMAL',
    usageTipsPortuguese:'Parafusos J fixados nos pontos altos das ondas — nunca nos pontos baixos. Apoio mínimo em 3 terças para vãos até 2,44m.',
    basePrice:'89.00', priceUnit:'peça',
  },
  {
    slug:'telha-metalica-trapezoidal', categorySlug:'cobertura', featured:0,
    namePortuguese:'Telha Metálica Trapezoidal Galvalume 0,5mm', nameEnglish:'Galvalume Trapezoidal Metal Tile 0.5mm',
    descriptionPortuguese:'Telha de aço galvalume para galpões industriais e residências modernas. Declividade mínima 5%. Alta resistência à corrosão.',
    riskLevel:'ATENCAO',
    safetyWarningsPortuguese:'Bordas extremamente cortantes — luvas de proteção obrigatórias. Risco de choque elétrico durante instalação em dias nublados (condutora elétrica).',
    basePrice:'0.00', priceUnit:'m² (consultar',
  },

  // ── ISOLAMENTO ────────────────────────────────────────────────────────────────
  {
    slug:'la-de-vidro-50mm', categorySlug:'isolamento', featured:0,
    namePortuguese:'Lã de Vidro Rolo 50mm (10m²)', nameEnglish:'Glass Wool Roll 50mm (10m²)',
    descriptionPortuguese:'Isolante térmico e acústico para paredes, forros e coberturas. Condutividade térmica 0,040 W/mK. Temperatura max 200°C.',
    riskLevel:'ATENCAO',
    safetyWarningsPortuguese:'Fibras causam irritação na pele, olhos e trato respiratório. Use luvas, óculos e máscara PFF2 OBRIGATORIAMENTE durante instalação.',
    basePrice:'125.00', priceUnit:'rolo 10m²',
  },
  {
    slug:'manta-aluminizada-telhado', categorySlug:'isolamento', featured:0,
    namePortuguese:'Manta Aluminizada para Telhado (50m²)', nameEnglish:'Aluminized Foil Roof Underlayment (50m²)',
    descriptionPortuguese:'Barreira de vapor e reflexão térmica para instalação sob telhas. Reduz até 70% da irradiação de calor. Espessura 3mm.',
    riskLevel:'NORMAL', basePrice:'280.00', priceUnit:'rolo 50m²',
  },
  {
    slug:'espuma-poliuretano-spray', categorySlug:'isolamento', featured:0,
    namePortuguese:'Espuma Poliuretano Spray 500ml', nameEnglish:'Polyurethane Spray Foam 500ml',
    descriptionPortuguese:'Selante e isolante para frestas, marcos de janela, passagens de tubulações. Expansão pós-cura: até 3x. Aderência em quase todas as superfícies.',
    riskLevel:'ATENCAO',
    safetyWarningsPortuguese:'Irritante para olhos e pele. Vapores inflamáveis — não fumar durante aplicação. Usar em ambientes ventilados com máscara e luvas.',
    basePrice:'42.00', priceUnit:'frasco 500ml',
  },

  // ── FIXAÇÃO ───────────────────────────────────────────────────────────────────
  {
    slug:'parafuso-autoatarraxante-4-8x65', categorySlug:'fixacao', featured:0,
    namePortuguese:'Parafuso Autoatarraxante Fosfatizado 4,8×65mm (caixa 100)', nameEnglish:'Self-Tapping Screw Phosphatized 4.8×65mm (box 100)',
    descriptionPortuguese:'Para fixação em madeira, drywall e estruturas metálicas leves. Cabeça sextavada, ponta broca.',
    riskLevel:'NORMAL', basePrice:'28.00', priceUnit:'caixa 100un',
  },
  {
    slug:'bucha-nylon-6', categorySlug:'fixacao', featured:0,
    namePortuguese:'Bucha de Nylon S6 (caixa 100)', nameEnglish:'Nylon Wall Plug S6 (box 100)',
    descriptionPortuguese:'Para fixação de parafusos em alvenaria, concreto e materiais macios. Resistência de arrancamento: 600N.',
    riskLevel:'NORMAL', basePrice:'8.50', priceUnit:'caixa 100un',
  },
  {
    slug:'chumbador-quimico-vinil-ester', categorySlug:'fixacao', featured:1,
    namePortuguese:'Chumbador Químico Vinil-Éster 300ml', nameEnglish:'Chemical Anchor Vinyl-Ester 300ml',
    descriptionPortuguese:'Fixação química para cargas elevadas em concreto, pedra e alvenaria. Resistência de arrancamento até 25kN. Ideal para estruturas metálicas.',
    riskLevel:'ATENCAO',
    safetyWarningsPortuguese:'Produto químico irritante. Use luvas e óculos. Orifício deve estar limpo e seco. Respeitar tempo de cura antes de aplicar carga.',
    technicalSpecsPortuguese:'Força de arrancamento: até 25kN | Temp cura: 20min a 20°C | Norma: ETAG 001 | Opções de haste M8 a M30',
    basePrice:'89.00', priceUnit:'cartucho 300ml',
  },
  {
    slug:'prego-com-cabeca-17x27', categorySlug:'fixacao', featured:0,
    namePortuguese:'Prego com Cabeça 17×27 (caixa 1kg)', nameEnglish:'Wire Nail 17×27 (1kg box)',
    descriptionPortuguese:'Prego aço para madeira, formas e fixações gerais em obra. ~350 unidades por kg.',
    riskLevel:'NORMAL', basePrice:'12.00', priceUnit:'caixa 1kg',
  },
  {
    slug:'argamassa-de-reparo', categorySlug:'estrutural', featured:0,
    namePortuguese:'Argamassa de Reparo Estrutural 1,5kg', nameEnglish:'Structural Repair Mortar 1.5kg',
    descriptionPortuguese:'Argamassa de alta resistência para reparo de concreto deteriorado, revestimento de pilares e vigas. Livre de cloretos.',
    riskLevel:'ATENCAO',
    safetyWarningsPortuguese:'Produto alcalino — use luvas e óculos. Para reparo estrutural, exija laudotécnico de engenheiro.',
    basePrice:'78.00', priceUnit:'embalagem 1,5kg',
  },
  {
    slug:'tela-soldada-q92', categorySlug:'estrutural', featured:0,
    namePortuguese:'Tela Soldada Q92 (2,0×3,0m)', nameEnglish:'Welded Wire Mesh Q92 (2.0×3.0m)',
    descriptionPortuguese:'Malha de aço CA-60 para armação de lajes, pisos industriais e piscinas. Malha 15×15cm, fio Ø4,2mm. NBR 7480.',
    riskLevel:'ATENCAO',
    safetyWarningsPortuguese:'Manuseio com luvas grossas — bordas cortantes. Evite dobras acentuadas que fragilizam o aço.',
    basePrice:'145.00', priceUnit:'painel 6m²',
  },
  {
    slug:'impermeabilizante-cristalizante', categorySlug:'hidraulica', featured:0,
    namePortuguese:'Impermeabilizante Cristalizante 1kg', nameEnglish:'Crystalline Waterproofing 1kg',
    descriptionPortuguese:'Impermeabilização de caixas d\'água, piscinas e reservatórios. Reação química permanente no concreto. Atóxico após cura.',
    riskLevel:'NORMAL',
    usageTipsPortuguese:'Aplicar em concreto úmido. 2 demãos cruzadas. Cura mínima 7 dias antes de encher o reservatório.',
    basePrice:'65.00', priceUnit:'embalagem 1kg',
  },
  {
    slug:'piso-vinilico-lvt-4mm', categorySlug:'acabamentos', featured:0,
    namePortuguese:'Piso Vinílico LVT Click 4mm', nameEnglish:'LVT Click Vinyl Plank 4mm',
    descriptionPortuguese:'Piso flutuante de PVC com camada de uso de 0,5mm. Resistente à água, instalação sem cola. Rendimento 1,86m²/caixa.',
    riskLevel:'NORMAL',
    usageTipsPortuguese:'Aclimatizar por 48h antes da instalação. Deixar junta de dilatação de 8mm nas bordas. Não instalar em áreas com grande incidência solar direta.',
    basePrice:'89.00', priceUnit:'m²',
  },
  {
    slug:'calha-pvc-meia-cana-100', categorySlug:'cobertura', featured:0,
    namePortuguese:'Calha PVC Meia-Cana 100mm (3m)', nameEnglish:'Half-Round PVC Gutter 100mm (3m)',
    descriptionPortuguese:'Sistema de coleta de águas pluviais. Declividade de instalação: 0,5 a 1%. Acessórios: suporte, garra e emenda com borracha.',
    riskLevel:'NORMAL', basePrice:'38.00', priceUnit:'barra 3m',
  },
];

const matIds = {};
for (const mat of materials) {
  const catId = catIds[mat.categorySlug];
  const r = await run(
    `INSERT INTO materials 
      (slug, categoryId, namePortuguese, nameEnglish, descriptionPortuguese, descriptionEnglish, 
       riskLevel, safetyWarningsPortuguese, safetyWarningsEnglish, usageTipsPortuguese, usageTipsEnglish,
       antiScamPortuguese, antiScamEnglish, technicalSpecsPortuguese, technicalSpecsEnglish,
       standards, basePrice, priceUnit, featured)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      mat.slug, catId,
      mat.namePortuguese, mat.nameEnglish,
      mat.descriptionPortuguese || null, mat.descriptionEnglish || null,
      mat.riskLevel || 'NORMAL',
      mat.safetyWarningsPortuguese || null, mat.safetyWarningsEnglish || null,
      mat.usageTipsPortuguese || null, mat.usageTipsEnglish || null,
      mat.antiScamPortuguese || null, mat.antiScamEnglish || null,
      mat.technicalSpecsPortuguese || null, mat.technicalSpecsEnglish || null,
      mat.standards || null,
      mat.basePrice || null, mat.priceUnit || null,
      mat.featured || 0,
    ]
  );
  matIds[mat.slug] = r.insertId;
}
console.log(`  ✓ ${materials.length} materials inserted`);

// ──────────────────────────────────────────────────────────────────────────────
// MATERIAL PRICES
// ──────────────────────────────────────────────────────────────────────────────
console.log('💰 Seeding material prices...');
const matPrices = [
  { mat:'cimento-cp-ii-50kg',          store:'leroy-merlin',          price:'44.90', unit:'saco 50kg' },
  { mat:'cimento-cp-ii-50kg',          store:'sodimac-homecenter',     price:'45.90', unit:'saco 50kg' },
  { mat:'cimento-cp-ii-50kg',          store:'construcenter',          price:'43.50', unit:'saco 50kg' },
  { mat:'fio-eletrico-750v-2-5mm',     store:'leroy-merlin',          price:'4.89',  unit:'metro' },
  { mat:'fio-eletrico-750v-2-5mm',     store:'telhanorte',             price:'4.49',  unit:'metro' },
  { mat:'fio-eletrico-750v-2-5mm',     store:'c-e-materiais',          price:'4.20',  unit:'metro' },
  { mat:'ferro-ca-50-10mm',            store:'leroy-merlin',          price:'54.90', unit:'barra 12m' },
  { mat:'ferro-ca-50-10mm',            store:'construcenter',          price:'51.00', unit:'barra 12m' },
  { mat:'tijolo-6-furos',             store:'leroy-merlin',          price:'0.89',  unit:'unidade' },
  { mat:'tijolo-6-furos',             store:'sodimac-homecenter',     price:'0.92',  unit:'unidade' },
  { mat:'tijolo-6-furos',             store:'c-e-materiais',          price:'0.79',  unit:'unidade' },
  { mat:'areia-media-lavada',          store:'construcenter',          price:'270.00',unit:'m³' },
  { mat:'areia-media-lavada',          store:'c-e-materiais',          price:'260.00',unit:'m³' },
  { mat:'porcelanato-60x60-polido',    store:'leroy-merlin',          price:'89.90', unit:'m²' },
  { mat:'porcelanato-60x60-polido',    store:'telhanorte',             price:'94.90', unit:'m²' },
  { mat:'argamassa-accolante-ac-ii',   store:'leroy-merlin',          price:'31.90', unit:'saco 20kg' },
  { mat:'argamassa-accolante-ac-ii',   store:'sodimac-homecenter',     price:'33.90', unit:'saco 20kg' },
  { mat:'tinta-acrilica-premium-18l',  store:'leroy-merlin',          price:'199.00',unit:'lata 18L' },
  { mat:'tinta-acrilica-premium-18l',  store:'telhanorte',             price:'189.00',unit:'lata 18L' },
  { mat:'caixa-dagua-1000l',          store:'leroy-merlin',          price:'699.00',unit:'unidade' },
  { mat:'caixa-dagua-1000l',          store:'sodimac-homecenter',     price:'720.00',unit:'unidade' },
  { mat:'disjuntor-monopolar-25a',     store:'leroy-merlin',          price:'18.90', unit:'unidade' },
  { mat:'disjuntor-monopolar-25a',     store:'telhanorte',             price:'21.90', unit:'unidade' },
  { mat:'concreto-fck-20-usinado',     store:'construcenter',          price:'390.00',unit:'m³' },
  { mat:'concreto-fck-20-usinado',     store:'c-e-materiais',          price:'375.00',unit:'m³' },
];

for (const p of matPrices) {
  const matId = matIds[p.mat];
  const storeId = storeIds[p.store];
  if (!matId || !storeId) continue;
  await run(
    'INSERT INTO materialPrices (materialId, storeId, price, priceUnit) VALUES (?,?,?,?)',
    [matId, storeId, p.price, p.unit]
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// TOOL CATEGORIES
// ──────────────────────────────────────────────────────────────────────────────
console.log('🔧 Seeding tool categories...');
const toolCatData = [
  { slug:'perfuracao-e-fixacao', namePortuguese:'Perfuração e Fixação',      nameEnglish:'Drilling & Fastening',  icon:'Drill',      sortOrder:1 },
  { slug:'medicao-e-nivelamento', namePortuguese:'Medição e Nivelamento',     nameEnglish:'Measuring & Leveling', icon:'Ruler',      sortOrder:2 },
  { slug:'corte-e-acabamento',   namePortuguese:'Corte e Acabamento',        nameEnglish:'Cutting & Finishing',   icon:'Scissors',   sortOrder:3 },
  { slug:'epi',                  namePortuguese:'EPI — Equipamentos de Proteção Individual', nameEnglish:'PPE — Personal Protective Equipment', icon:'HardHat', sortOrder:4 },
  { slug:'eletrica-ferramentas', namePortuguese:'Ferramentas Elétricas',     nameEnglish:'Power Tools',           icon:'Zap',        sortOrder:5 },
  { slug:'manuais',              namePortuguese:'Ferramentas Manuais',       nameEnglish:'Hand Tools',            icon:'Hammer',     sortOrder:6 },
];
const toolCatIds = {};
for (const c of toolCatData) {
  const r = await run(
    'INSERT INTO toolCategories (slug,namePortuguese,nameEnglish,icon,sortOrder) VALUES (?,?,?,?,?)',
    [c.slug,c.namePortuguese,c.nameEnglish,c.icon,c.sortOrder]
  );
  toolCatIds[c.slug] = r.insertId;
}

// ──────────────────────────────────────────────────────────────────────────────
// TOOLS
// ──────────────────────────────────────────────────────────────────────────────
console.log('🪛 Seeding tools...');
const toolsData = [
  // EPI
  {
    slug:'capacete-classe-b', catSlug:'epi', featured:1, powerType:'manual', professionLevel:'beginner',
    namePortuguese:'Capacete de Segurança Classe B', nameEnglish:'Class B Safety Helmet',
    descriptionPortuguese:'Proteção da cabeça contra impactos e choques elétricos até 20.000V. Uso obrigatório em obras pela NR-6. Classe B: resistente a choques elétricos.',
    safetyPortuguese:'Verificar data de validade gravada na aba interna (máx 5 anos). Substituir após qualquer impacto mesmo sem dano aparente. Não perfurar ou pintar o capacete.',
    basePrice:'35.00',
  },
  {
    slug:'luva-raspa-couro', catSlug:'epi', featured:1, powerType:'manual', professionLevel:'beginner',
    namePortuguese:'Luva de Raspa de Couro para Solda', nameEnglish:'Split Leather Welding Glove',
    descriptionPortuguese:'Proteção das mãos contra calor, respingos de solda e abrasão. Material: raspa de couro. Cano longo. CA obrigatório NR-6.',
    safetyPortuguese:'Não usar luvas danificadas. Luvas molhadas aumentam risco de choque elétrico em trabalhos elétricos.',
    basePrice:'22.00',
  },
  {
    slug:'oculos-protecao-ampla-visao', catSlug:'epi', featured:0, powerType:'manual', professionLevel:'beginner',
    namePortuguese:'Óculos de Proteção Ampla Visão', nameEnglish:'Wide-Vision Safety Goggles',
    descriptionPortuguese:'Proteção ocular contra poeira, respingos e partículas. Vedação perimetral, ventilação indireta. NBR 6533.',
    basePrice:'18.00',
  },
  {
    slug:'mascara-pff2', catSlug:'epi', featured:1, powerType:'manual', professionLevel:'beginner',
    namePortuguese:'Máscara PFF2 Respiratória (embalagem 10)', nameEnglish:'PFF2 Respirator Mask (pack of 10)',
    descriptionPortuguese:'Proteção respiratória contra poeiras finas, sílica e partículas perigosas. Filtração ≥94%. Uso obrigatório em trabalhos com cimento, gesso, corte a seco.',
    safetyPortuguese:'PFF1 NÃO protege contra sílica — use PFF2 ou superior. Substituir após cada turno ou quando molhar/deformar.',
    basePrice:'45.00',
  },
  {
    slug:'cinto-seguranca-paraquedista', catSlug:'epi', featured:1, powerType:'manual', professionLevel:'intermediate',
    namePortuguese:'Cinto de Segurança Tipo Paraquedista', nameEnglish:'Full-Body Safety Harness',
    descriptionPortuguese:'EPI obrigatório para trabalho em altura acima de 2m (NR-35). Cintos e fivelas de aço. Absorvedor de energia integrado.',
    safetyPortuguese:'Inspecionar antes de cada uso. Substituir após queda mesmo sem dano visual. Ponto de ancoragem deve suportar mínimo 15kN.',
    basePrice:'289.00',
  },
  {
    slug:'bota-seguranca-couro-ca', catSlug:'epi', featured:0, powerType:'manual', professionLevel:'beginner',
    namePortuguese:'Bota de Segurança Couro Bico de Aço', nameEnglish:'Steel-Toe Safety Boot',
    descriptionPortuguese:'Calçado de proteção com biqueira de aço, palmilha antiestática e solado resistente a combustíveis. CA aprovado pelo MTE.',
    safetyPortuguese:'Verificar o CA do fabricante. Bota com solado isolante elétrico é diferente da EL (eletricista).',
    basePrice:'189.00',
  },
  // PERFURAÇÃO
  {
    slug:'furadeira-impacto-3-8', catSlug:'perfuracao-e-fixacao', featured:1, powerType:'corded', professionLevel:'beginner',
    namePortuguese:'Furadeira de Impacto 3/8" 700W', nameEnglish:'3/8" 700W Impact Drill',
    descriptionPortuguese:'Furadeira elétrica com função impacto para perfuração em concreto, alvenaria, madeira e metal. Mandril 3/8" (10mm), 0-3000rpm.',
    safetyPortuguese:'Use óculos e máscara ao perfurar concreto. Nunca perfure sem verificar presença de fiação na parede.',
    technicalSpecsPortuguese:'Potência: 700W | Mandril: 10mm | Vel: 0-3000rpm | Impacto: 0-48.000 bpm | Peso: 1,8kg',
    basePrice:'189.00',
  },
  {
    slug:'parafusadeira-bateria-18v', catSlug:'perfuracao-e-fixacao', featured:1, powerType:'battery', professionLevel:'beginner',
    namePortuguese:'Parafusadeira/Furadeira Bateria 18V', nameEnglish:'18V Cordless Drill/Driver',
    descriptionPortuguese:'Ferramenta 2-em-1 sem fio com bateria de íon-lítio 18V 2Ah. 21 torques + 2 velocidades. Mandril 13mm.',
    safetyPortuguese:'Carregar bateria somente com carregador original. Não deixar bateria na chuva — risco de curto-circuito.',
    technicalSpecsPortuguese:'Tensão: 18V | Bateria: Li-Ion 2Ah | Torque max: 65Nm | Mandril: 13mm | Peso (c/bat): 1,9kg',
    basePrice:'389.00',
  },
  {
    slug:'martelo-demolidor-10j', catSlug:'perfuracao-e-fixacao', featured:0, powerType:'corded', professionLevel:'professional',
    namePortuguese:'Martelo Demolidor 10J 1100W', nameEnglish:'10J 1100W Demolition Hammer',
    descriptionPortuguese:'Demolição de paredes e pisos de concreto. Energia de impacto 10J, 2900 golpes/min. Encaixe SDS-Plus.',
    safetyPortuguese:'EPI completo obrigatório: capacete, óculos, protetor auricular e luvas. Verificar ausência de fiação e tubulação antes de demolir.',
    basePrice:'890.00',
  },
  // MEDIÇÃO
  {
    slug:'nivel-laser-linha-verde', catSlug:'medicao-e-nivelamento', featured:1, powerType:'battery', professionLevel:'intermediate',
    namePortuguese:'Nível Laser de Linha Verde 360°', nameEnglish:'360° Green Line Laser Level',
    descriptionPortuguese:'Projeção de 3 linhas cruzadas (horizontal + 2 verticais). Alcance 30m, precisão ±1mm/5m. Tripé incluído.',
    basePrice:'589.00',
  },
  {
    slug:'trena-laser-50m', catSlug:'medicao-e-nivelamento', featured:0, powerType:'battery', professionLevel:'beginner',
    namePortuguese:'Trena Laser Digital 50m', nameEnglish:'50m Digital Laser Measure',
    descriptionPortuguese:'Medição precisa até 50m, precisão ±2mm. Calcula área, volume e distância indireta. Display retroiluminado.',
    basePrice:'189.00',
  },
  {
    slug:'trena-manual-5m', catSlug:'medicao-e-nivelamento', featured:0, powerType:'manual', professionLevel:'beginner',
    namePortuguese:'Trena Manual Aço Inox 5m', nameEnglish:'5m Steel Tape Measure',
    descriptionPortuguese:'Trena com fita de aço inoxidável, trava automática, gancho magnético. Largura 19mm.',
    basePrice:'28.00',
  },
  {
    slug:'nivel-de-bolha-120cm', catSlug:'medicao-e-nivelamento', featured:0, powerType:'manual', professionLevel:'beginner',
    namePortuguese:'Nível de Bolha Alumínio 120cm', nameEnglish:'120cm Aluminum Spirit Level',
    descriptionPortuguese:'Nível de pedreiro em alumínio extrudado, 3 ampolas (horizontal, vertical e 45°). Precisão ±0,5mm/m.',
    basePrice:'89.00',
  },
  // CORTE
  {
    slug:'esmerilhadeira-angular-4-5', catSlug:'corte-e-acabamento', featured:1, powerType:'corded', professionLevel:'intermediate',
    namePortuguese:'Esmerilhadeira Angular 4½" 800W', nameEnglish:'4½" 800W Angle Grinder',
    descriptionPortuguese:'Para corte de cerâmica, metal e concreto. Disco máximo 115mm, 11.000rpm. Proteção ajustável.',
    safetyPortuguese:'NUNCA remova a proteção. Trocar disco ao mínimo sinal de trinca. Use óculos, protetor facial, luvas e protetor auricular. Manter a área livre de pessoas.',
    basePrice:'249.00',
  },
  {
    slug:'serra-circular-7-1-4', catSlug:'corte-e-acabamento', featured:0, powerType:'corded', professionLevel:'intermediate',
    namePortuguese:'Serra Circular 7¼" 1400W', nameEnglish:'7¼" 1400W Circular Saw',
    descriptionPortuguese:'Corte de madeira, compensados e painéis. Profundidade máx 65mm a 90°, 46mm a 45°. Guia paralela incluída.',
    safetyPortuguese:'Use protetor ocular e auricular. Nunca corte materiais molhados. Manter mãos longe da linha de corte.',
    basePrice:'489.00',
  },
  // MANUAIS
  {
    slug:'marreta-3-libras', catSlug:'manuais', featured:0, powerType:'manual', professionLevel:'beginner',
    namePortuguese:'Marreta 3 Libras Cabo Madeira', nameEnglish:'3-Pound Sledgehammer Wood Handle',
    descriptionPortuguese:'Para demolição leve, encaixe de pisos e cravação de estaqueamento. Cabeça em aço carbono forjado.',
    basePrice:'38.00',
  },
  {
    slug:'colher-de-pedreiro-10', catSlug:'manuais', featured:0, powerType:'manual', professionLevel:'beginner',
    namePortuguese:'Colher de Pedreiro 10" Inox', nameEnglish:'10" Stainless Trowel',
    descriptionPortuguese:'Essencial para assentamento de tijolos e argamassas. Lâmina em aço inoxidável 10", cabo de madeira.',
    basePrice:'35.00',
  },
  {
    slug:'betoneira-120l', catSlug:'eletrica-ferramentas', featured:1, powerType:'corded', professionLevel:'intermediate',
    namePortuguese:'Betoneira Elétrica 120L 0,5CV', nameEnglish:'120L 0.5HP Electric Concrete Mixer',
    descriptionPortuguese:'Para preparo de concreto e argamassa em obra. Cuba de 120L, capacidade útil 80L. Motor 0,5CV monofásico 127/220V.',
    safetyPortuguese:'Nunca inserir instrumentos na cuba girando. Limpar após cada uso — concreto seco danifica o equipamento.',
    technicalSpecsPortuguese:'Capacidade: 120L (útil 80L) | Motor: 0,5CV | Tensão: 127/220V | Rotação cuba: 25rpm',
    basePrice:'1290.00',
  },
  {
    slug:'compactador-de-solo-60kg', catSlug:'eletrica-ferramentas', featured:0, powerType:'corded', professionLevel:'professional',
    namePortuguese:'Compactador de Solo Sapo 60kg', nameEnglish:'60kg Jumping Jack Compactor',
    descriptionPortuguese:'Compactação de base granular, argila e solo em valas e áreas estreitas. Motor a gasolina 4T 4CV.',
    safetyPortuguese:'Use protetor auricular — emite >100dB. Nunca operar próximo a fundações sem ART de engenheiro.',
    basePrice:'2890.00',
  },
];

const toolIds = {};
for (const t of toolsData) {
  const catId = toolCatIds[t.catSlug];
  const r = await run(
    `INSERT INTO tools 
      (slug, toolCategoryId, namePortuguese, nameEnglish, descriptionPortuguese, descriptionEnglish,
       safetyPortuguese, safetyEnglish, technicalSpecsPortuguese, technicalSpecsEnglish,
       powerType, professionLevel, basePrice, featured)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      t.slug, catId,
      t.namePortuguese, t.nameEnglish,
      t.descriptionPortuguese || null, t.descriptionEnglish || null,
      t.safetyPortuguese || null, t.safetyEnglish || null,
      t.technicalSpecsPortuguese || null, t.technicalSpecsEnglish || null,
      t.powerType, t.professionLevel,
      t.basePrice || null,
      t.featured || 0,
    ]
  );
  toolIds[t.slug] = r.insertId;
}
console.log(`  ✓ ${toolsData.length} tools inserted`);

// Tool prices
const toolPricesData = [
  { tool:'furadeira-impacto-3-8',     store:'leroy-merlin', price:'199.00' },
  { tool:'furadeira-impacto-3-8',     store:'telhanorte',   price:'189.00' },
  { tool:'parafusadeira-bateria-18v', store:'leroy-merlin', price:'399.00' },
  { tool:'parafusadeira-bateria-18v', store:'telhanorte',   price:'389.00' },
  { tool:'nivel-laser-linha-verde',   store:'leroy-merlin', price:'599.00' },
  { tool:'esmerilhadeira-angular-4-5',store:'leroy-merlin', price:'259.00' },
  { tool:'esmerilhadeira-angular-4-5',store:'telhanorte',   price:'249.00' },
  { tool:'capacete-classe-b',         store:'leroy-merlin', price:'36.90' },
  { tool:'capacete-classe-b',         store:'construcenter',price:'32.00' },
  { tool:'cinto-seguranca-paraquedista', store:'leroy-merlin', price:'299.00' },
  { tool:'betoneira-120l',            store:'leroy-merlin', price:'1350.00' },
  { tool:'betoneira-120l',            store:'sodimac-homecenter', price:'1290.00' },
];
for (const p of toolPricesData) {
  const toolId = toolIds[p.tool];
  const storeId = storeIds[p.store];
  if (!toolId || !storeId) continue;
  await run('INSERT INTO toolPrices (toolId, storeId, price) VALUES (?,?,?)', [toolId, storeId, p.price]);
}

// ──────────────────────────────────────────────────────────────────────────────
// KNOWLEDGE BASE ARTICLES
// ──────────────────────────────────────────────────────────────────────────────
console.log('📚 Seeding knowledge base articles...');
const articles = [
  {
    slug:'nr-6-epi-obrigatorio-obra',
    titlePortuguese:'NR-6: Guia Completo de EPI Obrigatório em Obras',
    titleEnglish:'NR-6: Complete Guide to Mandatory PPE on Construction Sites',
    summaryPortuguese:'Tudo que você precisa saber sobre a Norma Regulamentadora 6 — quais EPIs são obrigatórios, responsabilidades do empregador e do trabalhador.',
    summaryEnglish:'Everything you need to know about NR-6 — which PPEs are mandatory, employer and worker responsibilities.',
    contentPortuguese:`A NR-6 (Norma Regulamentadora 6) define os Equipamentos de Proteção Individual obrigatórios em obras de construção civil.

## EPIs Mínimos Obrigatórios

**Proteção da cabeça:** Capacete Classe B (isolante elétrico) para toda obra com riscos elétricos.

**Proteção visual:** Óculos de segurança em toda operação com risco de projeção de partículas.

**Proteção respiratória:** Máscara PFF2 em trabalhos com cimento, gesso, sílica livre ou poeiras.

**Proteção dos pés:** Bota com biqueira de aço e solado antiderrapante.

**Proteção das mãos:** Luvas adequadas ao risco — raspa de couro para solda, borracha para eletricidade.

## Responsabilidades

O empregador DEVE fornecer EPIs sem custo ao trabalhador, treinar para o uso correto e substituir quando necessário. O trabalhador é obrigado a usar corretamente.

## Penalidades

Empresa que não fornece EPI pode ser multada em até R$ 6.708,00 por empregado. Acidentes por ausência de EPI podem caracterizar crime de lesão corporal culposa.`,
    contentEnglish:`NR-6 (Regulatory Standard 6) defines mandatory Personal Protective Equipment on construction sites in Brazil.

## Minimum Mandatory PPE

**Head protection:** Class B helmet (electrical insulating) for all work with electrical risks.

**Eye protection:** Safety glasses for all operations with particle projection risk.

**Respiratory protection:** PFF2 mask for work with cement, plaster, silica or dusts.

**Foot protection:** Steel-toe boots with anti-slip sole.

**Hand protection:** Appropriate gloves for the risk.

## Responsibilities

Employers MUST provide PPE at no cost to workers, train for correct use and replace when necessary.`,
    readingTimeMinutes: 8, featured: 1,
  },
  {
    slug:'tracos-concreto-br',
    titlePortuguese:'Traços de Concreto: Do Simples ao C40',
    titleEnglish:'Concrete Mixes: From Simple to C40',
    summaryPortuguese:'Tabela completa de traços de concreto em volume e peso para obra. Inclui cálculo de materiais por m³.',
    summaryEnglish:'Complete concrete mix table by volume and weight. Includes material calculation per m³.',
    contentPortuguese:`## Traços Mais Usados em Obra

| Resistência | Cimento | Areia | Brita | Água | Uso |
|------------|---------|-------|-------|------|-----|
| fck 15 MPa | 1 | 3,5 | 5 | 0,8 | Calçadas, contra-pisos |
| fck 20 MPa | 1 | 2,8 | 4 | 0,6 | Fundações, pilares simples |
| fck 25 MPa | 1 | 2,2 | 3,2 | 0,5 | Lajes, vigas residenciais |
| fck 30 MPa | 1 | 1,8 | 2,6 | 0,45 | Estruturas protendidas |

## Consumo por m³ (fck 20 MPa)

- Cimento: 8 sacos de 50kg (~400kg)
- Areia: 0,54m³ (~800kg)
- Brita: 0,72m³ (~1100kg)
- Água: ~180 litros

## Dica Anti-desperdício

Calcule o volume exato antes de pedir o concreto usinado. Excesso de água (maior relação a/c) reduz a resistência final.`,
    contentEnglish:`## Most Common Concrete Mixes

| Strength | Cement | Sand | Aggregate | Water | Use |
|----------|--------|------|-----------|-------|-----|
| fck 15 MPa | 1 | 3.5 | 5 | 0.8 | Sidewalks, sub-floors |
| fck 20 MPa | 1 | 2.8 | 4 | 0.6 | Foundations, simple columns |
| fck 25 MPa | 1 | 2.2 | 3.2 | 0.5 | Slabs, residential beams |
| fck 30 MPa | 1 | 1.8 | 2.6 | 0.45 | Prestressed structures |

## Materials per m³ (fck 20 MPa)

- Cement: 8 bags of 50kg (~400kg)
- Sand: 0.54m³ (~800kg)
- Aggregate: 0.72m³ (~1100kg)
- Water: ~180 liters`,
    readingTimeMinutes: 6, featured: 1,
  },
  {
    slug:'instalacao-eletrica-nr5410',
    titlePortuguese:'NBR 5410: O Que Todo Dono de Obra Precisa Saber',
    titleEnglish:'NBR 5410: What Every Property Owner Needs to Know',
    summaryPortuguese:'As exigências mínimas da norma elétrica brasileira para instalações de baixa tensão — tomadas, circuitos, disjuntores e aterramento.',
    summaryEnglish:'Minimum requirements of the Brazilian electrical standard for low voltage installations — outlets, circuits, breakers and grounding.',
    contentPortuguese:`## Circuitos Mínimos por Cômodo

**Quartos:** Mínimo 1 circuito exclusivo de iluminação + 1 de tomadas.

**Cozinha e lavanderia:** Circuito exclusivo para cada equipamento acima de 1500W (fogão, lava-louças, máquina de lavar).

**Banheiro:** Circuito exclusivo para chuveiro/torneira elétrica.

## Bitolas Mínimas

- Iluminação: 1,5mm²
- Tomadas gerais: 2,5mm²
- Chuveiro elétrico: 4mm² (mínimo 25A)
- Ar-condicionado 12.000 BTU: 4mm²

## Aterramento Obrigatório

Toda instalação nova deve ter sistema de aterramento com haste de terra (mínimo 2,4m), condutor PE e tomadas 3 pinos (2P+T).

## Erros Comuns e Perigosos

❌ Usar fio 2,5mm² para chuveiro
❌ Disjuntor maior que a capacidade do fio
❌ Tomadas sem aterramento
❌ Emendas sem conector ou fita isolante inadequada`,
    contentEnglish:`## Minimum Circuits per Room

**Bedrooms:** Minimum 1 dedicated lighting circuit + 1 outlet circuit.

**Kitchen and laundry:** Dedicated circuit for each appliance above 1500W.

**Bathroom:** Dedicated circuit for electric shower/faucet.

## Minimum Wire Gauges

- Lighting: 1.5mm²
- General outlets: 2.5mm²
- Electric shower: 4mm² (minimum 25A)
- 12,000 BTU AC: 4mm²

## Mandatory Grounding

All new installations must have grounding with earth rod (minimum 2.4m), PE conductor and 3-pin outlets.`,
    readingTimeMinutes: 10, featured: 1,
  },
  {
    slug:'golpes-materiais-construcao',
    titlePortuguese:'5 Golpes Mais Comuns na Compra de Materiais de Construção',
    titleEnglish:'5 Most Common Scams When Buying Building Materials',
    summaryPortuguese:'Aprenda a identificar fios com seção reduzida, cimentos adulterados, tijolos fora de bitola e outros golpes que custam caro na obra.',
    summaryEnglish:'Learn to identify undersized wire, adulterated cement, off-size bricks and other scams that cost dearly in construction.',
    contentPortuguese:`## 1. Fio Elétrico com Seção Abaixo do Declarado

Fabricantes desonestos vendem fio "2,5mm²" com apenas 1,5mm² real. Como verificar: compre 1 metro, remova a isolação e pese o cobre — deve pesar ~21g para 2,5mm² (22,5g/m para cobre puro).

## 2. Cimento Adulterado ou Vencido

Cimento com mais de 3 meses começa a perder resistência. Adulteração com calcário faz o cimento parecer normal mas perde até 50% da resistência. Sempre verifique a data no saco.

## 3. Vergalhão com Seção Reduzida

Vergalhão CA-50 Ø10mm deve pesar 0,617 kg/m. Pese uma barra de 12m — deve dar ~7,4kg. Vergalhão falsificado frequentemente está 10-20% abaixo.

## 4. Tijolo com Dimensões Fora de Padrão

Tijolo 9×14×19cm com variação >5mm por dimensão compromete o alinhamento das fiadas. Verifique a bitola com régua em pelo menos 5 peças do lote.

## 5. Produto sem INMETRO

Disjuntores, capacetes, cabos elétricos e outros itens de segurança SEM certificação INMETRO são ilegais e podem causar acidentes graves. Exija sempre o número do CA (Certificado de Aprovação).`,
    contentEnglish:`## 1. Electrical Wire with Undersized Cross-Section

Dishonest manufacturers sell "2.5mm²" wire with only 1.5mm² actual. How to verify: buy 1 meter, remove insulation and weigh the copper — should be ~21g for 2.5mm².

## 2. Adulterated or Expired Cement

Cement over 3 months old loses resistance. Adulteration with limestone makes cement look normal but loses up to 50% of strength.

## 3. Rebar with Reduced Cross-Section

CA-50 Ø10mm rebar should weigh 0.617 kg/m. Weigh a 12m bar — should be ~7.4kg.

## 4. Off-Size Bricks

Bricks with >5mm variation per dimension compromise course alignment.

## 5. Products without INMETRO Certification

Circuit breakers, helmets, cables and other safety items WITHOUT INMETRO certification are illegal.`,
    readingTimeMinutes: 7, featured: 1,
  },
  {
    slug:'impermeabilizacao-banheiro-correto',
    titlePortuguese:'Impermeabilização de Banheiro: Passo a Passo Correto',
    titleEnglish:'Bathroom Waterproofing: Correct Step by Step',
    summaryPortuguese:'Como impermeabilizar piso e paredes de banheiro evitando infiltrações futuras — tipos de produtos, espessura e teste de estanqueidade.',
    summaryEnglish:'How to waterproof bathroom floor and walls avoiding future leaks — product types, thickness and leakage test.',
    contentPortuguese:`## Por Que a Impermeabilização Falha

A maioria das falhas ocorre por: produto errado, número insuficiente de demãos, ou não respeitar os arredondamentos nos encontros piso-parede.

## Passo a Passo

1. **Preparação:** Remover toda sujeira, desmoldante e materiais soltos. Regularizar o piso com argamassa de regularização (caimento mínimo 1,5% em direção ao ralo).

2. **Arredondamento:** Criar canto arredondado (filete de argamassa) no encontro piso-parede — ponto crítico de infiltração.

3. **1ª demão:** Aplicar manta líquida ou cristalizante. Aguardar cura.

4. **2ª demão:** Perpendicular à primeira. Tela de poliéster no perímetro e ralos.

5. **3ª demão** (em áreas molháveis): Opcional mas recomendada em box e áreas de maior exposição.

6. **Teste de estanqueidade:** Tampar o ralo, encher o piso com 5cm de água por 72h. Verificar no andar de baixo.

7. **Revestimento:** Aguardar 7 dias antes de assentar cerâmica.`,
    contentEnglish:`## Why Waterproofing Fails

Most failures occur due to: wrong product, insufficient coats, or not respecting the floor-wall roundings.

## Step by Step

1. **Preparation:** Remove all dirt, release agents and loose materials. Level the floor (minimum 1.5% slope toward drain).

2. **Rounding:** Create rounded corner (mortar fillet) at floor-wall junction — critical infiltration point.

3. **1st coat:** Apply liquid membrane or crystalline waterproofing. Wait for cure.

4. **2nd coat:** Perpendicular to the first. Polyester mesh at perimeter and drains.

5. **Leakage test:** Block drain, fill floor with 5cm of water for 72h.

6. **Tiling:** Wait 7 days before laying ceramic tiles.`,
    readingTimeMinutes: 9, featured: 0,
  },
  {
    slug:'nr-35-trabalho-em-altura',
    titlePortuguese:'NR-35: Trabalho em Altura — Obrigações e Procedimentos',
    titleEnglish:'NR-35: Working at Height — Obligations and Procedures',
    summaryPortuguese:'Resumo completo da NR-35 para trabalhadores e responsáveis: planejamento, EPIs, treinamento e permissão de trabalho.',
    summaryEnglish:'Complete NR-35 summary for workers and supervisors: planning, PPE, training and work permits.',
    contentPortuguese:`## O Que Define Trabalho em Altura

Qualquer atividade realizada acima de 2 metros do nível inferior, onde haja risco de queda.

## Equipamentos Obrigatórios

- Cinto tipo paraquedista (talabartes)
- Capacete com jugular
- Linha de vida (cabo de aço 8mm ou corda poliamida)
- Ponto de ancoragem certificado (mín 15kN)

## Treinamento Obrigatório

O trabalhador deve receber treinamento teórico e prático mínimo de 8 horas antes da primeira atividade em altura.

## Permissão de Trabalho (PT)

Toda atividade em altura requer emissão de PT pelo responsável técnico, com identificação de riscos e medidas de controle.

## Estatística de Acidentes

Queda de altura é a 2ª maior causa de acidentes fatais na construção civil no Brasil. Use sempre o cinto — nunca improvise.`,
    contentEnglish:`## What Defines Work at Height

Any activity performed more than 2 meters above the lower level, where there is a fall risk.

## Required Equipment

- Full-body harness
- Helmet with chin strap
- Lifeline (8mm steel cable or polyamide rope)
- Certified anchor point (min 15kN)

## Mandatory Training

Workers must receive minimum 8 hours of theoretical and practical training before first height activity.`,
    readingTimeMinutes: 8, featured: 0,
  },
  {
    slug:'como-calcular-materiais-alvenaria',
    titlePortuguese:'Como Calcular Materiais para Alvenaria: Tijolos, Cimento e Areia',
    titleEnglish:'How to Calculate Masonry Materials: Bricks, Cement and Sand',
    summaryPortuguese:'Fórmulas e tabelas práticas para calcular a quantidade exata de tijolos, argamassa e cimento para qualquer parede.',
    summaryEnglish:'Practical formulas and tables to calculate the exact amount of bricks, mortar and cement for any wall.',
    contentPortuguese:`## Quantidade de Tijolos

**Tijolo 6 furos (9×14×19cm):** 70 tijolos/m² de parede (em pé) ou 35 tijolos/m² (deitado).

**Fórmula:** Área da parede × 70 × 1,08 (8% de quebra) = tijolos necessários.

## Argamassa de Assentamento

Traço recomendado: 1 cimento : 6 areia (em volume)

**Para cada m² de parede:** ~15kg de argamassa (tijolo em pé).

## Cálculo de Cimento e Areia

Para argamassa traço 1:6:
- 1 saco de cimento (50kg) + 6 padiolas de areia = ~0,3m³ de argamassa
- Rende aproximadamente 20m² de parede

## Exemplo Prático

Quero levantar 60m² de parede com tijolo 6 furos em pé:
- Tijolos: 60 × 70 × 1,08 = **4.536 tijolos**
- Argamassa: 60 × 15kg = **900kg**
- Cimento: 900kg ÷ 7 = **~13 sacos de 50kg**
- Areia: 900kg ÷ 1440 = **~0,63m³**`,
    contentEnglish:`## Number of Bricks

**6-hole brick (9×14×19cm):** 70 bricks/m² standing or 35 bricks/m² lying.

**Formula:** Wall area × 70 × 1.08 (8% waste) = bricks needed.

## Laying Mortar

Recommended mix: 1 cement : 6 sand (by volume)

**Per m² of wall:** ~15kg of mortar (brick standing).

## Practical Example

I want to build 60m² of wall with 6-hole brick standing:
- Bricks: 60 × 70 × 1.08 = **4,536 bricks**
- Mortar: 60 × 15kg = **900kg**
- Cement: 900kg ÷ 7 = **~13 bags of 50kg**
- Sand: 900kg ÷ 1440 = **~0.63m³**`,
    readingTimeMinutes: 6, featured: 0,
  },
  {
    slug:'instalar-eletroduto-correto',
    titlePortuguese:'Como Instalar Eletroduto Corretamente em Alvenaria',
    titleEnglish:'How to Install Conduit Correctly in Masonry',
    summaryPortuguese:'Guia prático para embutir eletrodutos PVC rígido em paredes de alvenaria: espaçamento, caixas e passagem de fios.',
    summaryEnglish:'Practical guide for embedding rigid PVC conduits in masonry walls: spacing, boxes and wire pulling.',
    contentPortuguese:`## Materiais Necessários

- Eletroduto PVC rígido 3/4" ou 1" (dependendo do número de fios)
- Caixas de luz octogonais e retangulares
- Condulete PVC para curvas
- Fio guia (aço ou nylon) para passagem dos condutores

## Planejamento

Desenhe o percurso dos eletrodutos ANTES de fechar a alvenaria. Evite curvas de 90° sem condulete — dificulta a passagem dos fios.

## Regra da Ocupação

Um eletroduto de 3/4" comporta:
- Até 3 fios de 2,5mm²
- Até 2 fios de 4mm²
- Nunca misture circuitos diferentes no mesmo eletroduto

## Instalação Passo a Passo

1. Marcar percurso na parede com giz ou marcador
2. Cortar canais com serra de mármore ou disco de corte
3. Fixar os eletrodutos com abraflex a cada 60cm
4. Posicionar as caixas na altura correta (tomadas: 30cm do piso; interruptores: 120cm)
5. Preencher os canais com argamassa traço 1:3`,
    contentEnglish:`## Required Materials

- Rigid PVC conduit 3/4" or 1" (depending on number of wires)
- Octagonal and rectangular electrical boxes
- PVC condulets for curves
- Guide wire (steel or nylon) for conductor pulling

## Planning

Draw the conduit route BEFORE closing the masonry. Avoid 90° bends without condulets — makes wire pulling difficult.

## Fill Ratio Rule

A 3/4" conduit fits:
- Up to 3 wires of 2.5mm²
- Up to 2 wires of 4mm²
- Never mix different circuits in the same conduit`,
    readingTimeMinutes: 7, featured: 0,
  },
];

for (const a of articles) {
  await run(
    `INSERT INTO knowledgeBaseArticles 
      (slug, titlePortuguese, titleEnglish, summaryPortuguese, summaryEnglish, contentPortuguese, contentEnglish, readingTimeMinutes, featured)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [a.slug, a.titlePortuguese, a.titleEnglish,
     a.summaryPortuguese || null, a.summaryEnglish || null,
     a.contentPortuguese, a.contentEnglish,
     a.readingTimeMinutes, a.featured]
  );
}
console.log(`  ✓ ${articles.length} articles inserted`);

// ──────────────────────────────────────────────────────────────────────────────
// CALCULATORS (metadata — actual computation is client-side)
// ──────────────────────────────────────────────────────────────────────────────
console.log('🧮 Seeding calculators metadata...');
const calcs = [
  { slug:'volume-concreto', namePortuguese:'Volume de Concreto', nameEnglish:'Concrete Volume', descriptionPortuguese:'Calcule m³ de concreto para lajes, vigas e pilares com fator de perda.', descriptionEnglish:'Calculate m³ of concrete for slabs, beams and columns with waste factor.', categorySlug:'estrutural', featured:1 },
  { slug:'quantidade-tinta', namePortuguese:'Quantidade de Tinta', nameEnglish:'Paint Quantity', descriptionPortuguese:'Litros necessários de tinta para uma área, considerando número de demãos.', descriptionEnglish:'Liters of paint needed for an area considering number of coats.', categorySlug:'acabamento', featured:1 },
  { slug:'quantidade-revestimento', namePortuguese:'Azulejos e Porcelanato', nameEnglish:'Tiles & Porcelain', descriptionPortuguese:'Peças necessárias para revestir uma área com acréscimo de quebra.', descriptionEnglish:'Pieces needed to cover an area with breakage factor.', categorySlug:'acabamento', featured:1 },
  { slug:'quantidade-argamassa', namePortuguese:'Volume de Argamassa', nameEnglish:'Mortar Volume', descriptionPortuguese:'Argamassa de assentamento para revestimentos.', descriptionEnglish:'Laying mortar for tile work.', categorySlug:'acabamento', featured:0 },
  { slug:'secao-fio-eletrico', namePortuguese:'Seção do Fio Elétrico', nameEnglish:'Wire Gauge Calculator', descriptionPortuguese:'Determine a bitola mínima do condutor pela carga e comprimento.', descriptionEnglish:'Determine minimum wire gauge by load and length.', categorySlug:'eletrica', featured:1 },
  { slug:'quantidade-tijolos', namePortuguese:'Quantidade de Tijolos', nameEnglish:'Brick Count', descriptionPortuguese:'Tijolos para uma parede, com acréscimo de quebra.', descriptionEnglish:'Bricks for a wall, with breakage factor.', categorySlug:'estrutural', featured:1 },
  { slug:'peso-aco-vergalhao', namePortuguese:'Peso do Vergalhão', nameEnglish:'Rebar Weight', descriptionPortuguese:'Peso total de barras de aço CA-50 ou CA-60.', descriptionEnglish:'Total weight of CA-50 or CA-60 rebar.', categorySlug:'estrutural', featured:0 },
  { slug:'perda-carga-hidraulica', namePortuguese:'Perda de Carga Hidráulica', nameEnglish:'Hydraulic Pressure Drop', descriptionPortuguese:'Perda de pressão em tubulações PVC.', descriptionEnglish:'Pressure drop in PVC pipes.', categorySlug:'hidraulica', featured:0 },
];
for (const c of calcs) {
  await run(
    'INSERT INTO calculators (slug, namePortuguese, nameEnglish, descriptionPortuguese, descriptionEnglish, categorySlug, featured) VALUES (?,?,?,?,?,?,?)',
    [c.slug, c.namePortuguese, c.nameEnglish, c.descriptionPortuguese, c.descriptionEnglish, c.categorySlug, c.featured]
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// SAFETY ALERTS
// ──────────────────────────────────────────────────────────────────────────────
console.log('🚨 Seeding safety alerts...');
await run('DELETE FROM `safetyAlerts`');
await run('ALTER TABLE `safetyAlerts` AUTO_INCREMENT = 1');

const safetyAlertsData = [
  {
    slug: 'recall-cimento-cp-ii-lote-2024',
    severity: 'critical',
    titlePortuguese: 'Recall: Cimento CP II — Lote com resistência abaixo do especificado',
    titleEnglish: 'Recall: CP II Cement — Batch with below-spec compressive strength',
    contentPortuguese: 'Lotes do cimento CP II-E 32 fabricados entre agosto e outubro de 2024 apresentaram resistência à compressão abaixo dos 32 MPa especificados na NBR 11578. Obra que utilizou esses lotes deve suspender estrutura e acionar fabricante. Identificar pelo número de lote impresso no saco (LT24-08xx a LT24-10xx).',
    contentEnglish: 'Batches of CP II-E 32 cement manufactured between August and October 2024 showed compressive strength below the 32 MPa required by NBR 11578. Sites using these batches should suspend structural work and contact the manufacturer. Identify by the batch number printed on the bag (LT24-08xx to LT24-10xx).',
    source: 'ABCP / Inmetro',
    publishedAt: new Date('2024-11-05T09:00:00Z'),
  },
  {
    slug: 'nbr-6118-2024-revisao',
    severity: 'warning',
    titlePortuguese: 'NBR 6118 revisada — Novas regras para armadura de concreto',
    titleEnglish: 'NBR 6118 revised — New rules for concrete reinforcement',
    contentPortuguese: 'A ABNT publicou em setembro de 2024 a revisão da NBR 6118 (Projeto de Estruturas de Concreto). A versão 2024 altera os coeficientes de segurança parciais e os requisitos de cobrimento mínimo de armadura. Projetos em andamento devem ser revisados por engenheiro responsável antes de continuar a execução.',
    contentEnglish: 'ABNT published a revision of NBR 6118 (Concrete Structures Design) in September 2024. The 2024 version changes partial safety factors and minimum reinforcement cover requirements. Ongoing projects should be reviewed by the responsible engineer before continuing.',
    source: 'ABNT',
    publishedAt: new Date('2024-09-20T08:00:00Z'),
  },
  {
    slug: 'amianto-proibicao-nacional-2024',
    severity: 'critical',
    titlePortuguese: 'Uso de amianto totalmente proibido no Brasil',
    titleEnglish: 'Asbestos completely banned in Brazil',
    contentPortuguese: 'O STF confirmou a proibição total do uso, comercialização e exportação de amianto crisotila no Brasil. Telhas, caixas d\'água e outros produtos que ainda contenham amianto devem ser substituídos. A exposição ao amianto causa mesotelioma e outros cânceres — qualquer remoção exige empresa especializada em EPI adequado.',
    contentEnglish: 'Brazil\'s Supreme Court confirmed the complete ban on the use, commercialization and export of chrysotile asbestos. Roofing tiles, water tanks and other products still containing asbestos must be replaced. Asbestos exposure causes mesothelioma and other cancers — any removal requires a specialized company with proper PPE.',
    source: 'STF / ABNT',
    publishedAt: new Date('2024-03-15T10:00:00Z'),
  },
  {
    slug: 'tinta-chumbo-alerta-2024',
    severity: 'warning',
    titlePortuguese: 'Tintas antigas com chumbo — risco em reformas',
    titleEnglish: 'Old lead-based paints — risk during renovations',
    contentPortuguese: 'Casas construídas antes de 1990 podem ter camadas de tinta com chumbo (óxido de chumbo era usado como pigmento). Durante lixamento ou remoção, partículas de chumbo são inaladas e causam saturnismo. Use máscara PFF2, óculos e descarte corretamente os resíduos conforme NBR 10004.',
    contentEnglish: 'Homes built before 1990 may have layers of lead-based paint (lead oxide was used as a pigment). During sanding or removal, lead particles are inhaled and cause lead poisoning. Use PFF2 mask, goggles and dispose of waste correctly per NBR 10004.',
    source: 'ANVISA',
    publishedAt: new Date('2024-07-10T12:00:00Z'),
  },
  {
    slug: 'fio-eletrico-cobre-imitacao-2024',
    severity: 'critical',
    titlePortuguese: 'Alerta: cabos elétricos com núcleo de aço coberto — risco de incêndio',
    titleEnglish: 'Alert: steel-core copper-plated cables — fire hazard',
    contentPortuguese: 'Fiscalizações identificaram cabos vendidos como "cobre" que na verdade têm núcleo de aço com fina camada de cobre (CCA — Copper Clad Aluminium/Steel). Esses cabos têm resistência 3× maior, superaquecem e causam incêndios. Exija laudo do fabricante e verifique o peso: 1 metro de cabo 2,5mm² de cobre puro pesa ~22g.',
    contentEnglish: 'Inspections identified cables sold as "copper" that actually have a steel core with a thin copper layer (CCA — Copper Clad Steel). These cables have 3× higher resistance, overheat and cause fires. Demand manufacturer certification and check weight: 1 meter of genuine 2.5mm² copper cable weighs ~22g.',
    source: 'INMETRO / PROCON-SP',
    publishedAt: new Date('2024-10-22T14:00:00Z'),
  },
  {
    slug: 'solventes-cheiro-forte-ventilacao',
    severity: 'info',
    titlePortuguese: 'Lembrete: solventes e tintas — ventilação obrigatória',
    titleEnglish: 'Reminder: solvents and paints — mandatory ventilation',
    contentPortuguese: 'Ambientes fechados com uso de solventes orgânicos (thinner, aguarrás, resinas epóxi) acumulam vapores inflamáveis e tóxicos. Sempre abra janelas, use máscara com filtro para vapores orgânicos (tipo A2) e jamais use chama aberta ou faíscas elétricas na mesma área. Limite de exposição: 8h/dia conforme NR-15.',
    contentEnglish: 'Enclosed spaces with organic solvents (thinner, turpentine, epoxy resins) accumulate flammable and toxic vapors. Always open windows, use a mask with organic vapor filter (type A2) and never use open flames or electric sparks in the same area. Exposure limit: 8h/day per NR-15.',
    source: 'NR-15 / ABNT',
    publishedAt: new Date('2024-06-01T08:00:00Z'),
  },
  {
    slug: 'impermeabilizante-manta-asfaltica-uv',
    severity: 'info',
    titlePortuguese: 'Manta asfáltica: não expor ao sol sem proteção UV',
    titleEnglish: 'Asphalt membrane: do not expose to sun without UV protection',
    contentPortuguese: 'Mantas asfálticas sem proteção UV degradam em 18-24 meses sob exposição solar direta, perdendo estanqueidade. Aplique sempre a proteção mecânica (argamassa ou deck) ou escolha manta com alumínio ou ardósia. Produto correto: ABNT NBR 9952 para impermeabilização de terraços.',
    contentEnglish: 'Asphalt membranes without UV protection degrade within 18-24 months under direct sun exposure, losing waterproofing capacity. Always apply mechanical protection (mortar or deck) or choose membranes with aluminum or slate finish. Correct product: ABNT NBR 9952 for terrace waterproofing.',
    source: 'ABNT NBR 9952',
    publishedAt: new Date('2024-04-18T10:00:00Z'),
  },
  {
    slug: 'escora-madeira-escoramento-laje',
    severity: 'warning',
    titlePortuguese: 'Escoramento de laje: cuidado com madeira úmida ou com defeitos',
    titleEnglish: 'Slab shoring: beware of wet or defective lumber',
    contentPortuguese: 'O colapso de escoramentos é responsável por 23% dos acidentes fatais em construção civil no Brasil (Fundacentro 2023). Use apenas madeira seca, sem nós grandes, rachamentos ou sinais de apodrecimento. Escore no mínimo 3 andares abaixo da laje concretada e só retire com aprovação do engenheiro responsável.',
    contentEnglish: 'Shoring collapses account for 23% of fatal construction accidents in Brazil (Fundacentro 2023). Use only dry lumber, free from large knots, cracks or signs of rot. Shore at minimum 3 floors below the poured slab and only remove with the responsible engineer\'s approval.',
    source: 'Fundacentro / NR-18',
    publishedAt: new Date('2024-08-30T09:00:00Z'),
  },
];

for (const a of safetyAlertsData) {
  await run(
    `INSERT INTO safetyAlerts (slug, severity, titlePortuguese, titleEnglish, contentPortuguese, contentEnglish, source, publishedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [a.slug, a.severity, a.titlePortuguese, a.titleEnglish, a.contentPortuguese, a.contentEnglish, a.source, a.publishedAt]
  );
}
console.log(`  ✓ ${safetyAlertsData.length} safety alerts inserted`);

await db.end();
console.log('\n✅ Seed complete!');
console.log(`  Categories: ${catData.length}`);
console.log(`  Materials: ${materials.length}`);
console.log(`  Stores: ${storeData.length}`);
console.log(`  Tool categories: ${toolCatData.length}`);
console.log(`  Tools: ${toolsData.length}`);
console.log(`  KB Articles: ${articles.length}`);
console.log(`  Calculators: ${calcs.length}`);
console.log(`  Safety alerts: ${safetyAlertsData.length}`);
